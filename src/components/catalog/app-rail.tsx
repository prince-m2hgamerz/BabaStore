"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppTile } from "@/components/catalog/app-tile";
import type { CatalogApp } from "@/lib/catalog/types";

type RailProps = {
  apps: CatalogApp[];
  size?: "sm" | "md" | "lg";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
};

export function AppRail({ apps, size = "md", eyebrow, title, subtitle, href }: RailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [apps.length]);

  function scrollBy(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  }

  if (!apps.length) return null;

  return (
    <section className="page-shell pt-6 sm:pt-12">
      <div className="mb-2.5 flex items-end justify-between gap-3 sm:mb-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500 sm:block">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="truncate text-[17px] font-semibold tracking-[-0.4px] text-neutral-950 sm:mt-1 sm:text-[22px] sm:tracking-[-0.6px]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 hidden text-[13px] text-neutral-500 sm:block">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {href ? (
            <Link
              href={href}
              className="text-[12px] font-medium text-neutral-600 transition hover:text-neutral-950 sm:text-[13px]"
            >
              View all
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canLeft}
            className="hidden size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40 sm:inline-flex"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canRight}
            className="hidden size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-40 sm:inline-flex"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="-mx-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2 scrollbar-none sm:mx-0 sm:gap-4 sm:px-0"
      >
        {apps.map((app) => (
          <div key={app.id} className="snap-start">
            <AppTile app={app} size={size} />
          </div>
        ))}
        <div className="w-2 shrink-0 sm:hidden" aria-hidden />
      </div>
    </section>
  );
}
