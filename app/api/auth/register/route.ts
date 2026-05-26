import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendEmailConfirmationEmail } from '@/lib/email/send';
import { registerSchema } from '@/lib/validators/auth';

function generateAccountNumber(): string {
  return 'CB' + Math.random().toString().slice(2, 12).padStart(10, '0');
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

    const { email, password, first_name, last_name } = parsed.data;
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
      kyc_status: 'pending',
      role: 'user',
      status: 'active',
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: accountError } = await supabase.from('accounts').insert({
      user_id: userId,
      account_number: generateAccountNumber(),
      account_type: 'savings',
      currency: 'USD',
      balance: 0,
      status: 'active',
    });

    if (accountError) {
      console.error('Account creation error:', accountError);
    }

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'signup',
        email,
        password,
        options: { redirectTo: `${appUrl}/auth/callback` },
      });
      const confirmLink = linkData?.properties?.action_link;
      if (confirmLink) {
        await sendEmailConfirmationEmail(email, first_name, confirmLink);
      }
    } catch (emailErr) {
      console.error('Confirmation email failed:', emailErr);
    }

    return NextResponse.json({ message: 'Account created successfully', userId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
