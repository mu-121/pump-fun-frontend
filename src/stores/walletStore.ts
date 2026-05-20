import { create } from 'zustand';

interface WalletState {
  /** Last-known SOL balance for the connected wallet, in lamports. */
  solBalanceLamports: bigint | null;
  setSolBalanceLamports: (v: bigint | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  solBalanceLamports: null,
  setSolBalanceLamports: (v) => set({ solBalanceLamports: v }),
}));
