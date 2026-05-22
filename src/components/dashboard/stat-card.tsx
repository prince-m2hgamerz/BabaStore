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
    <Card className="glass-hover min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-600">{title}</CardTitle>
        <Icon className="size-4 shrink-0 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-semibold text-neutral-950">{value}</div>
        <p className="mt-1 text-xs leading-5 text-neutral-500">{helper}</p>
      </CardContent>
    </Card>
  );
}
