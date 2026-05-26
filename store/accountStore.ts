import { create } from 'zustand';
import { Account } from '@/types';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  updateBalance: (accountId: string, newBalance: number) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  selectedAccount: null,
  setAccounts: (accounts) => set({ accounts }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  updateBalance: (accountId, newBalance) =>
    set((state) => ({
      accounts: state.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, balance: newBalance } : acc
      ),
      selectedAccount:
        state.selectedAccount?.id === accountId
          ? { ...state.selectedAccount, balance: newBalance }
          : state.selectedAccount,
    })),
}));
