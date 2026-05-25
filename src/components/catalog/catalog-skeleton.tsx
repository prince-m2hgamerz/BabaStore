export function CatalogSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-neutral-200 bg-white p-3 sm:p-4"
        >
          {/* Mobile: vertical layout */}
          <div className="flex flex-col sm:hidden">
            <div className="size-16 squircle bg-neutral-200" />
            <div className="mt-2.5 h-3 w-3/4 rounded bg-neutral-200" />
            <div className="mt-1.5 h-2.5 w-1/2 rounded bg-neutral-100" />
            <div className="mt-2 h-2.5 w-1/3 rounded bg-neutral-100" />
          </div>
          {/* Desktop: horizontal layout */}
          <div className="hidden items-start gap-4 sm:flex">
            <div className="size-16 shrink-0 squircle bg-neutral-200" />
            <div className="min-w-0 flex-1">
              <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
              <div className="mt-1.5 h-3 w-1/2 rounded bg-neutral-100" />
              <div className="mt-3 h-3 w-full rounded bg-neutral-100" />
              <div className="mt-1.5 h-3 w-4/5 rounded bg-neutral-100" />
              <div className="mt-3 flex gap-2">
                <div className="h-2.5 w-12 rounded bg-neutral-100" />
                <div className="h-2.5 w-10 rounded bg-neutral-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
