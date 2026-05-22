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
  const resolvedSrc = src?.trim() || fallbackSrc?.trim() || null;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-neutral-200 text-white shadow-glass",
        className
      )}
      style={{ background: accent }}
    >
      {resolvedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolvedSrc}
          alt={`${name} icon`}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span className={cn("font-semibold", resolvedSrc ? "sr-only" : "")}>
        {name.slice(0, 1)}
      </span>
    </div>
  );
}
