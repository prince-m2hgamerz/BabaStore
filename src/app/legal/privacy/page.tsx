import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="page-shell py-12">
        <div className="max-w-3xl space-y-4">
          <p className="mono-label">LEGAL</p>
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">Privacy Policy</h1>
          <p className="text-sm leading-7 text-neutral-600">
            We store account, app, download, review, and moderation data needed to operate the store,
            support authentication, and power analytics. Uploaded files are scanned before storage.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
