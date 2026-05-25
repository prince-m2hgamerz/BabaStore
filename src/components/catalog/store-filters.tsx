import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { CategorySummary } from "@/lib/catalog/types";

export function StoreFilters({
  categories,
  query,
  category,
  minRating,
  size,
  updated,
  sort,
  source
}: {
  categories: CategorySummary[];
  query?: string;
  category?: string;
  minRating?: string;
  size?: string;
  updated?: string;
  sort?: string;
  source?: string;
}) {
  return (
    <form
      action="/"
      method="get"
      className="rounded-xl border border-neutral-200 bg-white p-3 shadow-level-1 sm:p-4"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          name="q"
          defaultValue={query}
          className="h-10 rounded-full pl-9"
          placeholder="Search by name, developer, package..."
          enterKeyHint="search"
        />
      </div>

      {/* Mobile: collapsed filters in a <details> */}
      <details className="group mt-3 sm:hidden">
        <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-full border border-neutral-200 bg-canvas-soft px-3 py-2 text-[12px] font-medium text-neutral-700">
          <span className="inline-flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </span>
          <span className="text-[10px] text-neutral-500 group-open:hidden">
            {[category && category !== "all", minRating && minRating !== "0", size && size !== "all", updated && updated !== "all", sort && sort !== "featured"].filter(Boolean).length || ""}
          </span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Select name="category" defaultValue={category ?? "all"}>
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((item) => (
                <SelectItem key={item.slug} value={item.slug}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select name="rating" defaultValue={minRating ?? "0"}>
            <SelectTrigger aria-label="Rating">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="4.5">4.5+</SelectItem>
              <SelectItem value="4">4.0+</SelectItem>
              <SelectItem value="3.5">3.5+</SelectItem>
            </SelectContent>
          </Select>
          <Select name="size" defaultValue={size ?? "all"}>
            <SelectTrigger aria-label="Size">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any size</SelectItem>
              <SelectItem value="small">Under 30 MB</SelectItem>
              <SelectItem value="medium">30-80 MB</SelectItem>
              <SelectItem value="large">80 MB+</SelectItem>
            </SelectContent>
          </Select>
          <Select name="updated" defaultValue={updated ?? "all"}>
            <SelectTrigger aria-label="Updated">
              <SelectValue placeholder="Updated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any update</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select name="sort" defaultValue={sort ?? "featured"}>
            <SelectTrigger aria-label="Sort" className="col-span-2">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="size">Smallest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </details>

      {/* Desktop: inline filter row */}
      <div className="mt-3 hidden gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-5">
        <Select name="category" defaultValue={category ?? "all"}>
          <SelectTrigger aria-label="Category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((item) => (
              <SelectItem key={item.slug} value={item.slug}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="rating" defaultValue={minRating ?? "0"}>
          <SelectTrigger aria-label="Rating">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any rating</SelectItem>
            <SelectItem value="4.5">4.5+</SelectItem>
            <SelectItem value="4">4.0+</SelectItem>
            <SelectItem value="3.5">3.5+</SelectItem>
          </SelectContent>
        </Select>
        <Select name="size" defaultValue={size ?? "all"}>
          <SelectTrigger aria-label="Size">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any size</SelectItem>
            <SelectItem value="small">Under 30 MB</SelectItem>
            <SelectItem value="medium">30-80 MB</SelectItem>
            <SelectItem value="large">80 MB+</SelectItem>
          </SelectContent>
        </Select>
        <Select name="updated" defaultValue={updated ?? "all"}>
          <SelectTrigger aria-label="Updated">
            <SelectValue placeholder="Updated" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any update</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="quarter">90 days</SelectItem>
          </SelectContent>
        </Select>
        <Select name="sort" defaultValue={sort ?? "featured"}>
          <SelectTrigger aria-label="Sort">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="downloads">Downloads</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="size">Smallest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <input type="hidden" name="source" value={source ?? "all"} />

      <Button type="submit" className="mt-3 h-10 w-full rounded-full">
        <Search />
        Apply
      </Button>
    </form>
  );
}
