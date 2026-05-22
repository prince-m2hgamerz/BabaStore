import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";

export default function Loading() {
  return (
    <div className="page-shell py-10">
      <CatalogSkeleton />
    </div>
  );
}
