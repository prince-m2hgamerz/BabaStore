import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function InstallButton({
  slug,
  size = "lg",
  className,
  label = "Install"
}: {
  slug: string;
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
}) {
  return (
    <Button size={size} asChild className={cn("rounded-full px-6", className)}>
      <Link href={`/api/download/${slug}`} prefetch={false}>
        <Download />
        {label}
      </Link>
    </Button>
  );
}
