import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  ChartLine,
  Coins,
  GraduationCap,
  Plus,
  Rocket,
  Shield,
  Wallet,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { env } from '@/lib/env';

const PHASES = [
  {
    icon: Rocket,
    title: 'Launch',
    summary:
      'Anyone with a Solana wallet can create a token in a few clicks. Upload art, set name and symbol, sign one transaction, and your bonding-curve pool goes live on-chain.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Trade',
    summary:
      'Buyers swap SOL for tokens on the curve. Price moves automatically as supply is bought or sold — no order book, no liquidity providers to recruit first.',
  },
  {
    icon: GraduationCap,
    title: 'Graduate',
    summary:
      'When the curve collects 85 SOL, the token migrates to a permanent Meteora DAMM v2 pool. Trading continues on the open market (e.g. via Jupiter).',
  },
] as const;

const LAUNCH_STEPS = [
  'Connect a wallet (Phantom, Solflare, or any Wallet Standard wallet).',
  'Fill in name, symbol, description, and upload an image (PNG, JPEG, WebP, or GIF).',
  'Optionally add an initial buy in the same flow — up to 5 SOL, requires a second signature.',
  'Sign the launch transaction in your wallet. The server builds the pool; you approve and pay network fees.',
  'Your token appears in the feed and gets its own trade page with a live chart.',
];

const TRADE_STEPS = [
  'Open a token page and connect your wallet.',
  'Choose Buy or Sell, enter an amount, and review the quote (slippage + priority fee).',
  'Sign the swap transaction. Reserves and the bonding-curve progress bar update after confirmation.',
  'Trades stream into the activity table and candlestick chart when the indexer is connected.',
];

const FACTS = [
  { label: 'Network', value: env.solanaNetwork },
  { label: 'Curve protocol', value: 'Meteora DBC' },
  { label: 'Total supply', value: '1B tokens' },
  { label: 'Graduation target', value: '85 SOL raised' },
  { label: 'LP at graduation', value: '20% of supply' },
  { label: 'Trading fee', value: '1% per swap' },
  { label: 'Min. wallet to launch', value: '0.05 SOL' },
  { label: 'Token decimals', value: '6' },
];

const FAQ = [
  {
    q: 'Do I need coding skills?',
    a: 'No. Launching and trading are done entirely in the browser with your wallet. The backend handles metadata upload, transaction building, and indexing.',
  },
  {
    q: 'What happens to the SOL in the curve?',
    a: 'SOL accumulates in the pool as people buy. At 85 SOL the curve completes and liquidity migrates to a DAMM v2 AMM. Until then, every buy and sell is against the bonding curve formula.',
  },
  {
    q: 'Can I sell before graduation?',
    a: 'Yes. Holders can sell back into the curve at any time before migration, subject to slippage and the 1% trading fee.',
  },
  {
    q: 'What does “graduated” mean?',
    a: 'The bonding phase is over. The token now trades on a standard AMM pool. The app links to Jupiter for post-graduation swaps.',
  },
  {
    q: 'Who receives trading fees?',
    a: 'Fees on curve trades go to the platform configuration. Creators earn exposure from launches and optional initial buys, not a separate creator fee share on this deployment.',
  },
  {
    q: 'Is this mainnet?',
    a: `This build is configured for ${env.solanaNetwork}. Always verify the network badge in the header before signing transactions.`,
  },
];

export function HowItWorksPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <Seo
        title="How it works"
        description="Learn how to launch and trade tokens on Solana bonding curves with Meteora Dynamic Bonding Curves."
      />

      <header className="flex flex-col gap-3">
        <p className="text-xs font-mono uppercase tracking-wider text-primary">Guide</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="text-sm text-text-muted leading-relaxed">
          {env.platformName} is a pump.fun-style launchpad on Solana. Tokens start on a{' '}
          <strong className="text-text-primary font-medium">dynamic bonding curve</strong> so
          early price discovery is automatic. When enough SOL has been raised, the token{' '}
          <strong className="text-text-primary font-medium">graduates</strong> to a full AMM.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {PHASES.map(({ icon: Icon, title, summary }) => (
          <Card key={title} className="flex flex-col gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
            <p className="text-xs text-text-muted leading-relaxed">{summary}</p>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">Launching a token</h2>
        </div>
        <Card>
          <ol className="flex flex-col gap-3">
            {LAUNCH_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-text-muted leading-relaxed">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated border border-border text-[11px] font-mono text-text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ChartLine className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">Trading on the curve</h2>
        </div>
        <Card>
          <ol className="flex flex-col gap-3">
            {TRADE_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-text-muted leading-relaxed">
                <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated border border-border text-[11px] font-mono text-text-primary">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Card>
        <p className="text-xs text-text-muted leading-relaxed px-1">
          The bonding-curve card on each token page shows{' '}
          <span className="text-text-primary">SOL raised</span> toward the 85 SOL target and{' '}
          <span className="text-text-primary">supply sold</span> as a percentage of the 1B total
          supply.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">Key parameters</h2>
        </div>
        <Card padded={false}>
          <dl className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {FACTS.map(({ label, value }) => (
              <div key={label} className="px-4 py-3">
                <dt className="text-[10px] uppercase tracking-wide text-text-muted">{label}</dt>
                <dd className="mt-0.5 text-sm font-mono text-text-primary">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="text-lg font-semibold tracking-tight">FAQ</h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQ.map(({ q, a }) => (
            <Card key={q} title={q}>
              <p className="text-sm text-text-muted leading-relaxed">{a}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="bg-primary/5 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Ready to launch?</h2>
            <p className="mt-1 text-xs text-text-muted">
              Connect your wallet and create a token in under a minute.
            </p>
          </div>
          <Link to="/create" className="shrink-0">
            <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Create token
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
