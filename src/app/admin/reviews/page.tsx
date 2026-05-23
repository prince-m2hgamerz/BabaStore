import Link from "next/link";
import {
  ArrowRight,
  MessageSquareText,
  Search,
  Star,
  Trash2
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { getReviewList } from "@/lib/admin/admin";
import { formatDate } from "@/lib/catalog/catalog";
import { deleteReviewAction, respondToReviewAction } from "@/app/admin/actions";

export const metadata = {
  title: "Admin Reviews"
};

export default async function AdminReviewsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const search = String(Array.isArray(params.q) ? params.q[0] ?? "" : params.q ?? "");
  const minRating = Number(Array.isArray(params.rating) ? params.rating[0] : params.rating) || 0;

  const { reviews, total } = await getReviewList({
    limit: 100,
    search: search || undefined,
    minRating: minRating || undefined
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "N/A";

  return (
    <DashboardShell
      section="admin"
      title="Reviews"
      description="Moderate user reviews, respond to feedback, and remove inappropriate content."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Total reviews", value: total, icon: MessageSquareText },
          { title: "Average rating", value: avgRating, icon: Star, suffix: <Star className="size-4 fill-amber-400 text-amber-400" /> },
          { title: "Unresponded", value: reviews.filter((r) => !r.developerResponse).length, icon: MessageSquareText }
        ].map((m) => (
          <Card key={m.title} className="min-w-0 overflow-hidden transition-shadow hover:shadow-md">
            <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary/30" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="min-w-0 truncate text-sm font-medium text-neutral-500">{m.title}</CardTitle>
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <m.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-neutral-950">
                {m.value}
                {m.suffix}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mono-label">MODERATION</p>
            <CardTitle className="mt-1">All reviews</CardTitle>
          </div>
          <form action="/admin/reviews" method="get" className="grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <Input name="q" defaultValue={search} className="pl-9" placeholder="Search apps or users" enterKeyHint="search" />
            </div>
            <Select name="rating" defaultValue={String(minRating || 0)}>
              <SelectTrigger>
                <SelectValue placeholder="Min rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="2">2+ stars</SelectItem>
                <SelectItem value="1">1+ stars</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardHeader>
        <CardContent>
          {reviews.length ? (
            <div className="grid gap-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-md border border-neutral-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/apps/${review.appId}`}
                          className="font-medium text-neutral-950 hover:underline"
                        >
                          {review.appName}
                        </Link>
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {review.appPackageName}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                        <span>{review.userName}</span>
                        <span>·</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                          />
                        ))}
                      </div>
                      {review.body ? (
                        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{review.body}</p>
                      ) : null}
                      {review.developerResponse ? (
                        <div className="mt-3 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                          <p className="text-xs font-medium text-blue-600">Admin response:</p>
                          <p className="mt-1">{review.developerResponse}</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-start gap-2">
                      <Link
                        href={`/admin/apps/${review.appId}`}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-950"
                      >
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <form action={respondToReviewAction} className="grid gap-3">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <Textarea
                        name="response"
                        placeholder="Write a public response..."
                        defaultValue={review.developerResponse ?? ""}
                        className="min-h-20 text-sm"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" type="submit">
                          {review.developerResponse ? "Update response" : "Post response"}
                        </Button>
                      </div>
                    </form>
                    <form action={deleteReviewAction} className="mt-2">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <Button size="sm" variant="destructive" type="submit">
                        <Trash2 className="size-3.5" />
                        Delete review
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
              <MessageSquareText className="mx-auto size-8 text-neutral-300" />
              <p className="mt-3 font-medium text-neutral-600">No reviews found</p>
              <p className="mt-1">
                {search || minRating ? "Try different search terms or rating filter." : "No reviews have been submitted yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
