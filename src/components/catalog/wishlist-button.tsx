import Link from "next/link";
import { Heart } from "lucide-react";
import { addWishlistAction, removeWishlistAction } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/guards";
import { isAppWishlisted } from "@/lib/user/user";

export async function WishlistButton({
  appId,
  slug,
  size = "lg",
  iconOnly = false
}: {
  appId: string;
  slug: string;
  size?: "default" | "sm" | "lg";
  iconOnly?: boolean;
}) {
  const { user } = await getCurrentProfile();
  const returnPath = `/apps/${slug}`;
  const supported = !appId.includes(":");

  const baseClass = iconOnly ? "size-10 rounded-full p-0" : "rounded-full";

  if (!user) {
    return (
      <Button variant="secondary" size={size} asChild className={baseClass}>
        <Link href={`/login?next=${encodeURIComponent(returnPath)}`}>
          <Heart />
          {!iconOnly && "Wishlist"}
        </Link>
      </Button>
    );
  }

  if (!supported) {
    return (
      <Button
        variant="secondary"
        size={size}
        disabled
        title="Wishlist is only available for BabaStore published apps"
        className={baseClass}
      >
        <Heart />
        {!iconOnly && "Wishlist"}
      </Button>
    );
  }

  const saved = await isAppWishlisted(user.id, appId);
  const action = saved
    ? removeWishlistAction.bind(null, appId, returnPath)
    : addWishlistAction.bind(null, appId, returnPath);

  return (
    <form action={action}>
      <Button
        variant={saved ? "outline" : "secondary"}
        size={size}
        type="submit"
        className={baseClass}
      >
        <Heart className={saved ? "fill-current" : undefined} />
        {!iconOnly && (saved ? "Saved" : "Wishlist")}
      </Button>
    </form>
  );
}
