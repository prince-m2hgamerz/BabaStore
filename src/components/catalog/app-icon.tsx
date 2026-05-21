import { cn } from "@/lib/utils";

export function AppIcon({
  name,
  accent,
  src,
  className
}: {
  name: string;
  accent: string;
  src?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-center bg-cover text-white shadow-glass",
        className
      )}
      style={src ? { backgroundImage: `url("${src}")` } : { background: accent }}
    >
      {src ? (
        <span className="sr-only">{name}</span>
      ) : (
        <span className="font-semibold">{name.slice(0, 1)}</span>
      )}
    </div>
  );
}
