import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { copyToClipboard, formatAddress } from '@/lib/format';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';

interface AddressDisplayProps {
  address: string;
  head?: number;
  tail?: number;
  withSolscan?: boolean;
  /** What Solscan path to link to. Defaults to /account. */
  solscanPath?: 'account' | 'token' | 'tx';
  className?: string;
}

/**
 * Truncated mono address with a one-tap copy button and an optional Solscan link.
 * Use this anywhere we display a Solana address in the UI.
 */
export function AddressDisplay({
  address,
  head = 4,
  tail = 4,
  withSolscan = true,
  solscanPath = 'account',
  className,
}: AddressDisplayProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const solscanCluster = env.solanaNetwork === 'mainnet-beta' ? '' : `?cluster=${env.solanaNetwork}`;
  const solscanUrl = `https://solscan.io/${solscanPath}/${address}${solscanCluster}`;
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs text-text-muted', className)}>
      <button
        type="button"
        title="Copy address"
        onClick={async (e) => {
          e.stopPropagation();
          e.preventDefault();
          const ok = await copyToClipboard(address);
          if (ok) {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }
        }}
        className="inline-flex items-center gap-1 hover:text-text-primary transition-colors"
      >
        <span>{formatAddress(address, head, tail)}</span>
        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
      </button>
      {withSolscan ? (
        <a
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Solscan"
          onClick={(e) => e.stopPropagation()}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </span>
  );
}
