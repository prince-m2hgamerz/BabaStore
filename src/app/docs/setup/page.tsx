import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Setup"
};

export default function SetupDocsPage() {
  return (
    <main className="page-shell py-10">
      <Button variant="ghost" asChild>
        <Link href="/">
          <ArrowLeft />
          Back
        </Link>
      </Button>
      <Card className="mt-6 max-w-3xl">
        <CardHeader>
          <Database className="size-5 text-primary" />
          <CardTitle>Phase 1 setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-6 text-neutral-600">
          <p>
            Copy <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-950">.env.example</code>{" "}
            to <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-950">.env.local</code>{" "}
            and add your Supabase and Resend credentials.
          </p>
          <p>
            Run <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-950">supabase/schema.sql</code>{" "}
            in the Supabase SQL editor to create profiles, apps, app versions,
            screenshots, categories, reviews, downloads, and RLS policies.
          </p>
          <p>
            Admin accounts are promoted manually in Supabase after registration.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
