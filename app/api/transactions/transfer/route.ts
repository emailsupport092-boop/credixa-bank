import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { sendTransactionEmail } from '@/lib/email/send';

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
  const {
    fromAccountId,
    beneficiaryAccountNumber,
    beneficiaryName,
    bankName,
    bankAddress,
    amount,
    purpose,
    swiftCode,
    routingNumber,
  } = body;

  if (!fromAccountId || !beneficiaryAccountNumber || !beneficiaryName || !bankName || !amount || amount <= 0) {
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

  if (fromAccount.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
  }

  // Re-resolve the beneficiary server-side — never trust the client's name/bank
  // fields for money that's about to move. If the account number belongs to a
  // real Credixa customer, this is an internal transfer: credited automatically
  // on completion (see the admin PATCH handler), using our own records.
  const admin = createAdminClient();
  const normalizedAccountNumber = String(beneficiaryAccountNumber).replace(/\s+/g, '');
  const { data: internalAccount } = await admin
    .from('accounts')
    .select('id, user_id, currency, users:user_id(first_name, last_name)')
    .eq('account_number', normalizedAccountNumber)
    .eq('status', 'active')
    .single();

  const owner = internalAccount
    ? (Array.isArray(internalAccount.users) ? internalAccount.users[0] : internalAccount.users)
    : null;

  if (internalAccount && owner && internalAccount.user_id === user.id) {
    return NextResponse.json({ error: 'You cannot transfer to your own account' }, { status: 400 });
  }

  const isInternal = Boolean(internalAccount && owner);

  const reference = generateReference();

  // Create transaction as pending — admin will approve/reject
  const { data: transaction, error: txError } = await supabase
    .from('transactions')
    .insert({
      from_account_id: fromAccountId,
      from_user_id: user.id,
      to_account_id: isInternal ? internalAccount!.id : null,
      to_user_id: isInternal ? internalAccount!.user_id : null,
      amount,
      type: 'transfer',
      status: 'pending',
      description: purpose,
      reference,
      beneficiary_name: isInternal ? `${owner!.first_name} ${owner!.last_name}` : beneficiaryName,
      bank_name: isInternal ? 'Credixa Bank' : bankName,
      bank_address: isInternal ? 'Credixa Bank — Internal Transfer' : bankAddress,
      swift_code: isInternal ? null : swiftCode || null,
      routing_number: isInternal ? 'INTERNAL' : routingNumber,
      purpose,
    })
    .select()
    .single();

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 });
  }

  // Debit funds immediately (held in transit until admin approves)
  const { error: debitError } = await supabase
    .from('accounts')
    .update({ balance: fromAccount.balance - amount })
    .eq('id', fromAccountId);

  if (debitError) {
    await supabase.from('transactions').delete().eq('id', transaction.id);
    return NextResponse.json({ error: 'Failed to process transfer' }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', user.id)
    .single();

  if (profile) {
    try {
      await sendTransactionEmail(profile.email, profile.first_name, amount, 'sent', reference, purpose);
    } catch (e) {
      console.error('Email send failed:', e);
    }
  }

  return NextResponse.json(
    {
      transactionId: transaction.id,
      reference,
      beneficiaryName: transaction.beneficiary_name,
      bankName: transaction.bank_name,
      beneficiaryAccountNumber: normalizedAccountNumber,
      amount,
    },
    { status: 201 }
  );
}
