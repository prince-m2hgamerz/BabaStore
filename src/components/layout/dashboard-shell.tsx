import { CircleUser } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { DashboardNav, type ShellSection } from "@/components/layout/dashboard-nav";
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
    <div className="min-h-screen bg-neutral-50">
      <DashboardNav section={section} signOutAction={signOutAction} />
      <main className="min-w-0 lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur-xl lg:static">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:min-h-20 sm:px-6 sm:py-4 lg:px-8">
            <div className="min-w-0 pl-12 lg:pl-0">
              <p className="mono-label">BabaStore</p>
              <h1 className="mt-0.5 truncate text-xl font-semibold tracking-normal text-neutral-950 sm:mt-1 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-neutral-600 sm:block">
                {description}
              </p>
            </div>
            <form action={signOutAction} className="hidden sm:block">
              <button
                type="submit"
                className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-glass transition hover:bg-neutral-50 hover:text-neutral-950"
                aria-label="Sign out"
              >
                <CircleUser className="size-5" />
              </button>
            </form>
          </div>
        </header>
        <div className={cn("px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8", className)}>
          {children}
        </div>
      </main>
    </div>
  );
}
