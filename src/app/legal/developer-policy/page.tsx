import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Developer Policy"
};

export default function DeveloperPolicyPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="page-shell py-12">
        <div className="max-w-3xl space-y-4">
          <p className="mono-label">LEGAL</p>
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">Developer Policy</h1>
          <p className="text-sm leading-7 text-neutral-600">
            App submissions must include valid metadata, a scanned APK, and accurate descriptions.
            Admin review may reject or flag content that fails policy checks.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
