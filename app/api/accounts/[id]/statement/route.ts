import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

function parsePeriod(monthParam: string | null) {
  const now = new Date();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth(); // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    if (m >= 1 && m <= 12) {
      year = y;
      month = m - 1;
    }
  }

  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 1));
  const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const value = `${year}-${String(month + 1).padStart(2, '0')}`;

  return { start, end, label, value };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams.get('month'));

  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: transactions, error: txError } = await admin
    .from('transactions')
    .select('*')
    .or(`from_account_id.eq.${id},to_account_id.eq.${id}`)
    .gte('created_at', period.start.toISOString())
    .lt('created_at', period.end.toISOString())
    .order('created_at', { ascending: true });

  if (txError) {
    return NextResponse.json({ error: 'Failed to load statement' }, { status: 500 });
  }

  const rows = transactions || [];

  // Credit rows (money received into this account) don't carry the sender's
  // name on the transaction row — resolve it in one batch lookup.
  const senderIds = Array.from(
    new Set(rows.filter((t) => t.to_account_id === id && t.from_user_id).map((t) => t.from_user_id as string))
  );
  const senderNames = new Map<string, string>();
  if (senderIds.length > 0) {
    const { data: senders } = await admin
      .from('users')
      .select('id, first_name, last_name')
      .in('id', senderIds);
    for (const s of senders || []) {
      senderNames.set(s.id, `${s.first_name} ${s.last_name}`);
    }
  }

  const statementRows = rows.map((t) => {
    const isCredit = t.to_account_id === id;
    return {
      id: t.id,
      created_at: t.created_at,
      reference: t.reference,
      type: t.type,
      status: t.status,
      direction: isCredit ? 'credit' : 'debit',
      counterparty_name: isCredit ? senderNames.get(t.from_user_id) || 'Credixa Bank customer' : t.beneficiary_name,
      description: t.description || t.purpose,
      amount: t.amount,
    };
  });

  // Only completed credits and non-reversed debits actually moved the
  // balance (a pending debit is held immediately; a failed/cancelled one is
  // refunded — see app/api/admin/transactions/route.ts).
  const totalCredits = rows
    .filter((t) => t.to_account_id === id && t.status === 'completed')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDebits = rows
    .filter((t) => t.from_account_id === id && (t.status === 'completed' || t.status === 'pending'))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return NextResponse.json({
    account: {
      id: account.id,
      account_number: account.account_number,
      account_type: account.account_type,
      currency: account.currency,
      balance: account.balance,
    },
    period: {
      value: period.value,
      label: period.label,
      start: period.start.toISOString(),
      end: period.end.toISOString(),
    },
    transactions: statementRows,
    totals: {
      credits: totalCredits,
      debits: totalDebits,
      net: totalCredits - totalDebits,
      count: statementRows.length,
    },
  });
}
