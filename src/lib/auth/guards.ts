import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/constants";
import { getRoleHome, isUserRole } from "@/lib/auth/routes";
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
    .maybeSingle();

  if (!profile && isUserRole(user.user_metadata?.role)) {
    return {
      user,
      profile: {
        id: user.id,
        role: user.user_metadata.role,
        email: user.email ?? "",
        username:
          typeof user.user_metadata?.username === "string"
            ? user.user_metadata.username
            : null,
        avatar_url:
          typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : null
      },
      missingEnv: false
    };
  }

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
    redirect(getRoleHome(result.profile?.role));
  }

  return result;
}
