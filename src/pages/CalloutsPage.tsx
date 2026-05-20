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
                    <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold tabular-nums border-positive/30 bg-positive/15 text-positive">Avg {multiplier}x</span>
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
            <div
              key={c.id}
              onClick={() => toggleExpand(c.id)}
              className="bg-[#0d0d0f] border border-neutral-800/80 rounded-2xl p-4 flex flex-col hover:border-neutral-700/60 transition-all duration-200 shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Avatar seed={c.caller.avatar} handle={c.caller.handle} />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
                      <span className="font-bold text-white">{c.caller.handle}</span>
                      {c.caller.verified ? (
                        <Trophy className="h-3.5 w-3.5 text-[#22c55e] fill-[#22c55e]/10 shrink-0" />
                      ) : null}
                      <span className="text-neutral-400 font-normal">called</span>
                      <div className="flex items-center gap-1.5 bg-[#161618] border border-neutral-800/50 px-2 py-0.5 rounded-md select-none">
                        <span className="text-xs shrink-0">{c.tokenImage}</span>
                        <span className="font-extrabold text-white text-[11px]">${c.ticker}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold flex-wrap">
                      <span>
                        MC{' '}
                        <strong className="text-neutral-350 font-extrabold">
                          {c.calledAtMcap}
                        </strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                        NOW{' '}
                        <strong className="text-neutral-350 font-extrabold">{c.currentMcap}</strong>
                      </span>
                      <span>·</span>
                      <span className="uppercase text-[10px] text-neutral-500 font-extrabold tracking-wide">
                        {c.age} AGO
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider text-right hidden sm:inline">
                      RECENT CALL HIT
                    </span>
                    <span
                      className={cn(
                        'px-3 py-0.5 rounded-full text-xs font-black tracking-wide font-mono border select-none',
                        formatted.isWin
                          ? 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20'
                          : 'text-danger bg-danger/10 border-danger/20',
                      )}
                    >
                      {formatted.text}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(c.id)}
                    className="w-8 h-8 rounded-full bg-[#131315] border border-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors shadow-sm shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Position Info */}
              {isExpanded && c.position && (
                <div
                  className="mt-4 pt-4 border-t border-neutral-800/40 flex flex-col gap-3 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-[9px] uppercase font-extrabold text-neutral-500 tracking-wider">
                        Caller Position <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 inline-block" />
                      </div>
                      <span className={cn(
                        'text-lg font-black font-mono tracking-tight',
                        isWin ? 'text-[#22c55e]' : 'text-danger'
                      )}>
                        {c.position.pnlUsd}
                      </span>
                      <span className="text-[11px] font-semibold font-mono text-neutral-400">
                        {c.position.amount} {c.ticker}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className={cn(
                        'px-2.5 py-0.5 rounded text-[10px] font-black font-mono flex items-center gap-0.5',
                        isWin
                          ? 'text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20'
                          : 'text-danger bg-danger/10 border-danger/20'
                      )}>
                        {isWin ? '↑' : '↓'} {c.position.pnlPercent}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold">
                        Cost basis <strong className="text-white font-extrabold font-mono">{c.position.costBasis}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
