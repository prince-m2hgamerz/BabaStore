import Link from "next/link";
import {
  BarChart3,
  Boxes,
  CircleUser,
  Download,
  Flag,
  Heart,
  LayoutDashboard,
  Megaphone,
  PackagePlus,
  Settings,
  ShieldCheck,
  Tags,
  Users
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navBySection = {
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
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/reports", label: "Reports", icon: Flag }
  ]
} as const;

type ShellSection = keyof typeof navBySection;

export function DashboardShell({
  section,
  title,
  description,
  children,
  className
}: {
  section: ShellSection;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  const nav = navBySection[section];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-neutral-950/65 p-5 backdrop-blur-xl lg:block">
        <Logo />
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/68 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="border-b border-white/10 bg-neutral-950/50 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm text-white/45">BabaSwift AppStore</p>
              <h1 className="text-2xl font-semibold tracking-normal text-white">
                {title}
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-white/55">
                {description}
              </p>
            </div>
            <Button variant="secondary" size="icon" aria-label="Profile">
              <CircleUser />
            </Button>
          </div>
        </header>
        <div className={cn("px-4 py-6 sm:px-6 lg:px-8", className)}>
          {children}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-neutral-950/80 p-2 backdrop-blur-xl lg:hidden">
        {nav.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[11px] text-white/60"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
