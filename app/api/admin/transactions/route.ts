import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendTransactionEmail } from '@/lib/email/send';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return user;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createAdminClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status');
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  let query = db
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (search) {
    query = query.or(
      `reference.ilike.%${search}%,beneficiary_name.ilike.%${search}%,bank_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ transactions: data, total: count, page, limit });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, status, error_message, success_message } = body;

  if (!id) return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });

  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: existing, error: fetchError } = await db
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  if (status && existing.status === 'completed' && status !== 'completed') {
    return NextResponse.json(
      { error: 'Cannot change the status of a completed transaction' },
      { status: 400 }
    );
  }

  // Credit the recipient's balance exactly once, on the pending → completed
  // transition, and only for internal transfers (external wires are settled
  // outside the system). This mirrors the debit that already happened
  // immediately when the sender submitted the transfer.
  if (status === 'completed' && existing.status !== 'completed' && existing.to_account_id) {
    const { data: toAccount, error: toAccountError } = await db
      .from('accounts')
      .select('balance')
      .eq('id', existing.to_account_id)
      .single();

    if (toAccountError || !toAccount) {
      return NextResponse.json({ error: 'Recipient account not found' }, { status: 500 });
    }

    const { error: creditError } = await db
      .from('accounts')
      .update({ balance: toAccount.balance + existing.amount })
      .eq('id', existing.to_account_id);

    if (creditError) {
      return NextResponse.json({ error: 'Failed to credit recipient account' }, { status: 500 });
    }

    if (existing.to_user_id) {
      const { data: recipient } = await db
        .from('users')
        .select('email, first_name')
        .eq('id', existing.to_user_id)
        .single();

      if (recipient) {
        try {
          await sendTransactionEmail(
            recipient.email,
            recipient.first_name,
            existing.amount,
            'received',
            existing.reference,
            existing.purpose
          );
        } catch (e) {
          console.error('Recipient email send failed:', e);
        }
      }
    }
  }

  // Refund the sender if a pending transfer ends up failing/cancelled —
  // funds were debited immediately at submission time and were never
  // credited anywhere, so they need to go back.
  if (
    (status === 'failed' || status === 'cancelled') &&
    existing.status === 'pending' &&
    existing.from_account_id
  ) {
    const { data: fromAccount, error: fromAccountError } = await db
      .from('accounts')
      .select('balance')
      .eq('id', existing.from_account_id)
      .single();

    if (fromAccountError || !fromAccount) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 500 });
    }

    const { error: refundError } = await db
      .from('accounts')
      .update({ balance: fromAccount.balance + existing.amount })
      .eq('id', existing.from_account_id);

    if (refundError) {
      return NextResponse.json({ error: 'Failed to refund sender account' }, { status: 500 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (error_message !== undefined) updates.error_message = error_message || null;
  if (success_message !== undefined) updates.success_message = success_message || null;

  const { data, error } = await db
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
