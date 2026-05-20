import { NavLink } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { WalletButton } from '@/components/wallet/WalletButton';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/create', label: 'Create' },
  { to: '/how-it-works', label: 'How it works' },
];

export function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid place-items-center w-7 h-7 rounded-md bg-primary/15 text-primary">
            <Rocket className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">{env.platformName}</span>
          <span className="text-[10px] uppercase tracking-wider text-text-muted px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
            {env.solanaNetwork}
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'px-3 h-8 inline-flex items-center rounded-md text-sm transition-colors',
                  isActive
                    ? 'text-text-primary bg-surface-elevated'
                    : 'text-text-muted hover:text-text-primary',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />
        <WalletButton />
      </div>
    </header>
  );
}
