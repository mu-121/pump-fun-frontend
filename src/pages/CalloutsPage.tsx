import { useState } from 'react';
import { ArrowUpRight, Crown, Megaphone, TrendingUp, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tab, TabList, Tabs } from '@/components/ui/Tabs';
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
}

const CALLOUTS: Callout[] = [
  {
    id: '1',
    caller: { handle: '@solwhale', avatar: 'SW', verified: true },
    ticker: 'BUTT',
    tokenName: 'Buttcoin',
    tokenImage: '🍑',
    calledAtMcap: '$2.4M',
    currentMcap: '$21.5M',
    pnlPct: 795,
    age: '3h',
    note: 'this one\'s heading to $50M, mark it',
    mint: 'BuTTcoiN1111111111111111111111111111111111',
  },
  {
    id: '2',
    caller: { handle: '@degensage', avatar: 'DS' },
    ticker: 'LMAO',
    tokenName: 'LMAO!',
    tokenImage: '😂',
    calledAtMcap: '$890K',
    currentMcap: '$5.67M',
    pnlPct: 537,
    age: '5h',
    mint: 'LMaOcoiN1111111111111111111111111111111111',
  },
  {
    id: '3',
    caller: { handle: '@kolking', avatar: 'KK', verified: true },
    ticker: 'TROLL',
    tokenName: 'TROLL',
    tokenImage: '👺',
    calledAtMcap: '$8.2M',
    currentMcap: '$120M',
    pnlPct: 1363,
    age: '1d',
    note: 'I told you. dont fade.',
    mint: 'TroLLcoiN111111111111111111111111111111111',
  },
  {
    id: '4',
    caller: { handle: '@quietcaller', avatar: 'QC' },
    ticker: 'WIF',
    tokenName: 'dogwifhat',
    tokenImage: '🐕',
    calledAtMcap: '$340K',
    currentMcap: '$1.1M',
    pnlPct: 224,
    age: '40m',
    mint: 'WiFcoiN11111111111111111111111111111111111',
  },
  {
    id: '5',
    caller: { handle: '@earlyalpha', avatar: 'EA' },
    ticker: 'POPCAT',
    tokenName: 'Popcat',
    tokenImage: '🐈',
    calledAtMcap: '$1.2M',
    currentMcap: '$890K',
    pnlPct: -25,
    age: '6h',
    mint: 'PopCatcoiN1111111111111111111111111111111',
  },
];

const LEADERBOARD = [
  { handle: '@solwhale', avatar: 'SW', calls: 47, hitRate: 78, avgGain: 412, verified: true },
  { handle: '@kolking', avatar: 'KK', calls: 31, hitRate: 71, avgGain: 388, verified: true },
  { handle: '@earlyalpha', avatar: 'EA', calls: 88, hitRate: 64, avgGain: 240 },
  { handle: '@degensage', avatar: 'DS', calls: 22, hitRate: 68, avgGain: 195 },
  { handle: '@quietcaller', avatar: 'QC', calls: 14, hitRate: 79, avgGain: 184 },
];

export function CalloutsPage(): JSX.Element {
  const [tab, setTab] = useState<'recent' | 'leaders'>('recent');

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
            <Megaphone className="h-6 w-6 text-primary" />
            Callouts
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track which voices in the community are calling winners early.
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'recent' | 'leaders')}>
          <TabList>
            <Tab value="recent">Recent calls</Tab>
            <Tab value="leaders">Top callers</Tab>
          </TabList>
        </Tabs>
      </div>

      {tab === 'recent' ? (
        <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
          {CALLOUTS.map((c) => (
            <CalloutCard key={c.id} callout={c} />
          ))}
        </div>
      ) : (
        <Card padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
                  <Th>#</Th>
                  <Th>Caller</Th>
                  <Th align="right">Calls</Th>
                  <Th align="right">Hit rate</Th>
                  <Th align="right">Avg gain</Th>
                </tr>
              </thead>
              <tbody>
                {LEADERBOARD.map((row, i) => (
                  <tr key={row.handle} className="border-t border-border hover:bg-surface-elevated/40">
                    <Td className="font-mono text-text-muted">
                      <div className="flex items-center gap-1.5">
                        {i === 0 ? <Crown className="h-3.5 w-3.5 text-accent" /> : null}
                        {i + 1}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar seed={row.avatar} />
                        <span className="font-medium">{row.handle}</span>
                        {row.verified ? <Trophy className="h-3 w-3 text-primary" /> : null}
                      </div>
                    </Td>
                    <Td align="right" className="font-mono tabular-nums">
                      {row.calls}
                    </Td>
                    <Td align="right" className="font-mono tabular-nums">
                      {row.hitRate}%
                    </Td>
                    <Td align="right" className="font-mono tabular-nums text-primary">
                      +{row.avgGain}%
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function CalloutCard({ callout }: { callout: Callout }): JSX.Element {
  const isWin = callout.pnlPct >= 0;
  return (
    <Card className="hover:border-text-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar seed={callout.caller.avatar} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold">{callout.caller.handle}</span>
            {callout.caller.verified ? <Trophy className="h-3 w-3 text-primary" /> : null}
            <span className="text-[11px] text-text-muted">· {callout.age} ago</span>
          </div>
          {callout.note ? (
            <p className="mt-0.5 text-xs text-text-muted">"{callout.note}"</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg bg-surface-elevated border border-border p-3">
        <span className="grid place-items-center h-10 w-10 rounded-lg bg-background border border-border text-lg">
          {callout.tokenImage}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{callout.tokenName}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">${callout.ticker}</span>
            <AddressDisplay address={callout.mint} head={3} tail={3} withSolscan={false} />
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-text-muted" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Called at" value={callout.calledAtMcap} />
        <Stat label="Now" value={callout.currentMcap} />
        <div className="rounded-lg bg-surface-elevated border border-border p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Return</p>
          <p
            className={cn(
              'mt-0.5 font-mono tabular-nums font-semibold flex items-center gap-1',
              isWin ? 'text-primary' : 'text-danger',
            )}
          >
            {isWin ? <TrendingUp className="h-3 w-3" /> : null}
            {isWin ? '+' : ''}
            {callout.pnlPct}%
          </p>
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-lg bg-surface-elevated border border-border p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-0.5 font-mono tabular-nums font-semibold text-text-primary">{value}</p>
    </div>
  );
}

function Avatar({ seed }: { seed: string }): JSX.Element {
  return (
    <span className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-accent to-primary text-[11px] font-bold text-background shrink-0">
      {seed}
    </span>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
}): JSX.Element {
  return (
    <th className={cn('px-3 py-2 font-medium', align === 'right' ? 'text-right' : 'text-left')}>
      {children}
    </th>
  );
}

function Td({
  children,
  align = 'left',
  className,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}): JSX.Element {
  return (
    <td
      className={cn('px-3 py-2.5', align === 'right' ? 'text-right' : 'text-left', className)}
    >
      {children}
    </td>
  );
}
