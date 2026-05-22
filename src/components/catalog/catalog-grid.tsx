"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { AppCard } from "@/components/marketing/app-card";
import { Button } from "@/components/ui/button";
import type { CatalogApp, CatalogFilters, CatalogResult } from "@/lib/catalog/types";

type CatalogGridProps = {
  initialApps: CatalogApp[];
  initialNextOffset: number | null;
  filters: CatalogFilters;
};

function paramsFromFilters(filters: CatalogFilters, offset: number) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.minRating) params.set("rating", String(filters.minRating));
  if (filters.size) params.set("size", filters.size);
  if (filters.updated) params.set("updated", filters.updated);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.source) params.set("source", filters.source);
  params.set("limit", "48");
  params.set("offset", String(offset));
  return params;
}

export function CatalogGrid({
  initialApps,
  initialNextOffset,
  filters
}: CatalogGridProps) {
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const dataKey = useMemo(
    () =>
      [
        filterKey,
        initialNextOffset ?? "end",
        initialApps
          .map((app) => `${app.id}:${app.updatedAt}:${app.rating ?? "none"}:${app.reviews}`)
          .join("|")
      ].join("::"),
    [filterKey, initialApps, initialNextOffset]
  );

  return (
    <CatalogGridState
      key={dataKey}
      initialApps={initialApps}
      initialNextOffset={initialNextOffset}
      filters={filters}
    />
  );
}

function CatalogGridState({
  initialApps,
  initialNextOffset,
  filters
}: CatalogGridProps) {
  const [apps, setApps] = useState(initialApps);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  async function loadMore() {
    if (nextOffset === null || isPending) {
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        const response = await fetch(`/api/catalog/apps?${paramsFromFilters(filters, nextOffset)}`);
        const payload = (await response.json()) as CatalogResult & { error?: string };

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load more apps.");
        }

        setApps((current) => {
          const seen = new Set(current.map((app) => app.packageName.toLowerCase()));
          const incoming = payload.apps.filter((app) => {
            const key = app.packageName.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return [...current, ...incoming];
        });
        setNextOffset(payload.nextOffset);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load more apps.");
      }
    });
  }

  return (
    <div key={filterKey} className="grid gap-4 sm:gap-5">
      {apps.length ? (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} compact />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {nextOffset !== null ? (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" onClick={loadMore} disabled={isPending} className="w-full sm:w-auto">
            {isPending ? <Loader2 className="animate-spin" /> : null}
            Load more apps
          </Button>
        </div>
      ) : null}
    </div>
  );
}
