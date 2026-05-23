import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth/guards";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentProfile();
  if (result.missingEnv) {
    return <>{children}</>;
  }
  if (!result.user || !result.profile) {
    redirect("/login");
  }
  if (result.profile.role !== "admin") {
    const home =
      result.profile.role === "developer" ? "/developer" : "/dashboard";
    redirect(home);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardNav section="admin" signOutAction={signOutAction} />
      <main className="min-w-0 lg:pl-72">
        <div className="px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
