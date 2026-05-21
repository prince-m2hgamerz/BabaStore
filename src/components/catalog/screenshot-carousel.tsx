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
  const safeScreenshots = useMemo(
    () => (screenshots.length ? screenshots : ["linear-gradient(135deg, #fafafa, #ebebeb)"]),
    [screenshots]
  );

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
      <div
        className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-md border border-neutral-200"
        style={{ background: active }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.38),transparent_30%)]" />
        <div className="relative rounded-md border border-white/20 bg-white/75 px-4 py-3 text-center shadow-glass backdrop-blur-sm">
          <ImageIcon className="mx-auto size-5 text-neutral-500" />
          <p className="mt-2 text-sm font-medium text-neutral-950">
            {appName} screenshot {activeIndex + 1}
          </p>
        </div>
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
            className="h-16 w-24 shrink-0 rounded-md border border-neutral-200 shadow-glass outline-none transition focus:ring-2 focus:ring-blue-500/20 data-[active=true]:border-neutral-950"
            style={{ background: screenshot }}
            data-active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show screenshot ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

