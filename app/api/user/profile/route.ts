import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function fallbackProfile(user: any) {
  return {
    id: user.id,
    email: user.email ?? '',
    first_name: user.user_metadata?.first_name ?? user.email?.split('@')[0] ?? 'User',
    last_name: user.user_metadata?.last_name ?? '',
    kyc_status: 'pending',
    role: 'user',
    status: 'active',
    two_factor_enabled: false,
    created_at: user.created_at,
  };
}

export async function GET() {
  let user: any = null;
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    user = authUser;

    // Use service-role client so RLS never blocks reading the user's own profile
    const adminClient = createAdminClient();
    const { data: profile, error } = await adminClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(fallbackProfile(user));
    }

    return NextResponse.json(profile);
  } catch {
    // If we at least have the user from auth, return a minimal profile
    if (user) return NextResponse.json(fallbackProfile(user));
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
