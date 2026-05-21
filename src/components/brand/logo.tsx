import Link from "next/link";
import { Boxes } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <span className="flex size-9 items-center justify-center rounded-md border border-neutral-200 bg-white shadow-glass">
        <Boxes className="size-4 text-neutral-950" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-neutral-950">
          {siteConfig.shortName}
        </span>
        <span className="block text-xs text-neutral-500">Android marketplace</span>
      </span>
    </Link>
  );
}
