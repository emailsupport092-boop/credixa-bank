import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hashOTP, MAX_ATTEMPTS } from '@/lib/otp/generate';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== 'string' || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 });
  }

  // Find the most recent valid OTP for this user
  const { data: otpRecord, error: fetchError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('user_id', user.id)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !otpRecord) {
    return NextResponse.json(
      { error: 'Verification code not found or has expired. Request a new one.' },
      { status: 400 }
    );
  }

  // Check attempt limit
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    return NextResponse.json(
      { error: 'Too many failed attempts. Please request a new code.' },
      { status: 429 }
    );
  }

  const expectedHash = hashOTP(code, user.id);
  const isValid = expectedHash === otpRecord.code_hash;

  if (!isValid) {
    // Increment attempt counter
    await supabase
      .from('otp_codes')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);

    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    return NextResponse.json(
      {
        error: `Invalid code. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : 'No more attempts. Request a new code.'}`,
        attemptsRemaining: remaining,
      },
      { status: 400 }
    );
  }

  // Mark OTP as used
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', otpRecord.id);

  // Clear the pending 2FA cookie
  const cookieStore = await cookies();
  cookieStore.delete('pending_2fa');

  return NextResponse.json({ message: 'Verified successfully' });
}
