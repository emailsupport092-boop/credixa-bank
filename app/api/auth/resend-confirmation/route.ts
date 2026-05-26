import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmailConfirmationEmail } from '@/lib/email/send';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const supabase = createAdminClient();

    // Look up the user
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: 'Failed to look up account' }, { status: 500 });

    const user = users.find((u) => u.email === email);
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({ message: 'If that email exists, a confirmation link has been sent.' });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ error: 'This email is already verified. You can sign in.' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000';
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${appUrl}/auth/callback` },
    });

    if (linkError || !linkData?.properties?.action_link) {
      return NextResponse.json({ error: 'Failed to generate confirmation link' }, { status: 500 });
    }

    const firstName = user.user_metadata?.first_name || email.split('@')[0];
    await sendEmailConfirmationEmail(email, firstName, linkData.properties.action_link);

    return NextResponse.json({ message: 'Confirmation email sent.' });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
