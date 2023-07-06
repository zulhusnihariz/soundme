import { StateCreator } from 'zustand';
import { resetters } from '..';
import { PhantomProvider } from 'lib/Phantom';

export type Wallet = {
  address: string;
  balance: number;
  provider: PhantomProvider | undefined;
};

export enum CURRENT_CHAIN {
  SOLANA = 'solana',
  EVM = 'evm',
  NEAR = 'near',
}

type PartialWallet = Partial<{
  phantom: Partial<Wallet>;
  near: Partial<Wallet>;
}>;

export interface WalletSlice {
  currentChain: CURRENT_CHAIN | null;
  wallet: { phantom: Wallet; near: Wallet };
  setCurrentChain: (chain: CURRENT_CHAIN | null) => void;
  setWalletState: (wallet: PartialWallet) => void;
  resetWallet: () => void;
}

const initialWallet = {
  currentChain: null,
  wallet: {
    phantom: {
      address: '',
      provider: undefined,
      balance: 0,
    },
    near: {
      address: '',
      provider: undefined,
      balance: 0,
    },
  },
};

export const createWalletSlice: StateCreator<WalletSlice, [], [], WalletSlice> = set => {
  resetters.push(() => set(initialWallet));

  return {
    ...initialWallet,
    setCurrentChain: chain => {
      set({ currentChain: chain });
    },
    setWalletState: wallet => {
      let key = Object.keys(wallet)[0] as 'phantom' | 'near';

      set(state => ({
        wallet: { ...state.wallet, [key]: Object.assign(state.wallet[key], wallet[key]) },
      }));
    },
    resetWallet: () => {
      set({ ...initialWallet });
    },
  };
};
