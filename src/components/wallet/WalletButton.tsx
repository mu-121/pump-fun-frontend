import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

/**
 * Thin wrapper around the wallet-adapter multi-button. Lets us swap the
 * implementation later (or add balance display) without touching every call site.
 */
export function WalletButton(): JSX.Element {
  return <WalletMultiButton />;
}
