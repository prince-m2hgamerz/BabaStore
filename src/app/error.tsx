"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="mx-auto size-9 text-amber-500" />
          <h1 className="mt-4 text-2xl font-semibold text-neutral-950">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            The page failed to load. Try again without losing your session.
          </p>
          <Button className="mt-5" onClick={() => reset()}>
            <RefreshCw />
            Retry
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
