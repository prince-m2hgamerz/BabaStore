"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScreenshotCarousel({
  appName,
  screenshots
}: {
  appName: string;
  screenshots: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeScreenshots = useMemo(() => screenshots, [screenshots]);

  if (!safeScreenshots.length) {
    return (
      <div className="min-w-0 rounded-lg border border-neutral-200 bg-white p-4 shadow-float sm:p-8">
        <div className="grid aspect-[4/3] place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-center sm:aspect-[16/9]">
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

  const active = safeScreenshots[activeIndex];

  function previous() {
    setActiveIndex((index) =>
      index === 0 ? safeScreenshots.length - 1 : index - 1
    );
  }

  function next() {
    setActiveIndex((index) =>
      index === safeScreenshots.length - 1 ? 0 : index + 1
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-neutral-200 bg-white p-2 shadow-float sm:p-3">
      <div className="relative grid aspect-[10/13] max-h-[60vh] min-h-56 place-items-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 sm:aspect-[16/9] sm:max-h-[420px] sm:min-h-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={`${appName} screenshot ${activeIndex + 1}`}
          loading="eager"
          decoding="async"
          className="h-full max-h-[60vh] w-full max-w-full object-contain sm:max-h-[420px]"
        />
        {safeScreenshots.length > 1 ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-1 top-1/2 size-8 -translate-y-1/2 opacity-80 sm:left-3 sm:size-10 sm:opacity-100"
              onClick={previous}
              aria-label="Previous screenshot"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-1 top-1/2 size-8 -translate-y-1/2 opacity-80 sm:right-3 sm:size-10 sm:opacity-100"
              onClick={next}
              aria-label="Next screenshot"
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}
      </div>
      <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto pb-1 sm:mt-3 sm:gap-2">
        {safeScreenshots.map((screenshot, index) => (
          <button
            key={`${screenshot}-${index}`}
            type="button"
            className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shadow-glass outline-none transition focus:ring-2 focus:ring-blue-500/20 data-[active=true]:border-neutral-950 sm:h-16 sm:w-24"
            data-active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show screenshot ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshot}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
