import { createContext, useContext, useState, type ReactNode } from 'react';
import { WalletModal } from '@/components/wallet/WalletModal';

interface WalletModalContextState {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const WalletModalContext = createContext<WalletModalContextState | undefined>(undefined);

interface WalletModalProviderProps {
  children: ReactNode;
}

export function WalletModalProvider({ children }: WalletModalProviderProps): JSX.Element {
  const [visible, setVisible] = useState(false);

  return (
    <WalletModalContext.Provider value={{ visible, setVisible }}>
      {children}
      <WalletModal />
    </WalletModalContext.Provider>
  );
}

export function useWalletModal(): WalletModalContextState {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
}
