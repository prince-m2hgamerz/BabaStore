"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema
} from "@/lib/validators/auth";
import { roleHome, roles, type UserRole } from "@/lib/constants";
import { canAccessPath } from "@/lib/auth/routes";
import { notifyNewUser } from "@/lib/notifications/telegram";
import { sendWelcomeEmail } from "@/lib/notifications/email";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL!;
}

function envReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function cleanNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && roles.includes(value as UserRole);
}

async function getSignedInRole() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return "user" satisfies UserRole;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const metadataRole = user.user_metadata?.role;
  if (isUserRole(profile?.role)) {
    return profile.role;
  }

  if (isUserRole(metadataRole)) {
    return metadataRole;
  }

  return "user" satisfies UserRole;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  void _prevState;
  if (!envReady()) {
    return {
      ok: false,
      message: "Supabase environment variables are missing."
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid login details."
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  const role = await getSignedInRole();
  const nextPath = cleanNextPath(formData.get("next"));

  const destination = nextPath && canAccessPath(role, nextPath) ? nextPath : roleHome[role];
  redirect(destination ?? "/login");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  void _prevState;
  if (!envReady()) {
    return {
      ok: false,
      message: "Supabase environment variables are missing."
    };
  }

  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
    role: formData.get("role") || "user"
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid registration details."
    };
  }

  if (parsed.data.role === "admin") {
    return {
      ok: false,
      message: "Admin access must be granted from the database."
    };
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      username: parsed.data.username,
      role: parsed.data.role
    }
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  notifyNewUser(parsed.data.email);

  if (data?.user) {
    sendWelcomeEmail(parsed.data.email, parsed.data.username);
  }

  return {
    ok: true,
    message: "Account created! Welcome to BabaStore."
  };
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  void _prevState;
  if (!envReady()) {
    return {
      ok: false,
      message: "Supabase environment variables are missing."
    };
  }

  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid email address."
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/reset-password`
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  return {
    ok: true,
    message: "Password reset email sent."
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
