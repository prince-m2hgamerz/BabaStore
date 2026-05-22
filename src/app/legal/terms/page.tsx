import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";

export const metadata: Metadata = {
  title: "Terms of Service"
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="page-shell py-12">
        <div className="max-w-3xl space-y-4">
          <p className="mono-label">LEGAL</p>
          <h1 className="text-4xl font-semibold tracking-normal text-neutral-950">Terms of Service</h1>
          <p className="text-sm leading-7 text-neutral-600">
            Use the platform responsibly, do not upload harmful content, and keep your account
            credentials secure. Developers remain responsible for the apps they submit.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
