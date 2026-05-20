import { Link, useParams } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { TokenCard } from '@/components/token/TokenCard';
import { useProfile } from '@/hooks/useProfile';
import {
  formatAddress,
  formatSol,
  formatTimeAgo,
  formatToken,
  formatUsd,
} from '@/lib/format';
import { getExplorerUrl } from '@/lib/tx';
import { cn } from '@/lib/utils';
import type { Profile, ProfileHolding, Trade } from '@/types';

const TOKEN_DECIMALS = 6;

export function ProfilePage(): JSX.Element {
  const { address = '' } = useParams<{ address: string }>();
  const { publicKey } = useWallet();
  const isSelf = publicKey?.toBase58() === address;
  const { data, isLoading, error } = useProfile(address);

  if (isLoading) return <ProfileSkeleton />;
  if (error || !data) {
    return (
      <Card>
        <p className="text-sm text-text-primary font-medium">Couldn't load profile</p>
        <p className="mt-1 text-xs text-text-muted">{error?.message ?? 'No data for this wallet.'}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {isSelf ? 'My profile' : 'Profile'}
          </h1>
          <AddressDisplay address={address} head={6} tail={6} />
        </div>
        <p className="text-sm text-text-muted mt-1">
          {data.tokensCreated.length} created · {data.recentTrades.length} recent trades
          {isSelf ? ` · ${data.holdings.length} holdings` : ''}
        </p>
      </div>

      {isSelf ? <HoldingsSection holdings={data.holdings} /> : null}
      <CreatedSection profile={data} />
      <RecentTradesSection profile={data} />
    </div>
  );
}

function HoldingsSection({ holdings }: { holdings: ProfileHolding[] }): JSX.Element {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3">Holdings</h2>
      {holdings.length === 0 ? (
        <Card>
          <p className="text-xs text-text-muted">You don't hold any tokens launched here yet.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
                <Th>Token</Th>
                <Th align="right">Balance</Th>
                <Th align="right">Value (USD)</Th>
                <Th align="right">Market cap</Th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr
                  key={h.token.mintAddress}
                  className="border-t border-border hover:bg-surface-elevated/40 transition-colors"
                >
                  <Td>
                    <Link
                      to={`/token/${h.token.mintAddress}`}
                      className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {h.token.imageUrl ? (
                        <img
                          src={h.token.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-7 w-7 rounded-md object-cover border border-border"
                        />
                      ) : (
                        <span className="h-7 w-7 rounded-md bg-surface-elevated border border-border grid place-items-center text-xs text-text-muted">
                          {h.token.symbol.slice(0, 1)}
                        </span>
                      )}
                      <span className="text-sm">{h.token.name}</span>
                      <span className="text-xs font-mono text-text-muted">${h.token.symbol}</span>
                    </Link>
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatToken(h.balance, TOKEN_DECIMALS, { compact: true })}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums">
                    {formatUsd(h.valueUsd, { compact: false })}
                  </Td>
                  <Td align="right" className="font-mono tabular-nums text-text-muted">
                    {formatUsd(h.token.marketCapUsd)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function CreatedSection({ profile }: { profile: Profile }): JSX.Element {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3">Tokens created</h2>
      {profile.tokensCreated.length === 0 ? (
        <Card>
          <p className="text-xs text-text-muted">
            This wallet hasn't launched any tokens.
            <Link to="/create" className="text-primary ml-1 hover:underline">
              Launch the first?
            </Link>
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {profile.tokensCreated.map((t, i) => (
            <TokenCard key={t.mintAddress} token={t} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

function RecentTradesSection({ profile }: { profile: Profile }): JSX.Element {
  return (
    <section>
      <h2 className="text-base font-semibold mb-3">Recent trades</h2>
      {profile.recentTrades.length === 0 ? (
        <Card>
          <p className="text-xs text-text-muted">No trades yet.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-text-muted bg-surface-elevated">
                <Th>Time</Th>
                <Th>Type</Th>
                <Th>Token</Th>
                <Th align="right">SOL</Th>
                <Th align="right">Tokens</Th>
                <Th align="right">Tx</Th>
              </tr>
            </thead>
            <tbody>
              {profile.recentTrades.map((t) => (
                <TradeRow key={t.signature} trade={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function TradeRow({ trade }: { trade: Trade }): JSX.Element {
  const isBuy = trade.side === 'BUY';
  return (
    <tr className="border-t border-border hover:bg-surface-elevated/40 transition-colors">
      <Td className="text-text-muted whitespace-nowrap">
        {formatTimeAgo(trade.blockTime, { suffix: false })}
      </Td>
      <Td>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            isBuy ? 'text-primary' : 'text-danger',
          )}
        >
          {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {isBuy ? 'Buy' : 'Sell'}
        </span>
      </Td>
      <Td>
        <Link
          to={`/token/${trade.tokenMint}`}
          className="font-mono text-xs text-text-muted hover:text-text-primary"
        >
          {formatAddress(trade.tokenMint, 4, 4)}
        </Link>
      </Td>
      <Td align="right" className="font-mono tabular-nums">
        {formatSol(trade.solAmount, { withUnit: false, fractionDigits: 4 })}
      </Td>
      <Td align="right" className="font-mono tabular-nums">
        {formatToken(trade.tokenAmount, TOKEN_DECIMALS, { compact: true })}
      </Td>
      <Td align="right">
        <a
          href={getExplorerUrl(trade.signature)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-text-muted hover:text-text-primary"
          aria-label="View on Solscan"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Td>
    </tr>
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
      className={cn(
        'px-3 py-2 align-middle',
        align === 'right' ? 'text-right' : 'text-left',
        className,
      )}
    >
      {children}
    </td>
  );
}

function ProfileSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-1/3" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
