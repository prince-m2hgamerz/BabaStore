import { cn } from "@/lib/utils";

export function AppIcon({
  name,
  accent,
  className
}: {
  name: string;
  accent: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-neutral-200 text-white shadow-glass",
        className
      )}
      style={{ background: accent }}
    >
      <span className="font-semibold">{name.slice(0, 1)}</span>
    </div>
  );
}

