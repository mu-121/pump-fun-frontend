import { memo } from "react";
import { Link } from "react-router-dom";
import { bondingProgress, formatMarketCap } from "@/lib/format";
import { curveReserves } from "@/lib/curve";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";

interface CompactTokenCardProps {
  token: Token;
  rank: number;
  className?: string;
}

/** Small ranked card for horizontal “graduating” strip. */
export const CompactTokenCard = memo(function CompactTokenCard({
  token,
  rank,
  className,
}: CompactTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || "?").slice(0, 1).toUpperCase();
  const progress = bondingProgress(curveReserves(token).solLamports);
  const pct = Math.round(progress * 100);

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        "group relative overflow-hidden flex h-[58px] w-[228px] items-center gap-3 rounded-[12px] border border-[#27272A] bg-[#18181B] px-3 transition-colors hover:border-pink-400/40 font-['Inter']",
        className,
      )}
    >
      {/* Hover glow overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(120%_60%_at_0%_0%,rgba(244,114,182,0.16),transparent_60%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <span className="text-[11px] font-medium text-[#71717A] transition-colors group-hover:text-pink-400 w-3 text-center shrink-0 relative z-10">
        {rank}
      </span>

      <div className="relative shrink-0 z-10">
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt=""
            className="h-[34px] w-[34px] rounded-full object-cover"
          />
        ) : (
          <div className="h-[34px] w-[34px] rounded-full bg-surface-elevated grid place-items-center text-xs font-bold text-text-muted">
            {initial}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 inline-flex size-3.5 items-center justify-center rounded-full border border-bg-primary bg-pink-500/95 shadow-[0_0_0_1px_rgba(244,114,182,0.45),0_4px_10px_-4px_rgba(244,114,182,0.85)]">
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            className="text-white"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center min-w-0">
        <p className="text-[13px] font-semibold text-[#FAFAFA] truncate leading-tight">
          {token.symbol?.startsWith("$") ? token.symbol : `$${token.symbol}`}
        </p>
        <p className="text-[11px] text-[#A1A1AA] truncate leading-tight mt-[1px]">
          {token.name}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-end justify-center shrink-0 ml-2">
        <p className="text-[13px] font-semibold text-[#FAFAFA] leading-tight">
          {(() => {
            const value = formatMarketCap(token.marketCapUsd);
            return value?.startsWith("$") ? value : `$${value}`;
          })()}
        </p>
        <p
          className={cn(
            "inline-flex items-center gap-[2px] text-[11px] leading-tight mt-[1px] tabular-nums",
            pct > 0 ? "text-[#5FE992]" : "text-[#ED7878]",
          )}
        >
          <svg
            aria-hidden="true"
            width="10px"
            height="10px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={pct > 0 ? "rotate-0" : "rotate-180"}
          >
            <path
              d="M6 10L12 4L18 10M12 5V20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {pct}%
        </p>
      </div>
    </Link>
  );
});
