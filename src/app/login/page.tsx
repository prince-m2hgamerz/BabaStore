import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/layout/site-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign In"
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "";

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Logo />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Sign in to continue to your BabaStore dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm nextPath={nextPath} />
              <p className="mt-6 text-center text-sm text-neutral-500">
                New here?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
