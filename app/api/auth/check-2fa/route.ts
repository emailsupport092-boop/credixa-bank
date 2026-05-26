import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOTP, hashOTP, getOTPExpiry, OTP_EXPIRY_MINUTES } from '@/lib/otp/generate';
import { sendOTPEmail } from '@/lib/email/send';
import { cookies } from 'next/headers';

/**
 * Called immediately after a successful Supabase signInWithPassword.
 * Checks if 2FA is enabled. If so, generates/sends OTP and sets
 * a pending_2fa cookie so the proxy can gate protected routes.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No active session' }, { status: 401 });
  }

  if (!user.email_confirmed_at) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: 'Please verify your email before signing in. Check your inbox for the confirmation link.' },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name, two_factor_enabled')
    .eq('id', user.id)
    .single();

  if (!profile?.two_factor_enabled) {
    return NextResponse.json({ requires_2fa: false });
  }

  // Invalidate old unused OTPs
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('user_id', user.id)
    .eq('used', false);

  const otp = generateOTP();
  const codeHash = hashOTP(otp, user.id);

  const { error: insertError } = await supabase.from('otp_codes').insert({
    user_id: user.id,
    code_hash: codeHash,
    expires_at: getOTPExpiry().toISOString(),
    attempts: 0,
    used: false,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
  }

  try {
    await sendOTPEmail(profile.email, profile.first_name, otp, OTP_EXPIRY_MINUTES);
  } catch (emailErr) {
    console.error('OTP email failed:', emailErr);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }

  // Set an httpOnly cookie to block protected routes until OTP is verified
  const cookieStore = await cookies();
  cookieStore.set('pending_2fa', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OTP_EXPIRY_MINUTES * 60,
    path: '/',
  });

  return NextResponse.json({
    requires_2fa: true,
    message: 'Verification code sent to your email',
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  });
}
