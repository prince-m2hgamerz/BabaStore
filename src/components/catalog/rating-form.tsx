"use client";

import { useActionState, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { saveRatingAction, type RatingActionState } from "@/app/actions/ratings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initialState: RatingActionState = {
  status: "idle",
  message: ""
};

export function RatingForm({
  appId,
  slug,
  disabled = false
}: {
  appId: string;
  slug: string;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(saveRatingAction, initialState);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [currentBody, setCurrentBody] = useState("");

  useEffect(() => {
    if (disabled || appId.includes(":")) {
      return;
    }

    let active = true;

    fetch(`/api/catalog/apps/${encodeURIComponent(appId)}/review`)
      .then((response) => response.json())
      .then((payload: { review?: { rating?: number; body?: string | null } | null }) => {
        if (!active || !payload.review) return;
        setCurrentRating(payload.review.rating ?? null);
        setCurrentBody(payload.review.body ?? "");
      })
      .catch(() => {
        if (active) {
          setCurrentRating(null);
        }
      });

    return () => {
      active = false;
    };
  }, [appId, disabled]);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="appId" value={appId} />
      <input type="hidden" name="slug" value={slug} />
      <fieldset disabled={disabled || pending} className="grid gap-3 disabled:opacity-60">
        <legend className="sr-only">Rate this app</legend>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center justify-center rounded-md border border-neutral-200 bg-white p-2 transition hover:border-neutral-950 has-[:checked]:border-neutral-950 has-[:checked]:bg-neutral-950 has-[:checked]:text-white"
            >
              <input
                className="sr-only"
                type="radio"
                name="rating"
                value={value}
                required
                checked={currentRating === value}
                onChange={() => setCurrentRating(value)}
              />
              <Star className="size-4 fill-current" />
              <span className="sr-only">{value} stars</span>
            </label>
          ))}
        </div>
        <Textarea
          name="body"
          rows={3}
          maxLength={1000}
          placeholder="Share a short review..."
          value={currentBody}
          onChange={(event) => setCurrentBody(event.target.value)}
          className="resize-none"
        />
        <Button type="submit" disabled={disabled || pending} className="w-full">
          {pending ? "Saving..." : "Save rating"}
        </Button>
      </fieldset>
      {disabled ? (
        <p className="text-xs leading-5 text-neutral-500">
          Ratings are only available for apps published directly on BabaStore.
        </p>
      ) : null}
      {state.message ? (
        <p
          className={cn(
            "rounded-md border px-3 py-2 text-xs leading-5",
            state.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          )}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
