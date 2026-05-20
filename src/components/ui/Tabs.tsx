import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
}
const Ctx = createContext<TabsCtx | undefined>(undefined);

function useTabsCtx(): TabsCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('Tabs.* must be used inside <Tabs>');
  return c;
}

interface TabsProps {
  /** Optional when `value` is provided (controlled mode). */
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps): JSX.Element {
  const [internal, setInternal] = useState(defaultValue ?? value ?? '');
  const v = value ?? internal;
  const setV = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <Ctx.Provider value={{ value: v, setValue: setV }}>
      <div className={className}>{children}</div>
    </Ctx.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps): JSX.Element {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps): JSX.Element {
  const { value: active, setValue } = useTabsCtx();
  const selected = value === active;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => setValue(value)}
      className={cn(
        'px-3 h-7 rounded-md text-xs font-medium transition-colors',
        selected
          ? 'bg-surface-elevated text-text-primary'
          : 'text-text-muted hover:text-text-primary',
      )}
    >
      {children}
    </button>
  );
}

interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps): JSX.Element | null {
  const { value: active } = useTabsCtx();
  if (value !== active) return null;
  return <div className={className}>{children}</div>;
}
