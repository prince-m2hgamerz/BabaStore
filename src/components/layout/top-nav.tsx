import Link from "next/link";
import { Grid2X2, Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Store
          </Link>
          <Link
            href="/?tab=categories"
            className="rounded-full px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Categories
          </Link>
          <Link
            href="/developer"
            className="rounded-full px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Developers
          </Link>
        </nav>
        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className="h-10 pl-9"
            placeholder="Search Android apps, games, tools..."
            aria-label="Search apps"
          />
        </div>
        <nav className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="icon" asChild className="md:hidden">
            <Link href="/?focus=search" aria-label="Browse apps">
              <Grid2X2 />
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              <UploadCloud />
              Developer
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
