import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { principalAmount, loanTerm } = body;

  if (!principalAmount || !loanTerm) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const interestRate =
    principalAmount > 100000 ? 2.5 :
    principalAmount > 50000 ? 3.5 :
    principalAmount > 10000 ? 4.5 : 5.5;

  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment =
    principalAmount *
    (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
    (Math.pow(1 + monthlyRate, loanTerm) - 1);

  const totalAmount = monthlyPayment * loanTerm;
  const totalInterest = totalAmount - principalAmount;

  return NextResponse.json({
    principalAmount,
    interestRate,
    loanTerm,
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  });
}
