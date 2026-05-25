"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Long-form description with a fade-out and "Show more" affordance,
 * mirroring the common store-detail pattern.
 */
export function AboutApp({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!description) {
    return (
      <p className="text-sm leading-7 text-neutral-500">
        No description provided.
      </p>
    );
  }
  return (
    <div className="relative">
      <div
        className={
          expanded
            ? "whitespace-pre-wrap break-words text-[14px] leading-7 text-neutral-700 sm:text-[15px]"
            : "relative max-h-[260px] overflow-hidden whitespace-pre-wrap break-words text-[14px] leading-7 text-neutral-700 sm:text-[15px]"
        }
      >
        {description}
        {!expanded ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-neutral-700 underline-offset-4 hover:underline"
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="size-3.5" />
          </>
        ) : (
          <>
            Show more <ChevronDown className="size-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
