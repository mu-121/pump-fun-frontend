import { VersionedTransaction } from '@solana/web3.js';
import { env } from './env';

/**
 * Browser-safe base64 helpers. We avoid Node's `Buffer` so this code works
 * cleanly in the Vite bundle without a buffer polyfill.
 */
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  // Chunked encode to avoid hitting the call-stack limit on large arrays.
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

/** Deserialize a base64-encoded v0 VersionedTransaction. */
export function deserializeTx(b64: string): VersionedTransaction {
  return VersionedTransaction.deserialize(base64ToBytes(b64));
}

/** Serialize a signed VersionedTransaction back to base64. */
export function serializeSignedTx(tx: VersionedTransaction): string {
  return bytesToBase64(tx.serialize());
}

/** Solscan URL for a tx signature, cluster-aware. */
export function getExplorerUrl(signature: string): string {
  const cluster = env.solanaNetwork === 'mainnet-beta' ? '' : `?cluster=${env.solanaNetwork}`;
  return `https://solscan.io/tx/${signature}${cluster}`;
}

/** Solscan URL for an account / mint address, cluster-aware. */
export function getAccountExplorerUrl(address: string): string {
  const cluster = env.solanaNetwork === 'mainnet-beta' ? '' : `?cluster=${env.solanaNetwork}`;
  return `https://solscan.io/account/${address}${cluster}`;
}

/**
 * Translate a raw error from `signTransaction` / `sendRawTransaction` /
 * `submitSignedLaunch` into a short, user-facing message.
 *
 * Wallets vary wildly in how they report rejections, so we sniff a few
 * common patterns rather than relying on a stable error code.
 */
export function explainTxError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : '';
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? (err as { code?: unknown }).code
      : undefined;

  // Wallet-adapter / Phantom / Solflare rejection codes
  if (code === 4001 || name === 'WalletSignTransactionError') {
    if (/reject/i.test(message) || /denied/i.test(message) || /user/i.test(message)) {
      return 'Transaction declined in your wallet.';
    }
  }
  if (/user rejected/i.test(message) || /User rejected/i.test(message)) {
    return 'Transaction declined in your wallet.';
  }
  if (/insufficient/i.test(message) && /lamports?|fund|balance|sol/i.test(message)) {
    return 'Not enough SOL to cover this transaction. Top up your wallet and try again.';
  }
  if (/blockhash/i.test(message) && /expired|not found/i.test(message)) {
    return 'The transaction expired before confirming. Please try again.';
  }
  if (/timeout|timed out/i.test(message)) {
    return 'The RPC timed out. Solana is congested — retry in a moment.';
  }
  if (/network|fetch failed|ECONNREFUSED|503|502/i.test(message)) {
    return 'Network error talking to the backend. Check your connection and retry.';
  }
  if (/wrong network|unknown cluster/i.test(message)) {
    return 'Wallet is on a different network. Switch your wallet to the same cluster and retry.';
  }
  return message || 'Transaction failed.';
}
