"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Boxes,
  Download,
  Flag,
  Heart,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  PackagePlus,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Tags,
  Users,
  X,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navBySection = {
  user: [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/apps", label: "My Apps", icon: Download },
    { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
    { href: "/settings", label: "Settings", icon: Settings }
  ],
  developer: [
    { href: "/developer", label: "Overview", icon: BarChart3 },
    { href: "/developer/apps", label: "My Apps", icon: Boxes },
    { href: "/developer/upload", label: "Upload APK", icon: PackagePlus },
    { href: "/developer/settings", label: "Settings", icon: Settings }
  ],
  admin: [
    { href: "/admin", label: "Moderation", icon: ShieldCheck },
    { href: "/admin/apps", label: "Apps", icon: Boxes },
    { href: "/admin/downloads", label: "Downloads", icon: Download },
    { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/email", label: "Email Marketing", icon: Send },
    { href: "/admin/telegram", label: "Telegram Bot", icon: Smartphone },
    { href: "/admin/feedback", label: "Feedback", icon: BarChart3 },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/settings", label: "System Health", icon: Activity }
  ]
} as const;

export type ShellSection = keyof typeof navBySection;

export function DashboardNav({
  section,
  signOutAction
}: {
  section: ShellSection;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav: readonly NavItem[] = navBySection[section];
  const activeHref = nav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const links = (
    <nav className="grid gap-1">
      {nav.map((item) => {
        const active = activeHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
              active && "bg-neutral-950 text-white hover:bg-neutral-900 hover:text-white"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-neutral-200 bg-white shadow-glass lg:flex lg:flex-col">
        <div className="border-b border-neutral-100 px-5 py-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">{links}</div>
        <div className="border-t border-neutral-100 px-4 py-4">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-[9px] z-50 inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 shadow-float transition hover:bg-neutral-50 hover:text-neutral-950 active:scale-95 sm:left-4 sm:top-4 sm:size-10 lg:hidden"
        aria-label="Open navigation"
        aria-expanded={open}
      >
        <Menu className="size-4 sm:size-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-neutral-950/60 opacity-0 backdrop-blur-sm transition-all duration-200 pointer-events-none lg:hidden",
          open && "pointer-events-auto opacity-100"
        )}
        onClick={() => setOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-neutral-200 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open && "translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-5 py-4">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950 active:scale-95"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">{links}</div>
        <div className="border-t border-neutral-100 px-4 py-4">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
