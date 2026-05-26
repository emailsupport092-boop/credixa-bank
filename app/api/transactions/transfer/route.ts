import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTransactionEmail } from '@/lib/email/send';

const FEES = { instant: 2.5, standard: 0, economy: 0 };

function generateReference(): string {
  return 'TXN' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { fromAccountId, toRecipient, amount, description, transferSpeed } = body;

  if (!fromAccountId || !toRecipient || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid transfer data' }, { status: 400 });
  }

  const { data: fromAccount, error: fromError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', fromAccountId)
    .eq('user_id', user.id)
    .single();

  if (fromError || !fromAccount) {
    return NextResponse.json({ error: 'Source account not found' }, { status: 404 });
  }

  const fee = FEES[transferSpeed as keyof typeof FEES] || 0;
  const totalAmount = amount + fee;

  if (fromAccount.balance < totalAmount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  const { data: toAccount } = await supabase
    .from('accounts')
    .select('*, users(email, first_name, last_name)')
    .eq('account_number', toRecipient)
    .single();

  const reference = generateReference();

  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      from_account_id: fromAccountId,
      to_account_id: toAccount?.id || null,
      from_user_id: user.id,
      to_user_id: toAccount?.user_id || null,
      amount,
      type: 'transfer',
      status: transferSpeed === 'instant' ? 'completed' : 'pending',
      description,
      reference,
    })
    .select()
    .single();

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  await supabase
    .from('accounts')
    .update({ balance: fromAccount.balance - totalAmount })
    .eq('id', fromAccountId);

  if (toAccount && transferSpeed === 'instant') {
    await supabase
      .from('accounts')
      .update({ balance: toAccount.balance + amount })
      .eq('id', toAccount.id);
  }

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', user.id)
    .single();

  if (profile) {
    try {
      await sendTransactionEmail(profile.email, profile.first_name, amount, 'sent', reference, description);
    } catch (e) {
      console.error('Email send failed:', e);
    }
  }

  return NextResponse.json({ transaction, reference }, { status: 201 });
}
