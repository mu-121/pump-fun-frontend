import { NavLink } from 'react-router-dom';
import { BookOpen, Home, Plus, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS: Array<{
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  highlight?: boolean;
}> = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/?sort=trending', label: 'Trending', icon: TrendingUp },
  { to: '/create', label: 'Create', icon: Plus, highlight: true },
  { to: '/how-it-works', label: 'Guide', icon: BookOpen },
];

export function MobileNav(): JSX.Element {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-14">
        {ITEMS.map(({ to, label, icon: Icon, end, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                highlight
                  ? 'text-primary'
                  : isActive
                    ? 'text-text-primary'
                    : 'text-text-muted',
              )
            }
          >
            <Icon className={cn('h-5 w-5', highlight && 'text-primary')} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
