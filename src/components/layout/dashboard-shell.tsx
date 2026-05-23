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
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2 sm:min-h-20 sm:px-6 sm:py-4 lg:px-8">
            <div className="min-w-0 pl-12 sm:pl-14 lg:pl-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-neutral-950 sm:text-2xl lg:text-3xl">
                {title}
              </h1>
              <p className="mt-0.5 hidden max-w-2xl text-sm leading-6 text-neutral-500 sm:line-clamp-2 lg:block">
                {description}
              </p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-float transition hover:bg-neutral-50 hover:text-neutral-950 sm:size-10"
                aria-label="Sign out"
              >
                <CircleUser className="size-4 sm:size-5" />
              </button>
            </form>
          </div>
        </header>
        <div className={cn("px-3 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8", className)}>
          {children}
        </div>
      </main>
    </div>
  );
}
