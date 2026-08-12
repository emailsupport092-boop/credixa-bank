import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendPasswordResetEmail } from '@/lib/email/send';
import { generateOTP, hashOTP, getOTPExpiry, OTP_EXPIRY_MINUTES } from '@/lib/otp/generate';

const GENERIC_SENT_MESSAGE = 'If that email exists, a reset code has been sent.';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const supabase = createAdminClient();

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: 'Failed to look up account' }, { status: 500 });

    const user = users.find((u) => u.email === email);
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: GENERIC_SENT_MESSAGE });
    }

    // Rate-limit: no more than 1 code per minute
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
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    const firstName = user.user_metadata?.first_name || email.split('@')[0];
    await sendPasswordResetEmail(email, firstName, otp, OTP_EXPIRY_MINUTES);

    return NextResponse.json({ message: GENERIC_SENT_MESSAGE, expiresIn: OTP_EXPIRY_MINUTES * 60 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
