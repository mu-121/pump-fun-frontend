import { useMemo, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import {
  ConnectionProvider as _ConnectionProvider,
  WalletProvider as _WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@/providers/WalletModalProvider';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
// NOTE: Backpack supports the Solana Wallet Standard natively, so it shows up
// in the modal automatically without a dedicated adapter (the older
// BackpackWalletAdapter has been removed from @solana/wallet-adapter-wallets).
//
// The wallet-adapter packages were compiled against newer React types that
// declare components as `() => ReactNode | Promise<ReactNode>`. Our app uses
// React 18 types where JSX.Element requires plain `ReactNode`. The cast below
// reconciles the type — the runtime behavior is unchanged.
const ConnectionProvider = _ConnectionProvider as unknown as ComponentType<
  Parameters<typeof _ConnectionProvider>[0]
>;
const WalletProvider = _WalletProvider as unknown as ComponentType<
  Parameters<typeof _WalletProvider>[0]
>;

import { Toaster } from 'react-hot-toast';
import { env } from '@/lib/env';

import '@solana/wallet-adapter-react-ui/styles.css';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 15_000,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Top-level provider stack. Order matters:
 *   Router → QueryClient → SolanaConnection → Wallets → WalletModal → Toaster → app
 */
export function AppProviders({ children }: AppProvidersProps): JSX.Element {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={env.solanaRpcUrl}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#1c1f26',
                    color: '#e7e9ec',
                    border: '1px solid #262932',
                    fontSize: '0.875rem',
                    borderRadius: '0.5rem',
                  },
                  success: { iconTheme: { primary: '#00d97e', secondary: '#0a0b0d' } },
                  error: { iconTheme: { primary: '#f43f5e', secondary: '#0a0b0d' } },
                }}
              />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
