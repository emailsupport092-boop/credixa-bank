import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateAccountNumber(): string {
  let number = '';
  for (let i = 0; i < 10; i++) {
    number += Math.floor(Math.random() * 10).toString();
  }
  return number;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { account_type, currency = 'USD' } = body;

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      account_number: generateAccountNumber(),
      account_type: account_type || 'savings',
      currency,
      balance: 0,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
