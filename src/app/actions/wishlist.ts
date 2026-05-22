"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function revalidateReturnPath(returnPath?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/wishlist");
  revalidateTag("catalog");
  if (returnPath?.startsWith("/")) {
    revalidatePath(returnPath);
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function addWishlistAction(appId: string, returnPath?: string) {
  if (appId.includes(":")) {
    revalidateReturnPath(returnPath);
    return;
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("wishlist_items").upsert(
    {
      app_id: appId,
      user_id: user.id
    },
    { onConflict: "user_id,app_id" }
  );

  if (error) {
    throw new Error(error.message || "Unable to save wishlist item.");
  }

  revalidateReturnPath(returnPath);
}

export async function removeWishlistAction(appId: string, returnPath?: string) {
  if (appId.includes(":")) {
    revalidateReturnPath(returnPath);
    return;
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("app_id", appId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message || "Unable to remove wishlist item.");
  }

  revalidateReturnPath(returnPath);
}
