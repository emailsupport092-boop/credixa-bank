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

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('id, status, reference, amount, beneficiary_name, bank_name, created_at')
    .eq('id', id)
    .eq('from_user_id', user.id)
    .single();

  if (error || !tx) {
    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  }

  // If a terminal status, attach the global config message
  if (tx.status === 'completed' || tx.status === 'failed') {
    const db = createAdminClient();
    const configKey = tx.status === 'completed' ? 'transfer_success_message' : 'transfer_failure_message';

    const { data: configRow } = await db
      .from('system_config')
      .select('value')
      .eq('key', configKey)
      .single();

    const messageField = tx.status === 'completed' ? 'success_message' : 'error_message';
    return NextResponse.json({
      ...tx,
      [messageField]: configRow?.value ?? null,
    });
  }

  return NextResponse.json(tx);
}
