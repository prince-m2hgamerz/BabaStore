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
import { sendConfirmationEmail, sendEmail } from "@/lib/notifications/email";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }
  return url.replace(/\/+$/, "");
}

function envReady() {
  return Boolean(
    process.env.NEXT_PUBLIC_SITE_URL &&
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
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "signup",
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
        role: parsed.data.role
      },
      redirectTo: `${getSiteUrl()}/auth/callback`
    }
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  if (data?.properties?.action_link) {
    notifyNewUser(parsed.data.email);
    sendConfirmationEmail(parsed.data.email, data.properties.action_link);
    return {
      ok: true,
      message: "Check your email to confirm your BabaStore account."
    };
  }

  return {
    ok: false,
    message: "Account created but confirmation link could not be generated."
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

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email: parsed.data.email,
    options: {
      redirectTo: `${getSiteUrl()}/reset-password`
    }
  });

  if (error) {
    return {
      ok: false,
      message: error.message
    };
  }

  if (data?.properties?.action_link) {
    sendEmail({
      to: parsed.data.email,
      subject: "Reset your BabaStore password",
      html: `
        <h2 style="font-size:20px;font-weight:600;margin:0 0 8px">Reset your password</h2>
        <p style="margin:0 0 16px;color:#4d4d4d">You requested a password reset for your BabaStore account. Click the button below to set a new password.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td align="center"><a href="${data.properties.action_link}" style="display:inline-block;padding:12px 32px;background:#171717;color:#ffffff;text-decoration:none;border-radius:100px;font-size:14px;font-weight:600">Reset password</a></td></tr></table>
        <p style="margin:16px 0 0;color:#888;font-size:13px">If you didn't request this, you can ignore this email. The link expires in 1 hour.</p>
        <p style="margin:4px 0 0;font-size:12px;word-break:break-all;color:#0070f3">${data.properties.action_link}</p>
      `
    });
  }

  return {
    ok: true,
    message: "If the email exists, a reset link has been sent."
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
