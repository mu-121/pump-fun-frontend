# pump-clone-frontend

Vite + React + TypeScript app for a pump.fun-style memecoin launchpad on Solana, talking to the [pump-clone-backend](../backend) API.

## Stack

- **Build:** Vite 8, code-split per route
- **UI:** React 18, TypeScript (strict), TailwindCSS 3 (dark-mode only)
- **Routing:** react-router-dom
- **Server state:** @tanstack/react-query (infinite queries on feeds + per-token tables)
- **Client state:** Zustand (slippage, priority-fee mode)
- **Wallet:** @solana/wallet-adapter (Phantom, Solflare; Backpack via Solana Wallet Standard)
- **Chain:** @solana/web3.js
- **Realtime:** socket.io-client → backend `token:<mint>` and `global` rooms
- **Chart:** lightweight-charts v5 with live `series.update()` from WS
- **Forms:** react-hook-form + zod
- **SEO:** react-helmet-async (per-token OG images)
- **UX:** react-hot-toast, lucide-react, date-fns
- **Math:** bignumber.js — no float math for token amounts

## Local development

```bash
cp .env.example .env       # adjust if your backend runs elsewhere
npm install
npm run dev                # http://localhost:5173
```

Backend must be reachable at `VITE_API_URL` (default `http://localhost:4000`). For Socket.io live updates, `VITE_WS_URL` should point at the same backend.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b` typecheck + `vite build` → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier on `src/` |

## Production env

For a `mainnet-beta` build, copy `.env.production.example` → `.env.production`. `VITE_*` vars are baked into the bundle at build time, so set them before `npm run build`. Optional `VITE_ANALYTICS_DOMAIN` enables a Plausible script.

| Name | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:4000` | Backend HTTP API base URL |
| `VITE_WS_URL` | `http://localhost:4000` | Backend Socket.io base URL |
| `VITE_SOLANA_NETWORK` | `devnet` | `devnet` or `mainnet-beta` |
| `VITE_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Client-side RPC (wallet-adapter `ConnectionProvider`) |
| `VITE_PLATFORM_NAME` | `PumpClone` | Brand string shown in the header / footer |
| `VITE_ANALYTICS_DOMAIN` | _empty_ | If set, injects Plausible's `script.js` with this `data-domain`. Disabled when blank. |

## Deployment

Anything that serves a static SPA works — Vercel, Netlify, Cloudflare Pages, or self-hosted on Hetzner. Configs are checked in:

- **Vercel** — `vercel.json` (SPA rewrite + asset cache-control)
- **Netlify** — `netlify.toml` (same)
- **Cloudflare Pages** — UI settings: build command `npm run build`, output dir `dist`. Set the `VITE_*` env vars in the project's Environment Variables page. Add a `/* → /index.html` rewrite for SPA fallback.

### Hetzner / nginx (self-hosted)
```bash
npm ci && npm run build
# scp -r dist/ user@server:/var/www/pump-clone
```
nginx site config:
```nginx
server {
  listen 443 ssl http2;
  server_name pump.example.com;
  root /var/www/pump-clone;
  index index.html;

  # SPA fallback
  location / { try_files $uri $uri/ /index.html; }

  # Long-cache fingerprinted assets
  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # No-cache HTML (so deploys are picked up immediately)
  location = /index.html {
    add_header Cache-Control "no-cache";
  }
}
```
Set the `VITE_*` env vars at build time, not at run time.

## Repo layout

```
src/
├── components/
│   ├── ui/        # Button, Input, Card, Modal, Tabs, Skeleton, Spinner, AddressDisplay
│   ├── layout/    # Header, Footer, MainLayout
│   ├── token/     # TokenCard, TokenList, TokenChart, TradePanel, MobileTradeSheet,
│   │              # BondingProgress(Bar), TradesTable, HoldersTable, LiveTape,
│   │              # ImageDropzone, LaunchProgress
│   ├── wallet/    # WalletButton
│   ├── ErrorBoundary.tsx
│   ├── RouteLoader.tsx
│   └── Seo.tsx
├── pages/         # HomePage, CreateTokenPage, TokenDetailPage, ProfilePage, NotFoundPage
├── hooks/         # useTokens, useToken, useTokenTrades, useTokenHolders, useCandles,
│                  # useLiveTokens, useLiveTrades, useSocketStatus,
│                  # useBalances (SOL + token), useProfile, useDebouncedValue, useWebSocket
├── lib/           # api, ws, env, analytics, format, tx, utils
├── stores/        # zustand: uiStore, walletStore
├── types/         # Token, Trade, Candle, Quote, Profile, etc
├── providers/     # AppProviders (helmet + router + query + wallet + toaster)
├── App.tsx        # React.lazy route boundaries
└── main.tsx       # ErrorBoundary → AppProviders → App
```
