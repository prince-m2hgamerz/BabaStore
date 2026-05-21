import Link from "next/link";
import { Search, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/60 backdrop-blur-xl">
      <div className="page-shell flex h-16 items-center gap-4">
        <Logo />
        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <Input
            className="h-10 pl-9"
            placeholder="Search Android apps, games, tools..."
            aria-label="Search apps"
          />
        </div>
        <nav className="ml-auto flex items-center gap-2">
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

