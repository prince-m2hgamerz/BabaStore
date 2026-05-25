import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  helper,
  icon: Icon
}: {
  title: string;
  value: string;
  helper: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-level-2 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500">
          {title}
        </p>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-canvas-soft text-neutral-700">
          <Icon className="size-3.5" />
        </span>
      </div>
      <div className="mt-3 break-words text-[24px] font-semibold tracking-[-0.6px] tabular-nums text-neutral-950 sm:text-[28px]">
        {value}
      </div>
      <p className="mt-1 text-[12px] leading-5 text-neutral-500">{helper}</p>
    </div>
  );
}
