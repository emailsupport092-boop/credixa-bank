import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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

const ALLOWED_KEYS = ['transfer_success_message', 'transfer_failure_message'];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createAdminClient();
  const { data, error } = await db
    .from('system_config')
    .select('key, value')
    .in('key', ALLOWED_KEYS);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Return as a flat object { transfer_success_message: '...', transfer_failure_message: '...' }
  const config = Object.fromEntries((data || []).map(({ key, value }) => [key, value]));
  return NextResponse.json(config);
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const db = createAdminClient();

  const updates = Object.entries(body).filter(([k]) => ALLOWED_KEYS.includes(k));
  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid config keys provided' }, { status: 400 });
  }

  for (const [key, value] of updates) {
    const { error } = await db
      .from('system_config')
      .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
