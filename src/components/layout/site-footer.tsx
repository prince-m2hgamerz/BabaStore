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
      <div className="page-shell grid gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600 sm:mt-4">
            {siteConfig.name} helps users discover Android apps and gives
            developers a moderated publishing workflow for APK releases.
          </p>
          <p className="mt-4 text-xs text-neutral-500 sm:mt-6">
            Copyright {new Date().getFullYear()} {siteConfig.shortName}. All rights reserved.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-neutral-950">{group.title}</h3>
              <div className="mt-2 grid gap-1.5 sm:mt-3 sm:gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-neutral-500 transition hover:text-neutral-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
