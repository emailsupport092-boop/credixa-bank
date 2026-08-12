import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { hashOTP, MAX_ATTEMPTS } from '@/lib/otp/generate';

const INVALID_OR_EXPIRED = 'Verification code not found or has expired. Request a new one.';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!code || typeof code !== 'string' || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Please enter a valid 6-digit code' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: 'Server error' }, { status: 500 });

    const user = users.find((u) => u.email === email);
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ error: INVALID_OR_EXPIRED }, { status: 400 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ message: 'Email already verified' });
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
      return NextResponse.json({ error: INVALID_OR_EXPIRED }, { status: 400 });
    }

    // Check attempt limit
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    const expectedHash = hashOTP(code, user.id);
    const isValid = expectedHash === otpRecord.code_hash;

    if (!isValid) {
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

    // Mark OTP as used and confirm the email
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    if (updateError) {
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
