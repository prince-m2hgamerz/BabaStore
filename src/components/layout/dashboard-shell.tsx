import { CircleUser } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { DashboardNav, type ShellSection } from "@/components/layout/dashboard-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

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
  return (
    <div className="has-bottom-nav min-h-screen bg-canvas-soft">
      <DashboardNav section={section} signOutAction={signOutAction} />
      <main className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neutral-200/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2 sm:min-h-16 sm:px-6 sm:py-3 lg:px-8">
            <div className="min-w-0 pl-12 sm:pl-14 lg:pl-0">
              <h1 className="display-tight truncate text-[18px] font-semibold leading-tight tracking-[-0.4px] text-neutral-950 sm:text-[22px] sm:tracking-[-0.6px]">
                {title}
              </h1>
              <p className="mt-0.5 hidden max-w-2xl text-[12px] leading-5 text-neutral-500 sm:line-clamp-1 lg:block sm:text-[13px]">
                {description}
              </p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-950 sm:size-10"
                aria-label="Sign out"
              >
                <CircleUser className="size-4 sm:size-5" />
              </button>
            </form>
          </div>
        </header>
        <div className={cn("px-3 pb-12 pt-4 sm:px-6 sm:pb-16 lg:px-8", className)}>
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
