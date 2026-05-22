import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <SearchX className="mx-auto size-9 text-neutral-400" />
            <h1 className="mt-4 text-2xl font-semibold text-neutral-950">
              Page not found
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              This route is not available in the current app build.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/">
                <ArrowLeft />
                Back to store
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
