import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendEmailConfirmationEmail } from '@/lib/email/send';
import { registerSchema } from '@/lib/validators/auth';
import { generateOTP, hashOTP, getOTPExpiry, OTP_EXPIRY_MINUTES } from '@/lib/otp/generate';

function generateAccountNumber(): string {
  let number = '';
  for (let i = 0; i < 10; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, first_name, last_name, phone, date_of_birth, nationality, address } = parsed.data;
    const supabase = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      email,
      first_name,
      last_name,
      phone,
      date_of_birth,
      nationality,
      address,
      kyc_status: 'pending',
      role: 'user',
      status: 'active',
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        account_number: generateAccountNumber(),
        account_type: 'savings',
        currency: 'USD',
        balance: 0,
        status: 'active',
      })
      .select()
      .single();

    if (accountError) {
      await supabase.from('users').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to open account. Please try again.' }, { status: 500 });
    }

    try {
      const otp = generateOTP();
      const codeHash = hashOTP(otp, userId);
      await supabase.from('otp_codes').insert({
        user_id: userId,
        code_hash: codeHash,
        expires_at: getOTPExpiry().toISOString(),
        attempts: 0,
        used: false,
      });
      await sendEmailConfirmationEmail(email, first_name, otp, OTP_EXPIRY_MINUTES);
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
    }

    return NextResponse.json(
      { message: 'Account created successfully', userId, accountNumber: account.account_number },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
