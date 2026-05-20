/**
 * Domain types matching the backend API. BigInt-as-string fields are typed
 * as `string` and only run through bignumber.js / BigInt at the boundary
 * where math actually happens — never as a float.
 */

export type Side = 'BUY' | 'SELL';
export type SortOption = 'new' | 'trending' | 'graduating' | 'graduated';
export type CandleIntervalKey = '1m' | '5m' | '1h' | '1d';
export type PriorityFeeMode = 'auto' | 'fast' | 'turbo';

export interface Token {
  id: string;
  mintAddress: string;
  poolAddress: string;
  configKey: string;
  creatorAddress: string;
  name: string;
  symbol: string;
  description: string | null;
  imageUrl: string | null;
  twitterUrl: string | null;
  telegramUrl: string | null;
  websiteUrl: string | null;
  createdAt: string;
  graduatedAt: string | null;
  graduatedPoolAddress: string | null;
  isGraduated: boolean;
  virtualSolReserves: string;
  virtualTokenReserves: string;
  realSolReserves: string;
  realTokenReserves: string;
  totalSupply: string;
  lastTradeAt: string | null;
  tradeCount: number;
  holderCount: number;
  marketCapUsd: number;
}

export interface TokenWithOnChain extends Token {
  onChain: {
    baseReserve: string;
    quoteReserve: string;
    sqrtPrice: string;
    isMigrated: boolean;
  } | null;
}

export interface Trade {
  id: string;
  signature: string;
  tokenMint: string;
  traderAddress: string;
  side: Side;
  solAmount: string;
  tokenAmount: string;
  priceUsd: number;
  priceSol: number;
  slot: string;
  blockTime: string;
  createdAt: string;
}

export interface Holder {
  id: string;
  tokenMint: string;
  walletAddress: string;
  balance: string;
  updatedAt: string;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteResult {
  amountIn: string;
  amountOut: string;
  minimumAmountOut: string;
  tradingFee: string;
  protocolFee: string;
  priceImpactBps: number;
  nextSqrtPrice: string;
}

export interface BuildSwapResult {
  unsignedTx: string;
  blockhash: string;
  lastValidBlockHeight: number;
  quote: QuoteResult;
}

export interface CreateLaunchResult {
  launchSessionId: string;
  unsignedTx: string;
  mintAddress: string;
  poolAddress: string;
  metadataUri: string;
  imageUrl: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface SubmitLaunchResult {
  signature: string;
  mintAddress: string;
  poolAddress: string;
  tokenId: string;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };

export interface ProfileHolding {
  token: Pick<Token, 'mintAddress' | 'name' | 'symbol' | 'imageUrl' | 'marketCapUsd' | 'isGraduated'>;
  balance: string;
  valueUsd: number;
}

export interface Profile {
  address: string;
  tokensCreated: Token[];
  recentTrades: Trade[];
  holdings: ProfileHolding[];
}

// ---- Real-time payloads ----

/** Payload published on `evt:trade:<mint>` and forwarded as the `trade` WS event. */
export interface LiveTradePayload {
  signature: string;
  mintAddress: string;
  side: Side;
  solAmount: string;
  tokenAmount: string;
  priceSol: string;
  priceUsd: string;
  marketCapUsd: string;
  blockTime: string;
  trader?: string;
}

/** Payload published on `evt:state:<mint>` and forwarded as the `tokenState` WS event. */
export interface LiveTokenStatePayload {
  mintAddress: string;
  virtualSolReserves: string;
  virtualTokenReserves: string;
  priceSol: string;
  priceUsd: string;
  marketCapUsd: string;
}

/** Payload published on `evt:new-token` and forwarded as the `newToken` WS event. */
export interface LiveNewTokenPayload {
  mintAddress: string;
  poolAddress: string;
  creatorAddress?: string;
  name?: string;
  symbol?: string;
  imageUrl?: string;
}

/** Payload published on `evt:graduation:<mint>` and forwarded as the `graduation` WS event. */
export interface LiveGraduationPayload {
  mintAddress: string;
  poolAddress: string;
  graduatedPoolAddress: string;
  signature?: string;
  blockTime?: string;
}
