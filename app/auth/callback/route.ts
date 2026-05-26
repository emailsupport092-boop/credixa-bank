import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `next` lets us control where to send the user after exchange (default: dashboard)
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Invalid+confirmation+link`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/link-expired`);
  }

  // Password recovery flow — the user needs to enter a new password
  const isRecovery = (data.session.user as any)?.amr?.some((m: any) => m.method === 'recovery');
  if (isRecovery) {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  // Email confirmation — sign them out so they log in fresh, show success page
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/email-verified`);
}
