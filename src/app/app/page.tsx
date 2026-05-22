import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getRoleHome } from "@/lib/auth/routes";

export default async function AppAliasPage() {
  const { profile } = await getCurrentProfile();
  redirect(profile ? getRoleHome(profile.role) : "/login");
}
