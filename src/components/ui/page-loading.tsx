export function PageLoading() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-md border border-neutral-200 bg-white"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-md border border-neutral-200 bg-white" />
    </div>
  );
}
