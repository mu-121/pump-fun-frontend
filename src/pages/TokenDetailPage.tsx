import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Globe, Send, X as TwitterX } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tab, TabList, TabPanel, Tabs } from '@/components/ui/Tabs';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { TokenChart } from '@/components/token/TokenChart';
import { TradePanel } from '@/components/token/TradePanel';
import { BondingProgress } from '@/components/token/BondingProgress';
import { TradesTable } from '@/components/token/TradesTable';
import { HoldersTable } from '@/components/token/HoldersTable';
import { useToken } from '@/hooks/useToken';
import { formatMarketCap, formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

export function TokenDetailPage(): JSX.Element {
  const { mint = '' } = useParams<{ mint: string }>();
  const { data, isLoading, error } = useToken(mint);

  if (isLoading) return <DetailSkeleton />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card>
          <p className="text-sm text-text-primary font-medium">Couldn't load token</p>
          <p className="mt-1 text-xs text-text-muted">
            {error?.message ?? 'No data for this mint.'}
          </p>
          <Link to="/" className="text-xs text-primary mt-3 inline-block hover:underline">
            ← Back to feed
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Seo
        title={`${data.name} ($${data.symbol})`}
        description={data.description ?? `Trade $${data.symbol} on the bonding curve.`}
        image={data.imageUrl}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
      />
      <TokenHeader token={data} />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <TokenChart mint={data.mintAddress} />

          <Card padded={false}>
            <Tabs defaultValue="trades">
              <div className="px-3 pt-3">
                <TabList>
                  <Tab value="trades">Trades</Tab>
                  <Tab value="holders">Holders</Tab>
                  <Tab value="comments">Comments</Tab>
                </TabList>
              </div>
              <div className="p-3">
                <TabPanel value="trades">
                  <TradesTable mint={data.mintAddress} joinWsRoom={false} />
                </TabPanel>
                <TabPanel value="holders">
                  <HoldersTable token={data} />
                </TabPanel>
                <TabPanel value="comments">
                  <p className="text-center text-xs text-text-muted py-12">
                    Comments coming soon.
                  </p>
                </TabPanel>
              </div>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="lg:sticky lg:top-20 flex flex-col gap-4">
            <TradePanel token={data} />
            <BondingProgress token={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenHeader({ token }: { token: Token }): JSX.Element {
  const initial = (token.symbol || token.name || '?').slice(0, 1).toUpperCase();
  const socials = useMemo(
    () => [
      { url: token.twitterUrl, Icon: TwitterX, label: 'Twitter' },
      { url: token.telegramUrl, Icon: Send, label: 'Telegram' },
      { url: token.websiteUrl, Icon: Globe, label: 'Website' },
    ],
    [token.twitterUrl, token.telegramUrl, token.websiteUrl],
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt=""
            className="h-14 w-14 rounded-lg object-cover border border-border bg-surface-elevated shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg bg-surface-elevated border border-border grid place-items-center text-base font-semibold text-text-muted shrink-0">
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
              {token.name || 'Unnamed'}
            </h1>
            <span className="text-sm font-mono text-text-muted">${token.symbol}</span>
            {token.isGraduated ? (
              <span className="inline-flex items-center rounded-md bg-accent/15 text-accent text-[10px] px-1.5 py-0.5 font-medium">
                Graduated
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
            <span>
              by{' '}
              <AddressDisplay
                address={token.creatorAddress}
                head={4}
                tail={4}
                withSolscan={false}
                className="inline-flex"
              />
            </span>
            <span>·</span>
            <span>created {formatTimeAgo(token.createdAt, { suffix: true })}</span>
            <span>·</span>
            <AddressDisplay address={token.mintAddress} head={4} tail={4} solscanPath="token" />
          </div>
          {socials.some((s) => s.url) ? (
            <div className="mt-2 flex items-center gap-2">
              {socials.map((s) =>
                s.url ? (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <s.Icon className="h-4 w-4" />
                  </a>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-6 sm:flex-col sm:items-end sm:gap-0">
        <Stat label="Market cap" value={formatMarketCap(token.marketCapUsd)} align="right" />
        <Stat label="Trades" value={String(token.tradeCount)} align="right" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: string;
  align?: 'left' | 'right';
}): JSX.Element {
  return (
    <div className={cn(align === 'right' ? 'text-right' : 'text-left')}>
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-mono tabular-nums text-base text-text-primary font-semibold">{value}</p>
    </div>
  );
}

function DetailSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 items-start">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="lg:col-span-8 h-96 rounded-xl" />
        <Skeleton className="lg:col-span-4 h-96 rounded-xl" />
      </div>
    </div>
  );
}
