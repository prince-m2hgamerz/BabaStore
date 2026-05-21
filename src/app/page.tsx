import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Grid3X3,
  ShieldCheck,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { AppCard, type AppCardData } from "@/components/marketing/app-card";
import { TopNav } from "@/components/layout/top-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const featuredApps: AppCardData[] = [
  {
    name: "Nova Blocks",
    category: "Games",
    rating: "4.8",
    size: "86 MB",
    accent: "linear-gradient(135deg, #2563eb, #22d3ee)"
  },
  {
    name: "Swift Notes",
    category: "Productivity",
    rating: "4.6",
    size: "22 MB",
    accent: "linear-gradient(135deg, #7c3aed, #f472b6)"
  },
  {
    name: "TutorFlow",
    category: "Education",
    rating: "4.7",
    size: "44 MB",
    accent: "linear-gradient(135deg, #059669, #84cc16)"
  },
  {
    name: "Secure Vault",
    category: "Tools",
    rating: "4.5",
    size: "19 MB",
    accent: "linear-gradient(135deg, #0f172a, #64748b)"
  }
];

const tabs = ["For You", "Top Charts", "Categories", "New Releases"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="page-shell pb-16 pt-6">
        <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="glass-panel rounded-lg p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <Sparkles className="mr-1 size-3" />
                Phase 1 foundation
              </Badge>
              <Badge variant="secondary">R2 ready</Badge>
              <Badge variant="secondary">Supabase auth</Badge>
            </div>
            <div className="mt-8 max-w-3xl">
              <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                BabaSwift AppStore
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/62">
                Browse Android apps, manage developer releases, and moderate a
                marketplace from one dark glass dashboard.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  placeholder="Search apps, games, tools..."
                  className="h-12"
                  aria-label="Search apps"
                />
              </div>
              <Button size="lg" asChild>
                <Link href="/register">
                  Start building
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-cyan-200" />
                Store pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                ["0", "Live apps"],
                ["0", "APK downloads"],
                ["6", "Default categories"]
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <span className="text-sm text-white/55">{label}</span>
                  <span className="text-xl font-semibold text-white">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab, index) => (
              <Button
                key={tab}
                variant={index === 0 ? "default" : "secondary"}
                size="sm"
                className="shrink-0"
              >
                {tab}
              </Button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredApps.map((app) => (
              <AppCard key={app.name} app={app} />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Gamepad2,
              title: "Play Store-style browsing",
              copy: "Home feeds, categories, charts, and app detail routes are shaped for Phase 2."
            },
            {
              icon: ShieldCheck,
              title: "Role-secured dashboards",
              copy: "Users, developers, and admins get separate protected route groups."
            },
            {
              icon: Grid3X3,
              title: "Design system first",
              copy: "Dark glass primitives are ready for consistent UI in later phases."
            }
          ].map((item) => (
            <Card key={item.title} className="glass-hover">
              <CardHeader>
                <item.icon className="size-5 text-primary" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-white/58">{item.copy}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}

