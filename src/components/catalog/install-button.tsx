import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallButton({ slug }: { slug: string }) {
  return (
    <Button size="lg" asChild>
      <Link href={`/api/download/${slug}`} prefetch={false}>
        <Download />
        Install APK
      </Link>
    </Button>
  );
}

