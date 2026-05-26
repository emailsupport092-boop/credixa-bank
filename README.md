# 🏛️ Credixa Bank

A complete fintech banking application built with Next.js 16, Supabase, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router)
- **Database + Auth**: Supabase (PostgreSQL + Auth + RLS)
- **Email**: Resend
- **Crypto**: CoinGecko API (free, no key needed)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Validation**: Zod + React Hook Form
- **Charts**: Recharts
- **Animations**: Framer Motion

## Features

- User registration & login (Supabase Auth)
- Dashboard with live crypto ticker (Bitcoin, Ethereum, Cardano)
- Account management (savings, current, investment)
- Money transfers with multiple speed options
- Loan calculator with real-time calculations
- KYC verification workflow
- Card management
- Transaction history with filters & pagination
- Admin panel (user management, KYC approvals, loan approvals)
- Email notifications via Resend
- Protected routes via proxy (auth middleware)
- Full TypeScript, RLS on all tables

## Setup

### 1. Environment Variables

Copy `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Database Setup

1. Create a new Supabase project
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. This creates all tables, indexes, and RLS policies

### 3. Supabase Storage

Create a storage bucket named `kyc-documents` (private, max 10MB).

### 4. Resend Email

Sign up at [resend.com](https://resend.com) and get your API key (100 emails/day free).

### 5. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Make Yourself Admin

After registering, run this in Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

## Deployment to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables
4. Deploy!

## Project Structure

```
app/
├── (auth)/          # Login, Register, Forgot Password
├── (dashboard)/     # Dashboard, Accounts, Transactions, etc.
├── admin/           # Admin panel
└── api/             # All API routes
components/
├── auth/            # LoginForm, RegisterForm
├── common/          # Navbar, Button, Card, Modal
├── dashboard/       # AccountBalance, CryptoTicker, QuickActions
├── loans/           # LoanCalculator
└── transactions/    # TransferForm
lib/
├── supabase/        # Client + Server Supabase instances
├── email/           # Resend email templates
├── crypto/          # CoinGecko API
└── validators/      # Zod schemas
```
