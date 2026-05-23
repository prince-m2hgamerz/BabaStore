import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Sparkles } from "lucide-react";

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
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-[480px] flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-10 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-neutral-900">
              B
            </div>
            <span className="text-lg font-semibold text-white">BabaStore</span>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <Sparkles className="size-3" />
            Open Android App Marketplace
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Discover, install, and publish Android apps.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Browse thousands of free APKs. Publish your own. No gatekeepers, just
            apps — delivered directly from the community.
          </p>
        </div>
        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} BabaStore
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link href="/" className="mb-4 flex size-12 items-center justify-center rounded-xl bg-neutral-950 text-lg font-bold text-white">
              B
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to your BabaStore account
            </p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Sign in to your account to continue
            </p>
          </div>

          <LoginForm nextPath={nextPath} />

          <p className="mt-6 text-center text-sm text-neutral-500">
            New to BabaStore?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
