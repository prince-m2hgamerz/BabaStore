import Link from "next/link";
import { Heart } from "lucide-react";
import { addWishlistAction, removeWishlistAction } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/guards";
import { isAppWishlisted } from "@/lib/user/user";

export async function WishlistButton({
  appId,
  slug,
  size = "lg"
}: {
  appId: string;
  slug: string;
  size?: "default" | "sm" | "lg";
}) {
  const { user } = await getCurrentProfile();
  const returnPath = `/apps/${slug}`;
  const supported = !appId.includes(":");

  if (!user) {
    return (
      <Button variant="secondary" size={size} asChild>
        <Link href={`/login?next=${encodeURIComponent(returnPath)}`}>
          <Heart />
          Add to wishlist
        </Link>
      </Button>
    );
  }

  if (!supported) {
    return (
      <Button variant="secondary" size={size} disabled title="Wishlist is only available for BabaStore published apps">
        <Heart />
        Wishlist
      </Button>
    );
  }

  const saved = await isAppWishlisted(user.id, appId);
  const action = saved
    ? removeWishlistAction.bind(null, appId, returnPath)
    : addWishlistAction.bind(null, appId, returnPath);

  return (
    <form action={action}>
      <Button variant={saved ? "outline" : "secondary"} size={size} type="submit">
        <Heart className={saved ? "fill-current" : undefined} />
        {saved ? "Saved" : "Add to wishlist"}
      </Button>
    </form>
  );
}
