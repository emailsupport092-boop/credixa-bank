import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendLoanApplicationEmail } from '@/lib/email/send';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('loans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { principalAmount, loanTerm, purpose } = body;

  const interestRate = principalAmount > 100000 ? 2.5 : principalAmount > 50000 ? 3.5 : principalAmount > 10000 ? 4.5 : 5.5;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = principalAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / (Math.pow(1 + monthlyRate, loanTerm) - 1);
  const totalAmount = monthlyPayment * loanTerm;
  const totalInterest = totalAmount - principalAmount;

  const { data, error } = await supabase
    .from('loans')
    .insert({
      user_id: user.id,
      principal_amount: principalAmount,
      interest_rate: interestRate,
      loan_term: loanTerm,
      monthly_payment: monthlyPayment,
      total_interest: totalInterest,
      total_amount: totalAmount,
      purpose,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profile } = await supabase
    .from('users')
    .select('email, first_name')
    .eq('id', user.id)
    .single();

  if (profile) {
    try {
      await sendLoanApplicationEmail(profile.email, profile.first_name, principalAmount, loanTerm, monthlyPayment);
    } catch (e) {
      console.error('Email failed:', e);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
