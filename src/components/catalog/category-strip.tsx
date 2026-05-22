import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CategorySummary } from "@/lib/catalog/types";

export function CategoryStrip({ categories }: { categories: CategorySummary[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/?category=${category.slug}`}
          className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-glass transition hover:bg-neutral-50 hover:text-neutral-950"
        >
          {category.name}
          <Badge variant="secondary">{category.count}</Badge>
        </Link>
      ))}
      <Link
        href="/?tab=categories"
        className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-950 px-4 py-2 text-sm text-white shadow-glass transition hover:bg-neutral-800"
      >
        All categories
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

