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
      <div className="rounded-lg border border-neutral-200 bg-white p-8 shadow-float">
        <div className="grid aspect-[16/9] place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 text-center">
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
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-float">
      <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={`${appName} screenshot ${activeIndex + 1}`}
          className="h-full w-full object-contain"
        />
        {safeScreenshots.length > 1 ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              onClick={previous}
              aria-label="Previous screenshot"
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={next}
              aria-label="Next screenshot"
            >
              <ChevronRight />
            </Button>
          </>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {safeScreenshots.map((screenshot, index) => (
          <button
            key={`${screenshot}-${index}`}
            type="button"
            className="h-16 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 shadow-glass outline-none transition focus:ring-2 focus:ring-blue-500/20 data-[active=true]:border-neutral-950"
            data-active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show screenshot ${index + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshot}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
