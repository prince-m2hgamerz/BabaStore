import Link from "next/link";
import { Star } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

function parseAccentColor(accent: string) {
  const match = accent.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : "#171717";
}

/**
 * Catalog grid card.
 *
 * Mobile: icon-on-top vertical card (works at 165px wide in a 2-col grid).
 * Desktop: icon-left horizontal card with summary line.
 */
export function AppCard({ app, compact = false }: { app: CatalogApp; compact?: boolean }) {
  const metrics = appMetrics(app);
  const accentColor = parseAccentColor(app.accent);
  const hasRating = app.rating !== null;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30"
    >
      <div className="relative h-full rounded-lg border border-neutral-200 bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-level-3 active:scale-[0.99]">
        <div
          className="absolute left-0 top-3 hidden h-[calc(100%-24px)] w-[2px] rounded-r-sm opacity-0 transition-opacity group-hover:opacity-100 sm:block"
          style={{ background: accentColor }}
          aria-hidden
        />

        {/* Mobile: vertical (icon on top) */}
        <div className="flex flex-col p-3 sm:hidden">
          <AppIcon
            name={app.name}
            accent={app.accent}
            src={app.iconUrl}
            fallbackSrc={app.source === "catalog" ? `/api/catalog/assets/icon/${app.slug}` : null}
            className="size-[72px] text-xl"
          />
          <h3 className="mt-2.5 line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-tight tracking-[-0.2px] text-neutral-950">
            {app.name}
          </h3>
          <p className="mt-1 truncate text-[11px] text-neutral-500">
            {app.developer !== "BabaStore" ? app.developer : app.category}
          </p>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-600">
            {hasRating ? (
              <>
                <span className="font-medium tabular-nums">{metrics.rating}</span>
                <Star className="size-2.5 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-neutral-300">·</span>
                <span className="text-neutral-500">{metrics.size}</span>
              </>
            ) : (
              <>
                <span className="text-neutral-400">New</span>
                <span className="text-neutral-300">·</span>
                <span className="text-neutral-500">{metrics.size}</span>
              </>
            )}
          </div>
        </div>

        {/* Desktop: horizontal (icon-left) */}
        <div className="hidden items-start gap-4 p-4 sm:flex">
          <AppIcon
            name={app.name}
            accent={app.accent}
            src={app.iconUrl}
            fallbackSrc={app.source === "catalog" ? `/api/catalog/assets/icon/${app.slug}` : null}
            className="size-16 shrink-0 text-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold leading-tight tracking-[-0.3px] text-neutral-950">
                  {app.name}
                </h3>
                <p className="mt-0.5 truncate text-[13px] text-neutral-500">
                  {app.developer !== "BabaStore" ? app.developer : app.category}
                </p>
              </div>
              {hasRating ? (
                <div className="flex shrink-0 items-center gap-1 rounded-md border border-neutral-200 bg-canvas-soft px-1.5 py-0.5">
                  <Star className="size-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-medium text-neutral-700 tabular-nums">
                    {metrics.rating}
                  </span>
                </div>
              ) : null}
            </div>

            {!compact ? (
              <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-neutral-600">
                {app.summary ?? app.description}
              </p>
            ) : (
              <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-neutral-600">
                {app.summary ?? app.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.04em] text-neutral-400">
              <span>{metrics.downloads}</span>
              <span aria-hidden="true" className="text-neutral-300">
                ·
              </span>
              <span>{metrics.size}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
