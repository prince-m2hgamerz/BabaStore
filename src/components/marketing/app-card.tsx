import Link from "next/link";
import { Download, Star } from "lucide-react";
import { AppIcon } from "@/components/catalog/app-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { appMetrics } from "@/lib/catalog/catalog";
import type { CatalogApp } from "@/lib/catalog/types";

export function AppCard({ app, compact = false }: { app: CatalogApp; compact?: boolean }) {
  const metrics = appMetrics(app);

  return (
    <Link href={`/apps/${app.slug}`} className="block h-full">
      <Card className="glass-hover h-full p-4">
        <div className="flex items-start gap-3">
          <AppIcon
            name={app.name}
            accent={app.accent}
            src={app.iconUrl}
            className="size-14 text-lg"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-neutral-950">{app.name}</h3>
            <p className="mt-1 text-xs text-neutral-500">{app.category}</p>
            {!compact ? (
              <p className="mt-3 line-clamp-2 text-sm leading-5 text-neutral-600">
                {app.summary ?? app.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <Star className="mr-1 size-3 fill-amber-400 text-amber-400" />
                {metrics.rating}
              </Badge>
              <span className="text-xs text-neutral-500">{metrics.size}</span>
              <span className="text-xs text-neutral-500">{metrics.downloads} downloads</span>
            </div>
          </div>
          <Download className="size-4 text-neutral-400" />
        </div>
      </Card>
    </Link>
  );
}
