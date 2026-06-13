import { z } from 'zod';

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters').max(50),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Please select an account'),
  toRecipient: z.string().min(1, 'Please enter a recipient'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(1000000),
  description: z.string().optional(),
  transferSpeed: z.enum(['instant', 'standard', 'economy']),
});

export const bankTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'Please select a source account'),
  beneficiaryAccountNumber: z.string().min(1, 'Please enter a beneficiary account number'),
  beneficiaryName: z.string().min(1, 'Beneficiary name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  bankAddress: z.string().min(1, 'Bank address is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(10_000_000),
  purpose: z.string().min(1, 'Purpose of payment is required'),
  swiftCode: z.string().optional(),
  routingNumber: z.string().min(1, 'Routing number is required'),
});

export const loanApplicationSchema = z.object({
  principalAmount: z.number().min(1000).max(500000),
  loanTerm: z.number().min(6).max(60),
  purpose: z.string().min(10, 'Please describe the purpose of the loan'),
  monthlyIncome: z.number().min(1000, 'Monthly income must be at least $1,000'),
});

export const kycStep1Schema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter your full address'),
});

export const kycStep2Schema = z.object({
  id_type: z.enum(['passport', 'drivers_license', 'national_id']),
  id_number: z.string().min(5, 'Please enter your document number'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type BankTransferFormData = z.infer<typeof bankTransferSchema>;
export type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;
export type KYCStep1FormData = z.infer<typeof kycStep1Schema>;
export type KYCStep2FormData = z.infer<typeof kycStep2Schema>;
