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
  lazy = true,
  shape = "squircle"
}: {
  name: string;
  accent: string;
  src?: string | null;
  fallbackSrc?: string | null;
  className?: string;
  lazy?: boolean;
  shape?: "squircle" | "rounded";
}) {
  const [errored, setErrored] = useState(false);
  const resolvedSrc =
    !errored && (src?.trim() || fallbackSrc?.trim()) || null;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden text-white ring-1 ring-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        shape === "squircle" ? "squircle" : "rounded-md",
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
