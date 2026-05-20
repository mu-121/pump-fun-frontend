import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TradePanel } from './TradePanel';
import { cn } from '@/lib/utils';
import type { Token } from '@/types';

interface MobileTradeSheetProps {
  token: Token;
}

/**
 * On mobile (lg-and-below) the TradePanel becomes a slide-up bottom sheet
 * triggered by a sticky CTA at the bottom of the screen. On lg+ the desktop
 * sticky-right-rail variant is used instead and this component renders nothing.
 */
export function MobileTradeSheet({ token }: MobileTradeSheetProps): JSX.Element {
  const [open, setOpen] = useState(false);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* Sticky CTA at the bottom of the viewport */}
      <div className="fixed inset-x-0 bottom-0 z-30 glass border-t border-border px-4 py-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setOpen(true)}
          disabled={token.isGraduated}
        >
          {token.isGraduated ? 'Graduated · trade on Jupiter' : `Trade ${token.symbol}`}
        </Button>
      </div>

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-0 z-40 lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <button
          aria-label="Close trade sheet"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0',
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface shadow-glow',
            'transition-transform duration-300 ease-out motion-reduce:transition-none',
            open ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{token.name}</p>
              <p className="text-xs font-mono text-text-muted">${token.symbol}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-3">
            <TradePanel token={token} />
          </div>
          <div className="h-4" />
        </div>
      </div>
      {/* Spacer so page content isn't hidden under the sticky CTA on mobile */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
