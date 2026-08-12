import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accountNumber } = await params;
  // Strip all whitespace, not just leading/trailing — account numbers are
  // often copied from a display that groups digits with spaces.
  const trimmed = accountNumber.replace(/\s+/g, '');

  // First check whether this is a real Credixa customer's account — if so,
  // auto-load their name straight from the ledger, just like an internal
  // bank transfer would. RLS scopes the regular client to the caller's own
  // accounts, so this lookup needs the admin client; only the fields below
  // are ever forwarded to the response.
  const admin = createAdminClient();
  const { data: internalAccount } = await admin
    .from('accounts')
    .select('account_number, currency, user_id, users:user_id(first_name, last_name)')
    .eq('account_number', trimmed)
    .eq('status', 'active')
    .single();

  if (internalAccount) {
    const owner = Array.isArray(internalAccount.users) ? internalAccount.users[0] : internalAccount.users;

    if (owner && internalAccount.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot transfer to your own account' }, { status: 400 });
    }

    if (owner) {
      return NextResponse.json({
        account_number: internalAccount.account_number,
        beneficiary_name: `${owner.first_name} ${owner.last_name}`,
        bank_name: 'Credixa Bank',
        bank_address: 'Credixa Bank — Internal Transfer',
        swift_code: null,
        routing_number: 'INTERNAL',
        currency: internalAccount.currency,
        is_internal: true,
      });
    }
  }

  // Fall back to the admin-curated external beneficiary registry.
  const { data, error } = await supabase
    .from('beneficiary_accounts')
    .select('account_number, beneficiary_name, bank_name, bank_address, swift_code, routing_number, currency')
    .eq('account_number', trimmed)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json({ ...data, is_internal: false });
}
