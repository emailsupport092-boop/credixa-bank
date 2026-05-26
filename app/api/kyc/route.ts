import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendKYCStatusEmail } from '@/lib/email/send';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('kyc_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { id_type, id_number, first_name, last_name, date_of_birth, nationality, phone, address } = body;

  const { data: existing } = await supabase
    .from('kyc_submissions')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existing) {
    return NextResponse.json({ error: 'You have a pending KYC submission' }, { status: 400 });
  }

  await supabase.from('users').update({ first_name, last_name, phone, date_of_birth }).eq('id', user.id);

  const { data, error } = await supabase
    .from('kyc_submissions')
    .insert({
      user_id: user.id,
      id_type,
      id_number,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from('users').update({ kyc_status: 'submitted' }).eq('id', user.id);

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', user.id)
    .single();

  if (profile) {
    try {
      await sendKYCStatusEmail(profile.email, profile.first_name, 'submitted');
    } catch (e) {
      console.error('Email failed:', e);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
