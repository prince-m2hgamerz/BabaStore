import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-3", className)}>
      <Image
        src="/logo.svg"
        alt={siteConfig.name}
        width={126}
        height={36}
        className="h-9 w-auto"
        priority
      />
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/favicon.svg"
      alt={siteConfig.name}
      width={36}
      height={36}
      className={cn("size-9", className)}
      priority
    />
  );
}
