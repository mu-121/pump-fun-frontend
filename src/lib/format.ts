import BigNumber from 'bignumber.js';
import toast from 'react-hot-toast';

BigNumber.config({ EXPONENTIAL_AT: 1e9 });

/** Lamports per SOL. */
const LAMPORTS_PER_SOL = new BigNumber(1e9);

// ---- Money ----

/**
 * Compact USD formatter: $1.23K / $42.5M / $1.2B.
 * Falls back to a sub-cent exponential for tiny amounts ($1.2e-7 etc).
 */
export function formatMarketCap(usd: number | string | BigNumber): string {
  return formatUsd(usd, { compact: true });
}

export function formatUsd(
  usd: number | string | BigNumber,
  opts?: { compact?: boolean },
): string {
  const x = new BigNumber(usd as never);
  if (!x.isFinite()) return '$0';
  const compact = opts?.compact ?? true;

  if (compact && x.abs().gte(1_000)) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
      style: 'currency',
      currency: 'USD',
    }).format(x.toNumber());
  }

  if (x.abs().lt(0.01) && !x.isZero()) {
    return `$${x.toExponential(2)}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(x.toNumber());
}

/** Format a raw lamport string/bigint as a "1.234 SOL" string. */
export function formatSol(
  rawLamports: string | bigint,
  opts?: { fractionDigits?: number; withUnit?: boolean },
): string {
  const lamports = typeof rawLamports === 'bigint' ? rawLamports.toString() : rawLamports;
  const sol = new BigNumber(lamports).div(LAMPORTS_PER_SOL);
  const digits = opts?.fractionDigits ?? (sol.abs().lt(1) ? 4 : 2);
  const value = sol.toFixed(digits);
  return opts?.withUnit === false ? value : `${value} SOL`;
}

/**
 * Format a raw token amount given its decimals; compactly if it exceeds 1k.
 * If `symbol` is provided, "{value} {symbol}" is returned.
 */
export function formatToken(
  raw: string | bigint,
  decimals: number,
  opts?: { symbol?: string; compact?: boolean; maxFractionDigits?: number },
): string {
  const r = typeof raw === 'bigint' ? raw.toString() : raw;
  const value = new BigNumber(r).div(new BigNumber(10).pow(decimals));

  let formatted: string;
  if ((opts?.compact ?? true) && value.abs().gte(1_000)) {
    formatted = new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value.toNumber());
  } else {
    formatted = value.toFormat(opts?.maxFractionDigits ?? 2);
  }
  return opts?.symbol ? `${formatted} ${opts.symbol}` : formatted;
}

// ---- Addresses ----

/** "EQz1…WkUw" — keep the first `head` and last `tail` chars. */
export function formatAddress(addr: string, head = 4, tail = 4): string {
  if (!addr) return '';
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** Compatibility alias — older code calls this `shortAddress`. */
export const shortAddress = formatAddress;

// ---- Time ----

/** Coerce API / WS date values to epoch milliseconds. */
export function toUnixMs(date: string | Date | number | null | undefined): number {
  if (date == null) return NaN;
  if (date instanceof Date) return date.getTime();
  if (typeof date === 'number') return date;
  if (typeof date === 'string') return new Date(date).getTime();
  return new Date(String(date)).getTime();
}

/**
 * Short relative time: "now", "12s", "3m", "2h", "5d". Uses no suffix by default.
 * Pass `{ suffix: true }` to get "2m ago" / "in 30s" style.
 */
export function formatTimeAgo(
  date: string | Date | number | null | undefined,
  opts?: { suffix?: boolean },
): string {
  const ms = Date.now() - toUnixMs(date);
  if (Number.isNaN(ms)) return '—';
  const abs = Math.abs(ms);

  let value: string;
  if (abs < 5_000) value = 'now';
  else if (abs < 60_000) value = `${Math.floor(abs / 1000)}s`;
  else if (abs < 3_600_000) value = `${Math.floor(abs / 60_000)}m`;
  else if (abs < 86_400_000) value = `${Math.floor(abs / 3_600_000)}h`;
  else if (abs < 30 * 86_400_000) value = `${Math.floor(abs / 86_400_000)}d`;
  else value = `${Math.floor(abs / (30 * 86_400_000))}mo`;

  if (!opts?.suffix || value === 'now') return value;
  return ms >= 0 ? `${value} ago` : `in ${value}`;
}

// ---- Misc ----

export function formatPercentBps(bps: number): string {
  const pct = bps / 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Bonding-curve progress as a 0..1 ratio. Uses `virtualSolReserves` as the
 * numerator because that's where SOL accumulates on the DBC curve, and the
 * fixed migration threshold for our config (85 SOL).
 */
const MIGRATION_THRESHOLD_LAMPORTS = new BigNumber(85).times(LAMPORTS_PER_SOL);

export function bondingProgress(virtualSolReservesRaw: string): number {
  const x = new BigNumber(virtualSolReservesRaw).div(MIGRATION_THRESHOLD_LAMPORTS);
  if (!x.isFinite() || x.isNegative()) return 0;
  return Math.min(1, x.toNumber());
}

/** Copy text to the clipboard, with a toast for feedback. */
export async function copyToClipboard(
  text: string,
  opts?: { successMessage?: string; errorMessage?: string },
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(opts?.successMessage ?? 'Copied');
    return true;
  } catch {
    toast.error(opts?.errorMessage ?? 'Copy failed');
    return false;
  }
}
