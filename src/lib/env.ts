/**
 * Typed access to Vite env vars. Throws at module-load time if anything required
 * is missing — better to fail fast than 50 mysterious errors deep in a request.
 */
function read(name: string, fallback?: string): string {
  const v = import.meta.env[name];
  if (typeof v === 'string' && v.length > 0) return v;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required Vite env: ${name}`);
}

export const env = {
  apiUrl: read('VITE_API_URL', 'http://localhost:4000').replace(/\/$/, ''),
  wsUrl: read('VITE_WS_URL', 'http://localhost:4000').replace(/\/$/, ''),
  solanaNetwork: read('VITE_SOLANA_NETWORK', 'devnet') as 'devnet' | 'mainnet-beta',
  solanaRpcUrl: read('VITE_SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
  platformName: read('VITE_PLATFORM_NAME', 'PumpClone'),
} as const;

export type Env = typeof env;
