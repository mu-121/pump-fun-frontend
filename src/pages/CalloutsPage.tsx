import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Crown, Megaphone, Trophy } from 'lucide-react';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { cn } from '@/lib/utils';

interface Callout {
  id: string;
  caller: { handle: string; avatar: string; verified?: boolean };
  ticker: string;
  tokenName: string;
  tokenImage: string;
  calledAtMcap: string;
  currentMcap: string;
  pnlPct: number;
  age: string;
  note?: string;
  mint: string;
  position?: {
    pnlUsd: string;
    pnlPercent: string;
    amount: string;
    costBasis: string;
  };
}

const CALLOUTS: Callout[] = [
  {
    id: '1',
    caller: { handle: 'certifiedglazer', avatar: 'CG' },
    ticker: 'xco',
    tokenName: 'xco',
    tokenImage: '🟡',
    calledAtMcap: '$14.2K',
    currentMcap: '$19.3K',
    pnlPct: 2700, // 27x
    age: 'LESS THAN A MINUTE',
    mint: 'xco1111111111111111111111111111111111111111',
    position: {
      pnlUsd: '+$81.53',
      pnlPercent: '41.27%',
      amount: '14,322,322.2099',
      costBasis: '$197.57',
    },
  },
  {
    id: '2',
    caller: { handle: 'airporting', avatar: 'AP' },
    ticker: 'Diphtheria',
    tokenName: 'Diphtheria',
    tokenImage: '🧬',
    calledAtMcap: '$9.30K',
    currentMcap: '$7.12K',
    pnlPct: 6400, // 64x
    age: '2M',
    mint: 'Diphtheria11111111111111111111111111111111',
    position: {
      pnlUsd: '-$24.50',
      pnlPercent: '-12.80%',
      amount: '3,450,000.0000',
      costBasis: '$191.40',
    },
  },
  {
    id: '3',
    caller: { handle: 'gaston_levai', avatar: 'GL' },
    ticker: 'xco',
    tokenName: 'xco',
    tokenImage: '🟡',
    calledAtMcap: '$11.0K',
    currentMcap: '$19.3K',
    pnlPct: 1600, // 16x
    age: '38M',
    mint: 'xco1111111111111111111111111111111111111111',
    position: {
      pnlUsd: '+$142.60',
      pnlPercent: '75.45%',
      amount: '18,500,000.0000',
      costBasis: '$188.90',
    },
  },
  {
    id: '4',
    caller: { handle: 'green55', avatar: 'G5' },
    ticker: 'TOGETHER',
    tokenName: 'TOGETHER',
    tokenImage: '🟢',
    calledAtMcap: '$82.3K',
    currentMcap: '$121K',
    pnlPct: 3600, // 36x
    age: '40M',
    mint: 'Together111111111111111111111111111111111',
    position: {
      pnlUsd: '+$312.40',
      pnlPercent: '46.90%',
      amount: '5,000,000.0000',
      costBasis: '$665.00',
    },
  },
];

const LEADERBOARD = [
  { handle: 'croakie', avatar: 'CR', calls: 45, hitRate: 82, avgGain: 300 }, // Avg 3x
  { handle: 'iapet...', avatar: 'IA', calls: 38, hitRate: 76, avgGain: 330 }, // Avg 3.3x
  { handle: 'airpor...', avatar: 'AP', calls: 52, hitRate: 79, avgGain: 460 }, // Avg 4.6x
];

function getAvatarStyle(handle: string) {
  switch (handle) {
    case 'croakie':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    case 'iapet...':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    case 'airpor...':
    case 'airporting':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
    case 'certifiedglazer':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    case 'gaston_levai':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25';
    case 'green55':
      return 'bg-green-500/10 text-green-400 border-green-500/25';
    default:
      return 'bg-neutral-800 text-neutral-400 border-neutral-700/50';
  }
}

function formatCalloutGain(pnlPct: number): { text: string; isWin: boolean } {
  const isWin = pnlPct >= 0;
  if (isWin) {
    const mult = Math.max(1, Math.round(pnlPct / 100));
    return { text: `${mult}x`, isWin: true };
  } else {
    return { text: `${pnlPct}%`, isWin: false };
  }
}

export function CalloutsPage(): JSX.Element {
  // First item expanded by default
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-bg-secondary via-bg-primary to-bg-secondary p-5 animate-fade-in">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary-green/15 blur-3xl"></div>
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary sm:text-3xl">Latest callouts</h1>
            <p className="mt-2 max-w-2xl text-sm text-text-tertiary font-medium">Every callout, across every coin, as it happens.</p>
          </div>
        </div>
      </header>

      {/* Top Callers Card */}
      <section aria-label="Top callout callers" className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-bg-secondary/80 via-bg-primary to-bg-secondary/80 p-4">
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-amber-300/10 blur-3xl"></div>
        <header className="relative flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-amber-300/90 via-amber-400/70 to-amber-500/40 text-black shadow-[0_4px_16px_-8px_rgba(252,211,77,0.6)]">
              <svg className="size-3.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.33416 18.204L2 7L8 10L12 4L16 10L22 7L19.6658 18.204C19.5692 18.6677 19.1605 19 18.6869 19H5.31314C4.83946 19 4.43077 18.6677 4.33416 18.204Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"></path></svg>
            </span>
            <div className="flex flex-col leading-tight">
              <p className="text-sm font-semibold text-text-primary">Top callers</p>
              <p className="text-[11px] uppercase tracking-wider text-text-tertiary">Last 7d · Top 3</p>
            </div>
          </div>
          <a className="group inline-flex items-center gap-1.5 rounded-full border border-primary-green/30 bg-primary-green/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-green transition-all hover:border-primary-green/60 hover:bg-primary-green/15" href="/callouts/leaderboard">
            View leaderboard
            <svg className="size-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 6L20 12L14 18M19 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </a>
        </header>
        <div className="relative mt-3">
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LEADERBOARD.slice(0, 3).map((row, i) => {
              const rankBadge =
                i === 0
                  ? 'border-amber-300/40 bg-amber-400/10 text-amber-200'
                  : i === 1
                    ? 'border-slate-200/30 bg-slate-200/10 text-slate-100'
                    : 'border-orange-400/30 bg-orange-400/10 text-orange-200';

              const multiplier = (row.avgGain / 100).toFixed(1);
              return (
                <li key={row.handle} style={{ opacity: 1, transform: 'none' }}>
                  <div className="group flex h-full items-center gap-3 rounded-xl border border-white/10 bg-bg-primary/55 px-2.5 py-2 transition-all hover:-translate-y-px hover:border-white/20 hover:bg-bg-primary/80 cursor-pointer">
                    <span className={cn('inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold tabular-nums', rankBadge)}>
                      #{i + 1}
                    </span>
                    <span className="size-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-bg-secondary flex items-center justify-center">
                      <Avatar seed={row.avatar} handle={row.handle} className="w-full h-full text-xs" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-semibold text-text-primary group-hover:underline">{row.handle}</span>
                    </div>
                    <span className="bg-[#5fe9a226] text-[#5fe992] rounded-full border px-2 py-0.5 text-[11px] font-bold tabular-nums border-[#5fe9a24d] ">Avg {multiplier}x</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Latest Callouts Feed List */}
      <div className="flex flex-col gap-3">
        {CALLOUTS.map((c) => {
          const isWin = c.pnlPct >= 0;
          const formatted = formatCalloutGain(c.pnlPct);
          const isExpanded = expandedId === c.id;
          return (
            <article
              key={c.id}
              onClick={() => toggleExpand(c.id)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary/55 p-3 transition-colors hover:border-white/20 hover:bg-bg-secondary/75 cursor-pointer"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r blur-md from-positive/0 via-positive/15 to-positive/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-[150%] transition-all duration-1000"
                style={{ transform: 'translateX(-110%)' }}
              ></span>
              <div className="flex items-center gap-3">
                <div
                  className="size-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-bg-primary flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar seed={c.caller.avatar} handle={c.caller.handle} className="w-full h-full text-xs" />
                </div>
                <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-text-primary">
                    <span className="truncate font-semibold hover:underline">{c.caller.handle}</span>
                    {c.caller.verified && (
                      <Trophy className="h-3.5 w-3.5 text-[#22c55e] fill-[#22c55e]/10 shrink-0" />
                    )}
                    <span className="text-xs text-text-tertiary">called</span>
                    <div className="flex min-w-0 items-center gap-1.5 truncate font-semibold hover:underline">
                      <span className="size-5 shrink-0 rounded-full border border-white/10 object-cover bg-neutral-800 flex items-center justify-center text-[10px] select-none">{c.tokenImage}</span>
                      <span className="truncate">${c.ticker}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] uppercase tracking-wider text-text-tertiary">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-text-secondary" title="Market cap when the callout was made">
                      <span className="text-text-tertiary">MC</span>
                      <span className="tabular-nums text-text-primary">{c.calledAtMcap}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-text-primary" title="Live market cap">
                      <span className="relative flex size-1.5 items-center justify-center">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-green/70 opacity-70"></span>
                        <span className="relative inline-flex size-1.5 rounded-full bg-primary-green"></span>
                      </span>
                      <span className="text-text-tertiary">now</span>
                      <span className="tabular-nums" style={{ color: 'rgb(228, 228, 231)' }}>{c.currentMcap}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{c.age} AGO</span>
                  </div>
                </div>

                <div className="relative flex shrink-0 flex-col items-end gap-0.5" title="The caller's best recent call. This is not the gain on this specific callout." onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Recent call hit</span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums select-none',
                      formatted.isWin
                        ? 'border-positive/30 bg-positive/15 text-positive'
                        : 'border-danger/30 bg-danger/15 text-danger'
                    )}
                  >
                    {formatted.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(c.id);
                  }}
                  aria-expanded={isExpanded}
                  title={isExpanded ? "Hide caller's position" : "Show caller's position"}
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-secondary transition-colors hover:border-white/20 hover:text-text-primary"
                >
                  {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
              </div>

              {/* Expanded Position Info */}
              {isExpanded && c.position && (
                <div
                  className="relative mt-2 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="relative flex flex-col gap-1.5 overflow-hidden rounded-md border border-white/10 bg-bg-primary/40 p-2.5">
                    <div className="relative flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                        Caller position
                        <span className="relative inline-flex h-1.5 w-1.5 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-text-tertiary/60"></span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
                          isWin
                            ? 'border-[#1FD978]/30 bg-[#1FD978]/10 text-[#1FD978]'
                            : 'border-danger/30 bg-danger/10 text-danger'
                        )}
                      >
                        <svg className="h-2.5 w-2.5" aria-hidden="true" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {isWin ? (
                            <path d="M6 10L12 4L18 10M12 5V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          ) : (
                            <path d="M18 14L12 20L6 14M12 19V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                          )}
                        </svg>
                        {c.position.pnlPercent}
                      </span>
                    </div>

                    <span
                      className="relative text-base font-semibold leading-none tabular-nums"
                      style={{ color: isWin ? '#1FD978' : '#f43f5e' }}
                    >
                      <span style={{ display: 'inline-block', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {c.position.pnlUsd}
                      </span>
                    </span>

                    <div className="relative flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-[11px] text-text-tertiary">
                      <span className="tabular-nums text-text-secondary">
                        <span className="font-medium">{c.position.amount}</span> <span className="text-text-tertiary">{c.ticker}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>Cost basis</span>
                        <span className="font-medium tabular-nums text-text-secondary">{c.position.costBasis}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({ seed, handle, className }: { seed: string; handle?: string; className?: string }): JSX.Element {
  const styleClass = handle
    ? getAvatarStyle(handle)
    : 'bg-gradient-to-br from-accent to-primary text-background';
  return (
    <span
      className={cn(
        'grid place-items-center h-8 w-8 rounded-full text-[11px] font-bold shrink-0 border select-none',
        styleClass,
        className
      )}
    >
      {seed}
    </span>
  );
}
