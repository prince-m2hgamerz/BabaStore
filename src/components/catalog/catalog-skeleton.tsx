export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-md border border-neutral-200 bg-white p-4 shadow-glass"
        >
          <div className="flex gap-3">
            <div className="size-14 rounded-md bg-neutral-200" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-1/3 rounded bg-neutral-100" />
              <div className="mt-5 h-3 w-full rounded bg-neutral-100" />
              <div className="mt-2 h-3 w-4/5 rounded bg-neutral-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
