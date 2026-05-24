"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Download, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

export function FeaturedCarousel({ apps }: { apps: CatalogApp[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const len = apps.length;

  const goTo = useCallback((i: number) => {
    setCurrent((i % len + len) % len);
  }, [len]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || len <= 1) return;
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, len, next]);

  if (!len) return null;

  const app = apps[current]!;
  const metrics = appMetrics(app);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-level-3 transition-shadow duration-300 hover:shadow-level-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link
        href={`/apps/${app.slug}`}
        className="group block active:scale-[0.99] transition-transform duration-150"
      >
        <div className="flex flex-col sm:flex-row">
          <div
            className="relative flex min-h-[180px] w-full items-end p-5 sm:min-h-[260px] sm:w-80 sm:p-8"
            style={{ background: app.accent }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
            <div className="relative flex items-end gap-4 sm:gap-5">
              <AppIcon
                name={app.name}
                accent={app.accent}
                src={app.iconUrl}
                className="size-16 border-2 border-white/30 shadow-lg sm:size-24"
              />
              <div className="text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70 sm:text-[11px]">
                  Featured App
                </p>
                <h2 className="text-xl font-bold leading-tight sm:text-3xl">
                  {app.name}
                </h2>
                <p className="mt-0.5 text-sm text-white/75 sm:text-base">
                  {app.developer}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 p-5 sm:gap-3 sm:p-8">
            <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600 sm:text-[15px]">
              {app.summary ?? app.description}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-neutral-800">{metrics.rating}</span>
              </span>
              <span className="flex items-center gap-1">
                <Download className="size-4" />
                {metrics.downloads}
              </span>
              <span className="hidden text-neutral-300 sm:inline">|</span>
              <span className="hidden sm:inline">{metrics.size}</span>
              <span className="ml-auto hidden text-xs text-neutral-400 sm:inline">{app.category}</span>
            </div>
            <div className="mt-1 flex items-center gap-4 sm:mt-2">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#28feaf] px-5 text-sm font-medium text-[#181818] transition group-hover:bg-[#22d699]">
                <Download className="size-4" />
                Install
              </span>
              <span className="text-sm font-medium text-blue-600 transition group-hover:underline">
                More info &rarr;
              </span>
            </div>
          </div>
        </div>
      </Link>

      {len > 1 ? (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-neutral-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-neutral-950 sm:block"
            aria-label="Previous featured app"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-neutral-700 shadow-lg backdrop-blur-sm transition hover:bg-white hover:text-neutral-950 sm:block"
            aria-label="Next featured app"
          >
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
            {apps.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); goTo(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-neutral-950"
                    : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Go to featured app ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
