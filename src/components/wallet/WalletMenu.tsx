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
  // Wallet,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/providers/WalletModalProvider';
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
// Sub-renderer for the Pink grumpy cartoon character avatar
function renderAvatar(size: 'sm' | 'lg' = 'lg'): JSX.Element {
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-11 w-11';
  return (
    <div className={`relative overflow-hidden ${sizeClass} rounded-full object-cover`}>
      <div className="absolute inset-0 origin-center" style={{ transform: 'scale(1.6) translate(1%, 18%)' }}>
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Backgrounds/Pink/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Bodies/Body-3-Red-glass/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Face-expressions/Face-3/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Face-Accessories/Empty%202/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Head-accessories/Empty%202/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Arm-Accessories/Bracelet-green/144x144" alt="" />
        <img width="88" height="88" className="absolute inset-0 h-full w-full object-cover" src="https://imagedelivery.net/WL1JOIJiM_NAChp6rtB6Cw/pump-avatar/Accessories/Tie-Red/144x144" alt="" />
      </div>
    </div>
  );
}

export function WalletMenu(): JSX.Element {
  const { publicKey, disconnect, wallet } = useWallet();
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
  const walletIcon = wallet?.adapter.icon;
  const walletName = wallet?.adapter.name || 'Solana Wallet';

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${address}`;
    void copyToClipboard(profileUrl, { successMessage: 'Profile link copied!' });
  };

  const handleLogOut = async () => {
    setOpen(false);
    await disconnect();
    toast.success('Wallet disconnected');
  };

  return (
    <>
      <div className="relative">
        {/* Main avatar menu trigger button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex items-center justify-center h-9 w-9 rounded-full transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="relative inline-flex h-9 w-9 overflow-hidden rounded-full border border-white/10">
            {renderAvatar('sm')}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#00d97e] border border-[#0c0d0e] shadow-sm animate-pulse" />
        </button>

        {open ? (
          <div
            ref={popRef}
            role="menu"
            className="absolute right-0 mt-2 w-[320px] overflow-hidden rounded-2xl border border-[#202227] bg-[#0c0d0e] p-0 shadow-2xl z-50 animate-fade-in"
          >
            {/* User Profile header block */}
            <div className="flex items-center gap-3 px-4 pb-3 pt-4">
              <span className="relative inline-flex h-11 w-11 shrink-0">
                <span className="inline-flex h-11 w-11 overflow-hidden rounded-full">
                  {renderAvatar('lg')}
                </span>
                <span
                  className="bg-[#0c0d0e] border-[#202227] text-text-primary absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-full border-2"
                  aria-label={`Connected via ${walletName}`}
                >
                  {walletIcon ? (
                    <img alt={walletName} width="14" height="14" className="h-3.5 w-3.5 object-contain" src={walletIcon} />
                  ) : (
                    <Wallet className="h-3 w-3 text-text-muted" />
                  )}
                </span>
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="text-[#FAFAFA] min-w-0 truncate text-base font-semibold">
                    {formatAddress(address, 4, 4)}
                  </span>
                  <button
                    type="button"
                    onClick={handleShareProfile}
                    aria-label="Share profile"
                    className="text-text-muted hover:bg-[#1a1c22] hover:text-[#FAFAFA] inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.8364 11.632L13.8254 4.27052C13.5048 3.97595 12.9871 4.20334 12.9871 4.63868V8.50018C4.63119 8.50018 2.07358 11.3993 1.98926 19.5726C1.98817 19.6781 2.13044 19.7151 2.17858 19.6212C3.58704 16.8739 4.85284 15.5002 12.9871 15.5002V19.3617C12.9871 19.797 13.5048 20.0244 13.8254 19.7298L21.8364 12.3683C22.052 12.1702 22.052 11.8301 21.8364 11.632Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path>
                    </svg>
                  </button>
                </div>
                <span className="text-text-muted truncate text-xs tabular-nums">0 followers</span>
              </div>
            </div>

            {/* Separator */}
            <div className="bg-[#202227] mx-2 h-px"></div>

            {/* Actions group */}
            <div className="flex flex-col gap-0.5 p-2">
              <Link
                to={`/profile/${address}`}
                onClick={() => setOpen(false)}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.4985 6.5C15.4985 8.433 13.9315 10 11.9985 10C10.0655 10 8.49854 8.433 8.49854 6.5C8.49854 4.567 10.0655 3 11.9985 3C13.9315 3 15.4985 4.567 15.4985 6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path>
                  <path d="M11.9985 13C8.20293 13 5.43245 15.5235 4.67009 18.9157C4.54089 19.4906 5.59696 20 5.59696 20H18.4001C18.9894 20 19.4562 19.4906 19.327 18.9157C18.5646 15.5235 15.7941 13 11.9985 13Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path>
                </svg>
                <span>View profile</span>
                <svg className="text-text-muted ml-auto h-3.5 w-3.5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 18L15.5 12L9.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDepositOpen(true);
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="h-5 w-5 shrink-0 text-text-muted" />
                <span>Deposit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setWithdrawOpen(true);
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <ArrowUpFromLine className="h-5 w-5 shrink-0 text-text-muted" />
                <span>Withdraw</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  toast('Profile customization is coming soon!', { icon: 'ℹ️' });
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 13V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5C4 4.44772 4.44772 4 5 4H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M13 11.0001V8.00009L18.2929 2.7072C18.6834 2.31668 19.3166 2.31668 19.7071 2.7072L21.2929 4.29299C21.6834 4.68351 21.6834 5.31668 21.2929 5.7072L16 11.0001H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Edit profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  toast('Community features are coming soon!', { icon: '💬' });
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.00195 8H16.002C16.5542 8 17.002 8.44772 17.002 9V17C17.002 17.5523 16.5542 18 16.002 18H10.502L6.00195 20.5V18H4.00195C3.44967 18 3.00195 17.5523 3.00195 17V9C3.00195 8.44772 3.44967 8 4.00195 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M16.9998 14H18.5009H20.002C20.5542 14 21.002 13.5523 21.002 13V5C21.002 4.44772 20.5542 4 20.002 4H8.00195C7.44967 4 7.00195 4.44772 7.00195 5V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Coin community</span>
                <svg className="text-text-muted ml-auto h-3.5 w-3.5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 18L15.5 12L9.5 6" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  toast('Support desk is currently offline. Please reach out on social channels.', { icon: 'ℹ' });
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M12 16V16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M10 9.5V9C10 8.44772 10.4477 8 11 8H13C13.5523 8 14 8.44772 14 9V10C14 10.3148 13.8518 10.6111 13.6 10.8L12.4 11.7C12.1482 11.8889 12 12.1852 12 12.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Help & support</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  toast('You are running the latest version. No new updates available.', { icon: '📣' });
                }}
                className="hover:bg-[#1a1c22] text-[#FAFAFA] relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.9961 13.9999C19.6529 13.9999 20.9961 12.6568 20.9961 10.9999C20.9961 9.34307 19.6529 7.99993 17.9961 7.99993M12.8254 17.9999C12.4136 19.1651 11.3023 19.9999 9.99609 19.9999C8.33924 19.9999 6.99609 18.6568 6.99609 16.9999V15.4999M6.99829 6.49993V15.4999M17.9961 4.36864V17.6312C17.9961 18.3084 17.3372 18.7897 16.6921 18.5839L3.69214 14.4363C3.27754 14.4363 2.99609 13.9188 2.99609 13.4836V8.51626C2.99609 8.08107 3.27754 7.69585 3.69214 7.56357L16.6921 3.41595C17.3372 3.21013 17.9961 3.6915 17.9961 4.36864Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                <span>Product updates</span>
                <span aria-label="New product updates available" className="ring-[#0c0d0e] ml-auto h-2 w-2 rounded-full bg-red-500 ring-2"></span>
              </button>
            </div>

            {/* Separator */}
            <div className="bg-[#202227] mx-2 h-px"></div>

            {/* Log out section */}
            <div className="flex flex-col gap-0.5 p-2">
              <button
                type="button"
                onClick={handleLogOut}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-300 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors cursor-pointer"
              >
                <svg className="h-5 w-5 shrink-0" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.25 20H5C4.44772 20 4 19.5523 4 19L4 5C4 4.44772 4.44772 4 5 4L11.25 4M20 12L8.75 12M20 12L15.5 16.5M20 12L15.5 7.5" stroke="currentColor" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span>Log out</span>
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
