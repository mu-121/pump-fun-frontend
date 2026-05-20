import { Link } from 'react-router-dom';
import { env } from '@/lib/env';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-text-muted">
        <span>
          {env.platformName} · Built on Solana with Meteora Dynamic Bonding Curve
        </span>
        <div className="flex items-center gap-4">
          <Link to="/how-it-works" className="hover:text-text-primary transition-colors">
            How it works
          </Link>
          <span className="font-mono">{env.solanaNetwork}</span>
        </div>
      </div>
    </footer>
  );
}
