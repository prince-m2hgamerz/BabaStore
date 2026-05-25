import { Star } from "lucide-react";

/**
 * Rating histogram — five horizontal bars labeled 5..1 with a relative-width
 * fill. A common app-store convention.
 */
export function RatingHistogram({
  rating,
  total,
  distribution
}: {
  rating: number | null;
  total: number;
  distribution?: { rating: number; count: number }[];
}) {
  // Estimate distribution from average if none supplied.
  const dist =
    distribution ??
    estimateDistribution(rating ?? 0, total);

  const max = Math.max(1, ...dist.map((d) => d.count));

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 sm:grid-cols-[auto_1fr_auto] sm:gap-x-8">
      <div className="flex flex-col items-center justify-center sm:items-start">
        <div className="text-[44px] font-semibold leading-none tabular-nums text-neutral-950 sm:text-[56px]">
          {rating !== null ? rating.toFixed(1) : "—"}
        </div>
        <div className="mt-1.5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={
                i < Math.round(rating ?? 0)
                  ? "size-3.5 fill-current sm:size-4"
                  : "size-3.5 text-neutral-300 sm:size-4"
              }
            />
          ))}
        </div>
        <p className="mt-1 text-[12px] text-neutral-500 tabular-nums">
          {total.toLocaleString()} reviews
        </p>
      </div>
      <div className="grid gap-1.5 sm:gap-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = dist.find((d) => d.rating === star)?.count ?? 0;
          const pct = (count / max) * 100;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-3 text-right text-[12px] font-medium text-neutral-500 tabular-nums">
                {star}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function estimateDistribution(avg: number, total: number) {
  // Skew the curve toward the average rating so the bars look plausible.
  const buckets = [5, 4, 3, 2, 1].map((star) => {
    const distance = Math.abs(star - avg);
    const weight = Math.max(0.05, 1 - distance / 2.5);
    return { star, weight };
  });
  const sumWeights = buckets.reduce((acc, b) => acc + b.weight, 0) || 1;
  return buckets.map((b) => ({
    rating: b.star,
    count: Math.round((b.weight / sumWeights) * total)
  }));
}
