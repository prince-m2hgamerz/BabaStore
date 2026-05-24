import Link from "next/link";
import { LayoutDashboard, Search, UploadCloud, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/logo";
import { getCurrentProfile } from "@/lib/auth/guards";

export async function TopNav({ searchQuery = "" }: { searchQuery?: string }) {
  const { profile } = await getCurrentProfile();
  const signedIn = Boolean(profile);

  const dashLink = profile
    ? profile.role === "admin"
      ? "/admin"
      : profile.role === "developer"
        ? "/developer"
        : "/dashboard"
    : null;

  const dashLabel = profile
    ? profile.role === "admin"
      ? "Admin"
      : profile.role === "developer"
        ? "Developer"
        : "Dashboard"
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="page-shell grid gap-2 py-2 sm:gap-3 sm:py-3">
        <div className="flex min-h-11 min-w-0 items-center gap-2 sm:gap-3">
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
          <form action="/" method="get" className="relative hidden flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              name="q"
              defaultValue={searchQuery}
              className="h-10 pl-9 pr-24"
              placeholder="Search Android apps, games, tools..."
              aria-label="Search apps"
              enterKeyHint="search"
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1 h-8">
              Search
            </Button>
          </form>
          <nav className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
            {signedIn && dashLink ? (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href={dashLink}>
                    <LayoutDashboard className="size-4" />
                    {dashLabel}
                  </Link>
                </Button>
                <Button size="sm" asChild className="shrink-0 sm:h-10 sm:px-4 sm:text-sm">
                  <Link href="/settings">
                    <UserCircle className="size-4 sm:mr-1.5" />
                    <span className="hidden xs:inline">Account</span>
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="shrink-0 sm:h-10 sm:px-4 sm:text-sm">
                  <Link href="/register">
                    <UploadCloud />
                    <span className="hidden xs:inline">Developer</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>

        <form action="/" method="get" className="relative mx-auto w-full max-w-xl md:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            name="q"
            defaultValue={searchQuery}
            className="h-10 rounded-full pl-9 pr-20 text-sm"
            placeholder="Search apps..."
            aria-label="Search apps"
            enterKeyHint="search"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 h-8 -translate-y-1/2 px-3 text-xs">
            Search
          </Button>
        </form>
      </div>
    </header>
  );
}
