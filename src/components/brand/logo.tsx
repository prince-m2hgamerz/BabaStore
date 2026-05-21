import Link from "next/link";
import { Boxes } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <span className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 shadow-glow">
        <Boxes className="size-5 text-cyan-200" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">
          {siteConfig.shortName}
        </span>
        <span className="block text-xs text-white/50">Android marketplace</span>
      </span>
    </Link>
  );
}

