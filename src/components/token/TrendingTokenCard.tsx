import { memo } from "react";
import { Link } from "react-router-dom";
import { formatMarketCap } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";

interface TrendingTokenCardProps {
  token: Token;
  className?: string;
}

/** Wide feature card for the trending carousel. */
export const TrendingTokenCard = memo(function TrendingTokenCard({
  token,
  className,
}: TrendingTokenCardProps): JSX.Element {
  const initial = (token.symbol || token.name || "?").slice(0, 1).toUpperCase();

  return (
    <Link
      to={`/token/${token.mintAddress}`}
      className={cn(
        "shrink-0 w-[240px] sm:w-[264px] snap-start group",
        "flex flex-col gap-y-2",
        className,
      )}
    >
      <div className="relative flex aspect-[3/2] w-full cursor-pointer overflow-hidden rounded-[12px] transition-transform group-hover:scale-[1.025]">
        {token.imageUrl ? (
          <img
            src={token.imageUrl}
            alt={token.name}
            loading="lazy"
            className="aspect-square h-full w-full rounded-md object-cover"
          />
        ) : (
          <div className="aspect-square h-full w-full rounded-md bg-gradient-to-br from-primary/20 to-surface grid place-items-center text-5xl font-bold text-text-muted">
            {initial}
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.08)_30%,rgba(0,0,0,0.4)_60%,rgba(0,0,0,0.85)_100%)] px-3 pb-3 pt-12">
          <div className="flex items-center justify-between gap-x-3">
            <div className="inline-block rounded-sm transform-gpu text-foreground will-change-[background-color] font-bold text-[18px] text-[#FAFAFA]">
              {(() => {
                const value = formatMarketCap(token.marketCapUsd);
                return value?.startsWith("$") ? value : `$${value}`;
              })()}
            </div>
          </div>
          <div className="flex items-end gap-x-1.5">
            <p className="truncate font-medium text-[16px] text-[#FAFAFA]">
              {token.name || "Unnamed"}
            </p>
            <p className="mb-px truncate text-[14px] font-base text-[#FAFAFA]">
              {token.symbol}
            </p>
          </div>
        </div>
      </div>
      {token.description ? (
        <p className="w-full line-clamp-2 text-[14px] text-[#A1A1AA] text-left">
          {token.description
            ? token.description.charAt(0).toUpperCase() +
              token.description.slice(1)
            : ""}
        </p>
      ) : null}
    </Link>
  );
});
