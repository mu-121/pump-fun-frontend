import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {  Menu, Mic, Plus, Search, X } from 'lucide-react';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/Button';
import { WalletMenu } from '@/components/wallet/WalletMenu';
import { BalanceMenu } from '@/components/wallet/BalanceMenu';
import { useUiStore } from '@/stores/uiStore';

const PROMO_KEY = 'pump-clone-promo-dismissed';

export function TopBar(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') ?? '');
  const [promoOpen, setPromoOpen] = useState(() => !localStorage.getItem(PROMO_KEY));
  const openMobileSidebar = useUiStore((s) => s.setSidebarOpenMobile);

  useEffect(() => {
    setQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  const submitSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmed = query.trim();
    const params = new URLSearchParams(searchParams);
    if (trimmed) params.set('search', trimmed);
    else params.delete('search');
    navigate({ pathname: '/', search: params.toString() });
  };

  return (
    <header className="flex flex-col sticky top-0 left-0 z-20 bg-bg-primary border-b border-border-secondary">
      {promoOpen ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs bg-surface border-b border-border text-text-muted">
          <a
            className="text-[14px] font-medium text-[#FAFAFA] truncate hover:underline"
            href="https://app.pump.fun/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Trade faster. Pump is better on mobile.
          </a>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(PROMO_KEY, '1');
              setPromoOpen(false);
            }}
            className="p-1 rounded hover:bg-surface-elevated text-text-muted hover:text-text-primary"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* ── Main nav row — 68 px tall, 3-column layout matching pump.fun ── */}
      <div className="flex items-center px-4 lg:px-6 h-[68px] w-full">
        <div className="flex items-center justify-between w-full h-full gap-x-3">

          {/* LEFT: mobile logo + desktop search */}
          <div className="flex items-center justify-start h-full grow-[2] basis-0 gap-x-3 min-w-0 max-lg:basis-auto">

            {/* Mobile logo — hidden on md+ */}
            <Link
              to="/"
              className="items-center justify-center shrink-0 hidden max-md:flex"
              aria-label="Home"
            >
              <span className="font-bold text-sm text-text-primary">{env.platformName}</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => openMobileSidebar(true)}
              aria-label="Open navigation"
              className="lg:hidden p-2 rounded-lg border border-border bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop search — hidden on lg and below */}
            <div className="flex items-center w-full max-w-[500px] max-lg:hidden gap-2">
              <form onSubmit={submitSearch} className="w-full">
                <div
                  className="relative flex h-10 w-full items-center rounded-lg bg-surface-elevated border border-border transition-colors hover:bg-surface"
                  role="search"
                >
                  <Search className="absolute left-3 shrink-0 h-[18px] w-[18px] text-text-muted pointer-events-none" aria-hidden />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for coins..."
                    className={cn(
                      'h-full w-full min-w-0 bg-transparent pl-10 pr-20',
                      'text-sm text-text-primary placeholder:text-text-muted',
                      'focus:outline-none',
                    )}
                  />
                  <div className="absolute right-3 hidden gap-1 sm:flex pointer-events-none">
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 rounded-sm border border-border bg-surface px-1 font-sans text-[11px] font-medium text-text-muted">⌘</kbd>
                    <kbd className="inline-flex items-center justify-center h-5 min-w-5 rounded-sm border border-border bg-surface px-1 font-sans text-[11px] font-medium text-text-muted">K</kbd>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: action buttons */}
          <div className="flex items-center justify-end h-full grow-[1] basis-0 gap-x-2 min-w-0 max-lg:grow-0 max-lg:basis-auto">

            {/* Mobile search icon — hidden on lg+ */}
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                navigate({ pathname: '/', search: params.toString() });
              }}
              aria-label="Search"
              className={cn(
                'hidden max-lg:grid place-items-center',
                'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
                'text-text-muted hover:text-text-primary transition-colors',
              )}
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>

            {/* Voice chat */}
            <VoiceChatPill />

            {/* Create — label on lg+, icon-only below */}
            <Link to="/create" className="max-[480px]:hidden">
              {/* Desktop label */}
              <button
                type="button"
                className={cn(
                  'hidden lg:inline-flex items-center gap-2',
                  'h-10 px-4 rounded-lg border border-border bg-surface-elevated',
                  'text-[14px] font-medium text-text-primary hover:bg-surface transition-colors',
                )}
              >
                <Plus className="h-5 w-5" aria-hidden />
                <span>Create</span>
              </button>
              {/* Mobile icon-only */}
              <button
                type="button"
                aria-label="Create"
                className={cn(
                  'lg:hidden grid place-items-center',
                  'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
                  'text-text-muted hover:text-text-primary transition-colors',
                )}
              >
                <Plus className="h-5 w-5" aria-hidden />
              </button>
            </Link>

            {/* Balance Dropdown */}
            <BalanceMenu />

            {/* Wallet / sign-in */}
            <WalletMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

function VoiceChatPill(): JSX.Element {
  // Demo-only — visual parity with pump.fun. Notification dot is static.
  const hasNotification = true;
  return (
    <div className="relative">
      {/* Desktop — label + icon */}
      <button
        type="button"
        aria-label="Voice chat"
        className={cn(
          'hidden lg:inline-flex items-center gap-2',
          'h-10 px-4 rounded-lg border border-border bg-surface-elevated',
          'text-sm font-medium text-text-primary hover:bg-surface transition-colors',
        )}
      >
        <Mic className="h-5 w-5" aria-hidden />
        <span>Voice chat</span>
      </button>

      {/* Mobile — icon only */}
      <button
        type="button"
        aria-label="Voice chat"
        className={cn(
          'lg:hidden grid place-items-center',
          'h-10 w-10 rounded-lg border border-border bg-surface-elevated',
          'text-text-muted hover:text-text-primary transition-colors',
        )}
      >
        <Mic className="h-5 w-5" aria-hidden />
      </button>

      {/* Animated notification dot */}
      {hasNotification && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-bg-primary"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-red-500" />
          </span>
        </span>
      )}
    </div>
  );
}
