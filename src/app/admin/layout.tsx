import { redirect } from "next/navigation";
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

  return <>{children}</>;
}
