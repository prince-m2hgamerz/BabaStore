"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Horizontal, snap-scrolling screenshot rail with portrait/landscape support
 * and a tap-to-zoom lightbox on mobile and desktop.
 */
export function ScreenshotCarousel({
  appName,
  screenshots
}: {
  appName: string;
  screenshots: string[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = railRef.current;
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
  }, [screenshots.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? null : (i + 1) % screenshots.length));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + screenshots.length) % screenshots.length
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, screenshots.length]);

  if (!screenshots.length) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="grid aspect-[16/9] place-items-center rounded-md border border-dashed border-neutral-200 bg-canvas-soft text-center">
          <div>
            <ImageIcon className="mx-auto size-5 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-500">
              No screenshots uploaded yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function scrollBy(dir: 1 | -1) {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.round(el.clientWidth * 0.9),
      behavior: "smooth"
    });
  }

  return (
    <>
      <div className="relative">
        <div
          ref={railRef}
          className="-mx-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-3 pb-2 scrollbar-none sm:mx-0 sm:gap-3 sm:px-0"
        >
          {screenshots.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative h-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-neutral-200 bg-canvas-soft outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-950/30 sm:h-[360px]"
              style={{ aspectRatio: "auto" }}
              aria-label={`Open screenshot ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${appName} screenshot ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-auto max-w-none object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>
          ))}
          <div className="w-1 shrink-0 sm:hidden" aria-hidden />
        </div>

        {screenshots.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canLeft}
              aria-label="Scroll screenshots left"
              className="absolute -left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-level-2 backdrop-blur-sm transition hover:bg-neutral-50 disabled:opacity-40 sm:inline-flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canRight}
              aria-label="Scroll screenshots right"
              className="absolute -right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-level-2 backdrop-blur-sm transition hover:bg-neutral-50 disabled:opacity-40 sm:inline-flex"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxIndex(null)}
        >
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            className="absolute right-4 top-4 size-9 rounded-full"
            aria-label="Close screenshot"
          >
            <X />
          </Button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={screenshots[lightboxIndex]}
            alt={`${appName} screenshot ${lightboxIndex + 1}`}
            className="max-h-full max-w-full rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
          {screenshots.length > 1 ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (i) =>
                      i !== null
                        ? (i - 1 + screenshots.length) % screenshots.length
                        : 0
                  );
                }}
                className="absolute left-3 top-1/2 size-10 -translate-y-1/2 rounded-full sm:left-6"
                aria-label="Previous screenshot"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) =>
                    i !== null ? (i + 1) % screenshots.length : 0
                  );
                }}
                className="absolute right-3 top-1/2 size-10 -translate-y-1/2 rounded-full sm:right-6"
                aria-label="Next screenshot"
              >
                <ChevronRight />
              </Button>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
