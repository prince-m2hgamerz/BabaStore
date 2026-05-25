import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/constants";

const footerGroups = [
  {
    title: "Store",
    links: [
      { href: "/", label: "Browse apps" },
      { href: "/?tab=categories", label: "Categories" },
      { href: "/?sort=newest", label: "New releases" }
    ]
  },
  {
    title: "Developers",
    links: [
      { href: "/developer", label: "Developer console" },
      { href: "/developer/upload", label: "Submit APK" },
      { href: "/docs/setup", label: "Setup guide" }
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/developer-policy", label: "Developer policy" }
    ]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="page-shell pb-10 pt-10 sm:pb-16 sm:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Logo />
            <p className="mt-4 max-w-md text-[13px] leading-6 text-neutral-600">
              {siteConfig.name} helps users discover Android apps and gives
              developers a moderated publishing workflow for APK releases.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  {group.title}
                </h3>
                <div className="mt-4 grid gap-2.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-[13px] text-neutral-700 transition hover:text-neutral-950"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-neutral-500">
            &copy; {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-neutral-400">
            Direct APK delivery
          </p>
        </div>
      </div>
    </footer>
  );
}
