"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Gamepad2,
  Search,
  User
} from "lucide-react";

const items = [
  { href: "/", label: "Apps", icon: Compass, match: (p: string) => p === "/" },
  {
    href: "/?category=games",
    label: "Games",
    icon: Gamepad2,
    match: (p: string, q: string) => p === "/" && q.includes("category=games")
  },
  {
    href: "/?q=",
    label: "Search",
    icon: Search,
    match: (_p: string, q: string) => q.startsWith("q=") || q.includes("&q=")
  },
  {
    href: "/dashboard",
    label: "You",
    icon: User,
    match: (p: string) =>
      p.startsWith("/dashboard") ||
      p.startsWith("/settings") ||
      p.startsWith("/developer") ||
      p.startsWith("/admin")
  }
];

export function BottomNav() {
  const pathname = usePathname();
  if (typeof window === "undefined") {
    // server render: still emit, the active state will rehydrate
  }
  const search =
    typeof window !== "undefined" ? window.location.search.replace(/^\?/, "") : "";

  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => {
        const active = item.match(pathname, search);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            data-active={active}
            className="bottom-nav-item"
          >
            <span className="bottom-nav-icon-wrap">
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
