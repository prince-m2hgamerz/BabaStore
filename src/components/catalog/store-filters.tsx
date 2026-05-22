import { Search } from "lucide-react";
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
      className="grid min-w-0 grid-cols-2 gap-2 rounded-lg border border-neutral-200 bg-white p-3 shadow-glass sm:grid-cols-3 lg:grid-cols-[minmax(220px,1fr)_180px_150px_150px_150px_150px_auto] lg:gap-3"
    >
      <div className="relative col-span-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          name="q"
          defaultValue={query}
          className="h-10 pl-9"
          placeholder="Search by name, developer, package..."
          enterKeyHint="search"
        />
      </div>
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
      <input type="hidden" name="source" value={source ?? "all"} />
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
      <Button type="submit" className="col-span-full h-10 lg:col-span-1">
        <Search />
        Apply filters
      </Button>
    </form>
  );
}
