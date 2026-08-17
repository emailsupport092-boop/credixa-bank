import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // RLS scopes this to transactions where the caller is the sender or the
  // recipient — nothing further to check here.
  const { data: tx, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  const isSender = tx.from_user_id === user.id;
  const admin = createAdminClient();

  // tx.beneficiary_account_number is always the destination account number
  // (internal or external), so the only lookup needed is the sender's own
  // account — either party may need it (the sender to see it as "their"
  // account, the recipient to see it as the counterparty's).
  const { data: fromAccount } = tx.from_account_id
    ? await admin.from('accounts').select('account_number').eq('id', tx.from_account_id).single()
    : { data: null };

  // The transaction row already stores the recipient's name (beneficiary_name)
  // as seen from the sender's side. A recipient viewing a received transfer
  // needs the *sender's* name instead — RLS blocks a direct cross-user read
  // of the users table, so resolve it here with the admin client.
  let counterpartyName = tx.beneficiary_name;
  if (!isSender && tx.from_user_id) {
    const { data: sender } = await admin
      .from('users')
      .select('first_name, last_name')
      .eq('id', tx.from_user_id)
      .single();
    if (sender) counterpartyName = `${sender.first_name} ${sender.last_name}`;
  }

  return NextResponse.json({
    id: tx.id,
    reference: tx.reference,
    type: tx.type,
    status: tx.status,
    amount: tx.amount,
    purpose: tx.purpose,
    description: tx.description,
    created_at: tx.created_at,
    direction: isSender ? 'sent' : 'received',
    is_internal: Boolean(tx.to_account_id),
    counterparty_name: counterpartyName,
    own_account_number: isSender ? fromAccount?.account_number : tx.beneficiary_account_number,
    counterparty_account_number: isSender ? tx.beneficiary_account_number : fromAccount?.account_number,
    bank_name: tx.bank_name,
    bank_address: tx.bank_address,
    swift_code: tx.swift_code,
    routing_number: tx.routing_number,
    error_message: tx.error_message,
    success_message: tx.success_message,
  });
}
