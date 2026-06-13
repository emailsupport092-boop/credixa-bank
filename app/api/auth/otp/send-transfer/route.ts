import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateOTP, hashOTP, getOTPExpiry, OTP_EXPIRY_MINUTES } from '@/lib/otp/generate';
import { sendTransferOTPEmail } from '@/lib/email/send';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  // Rate-limit: no more than 1 OTP per minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
  const { data: recentOTP } = await supabase
    .from('otp_codes')
    .select('created_at')
    .eq('user_id', user.id)
    .eq('used', false)
    .gte('created_at', oneMinuteAgo)
    .limit(1)
    .single();

  if (recentOTP) {
    return NextResponse.json(
      { error: 'Please wait before requesting another code' },
      { status: 429 }
    );
  }

  // Invalidate any existing unused OTPs for this user
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
    await sendTransferOTPEmail(profile.email, profile.first_name, otp, OTP_EXPIRY_MINUTES);
  } catch (emailErr) {
    console.error('Transfer OTP email failed:', emailErr);
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Transfer verification code sent',
    expiresIn: OTP_EXPIRY_MINUTES * 60,
  });
}
