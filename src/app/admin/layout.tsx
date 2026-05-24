import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/guards";
import { TelegramAutoReplyProvider } from "@/components/layout/telegram-auto-reply-provider";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const result = await getCurrentProfile();
  if (result.missingEnv) {
    return <TelegramAutoReplyProvider>{children}</TelegramAutoReplyProvider>;
  }
  if (!result.user || !result.profile) {
    redirect("/login");
  }
  if (result.profile.role !== "admin") {
    const home =
      result.profile.role === "developer" ? "/developer" : "/dashboard";
    redirect(home);
  }

  return <TelegramAutoReplyProvider>{children}</TelegramAutoReplyProvider>;
}
