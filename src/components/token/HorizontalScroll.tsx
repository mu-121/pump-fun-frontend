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
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
      >
        {children}
      </div>
    </div>
  );
}
