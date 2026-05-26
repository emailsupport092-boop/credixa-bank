export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  avatar_url?: string;
}

export interface Account {
  id: string;
  user_id: string;
  account_number: string;
  account_type: 'savings' | 'current' | 'investment';
  currency: string;
  balance: number;
  status: 'active' | 'frozen' | 'closed';
  created_at: string;
}

export interface Transaction {
  id: string;
  from_account_id?: string;
  to_account_id?: string;
  from_user_id?: string;
  to_user_id?: string;
  amount: number;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference: string;
  created_at: string;
  category?: string;
}

export interface Loan {
  id: string;
  user_id: string;
  principal_amount: number;
  interest_rate: number;
  loan_term: number;
  monthly_payment: number;
  total_interest: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'paid' | 'defaulted';
  purpose?: string;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  account_id: string;
  card_type: 'visa' | 'mastercard';
  card_name: string;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  status: 'active' | 'blocked' | 'expired' | 'pending';
  created_at: string;
}

export interface KYCSubmission {
  id: string;
  user_id: string;
  id_type: 'passport' | 'drivers_license' | 'national_id';
  id_number: string;
  id_document_url?: string;
  selfie_url?: string;
  address_proof_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'transaction' | 'loan' | 'kyc' | 'security' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  image: string;
  market_cap: number;
}

export interface LoanCalculation {
  principalAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

export interface TransferFormData {
  fromAccountId: string;
  toRecipient: string;
  amount: number;
  description?: string;
  transferSpeed: 'instant' | 'standard' | 'economy';
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
}
