import { useEffect, useMemo, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';
import { ArrowDownUp, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@/providers/WalletModalProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tab, TabList, Tabs } from '@/components/ui/Tabs';
import { buildSwap, getQuote, submitSwap } from '@/lib/api';
import { deserializeTx, explainTxError, getExplorerUrl, serializeSignedTx } from '@/lib/tx';
import { formatSol, formatToken, formatPercentBps } from '@/lib/format';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSolBalance, useTokenBalance } from '@/hooks/useBalances';
import { useUiStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { PriorityFeeMode, QuoteResult, Token } from '@/types';

const TOKEN_DECIMALS = 6;
const SOL_DECIMALS = 9;
const SOL_FEE_BUFFER_LAMPORTS = 10_000_000n; // ~0.01 SOL reserved for fees on Max-buy

const SLIPPAGE_PRESETS = [50, 100, 500]; // bps: 0.5% / 1% / 5%
const QUICK_BUY_SOL = [0.1, 0.5, 1, 5];
const PRIORITY_MODES: Array<{ key: PriorityFeeMode; label: string; hint: string }> = [
  { key: 'auto', label: 'Auto', hint: 'Helius medium estimate' },
  { key: 'fast', label: 'Fast', hint: 'Helius high estimate' },
  { key: 'turbo', label: 'Turbo', hint: 'Helius very-high estimate' },
];

type Side = 'buy' | 'sell';

interface TradePanelProps {
  token: Token;
  className?: string;
}

/**
 * Centerpiece widget: lets a connected wallet quote, sign, and submit a swap
 * against the bonding curve. Disables itself with a clear message when the
 * token is graduated, the wallet is missing, the balance is too low, or the
 * input is empty.
 */
export function TradePanel({ token, className }: TradePanelProps): JSX.Element {
  const { publicKey, signTransaction } = useWallet();
  const { setVisible: openWalletModal } = useWalletModal();
  const qc = useQueryClient();

  const slippageBps = useUiStore((s) => s.slippageBps);
  const setSlippageBps = useUiStore((s) => s.setSlippageBps);
  const priorityFeeMode = useUiStore((s) => s.priorityFeeMode);
  const setPriorityFeeMode = useUiStore((s) => s.setPriorityFeeMode);

  const sol = useSolBalance();
  const tokenBalance = useTokenBalance(token.mintAddress);

  const [side, setSide] = useState<Side>('buy');
  const [amountInput, setAmountInput] = useState('');
  const [customSlippage, setCustomSlippage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const debouncedAmount = useDebouncedValue(amountInput, 300);
  const decimals = side === 'buy' ? SOL_DECIMALS : TOKEN_DECIMALS;

  const amountRaw = useMemo<bigint | null>(() => {
    if (!debouncedAmount.trim()) return null;
    try {
      const x = new BigNumber(debouncedAmount).times(new BigNumber(10).pow(decimals));
      if (!x.isFinite() || x.isNegative()) return null;
      // BigNumber → BigInt via integer-string
      return BigInt(x.integerValue(BigNumber.ROUND_FLOOR).toFixed(0));
    } catch {
      return null;
    }
  }, [debouncedAmount, decimals]);

  // ---- Live quote (auto-refresh every 5s when amount is set) ----
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const reqRef = useRef(0);

  useEffect(() => {
    if (!amountRaw || amountRaw === 0n || token.isGraduated) {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }
    const myReq = ++reqRef.current;
    let cancelled = false;
    const run = async (): Promise<void> => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const q = await getQuote({
          mint: token.mintAddress,
          side,
          amount: amountRaw.toString(),
          slippageBps,
        });
        if (cancelled || myReq !== reqRef.current) return;
        setQuote(q);
      } catch (err) {
        if (cancelled || myReq !== reqRef.current) return;
        setQuote(null);
        setQuoteError(err instanceof Error ? err.message : 'Quote failed');
      } finally {
        if (!cancelled && myReq === reqRef.current) setQuoteLoading(false);
      }
    };
    void run();
    const interval = window.setInterval(() => void run(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [amountRaw, side, slippageBps, token.mintAddress, token.isGraduated]);

  // ---- Validation ----
  const insufficientBalance = useMemo(() => {
    if (!amountRaw || amountRaw === 0n) return false;
    if (side === 'buy') {
      if (sol.lamports == null) return false;
      return amountRaw + SOL_FEE_BUFFER_LAMPORTS > sol.lamports;
    }
    if (tokenBalance.raw == null) return false;
    return amountRaw > tokenBalance.raw;
  }, [amountRaw, side, sol.lamports, tokenBalance.raw]);

  const buttonDisabled =
    submitting ||
    token.isGraduated ||
    !amountRaw ||
    amountRaw === 0n ||
    insufficientBalance ||
    !!quoteError;

  // ---- Submit ----
  async function onSubmit(): Promise<void> {
    if (!publicKey || !signTransaction) {
      openWalletModal(true);
      return;
    }
    if (!amountRaw) return;
    setSubmitting(true);
    try {
      const build = await buildSwap({
        mint: token.mintAddress,
        side,
        amount: amountRaw.toString(),
        slippageBps,
        user: publicKey.toBase58(),
        priorityFeeMode,
      });
      const unsigned = deserializeTx(build.unsignedTx);
      const signed = await signTransaction(unsigned);
      const result = await submitSwap({
        signedTx: serializeSignedTx(signed),
        blockhash: build.blockhash,
        lastValidBlockHeight: build.lastValidBlockHeight,
        mint: token.mintAddress,
      });
      toast.success(
        (t) => (
          <span className="text-xs">
            Swap confirmed —{' '}
            <a
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
              href={getExplorerUrl(result.signature)}
              onClick={() => toast.dismiss(t.id)}
            >
              View on Solscan
            </a>
          </span>
        ),
        { duration: 6_000 },
      );
      setAmountInput('');
      // Refresh balances + token detail
      sol.refresh();
      tokenBalance.refresh();
      void qc.invalidateQueries({ queryKey: ['token', token.mintAddress] });
      void qc.invalidateQueries({ queryKey: ['token-trades', token.mintAddress], exact: false });
      void qc.invalidateQueries({ queryKey: ['tokens'], exact: false });
    } catch (err) {
      toast.error(explainTxError(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ---- Helpers ----
  function setQuickAmount(sol: number): void {
    setSide('buy');
    setAmountInput(String(sol));
  }
  function setMax(): void {
    if (side === 'buy') {
      if (sol.lamports == null) return;
      const max = sol.lamports > SOL_FEE_BUFFER_LAMPORTS ? sol.lamports - SOL_FEE_BUFFER_LAMPORTS : 0n;
      setAmountInput(new BigNumber(max.toString()).div(1e9).toFixed(6));
    } else {
      if (tokenBalance.raw == null) return;
      setAmountInput(
        new BigNumber(tokenBalance.raw.toString()).div(new BigNumber(10).pow(TOKEN_DECIMALS)).toFixed(6),
      );
    }
  }

  function applyCustomSlippage(): void {
    const x = Number(customSlippage);
    if (!Number.isFinite(x) || x < 0 || x > 50) {
      toast.error('Slippage must be 0–50%');
      return;
    }
    setSlippageBps(Math.round(x * 100));
  }

  if (token.isGraduated) {
    return (
      <Card title="Trade" className={className}>
        <p className="text-sm text-text-muted">
          This token has graduated. Trade it on the migrated DAMM v2 pool — see the link below the
          panel.
        </p>
      </Card>
    );
  }

  const connected = Boolean(publicKey && signTransaction);

  return (
    <Card className={cn('p-0', className)} padded={false}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 mb-3">
          <Tabs value={side} onValueChange={(v) => setSide(v as Side)}>
            <TabList>
              <Tab value="buy">Buy</Tab>
              <Tab value="sell">Sell</Tab>
            </TabList>
          </Tabs>
          <button
            type="button"
            onClick={() => setSide((s) => (s === 'buy' ? 'sell' : 'buy'))}
            aria-label="Flip side"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        <Input
          type="number"
          step="any"
          min={0}
          placeholder="0.0"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          suffix={<span className="text-xs font-mono">{side === 'buy' ? 'SOL' : token.symbol}</span>}
          errorText={insufficientBalance ? 'Insufficient balance' : undefined}
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {side === 'buy'
            ? QUICK_BUY_SOL.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setQuickAmount(v)}
                  className="rounded-md border border-border bg-surface-elevated px-2.5 py-1 text-xs font-mono text-text-muted hover:text-text-primary"
                >
                  {v} SOL
                </button>
              ))
            : null}
          <button
            type="button"
            onClick={setMax}
            className="rounded-md border border-border bg-surface-elevated px-2.5 py-1 text-xs font-mono text-text-muted hover:text-text-primary"
          >
            Max
          </button>
        </div>

        <Balances side={side} sol={sol.lamports} token={tokenBalance.raw} symbol={token.symbol} />
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Slippage</span>
          <span className="text-xs font-mono text-text-primary">
            {formatPercentBps(slippageBps)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SLIPPAGE_PRESETS.map((bps) => (
            <button
              key={bps}
              type="button"
              onClick={() => setSlippageBps(bps)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-mono transition-colors',
                slippageBps === bps
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary',
              )}
            >
              {(bps / 100).toFixed(bps < 100 ? 1 : 0)}%
            </button>
          ))}
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.1"
              min={0}
              max={50}
              placeholder="Custom"
              value={customSlippage}
              onChange={(e) => setCustomSlippage(e.target.value)}
              className="w-16 rounded-md border border-border bg-surface-elevated px-2 py-1 text-xs font-mono outline-none focus:border-text-muted/60"
            />
            <button
              type="button"
              onClick={applyCustomSlippage}
              className="text-[10px] uppercase tracking-wider text-text-muted hover:text-text-primary"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-muted">Priority fee</span>
          <span className="text-[10px] text-text-muted">
            {PRIORITY_MODES.find((m) => m.key === priorityFeeMode)?.hint}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {PRIORITY_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setPriorityFeeMode(m.key)}
              className={cn(
                'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                priorityFeeMode === m.key
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border bg-surface-elevated text-text-muted hover:text-text-primary',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <QuoteSummary
          side={side}
          quote={quote}
          loading={quoteLoading}
          error={quoteError}
          symbol={token.symbol}
          empty={!amountRaw || amountRaw === 0n}
        />
      </div>

      <div className="p-4">
        {connected ? (
          <Button
            type="button"
            onClick={onSubmit}
            variant={side === 'buy' ? 'primary' : 'danger'}
            size="lg"
            fullWidth
            loading={submitting}
            disabled={buttonDisabled}
          >
            {submitting ? 'Submitting…' : side === 'buy' ? `Buy ${token.symbol}` : `Sell ${token.symbol}`}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => openWalletModal(true)}
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Wallet className="h-4 w-4" />}
          >
            Connect wallet
          </Button>
        )}
      </div>
    </Card>
  );
}

function Balances({
  side,
  sol,
  token,
  symbol,
}: {
  side: Side;
  sol: bigint | null;
  token: bigint | null;
  symbol: string;
}): JSX.Element {
  return (
    <div className="mt-2 flex justify-between text-[11px] text-text-muted">
      <span>
        SOL:{' '}
        <span className="font-mono text-text-primary">
          {sol == null ? '—' : formatSol(sol, { withUnit: false, fractionDigits: 4 })}
        </span>
      </span>
      <span>
        {symbol}:{' '}
        <span className="font-mono text-text-primary">
          {token == null
            ? '—'
            : formatToken(token, TOKEN_DECIMALS, { compact: true, maxFractionDigits: 2 })}
        </span>
      </span>
      <span className="opacity-60">{side === 'buy' ? 'paying in SOL' : `selling ${symbol}`}</span>
    </div>
  );
}

function QuoteSummary({
  side,
  quote,
  loading,
  error,
  symbol,
  empty,
}: {
  side: Side;
  quote: QuoteResult | null;
  loading: boolean;
  error: string | null;
  symbol: string;
  empty: boolean;
}): JSX.Element {
  if (empty) {
    return <p className="text-xs text-text-muted">Enter an amount to see a quote.</p>;
  }
  if (error) {
    return <p className="text-xs text-danger">{error}</p>;
  }
  if (!quote && loading) {
    return <p className="text-xs text-text-muted">Fetching quote…</p>;
  }
  if (!quote) return <p className="text-xs text-text-muted">No quote available.</p>;

  const outDecimals = side === 'buy' ? TOKEN_DECIMALS : SOL_DECIMALS;
  const outSymbol = side === 'buy' ? symbol : 'SOL';
  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <Row
        label="You receive"
        value={
          <>
            <span className="font-mono tabular-nums">
              ~{formatToken(quote.amountOut, outDecimals, { compact: false, maxFractionDigits: 4 })}
            </span>{' '}
            <span className="text-text-muted">{outSymbol}</span>
          </>
        }
      />
      <Row
        label="Minimum"
        value={
          <span className="font-mono tabular-nums text-text-muted">
            {formatToken(quote.minimumAmountOut, outDecimals, { maxFractionDigits: 4 })} {outSymbol}
          </span>
        }
      />
      <Row
        label="Fees"
        value={
          <span className="font-mono tabular-nums text-text-muted">
            {formatPercentBps(quote.priceImpactBps)}
          </span>
        }
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
