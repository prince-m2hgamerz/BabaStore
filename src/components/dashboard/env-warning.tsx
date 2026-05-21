import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EnvWarning() {
  return (
    <Card className="border-amber-300/20 bg-amber-300/10">
      <CardContent className="flex gap-3 p-4 text-sm text-amber-100">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <div>
          Supabase environment variables are not configured yet. Add values from{" "}
          <Link href="/docs/setup" className="font-medium underline underline-offset-4">
            setup docs
          </Link>{" "}
          to enable live auth and database access.
        </div>
      </CardContent>
    </Card>
  );
}

