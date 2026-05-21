import type { AppStatus } from "@/lib/supabase/types";
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: AppStatus }) {
  const variant =
    status === "published" ? "success" : status === "draft" ? "secondary" : "warning";

  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}
