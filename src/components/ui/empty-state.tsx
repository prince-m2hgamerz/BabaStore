import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-48 place-items-center rounded-xl border border-dashed border-neutral-200 bg-canvas-soft p-6 text-center sm:p-10",
        className
      )}
    >
      <div className="max-w-sm">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-white shadow-level-1">
          <Icon className="size-5 text-neutral-500" />
        </div>
        <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.3px] text-neutral-950 sm:text-[17px]">
          {title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-6 text-neutral-500 sm:text-[14px]">
          {description}
        </p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
