"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Suggestion = {
  id: string;
  slug: string;
  name: string;
  packageName: string;
  iconUrl: string | null;
  accent?: string;
};

export function SearchSuggestions({ query = "" }: { query?: string }) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const cleanQuery = query.trim();

  useEffect(() => {
    if (cleanQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/catalog/suggestions?q=${encodeURIComponent(cleanQuery)}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { suggestions?: Suggestion[] };
        setItems(payload.suggestions ?? []);
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [cleanQuery]);

  if (cleanQuery.length < 2 || !items.length) {
    return null;
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-level-3">
      <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500">
        <Search className="size-3" />
        Suggestions
      </div>
      <div className="grid">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/apps/${item.slug}`}
            className="flex min-w-0 items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-canvas-soft"
          >
            <span
              className="size-9 shrink-0 squircle bg-cover bg-center text-white ring-1 ring-black/5"
              style={
                item.iconUrl
                  ? { backgroundImage: `url("${item.iconUrl}")` }
                  : { background: item.accent ?? "#171717" }
              }
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-neutral-950">
                {item.name}
              </span>
              <span className="block truncate font-mono text-[11px] text-neutral-500">
                {item.packageName}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
