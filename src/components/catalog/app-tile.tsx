import Link from "next/link";
import { Star } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

/**
 * Compact icon-first tile, used inside horizontal rails.
 * Mobile sizes are intentionally small so multiple tiles peek at the right
 * edge of the viewport (a common touch-scroll affordance).
 */
export function AppTile({
  app,
  size = "md"
}: {
  app: CatalogApp;
  size?: "sm" | "md" | "lg";
}) {
  const metrics = appMetrics(app);
  const widthClass =
    size === "lg"
      ? "w-[120px] sm:w-[160px]"
      : size === "sm"
        ? "w-[88px] sm:w-[112px]"
        : "w-[100px] sm:w-[140px]";
  const iconClass =
    size === "lg"
      ? "size-[96px] sm:size-[140px]"
      : size === "sm"
        ? "size-[72px] sm:size-[96px]"
        : "size-[84px] sm:size-[124px]";

  return (
    <Link
      href={`/apps/${app.slug}`}
      className={`group block ${widthClass} shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 rounded-xl`}
    >
      <AppIcon
        name={app.name}
        accent={app.accent}
        src={app.iconUrl}
        fallbackSrc={app.source === "catalog" ? `/api/catalog/assets/icon/${app.slug}` : null}
        className={`${iconClass} text-2xl transition-transform duration-200 group-hover:scale-[1.02]`}
      />
      <p className="mt-2 truncate text-[12px] font-medium leading-tight text-neutral-950 sm:mt-2.5 sm:text-[14px]">
        {app.name}
      </p>
      <p className="truncate text-[11px] text-neutral-500 sm:text-[12px]">
        {app.developer !== "BabaStore" ? app.developer : app.category}
      </p>
      <div className="mt-0.5 flex items-center gap-0.5 text-[11px] text-neutral-600 sm:mt-1 sm:gap-1 sm:text-[12px]">
        {app.rating !== null ? (
          <>
            <span className="font-medium tabular-nums">{metrics.rating}</span>
            <Star className="size-2.5 fill-amber-400 text-amber-400" />
          </>
        ) : (
          <span className="text-neutral-400">New</span>
        )}
      </div>
    </Link>
  );
}
