import Link from "next/link";
import { LayoutDashboard, Search, UploadCloud, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, LogoMark } from "@/components/brand/logo";
import { getCurrentProfile } from "@/lib/auth/guards";

type Tab = { label: string; value: string };

export async function TopNav({
  searchQuery = "",
  tabs,
  activeTab
}: {
  searchQuery?: string;
  tabs?: Tab[];
  activeTab?: string;
}) {
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
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      {/* Mobile: single combined row with logo mark + inline search + avatar */}
      <div className="page-shell flex h-12 min-w-0 items-center gap-2 md:hidden">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Home">
          <LogoMark className="size-8" />
        </Link>
        <form action="/" method="get" className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            name="q"
            defaultValue={searchQuery}
            className="h-9 rounded-full pl-8 pr-2 text-[13px]"
            placeholder="Search apps & games"
            aria-label="Search apps"
            enterKeyHint="search"
          />
        </form>
        {signedIn ? (
          <Link
            href="/settings"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition active:scale-95"
            aria-label="Account"
          >
            <UserCircle className="size-4" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition active:scale-95"
            aria-label="Sign in"
          >
            <UserCircle className="size-4" />
          </Link>
        )}
      </div>

      {/* Desktop: full nav */}
      <div className="page-shell hidden h-16 min-w-0 items-center gap-4 md:flex">
        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Apps
          </Link>
          <Link
            href="/?category=games"
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Games
          </Link>
          <Link
            href="/developer"
            className="rounded-full px-3 py-1.5 text-[13px] font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950"
          >
            Developers
          </Link>
        </nav>

        <form action="/" method="get" className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            name="q"
            defaultValue={searchQuery}
            className="h-9 rounded-full pl-9 pr-3 text-[13px]"
            placeholder="Search apps, games, tools..."
            aria-label="Search apps"
            enterKeyHint="search"
          />
        </form>

        <nav className="ml-auto flex min-w-0 items-center gap-2">
          {signedIn && dashLink ? (
            <>
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href={dashLink}>
                  <LayoutDashboard className="size-4" />
                  {dashLabel}
                </Link>
              </Button>
              <Button size="sm" asChild className="h-8 shrink-0">
                <Link href="/settings">
                  <UserCircle className="size-4" />
                  Account
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="h-8">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="h-8 shrink-0">
                <Link href="/register">
                  <UploadCloud />
                  Developer
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>

      {/* Top tab bar (Play Store-style) */}
      {tabs?.length ? (
        <div className="page-shell">
          <div className="-mb-px flex gap-1 overflow-x-auto pb-1.5 pt-1 scrollbar-none">
            {tabs.map((tab) => {
              const active = (activeTab ?? "for-you") === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={`/?tab=${tab.value}`}
                  data-active={active}
                  className="tab-pill"
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </header>
  );
}
