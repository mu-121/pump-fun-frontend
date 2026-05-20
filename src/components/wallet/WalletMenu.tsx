import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  User,
  Wallet,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useSolBalance } from '@/hooks/useBalances';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { copyToClipboard, formatAddress, formatSol } from '@/lib/format';
import { getAccountExplorerUrl } from '@/lib/tx';
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils';

/**
 * Wallet pill + popover combo. Mirrors pump.fun's avatar dropdown:
 *   - shows the connected address (truncated) and a green online dot
 *   - on click, opens a popover with SOL balance, Deposit / Withdraw, and Disconnect
 *
 * Deposit pops a modal with a QR + address. Withdraw is a UI placeholder for
 * the demo — actual SOL transfer would need a real fund-management flow.
 */
export function WalletMenu(): JSX.Element {
  const { publicKey, disconnect } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const sol = useSolBalance();

  const [open, setOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!publicKey) {
    return (
      <Button
        variant="primary"
        onClick={() => openWalletModal(true)}
        className={cn(
          'h-10 px-[14px] rounded-xl',
          'text-[14px] font-semibold flex-shrink-0',
          'transition-[background-color,box-shadow,opacity,translate] duration-150',
        )}
      >
        Sign in
      </Button>
    );
  }

  const address = publicKey.toBase58();
  const avatarSeed = address.slice(0, 2);

  return (
    <>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-full border border-border bg-surface-elevated hover:border-text-muted/40 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="relative">
            <span className="grid place-items-center h-6 w-6 rounded-full bg-gradient-to-br from-accent to-primary text-[10px] font-bold text-background">
              {avatarSeed.toUpperCase()}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary border border-surface-elevated" />
          </span>
          <span className="text-xs font-mono text-text-primary">{formatAddress(address, 3, 4)}</span>
        </button>

        {open ? (
          <div
            ref={popRef}
            role="menu"
            className="absolute right-0 mt-2 w-[300px] rounded-xl border border-border bg-surface shadow-glow z-50 animate-fade-in"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-accent to-primary text-xs font-bold text-background">
                  {avatarSeed.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(address, { successMessage: 'Address copied' });
                      void ok;
                    }}
                    className="flex items-center gap-1.5 text-xs font-mono text-text-primary hover:text-primary transition-colors"
                  >
                    {formatAddress(address, 6, 6)}
                    <Copy className="h-3 w-3" />
                  </button>
                  <a
                    href={getAccountExplorerUrl(address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary"
                  >
                    View on Solscan
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-surface-elevated border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-text-muted">Balance</p>
                <p className="mt-0.5 font-mono text-base font-semibold text-text-primary">
                  {sol.lamports == null
                    ? '—'
                    : formatSol(sol.lamports, { fractionDigits: 4 })}
                </p>
              </div>
            </div>

            <div className="p-2">
              <MenuRow
                icon={<ArrowDownToLine className="h-4 w-4" />}
                label="Deposit"
                onClick={() => {
                  setOpen(false);
                  setDepositOpen(true);
                }}
              />
              <MenuRow
                icon={<ArrowUpFromLine className="h-4 w-4" />}
                label="Withdraw"
                onClick={() => {
                  setOpen(false);
                  setWithdrawOpen(true);
                }}
              />
              <Link
                to={`/profile/${address}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 h-9 px-3 rounded-md text-sm text-text-primary hover:bg-surface-elevated transition-colors"
              >
                <User className="h-4 w-4" />
                <span>My profile</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await disconnect();
                  toast.success('Wallet disconnected');
                }}
                className="w-full flex items-center gap-2 h-9 px-3 rounded-md text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <DepositModal open={depositOpen} address={address} onClose={() => setDepositOpen(false)} />
      <WithdrawModal
        open={withdrawOpen}
        balanceLamports={sol.lamports}
        onClose={() => setWithdrawOpen(false)}
      />
    </>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 h-9 px-3 rounded-md text-sm text-text-primary hover:bg-surface-elevated transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DepositModal({
  open,
  address,
  onClose,
}: {
  open: boolean;
  address: string;
  onClose: () => void;
}): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deposit SOL"
      description="Send SOL or SPL tokens to this address from any wallet or exchange."
    >
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={address} size={176} includeMargin={false} />
        </div>
        <div className="w-full rounded-lg border border-border bg-surface-elevated p-3 flex items-center justify-between gap-2">
          <span className="font-mono text-xs break-all text-text-primary">{address}</span>
          <button
            type="button"
            aria-label="Copy address"
            onClick={async () => {
              const ok = await copyToClipboard(address, { successMessage: 'Address copied' });
              if (ok) {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              }
            }}
            className="shrink-0 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-[11px] text-text-muted text-center">
          Only send Solana-native SOL or SPL tokens to this address.
          <br />
          Other chains will be lost permanently.
        </p>
      </div>
    </Modal>
  );
}

function WithdrawModal({
  open,
  balanceLamports,
  onClose,
}: {
  open: boolean;
  balanceLamports: bigint | null;
  onClose: () => void;
}): JSX.Element {
  const [amount, setAmount] = useState('');
  const [to, setTo] = useState('');
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Withdraw SOL"
      description="Send SOL to any Solana address. Network fee ~0.00001 SOL."
    >
      <div className="flex flex-col gap-3">
        <Input
          label="Destination address"
          placeholder="Solana address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Input
          label="Amount (SOL)"
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          suffix={<span className="text-xs font-mono">SOL</span>}
          helperText={
            balanceLamports != null
              ? `Available: ${formatSol(balanceLamports, { fractionDigits: 4 })}`
              : undefined
          }
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              toast('Demo only — direct withdrawals aren\'t wired up here. Send from your wallet app.', {
                icon: 'ℹ️',
              });
              onClose();
            }}
            disabled={!to || !amount}
          >
            Send
          </Button>
        </div>
        <p className="text-[11px] text-text-muted">
          Tip: most users send directly from Phantom/Solflare's own UI.
        </p>
      </div>
    </Modal>
  );
}
