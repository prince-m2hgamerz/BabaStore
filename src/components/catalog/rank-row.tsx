import Link from "next/link";
import { Star } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

/**
 * Ranked row used inside Top Charts.
 * Mobile: tight padding, no trailing chevron, smaller icon.
 */
export function RankRow({ app, rank }: { app: CatalogApp; rank: number }) {
  const metrics = appMetrics(app);
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-2 transition hover:bg-neutral-50 active:bg-neutral-100 sm:gap-4 sm:p-2.5"
    >
      <span className="w-5 shrink-0 text-center font-mono text-[14px] font-medium tabular-nums text-neutral-400 sm:w-6 sm:text-right sm:text-[16px]">
        {rank}
      </span>
      <AppIcon
        name={app.name}
        accent={app.accent}
        src={app.iconUrl}
        className="size-12 sm:size-[60px]"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight text-neutral-950 sm:text-[15px]">
          {app.name}
        </p>
        <p className="truncate text-[11px] leading-tight text-neutral-500 sm:text-[13px]">
          {app.category}
        </p>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500 sm:text-[12px]">
          {app.rating !== null ? (
            <>
              <span className="font-medium text-neutral-700 tabular-nums">
                {metrics.rating}
              </span>
              <Star className="size-2.5 fill-amber-400 text-amber-400 sm:size-3" />
            </>
          ) : (
            <span className="text-neutral-400">No ratings</span>
          )}
        </div>
      </div>
    </Link>
  );
}
