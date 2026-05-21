import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Radio } from 'lucide-react';
import { formatAddress, formatSol } from '@/lib/format';
import { useLiveTape } from '@/hooks/useLiveTrades';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import { cn } from '@/lib/utils';
import type { LiveTradePayload } from '@/types';

/**
 * Horizontally-scrolling ticker tape of recent trades. We duplicate the list
 * inline so the CSS marquee can wrap seamlessly without a JS loop.
 *
 * Animation respects `prefers-reduced-motion`: when set, the tape is shown
 * statically (no horizontal scroll). New trades still arrive at the head.
 */
export function LiveTape(): JSX.Element {
  const tape = useLiveTape();
  const connected = useSocketStatus();

  const items = useMemo(() => tape.slice(0, 20), [tape]);

  return (
    <div className="">
      {/* <div className="flex items-center gap-3 px-3 py-2">
        <LiveBadge connected={connected} />
        <div className="relative flex-1 overflow-hidden">
          {items.length === 0 ? (
            <p className="text-xs text-text-muted">
              {connected
                ? 'Waiting for the first trade…'
                : 'Connecting to live feed…'}
            </p>
          ) : (
            <div className="marquee flex gap-6 whitespace-nowrap motion-reduce:!animate-none motion-reduce:!gap-3 motion-reduce:!flex-wrap">
              {items.map((t, i) => (
                <TapeEntry key={`${t.signature}-${i}`} trade={t} />
              ))}
            
              <div aria-hidden="true" className="flex gap-6 motion-reduce:hidden">
                {items.map((t, i) => (
                  <TapeEntry key={`dup-${t.signature}-${i}`} trade={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div> */}

      <style>{`
        .marquee {
          animation: marquee 60s linear infinite;
        }
        .marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee { animation: none; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function TapeEntry({ trade }: { trade: LiveTradePayload }): JSX.Element {
  const isBuy = trade.side === 'BUY';
  return (
    <Link
      to={`/token/${trade.mintAddress}`}
      className="inline-flex items-center gap-2 text-xs hover:opacity-80 transition-opacity shrink-0"
    >
      <span
        className={cn(
          'inline-flex items-center gap-0.5 font-mono tabular-nums',
          isBuy ? 'text-primary' : 'text-danger',
        )}
      >
        {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {formatSol(trade.solAmount, { fractionDigits: 3 })}
      </span>
      <span className="font-mono text-text-muted">{formatAddress(trade.mintAddress, 4, 4)}</span>
      {trade.trader ? (
        <span className="font-mono text-text-muted/70">{formatAddress(trade.trader, 3, 3)}</span>
      ) : null}
    </Link>
  );
}

function LiveBadge({ connected }: { connected: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider shrink-0',
        connected ? 'text-primary' : 'text-text-muted',
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            connected ? 'bg-primary animate-ping opacity-75' : 'bg-text-muted',
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            connected ? 'bg-primary' : 'bg-text-muted',
          )}
        />
      </span>
      <Radio className="h-3 w-3" />
      <span>Live</span>
    </div>
  );
}
