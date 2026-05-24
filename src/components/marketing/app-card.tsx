import Link from "next/link";
import { Download, Star } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

function parseAccentColor(accent: string) {
  const match = accent.match(/#([0-9a-fA-F]{6})/);
  return match ? `#${match[1]}` : "#171717";
}

export function AppCard({ app, compact = false }: { app: CatalogApp; compact?: boolean }) {
  const metrics = appMetrics(app);
  const accentColor = parseAccentColor(app.accent);
  const hasRating = app.rating !== null;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[#28feaf]/40 rounded-md group"
    >
      <div className="relative h-full rounded-md bg-white transition-all duration-200 hover:shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(0,0,0,0.08)] active:scale-[0.97] shadow-[0px_1px_1px_rgba(0,0,0,0.03),0px_2px_2px_rgba(0,0,0,0.04),inset_0_0_0_1px_rgba(0,0,0,0.08)]">
        <div
          className="absolute left-0 top-2 h-[calc(100%-16px)] w-[3px] rounded-r-sm opacity-60 transition-opacity group-hover:opacity-100"
          style={{ background: accentColor }}
        />
        <div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
          <AppIcon
            name={app.name}
            accent={app.accent}
            src={app.iconUrl}
            fallbackSrc={app.source === "catalog" ? `/api/catalog/assets/icon/${app.slug}` : null}
            className="size-14 shrink-0 rounded-md text-lg sm:size-16 sm:text-xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold leading-tight text-[#171717] tracking-[-0.3px] sm:text-base">
                  {app.name}
                </h3>
                <p className="mt-0.5 truncate text-[13px] text-[#4d4d4d] sm:text-sm">
                  {app.developer !== "BabaStore" ? app.developer : app.category}
                </p>
              </div>
              {hasRating ? (
                <div className="flex shrink-0 items-center gap-1 rounded-md bg-[#ffefcf] px-1.5 py-0.5">
                  <Star className="size-2.5 fill-[#f5a623] text-[#f5a623]" />
                  <span className="text-[11px] font-medium text-[#ab570a]">{metrics.rating}</span>
                </div>
              ) : null}
            </div>

            {!compact ? (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[#4d4d4d] sm:mt-2 sm:text-sm sm:leading-5">
                {app.summary ?? app.description}
              </p>
            ) : (
              <p className="mt-1.5 hidden line-clamp-2 text-[13px] leading-[1.45] text-[#4d4d4d] sm:mt-2 sm:block sm:text-sm sm:leading-5">
                {app.summary ?? app.description}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2.5 text-[12px] text-[#888888] sm:mt-2.5 sm:text-[13px]">
              <span className="flex items-center gap-1">
                <Download className="size-3" />
                {metrics.downloads}
              </span>
              <span aria-hidden="true">·</span>
              <span>{metrics.size}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
