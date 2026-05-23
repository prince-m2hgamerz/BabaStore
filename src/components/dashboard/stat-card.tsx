import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
      <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/30" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">{title}</CardTitle>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-bold tracking-tight text-neutral-950">{value}</div>
        <p className="mt-1 text-xs leading-5 text-neutral-400">{helper}</p>
      </CardContent>
    </Card>
  );
}
