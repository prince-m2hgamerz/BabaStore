"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Download, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { appMetrics } from "@/lib/catalog/format";
import type { CatalogApp } from "@/lib/catalog/types";

/**
 * Hero spotlight carousel.
 *
 * Mobile: single coloured panel, icon + name + meta + Install pill stacked
 * vertically inside the panel — no second body section, so the hero stays
 * around 220px tall instead of 380px.
 *
 * Desktop: splash panel on the left with a body panel on the right.
 */
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

  // Pick a random app different from the current one — used for auto-rotation only.
  // User-controlled prev/next stay sequential.
  const pickRandom = useCallback(() => {
    if (len <= 1) return;
    setCurrent((c) => {
      if (len === 2) return (c + 1) % 2;
      let pick = c;
      while (pick === c) {
        pick = Math.floor(Math.random() * len);
      }
      return pick;
    });
  }, [len]);

  useEffect(() => {
    if (isPaused || len <= 1) return;
    timerRef.current = setInterval(pickRandom, 2500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, len, pickRandom]);

  if (!len) return null;

  const app = apps[current]!;
  const metrics = appMetrics(app);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-level-2 sm:rounded-2xl sm:shadow-level-3"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Link
        href={`/apps/${app.slug}`}
        className="group block transition-transform duration-200 active:scale-[0.995]"
      >
        {/* Mobile: single colored panel */}
        <div
          className="relative overflow-hidden p-5 sm:hidden"
          style={{ background: app.accent }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.32),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.25))]" />

          <div className="relative flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/85">
              Editor&apos;s pick
            </p>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {app.category}
            </span>
          </div>

          <div className="relative mt-5 flex items-end gap-3.5">
            <AppIcon
              name={app.name}
              accent={app.accent}
              src={app.iconUrl}
              lazy={false}
              className="size-[76px] ring-2 ring-white/30"
            />
            <div className="min-w-0 flex-1 pb-1 text-white">
              <h2 className="line-clamp-2 text-[20px] font-semibold leading-tight tracking-[-0.4px]">
                {app.name}
              </h2>
              <p className="mt-1 truncate text-[12px] text-white/80">{app.developer}</p>
            </div>
          </div>

          <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/85">
            <span className="flex items-center gap-0.5">
              <Star className="size-3 fill-amber-300 text-amber-300" />
              <span className="font-medium tabular-nums">{metrics.rating}</span>
            </span>
            <span className="opacity-50">·</span>
            <span className="flex items-center gap-0.5">
              <Download className="size-3" />
              {metrics.downloads}
            </span>
            <span className="opacity-50">·</span>
            <span>{metrics.size}</span>
          </div>

          <p className="relative mt-2.5 line-clamp-2 text-[13px] leading-5 text-white/90">
            {app.summary ?? app.description}
          </p>

          <div className="relative mt-4 flex items-center gap-3">
            <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[13px] font-semibold text-neutral-950 shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
              <Download className="size-4" />
              Install
            </span>
            <span className="text-[12px] font-medium text-white/90">
              More info
              <ChevronRight className="ml-0.5 inline size-3.5" />
            </span>
          </div>
        </div>

        {/* Desktop: splash + body */}
        <div className="hidden sm:flex">
          <div
            className="relative flex min-h-[280px] w-[360px] items-end overflow-hidden p-8"
            style={{ background: app.accent }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.32),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.22))]" />
            <div className="relative flex items-end gap-5">
              <AppIcon
                name={app.name}
                accent={app.accent}
                src={app.iconUrl}
                className="size-28 ring-2 ring-white/30"
              />
              <div className="text-white">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">
                  Editor&apos;s pick
                </p>
                <h2 className="mt-1 text-[30px] font-semibold tracking-[-0.8px]">
                  {app.name}
                </h2>
                <p className="mt-0.5 text-[15px] text-white/80">{app.developer}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 p-8">
            <p className="line-clamp-3 text-[15px] leading-7 text-neutral-600">
              {app.summary ?? app.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium text-neutral-900 tabular-nums">{metrics.rating}</span>
              </span>
              <span className="flex items-center gap-1">
                <Download className="size-3.5" />
                {metrics.downloads}
              </span>
              <span className="text-neutral-300">·</span>
              <span>{metrics.size}</span>
              <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-400">
                {app.category}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-950 px-5 text-[13px] font-medium text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.18)] transition group-hover:bg-neutral-800">
                <Download className="size-4" />
                Install
              </span>
              <span className="text-[13px] font-medium text-neutral-600 transition group-hover:text-neutral-950">
                More info
                <ChevronRight className="ml-0.5 inline size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>

      {len > 1 ? (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 p-1.5 text-neutral-700 shadow-level-2 backdrop-blur-sm transition hover:bg-white hover:text-neutral-950 sm:block"
            aria-label="Previous featured app"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full border border-neutral-200 bg-white/90 p-1.5 text-neutral-700 shadow-level-2 backdrop-blur-sm transition hover:bg-white hover:text-neutral-950 sm:block"
            aria-label="Next featured app"
          >
            <ChevronRight className="size-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-4 sm:gap-1.5">
            {apps.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 bg-white sm:bg-neutral-950"
                    : "w-1 bg-white/50 hover:bg-white/80 sm:bg-neutral-300 sm:hover:bg-neutral-400"
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
