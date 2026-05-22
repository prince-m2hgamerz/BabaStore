"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RatingActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const defaultState: RatingActionState = {
  status: "idle",
  message: ""
};

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

export async function saveRatingAction(
  state: RatingActionState = defaultState,
  formData: FormData
): Promise<RatingActionState> {
  void state;
  const appId = String(formData.get("appId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating"));

  if (!appId || appId.includes(":")) {
    return {
      status: "error",
      message: "Ratings can only be saved for BabaStore app listings."
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      status: "error",
      message: "Choose a rating from 1 to 5 stars."
    };
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("reviews").upsert(
    {
      app_id: appId,
      user_id: user.id,
      rating,
      body: body || null
    },
    {
      onConflict: "app_id,user_id"
    }
  );

  if (error) {
    return {
      status: "error",
      message: error.message || "Unable to save your rating."
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidateTag("catalog");
  if (slug) {
    revalidatePath(`/apps/${slug}`);
  }

  return {
    status: "success",
    message: "Your rating has been saved."
  };
}
