import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ConfirmPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenHash = String(params.token_hash ?? "");
  const type = String(params.type ?? "");
  const next = String(params.next ?? "/dashboard");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "email" | "recovery" | "invite"
    });

    if (!error) {
      redirect(next.startsWith("/") ? next : "/dashboard");
    }
  }

  redirect("/login");
}
