import { Download, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type AppCardData = {
  name: string;
  category: string;
  rating: string;
  size: string;
  accent: string;
};

export function AppCard({ app }: { app: AppCardData }) {
  return (
    <Card className="glass-hover p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg font-semibold text-white"
          style={{ background: app.accent }}
        >
          {app.name.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">{app.name}</h3>
          <p className="mt-1 text-xs text-white/50">{app.category}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              <Star className="mr-1 size-3 fill-amber-300 text-amber-300" />
              {app.rating}
            </Badge>
            <span className="text-xs text-white/45">{app.size}</span>
          </div>
        </div>
        <Download className="size-4 text-white/40" />
      </div>
    </Card>
  );
}

