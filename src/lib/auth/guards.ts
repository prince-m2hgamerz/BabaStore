import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";
import type { User } from "@supabase/supabase-js";

type ProfileGuardResult = {
  user: User | null;
  profile: {
    id: string;
    role: UserRole;
    email: string;
    username: string | null;
    avatar_url: string | null;
  } | null;
  missingEnv: boolean;
};

export async function getCurrentProfile(): Promise<ProfileGuardResult> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return {
      user: null,
      profile: null,
      missingEnv: true
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      missingEnv: false
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, email, username, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    user,
    profile,
    missingEnv: false
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const result = await getCurrentProfile();

  if (result.missingEnv) {
    return result;
  }

  if (!result.user) {
    redirect("/login");
  }

  if (!result.profile || !allowedRoles.includes(result.profile.role)) {
    redirect("/dashboard");
  }

  return result;
}
