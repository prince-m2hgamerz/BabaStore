"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AppIcon({
  name,
  accent,
  src,
  fallbackSrc,
  className,
  lazy = true
}: {
  name: string;
  accent: string;
  src?: string | null;
  fallbackSrc?: string | null;
  className?: string;
  lazy?: boolean;
}) {
  const [errored, setErrored] = useState(false);
  const resolvedSrc =
    !errored && (src?.trim() || fallbackSrc?.trim()) || null;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 text-white shadow-glass",
        className
      )}
      style={{ background: accent }}
    >
      {resolvedSrc ? (
        <Image
          src={resolvedSrc}
          alt={`${name} icon`}
          fill
          sizes="96px"
          loading={lazy ? "lazy" : "eager"}
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : null}
      <span className={cn("font-semibold", resolvedSrc ? "sr-only" : "")}>
        {name.slice(0, 1)}
      </span>
    </div>
  );
}
