import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { TopNav } from "@/components/layout/top-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="has-bottom-nav min-h-screen bg-canvas-soft">
      <TopNav />
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-level-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-canvas-soft">
            <SearchX className="size-5 text-neutral-500" />
          </div>
          <h1 className="display-tight mt-4 text-[22px] font-semibold tracking-[-0.4px] text-neutral-950 sm:text-[26px]">
            Page not found
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-neutral-500">
            That route doesn&apos;t exist. Try the store or search for an app.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full">
              <Link href="/">
                <ArrowLeft />
                Back to store
              </Link>
            </Button>
            <Button variant="secondary" asChild className="rounded-full">
              <Link href="/?q=">Search apps</Link>
            </Button>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
