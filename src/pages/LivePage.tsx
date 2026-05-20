import { Eye, Mic, Radio, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface LiveStream {
  id: string;
  title: string;
  host: string;
  hostAvatar: string;
  ticker: string;
  tokenImage: string;
  viewers: number;
  mcap: string;
  thumbnailHue: string;
  startedMinsAgo: number;
}

const STREAMS: LiveStream[] = [
  {
    id: '1',
    title: 'sending BUTT to $50M live RIGHT NOW',
    host: 'solwhale',
    hostAvatar: 'SW',
    ticker: 'BUTT',
    tokenImage: '🍑',
    viewers: 1247,
    mcap: '$21.5M',
    thumbnailHue: 'from-orange-500 to-rose-500',
    startedMinsAgo: 18,
  },
  {
    id: '2',
    title: '24h dev stream — building $LMAO v2',
    host: 'lmaodev',
    hostAvatar: 'LM',
    ticker: 'LMAO',
    tokenImage: '😂',
    viewers: 432,
    mcap: '$5.67M',
    thumbnailHue: 'from-yellow-400 to-amber-500',
    startedMinsAgo: 184,
  },
  {
    id: '3',
    title: 'pump.clone trading marathon · everyone bring your bags',
    host: 'degensage',
    hostAvatar: 'DS',
    ticker: 'TROLL',
    tokenImage: '👺',
    viewers: 873,
    mcap: '$120M',
    thumbnailHue: 'from-slate-200 to-slate-400',
    startedMinsAgo: 47,
  },
  {
    id: '4',
    title: 'reviewing today\'s graduations',
    host: 'kolking',
    hostAvatar: 'KK',
    ticker: 'WIF',
    tokenImage: '🐕',
    viewers: 218,
    mcap: '$1.1M',
    thumbnailHue: 'from-amber-700 to-amber-900',
    startedMinsAgo: 12,
  },
  {
    id: '5',
    title: 'first buy of $POPCAT — bullposting',
    host: 'earlyalpha',
    hostAvatar: 'EA',
    ticker: 'POPCAT',
    tokenImage: '🐈',
    viewers: 96,
    mcap: '$890K',
    thumbnailHue: 'from-pink-400 to-fuchsia-600',
    startedMinsAgo: 5,
  },
  {
    id: '6',
    title: 'BOOB to a billion · giveaway in chat',
    host: 'pinkmoon',
    hostAvatar: 'PM',
    ticker: 'BOOB',
    tokenImage: '🌸',
    viewers: 2891,
    mcap: '$6.38M',
    thumbnailHue: 'from-pink-500 to-rose-700',
    startedMinsAgo: 92,
  },
];

const TOTAL_VIEWERS = STREAMS.reduce((sum, s) => sum + s.viewers, 0);

export function LivePage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            <Radio className="h-6 w-6 text-danger" />
            <span>Live now</span>
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-danger animate-ping opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
            </span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {STREAMS.length} streams · {TOTAL_VIEWERS.toLocaleString()} watching now
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-danger-600 transition-colors"
        >
          <Mic className="h-4 w-4" />
          Go live
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {STREAMS.map((s) => (
          <StreamCard key={s.id} stream={s} />
        ))}
      </div>

      <Card>
        <p className="text-xs text-text-muted">
          Streaming is in private beta. Creators of tokens with &gt;$1M market cap can request
          access from the Support page.
        </p>
      </Card>
    </div>
  );
}

function StreamCard({ stream }: { stream: LiveStream }): JSX.Element {
  return (
    <button
      type="button"
      className="group text-left rounded-xl border border-border bg-surface overflow-hidden hover:border-text-muted/40 transition-colors"
    >
      <div className={cn('relative aspect-video bg-gradient-to-br', stream.thumbnailHue)}>
        <div className="absolute inset-0 grid place-items-center text-6xl opacity-30">
          {stream.tokenImage}
        </div>
        <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-danger text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Live
        </div>
        <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5">
          <Eye className="h-3 w-3" />
          {stream.viewers.toLocaleString()}
        </div>
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5">
          ${stream.ticker} · {stream.mcap}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-2">
          <span className="grid place-items-center h-7 w-7 rounded-full bg-gradient-to-br from-accent to-primary text-[10px] font-bold text-background shrink-0">
            {stream.hostAvatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {stream.title}
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted">
              @{stream.host} · started {stream.startedMinsAgo}m ago
            </p>
          </div>
          <Users className="h-3.5 w-3.5 text-text-muted shrink-0 mt-1" />
        </div>
      </div>
    </button>
  );
}
