import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: -1 | 1): void => {
    ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative group', className)}>
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-border bg-surface/90 text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:grid place-items-center hover:bg-surface-elevated"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scroll-smooth snap-x snap-mandatory"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full border border-border bg-surface/90 text-text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden sm:grid place-items-center hover:bg-surface-elevated"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
