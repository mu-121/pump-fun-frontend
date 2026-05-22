import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBalance } from '@/hooks/useBalances';
import { formatSol, formatAddress } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function BalanceMenu(): JSX.Element | null {
  const { publicKey } = useWallet();
  const sol = useSolBalance();
  const [open, setOpen] = useState(false);
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

  if (!publicKey) return null;

  const address = publicKey.toBase58();
  console.log(address, "address");
  // Fixed SOL equivalent in USD for demo, typically derived from an API/price feed
  console.log(sol, "solddddddddddddd");
  const solBalance = sol.lamports !== null ? Number(sol.lamports) / 1e9 : 0;
  console.log(solBalance, "solbalance");
  const solValueUsd = (solBalance * 145.2).toFixed(2);
  console.log(solValueUsd, "solvalueusd");
  const formattedSol = sol.lamports !== null ? formatSol(sol.lamports, { withUnit: false }) : '0.00';
  console.log(formattedSol, "formattedSol");

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 h-10 px-3 rounded-lg bg-surface-elevated border border-border transition-colors hover:bg-surface font-medium text-sm text-[#FAFAFA]",
          open && "bg-surface border-border-primary"
        )}
      >
        <span className="h-2 w-2 rounded-full bg-[#00d97e] border border-[#0c0d0e] shadow-sm animate-pulse" />
        <span className="tabular-nums">${solValueUsd}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" />
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] overflow-hidden rounded-2xl border border-border-tertiary  p-0 shadow-2xl z-50 animate-fade-in bg-[#212225]"
          style={{
            transformOrigin: 'top right'
          }}
        >
          <div className="flex items-center px-5 pb-2 pt-4">
            <h3 className="text-text-tertiary text-[11px] font-semibold uppercase tracking-[0.08em]">Your balance</h3>
          </div>
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Switch to SOL" className="hover:text-text-primary -mx-1 cursor-pointer rounded-md px-1 text-left text-[34px] font-semibold leading-none tracking-tight tabular-nums transition-colors">
                ${solValueUsd}
              </button>
              <div className="ml-auto flex items-center gap-1">
                <button className="text-text-tertiary hover:text-text-primary flex size-5 items-center justify-center rounded transition-colors" aria-label="Switch to SOL">
                  <svg className="size-3.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.75 21L4.28033 17.5303C3.98744 17.2374 3.98744 16.7626 4.28033 16.4697L7.75 13M16.25 11L19.7197 7.53033C20.0126 7.23744 20.0126 6.76256 19.7197 6.46967L16.25 3M5 17H20M4 7H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                <button className="text-text-tertiary hover:text-text-primary flex size-5 items-center justify-center rounded transition-colors" aria-label="Hide balance">
                  <svg className="size-3.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M21.7537 11.5404C16.9124 2.81979 7.08764 2.81989 2.24627 11.5405C2.08881 11.8242 2.08881 12.1759 2.24627 12.4596C7.08764 21.1802 16.9124 21.1801 21.7537 12.4595C21.9112 12.1758 21.9112 11.8241 21.7537 11.5404Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" aria-label="Switch to SOL" className="text-text-tertiary hover:text-text-primary cursor-pointer text-xs tabular-nums transition-colors">
                {formattedSol} SOL
              </button>
              <span className="text-text-tertiary text-[11px]">Available</span>
            </div>
            <div className="mt-3">
              <button
                className="bg-primary/10 hover:bg-primary/15 border-primary/30 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                {formatAddress(address, 4, 4)}
                <svg className="size-3" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 9V3.5C15 3.22386 14.7761 3 14.5 3H3.5C3.22386 3 3 3.22386 3 3.5V14.5C3 14.7761 3.22386 15 3.5 15H9M9.5 9H20.5C20.7761 9 21 9.22386 21 9.5V20.5C21 20.7761 20.7761 21 20.5 21H9.5C9.22386 21 9 20.7761 9 20.5V9.5C9 9.22386 9.22386 9 9.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 px-3 pb-3">
            <button data-testid="topbar-wallet-deposit" className="group bg-[#181918] border-border-secondary flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all hover:border-border-primary hover:-translate-y-0.5">
              <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-lg">
                <svg className="size-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9V18H15M17.75 6.25L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </span>
              <span className="text-text-primary mt-1 text-sm font-semibold">Deposit</span>
              <span className="text-text-secondary text-[11px]">Crypto transfer</span>
            </button>
            <button data-testid="topbar-wallet-trade" className="group bg-[#181918] border-border-secondary flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all hover:border-border-primary hover:-translate-y-0.5">
              <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-lg">
                <svg className="size-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.75 21L4.28033 17.5303C3.98744 17.2374 3.98744 16.7626 4.28033 16.4697L7.75 13M16.25 11L19.7197 7.53033C20.0126 7.23744 20.0126 6.76256 19.7197 6.46967L16.25 3M5 17H20M4 7H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </span>
              <span className="text-text-primary mt-1 text-sm font-semibold">Trade</span>
              <span className="text-text-secondary text-[11px]">Browse coins</span>
            </button>
            <button data-testid="topbar-wallet-buy" disabled className="group border-border-secondary flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all cursor-not-allowed bg-[#181918] 
            ">
              <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-lg">
                <svg className="size-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10V18C3 18.5523 3.44772 19 4 19C9.33333 19 14.6667 19 20 19C20.5523 19 21 18.5523 21 18V10M3 10V6C3 5.44772 3.44772 5 4 5H20C20.5523 5 21 5.44649 21 5.99878C21 7.19926 21 9.15725 21 10M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="square"></path></svg>
              </span>
              <span className="text-text-primary mt-1 text-sm font-semibold">Buy crypto</span>
              <span className="text-text-secondary text-[11px]">Card / bank</span>
            </button>
            <button data-testid="topbar-wallet-history" className="group bg-[#181918] border-border-secondary flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all hover:border-border-primary hover:-translate-y-0.5">
              <span className="bg-primary/15 text-primary flex size-7 items-center justify-center rounded-lg">
                <svg className="size-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8V12L14.5 14.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              </span>
              <span className="text-text-primary mt-1 text-sm font-semibold">History</span>
              <span className="text-text-secondary text-[11px]">All activity</span>
            </button>
          </div>

          <div className="px-3 pb-3">
            <button type="button" data-testid="topbar-wallet-claim-rent-button" className="bg-bg-secondary border-border-secondary flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:bg-bg-quaternary hover:border-border-primary hover:-translate-y-0.5">
              <span aria-hidden="true" className="bg-primary/15 text-primary relative flex size-9 shrink-0 items-center justify-center rounded-lg">
                <svg className="size-4" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 13.8122C19.5 23.3907 4.5 23.4012 4.5 13.8122C4.5 6.61352 12 2.5 12 2.5C12 2.5 19.5 6.61352 19.5 13.8122Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path><path d="M15.5 17.4061C15.5 22.1954 8.5 22.2006 8.5 17.4061C8.5 13.8068 12 11.75 12 11.75C12 11.75 15.5 13.8068 15.5 17.4061Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path></svg>
                <svg className="text-primary absolute -right-1 -top-1 size-2.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M21 12.5C14.75 12.5 12 15.4028 12 22C12 15.4028 9.25 12.5 3 12.5C9.25 12.5 12 9.59722 12 3C12 9.59722 14.75 12.5 21 12.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"></path></svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-text-primary text-sm font-semibold">Reclaim rent</p>
                <p data-testid="topbar-wallet-claim-rent-subtitle" className="text-text-tertiary truncate text-[11px]">9 empty accounts · ≈ 0.0186 SOL</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
