import BigNumber from 'bignumber.js';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AddressDisplay } from '@/components/ui/AddressDisplay';
import { BondingProgressBar } from './BondingProgressBar';
import { bondingProgress, formatSol } from '@/lib/format';
import { curveReserves } from '@/lib/curve';
import type { Token, TokenWithOnChain } from '@/types';

// Re-export the primitive so existing imports keep working.
export { BondingProgressBar } from './BondingProgressBar';

/** Migration threshold for our DBC launch config (85 SOL → DAMM v2). */
const MIGRATION_THRESHOLD_SOL = 85;

interface BondingProgressProps {
  token: Token | TokenWithOnChain;
}

/**
 * Detail-page card: big progress bar + "X / 85 SOL raised" + "% of supply sold".
 * Once graduated, replaces the progress UI with a link to the DAMM v2 pool
 * and a Jupiter swap button.
 */
export function BondingProgress({ token }: BondingProgressProps): JSX.Element {
  const { solLamports, tokenRaw } = curveReserves(token);
  const progress = bondingProgress(solLamports);
  const solRaised = formatSol(solLamports, { fractionDigits: 2, withUnit: false });

  // Tokens sold = totalSupply - base reserve remaining on the curve (raw units).
  const totalRaw = new BigNumber(token.totalSupply);
  const remainingRaw = new BigNumber(tokenRaw);
  const soldRaw = BigNumber.maximum(totalRaw.minus(remainingRaw), 0);
  const supplySoldPct =
    totalRaw.isZero() || !totalRaw.isFinite()
      ? 0
      : Math.min(100, soldRaw.div(totalRaw).times(100).toNumber());

  if (token.isGraduated) {
    return (
      <Card title="Graduated" description="The curve completed and migrated to a DAMM v2 pool.">
        <div className="flex flex-col gap-3">
          {token.graduatedPoolAddress ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-text-muted">DAMM v2 pool</span>
              <AddressDisplay
                address={token.graduatedPoolAddress}
                head={5}
                tail={5}
                solscanPath="account"
              />
            </div>
          ) : null}
          <a
            href={`https://jup.ag/swap/SOL-${token.mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="primary"
              fullWidth
              rightIcon={<ExternalLink className="h-4 w-4" />}
            >
              Trade on Jupiter
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Bonding curve" description="Progress toward graduation to DAMM v2.">
      <div className="flex flex-col gap-4">
        <BondingProgressBar value={progress} thickness="thick" showLabel={false} />

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="SOL raised"
            value={
              <>
                <span className="font-mono tabular-nums">{solRaised}</span>
                <span className="text-text-muted"> / {MIGRATION_THRESHOLD_SOL} SOL</span>
              </>
            }
          />
          <Stat
            label="Supply sold"
            value={
              <span className="font-mono tabular-nums">{supplySoldPct.toFixed(1)}%</span>
            }
          />
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed">
          When the bonding curve fills with {MIGRATION_THRESHOLD_SOL} SOL, the token graduates
          to a permanent AMM pool. 20% of supply is reserved for that pool's liquidity.
        </p>
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-lg bg-surface-elevated border border-border p-3">
      <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}
