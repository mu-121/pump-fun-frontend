import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { shortAddress } from '@/lib/formatters';
import { copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AddressBadgeProps {
  address: string;
  head?: number;
  tail?: number;
  className?: string;
}

/** Truncated address with a one-tap copy button. */
export function AddressBadge({
  address,
  head = 4,
  tail = 4,
  className,
}: AddressBadgeProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(address);
        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }
      }}
      className={cn(
        'inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-primary transition-colors',
        className,
      )}
      title={address}
    >
      <span>{shortAddress(address, head, tail)}</span>
      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}
