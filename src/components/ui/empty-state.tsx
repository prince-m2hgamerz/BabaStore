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
        "grid min-h-48 place-items-center rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center",
        className
      )}
    >
      <div className="max-w-sm">
        <Icon className="mx-auto size-8 text-neutral-400" />
        <h3 className="mt-4 text-base font-semibold text-neutral-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}
