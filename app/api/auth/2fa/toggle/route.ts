import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { send2FAStatusEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { enabled } = body;

  if (typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: profile, error } = await supabase
    .from('users')
    .update({ two_factor_enabled: enabled })
    .eq('id', user.id)
    .select('email, first_name')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    await send2FAStatusEmail(profile.email, profile.first_name, enabled);
  } catch (emailErr) {
    console.error('2FA status email failed:', emailErr);
  }

  return NextResponse.json({
    message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
    two_factor_enabled: enabled,
  });
}
