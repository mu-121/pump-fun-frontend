import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/providers/WalletModalProvider';
import { Button } from '@/components/ui/Button';
import { formatAddress } from '@/lib/format';

/**
 * High-fidelity custom Wallet Connect/Disconnect button.
 * Integrates perfectly with the new custom WalletModalProvider.
 */
export function WalletButton(): JSX.Element {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (!publicKey) {
    return (
      <Button
        variant="primary"
        onClick={() => setVisible(true)}
        className="h-10 px-4 rounded-xl text-sm font-semibold flex-shrink-0 transition-[background-color,box-shadow,opacity,translate] duration-150"
      >
        Sign in
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={() => {
        void disconnect();
      }}
      className="h-10 px-4 rounded-xl text-sm font-mono flex-shrink-0 transition-colors duration-150 border border-border"
      title="Click to disconnect"
    >
      {formatAddress(publicKey.toBase58(), 4, 4)}
    </Button>
  );
}
