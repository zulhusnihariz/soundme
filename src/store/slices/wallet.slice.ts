import { StateCreator } from 'zustand';
import { resetters } from '..';
import { PhantomProvider } from 'lib/Phantom';
import { NearProvider } from 'lib/Near';

export enum CURRENT_CHAIN {
  SOLANA = 'solana',
  EVM = 'evm',
  NEAR = 'near',
}

type WalletBalance = {
  decimals?: number;
  formatted: string;
  symbol?: string;
};

export type Wallet<P> = {
  address: string;
  publicKey: string;
  balance: WalletBalance;
  provider: P | undefined;
};

type CurrentWallet = Omit<Wallet<undefined>, 'provider'> & {
  chain: CURRENT_CHAIN | null;
};

type PartialWallet = Partial<{
  evm: Partial<Wallet<undefined>>;
  phantom: Partial<Wallet<PhantomProvider>>;
  near: Partial<Wallet<NearProvider>>;
}>;

type PartialCurrentWallet = Partial<CurrentWallet>;

export interface WalletSlice {
  current: CurrentWallet;
  wallet: { evm: Wallet<undefined>; phantom: Wallet<PhantomProvider>; near: Wallet<NearProvider> };
  setCurrentState: (chain: PartialCurrentWallet) => void;
  setWalletState: (wallet: PartialWallet) => void;
  resetWallet: () => void;
}

const initialWallet = {
  current: {
    chain: null,
    address: '',
    publicKey: '',
    balance: {
      formatted: '',
      symbol: '',
    },
  },
  wallet: {
    evm: {
      address: '',
      publicKey: '',
      provider: undefined,
      balance: {
        decimals: 0,
        formatted: '',
        symbol: '',
      },
    },
    phantom: {
      address: '',
      publicKey: '',
      provider: undefined,
      balance: {
        decimals: 0,
        formatted: '',
        symbol: 'SOL',
      },
    },
    near: {
      address: '',
      publicKey: '',
      provider: undefined,
      balance: {
        decimals: 0,
        formatted: '',
        symbol: 'NEAR',
      },
    },
  },
};

export const createWalletSlice: StateCreator<WalletSlice, [], [], WalletSlice> = set => {
  resetters.push(() => set(initialWallet));

  return {
    ...initialWallet,
    setCurrentState: current => {
      set(state => ({ current: Object.assign(state.current, current) }));
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
