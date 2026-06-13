import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { data, error } = await supabase
    .from('beneficiary_accounts')
    .select('account_number, beneficiary_name, bank_name, bank_address, swift_code, routing_number, currency')
    .eq('account_number', accountNumber.trim())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
