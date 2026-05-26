import LoanCalculator from '@/components/loans/LoanCalculator';

export const metadata = { title: 'Loan Calculator — Credixa Bank' };

export default function LoanCalculatorPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loan Calculator</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Estimate your monthly repayments in real-time</p>
      </div>
      <LoanCalculator />
    </div>
  );
}
