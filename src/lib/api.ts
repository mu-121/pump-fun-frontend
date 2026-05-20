import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
import { env } from './env';
import type {
  ApiEnvelope,
  BuildSwapResult,
  Candle,
  CandleIntervalKey,
  CreateLaunchResult,
  Holder,
  Page,
  PriorityFeeMode,
  Profile,
  QuoteResult,
  Side,
  SortOption,
  SubmitLaunchResult,
  Token,
  TokenWithOnChain,
  Trade,
} from '@/types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const client: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
});

function unwrap<T>(payload: unknown): T {
  const env = payload as ApiEnvelope<T>;
  if (env && env.success === true) return env.data;
  if (env && env.success === false) {
    throw new ApiError(env.error.code, env.error.message, undefined, env.error.details);
  }
  // Some endpoints (health) don't use the envelope
  return payload as T;
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await client.request<unknown>(config);
    return unwrap<T>(res.data);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof AxiosError) {
      const data = err.response?.data as ApiEnvelope<unknown> | undefined;
      if (data && data.success === false) {
        throw new ApiError(data.error.code, data.error.message, err.response?.status, data.error.details);
      }
      throw new ApiError(
        'NetworkError',
        err.message,
        err.response?.status,
        err.response?.data,
      );
    }
    throw new ApiError('UnknownError', err instanceof Error ? err.message : 'Unknown error');
  }
}

// ---- Tokens ----

export interface ListTokensParams {
  sort?: SortOption;
  limit?: number;
  cursor?: string;
  search?: string;
}

export function listTokens(params: ListTokensParams = {}): Promise<Page<Token>> {
  return request<Page<Token>>({ url: '/api/v1/tokens', method: 'GET', params });
}

export function getToken(mint: string): Promise<TokenWithOnChain> {
  return request<TokenWithOnChain>({ url: `/api/v1/tokens/${mint}`, method: 'GET' });
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

export function getTokenHolders(mint: string, params: PaginationParams = {}): Promise<Page<Holder>> {
  return request<Page<Holder>>({
    url: `/api/v1/tokens/${mint}/holders`,
    method: 'GET',
    params,
  });
}

export function getTokenTrades(mint: string, params: PaginationParams = {}): Promise<Page<Trade>> {
  return request<Page<Trade>>({
    url: `/api/v1/tokens/${mint}/trades`,
    method: 'GET',
    params,
  });
}

export interface CandlesParams {
  interval: CandleIntervalKey;
  from?: number;
  to?: number;
  limit?: number;
}

export function getCandles(mint: string, params: CandlesParams): Promise<Candle[]> {
  return request<Candle[]>({
    url: `/api/v1/tokens/${mint}/candles`,
    method: 'GET',
    params,
  });
}

// ---- Launch ----

export interface CreateLaunchInput {
  name: string;
  symbol: string;
  description?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  creatorAddress: string;
  image: File;
}

export function createTokenLaunch(input: CreateLaunchInput): Promise<CreateLaunchResult> {
  const form = new FormData();
  form.append('name', input.name);
  form.append('symbol', input.symbol);
  if (input.description) form.append('description', input.description);
  if (input.twitter) form.append('twitter', input.twitter);
  if (input.telegram) form.append('telegram', input.telegram);
  if (input.website) form.append('website', input.website);
  form.append('creatorAddress', input.creatorAddress);
  form.append('image', input.image);
  return request<CreateLaunchResult>({
    url: '/api/v1/tokens/create',
    method: 'POST',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function submitTokenLaunch(input: {
  launchSessionId: string;
  signedTx: string;
}): Promise<SubmitLaunchResult> {
  return request<SubmitLaunchResult>({
    url: '/api/v1/tokens/create/submit',
    method: 'POST',
    data: input,
  });
}

// ---- Trade ----

export interface GetQuoteInput {
  mint: string;
  side: Lowercase<Side>;
  amount: string; // decimal-string BigInt
  slippageBps: number;
}

export function getQuote(input: GetQuoteInput): Promise<QuoteResult> {
  return request<QuoteResult>({ url: '/api/v1/trade/quote', method: 'POST', data: input });
}

export interface BuildSwapInput extends GetQuoteInput {
  user: string;
  priorityFeeMode: PriorityFeeMode;
}

export function buildSwap(input: BuildSwapInput): Promise<BuildSwapResult> {
  return request<BuildSwapResult>({ url: '/api/v1/trade/build', method: 'POST', data: input });
}

export function submitSwap(input: {
  signedTx: string;
  blockhash: string;
  lastValidBlockHeight: number;
  mint?: string;
}): Promise<{ signature: string }> {
  return request<{ signature: string }>({
    url: '/api/v1/trade/submit',
    method: 'POST',
    data: input,
  });
}

// ---- Profile ----

export function getProfile(address: string): Promise<Profile> {
  return request<Profile>({ url: `/api/v1/profile/${address}`, method: 'GET' });
}

// ---- Health ----

export function ping(): Promise<{ pong: boolean; timestamp: string }> {
  return request<{ pong: boolean; timestamp: string }>({
    url: '/api/v1/ping',
    method: 'GET',
  });
}
