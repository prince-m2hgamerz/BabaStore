import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account"
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden w-[480px] flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-10 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-blue-900">
              B
            </div>
            <span className="text-lg font-semibold text-white">BabaStore</span>
          </Link>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <Sparkles className="size-3" />
            Join the community
          </div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Create your account, start exploring.
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            Whether you want to discover new apps or publish your own creations,
            BabaStore gives you the freedom to do both.
          </p>
          <ul className="space-y-2 text-sm text-white/60">
            {[
              "Browse thousands of free Android APKs",
              "Publish apps with our developer console",
              "Rate, review, and build your wishlist",
              "No gatekeepers, just the community"
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-blue-400" />
                {item}
              </li>
            ))}
          </ul>
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
            <Link href="/" className="mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              B
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Choose user or developer access
            </p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold text-neutral-900">Create your account</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Choose your account type to get started
            </p>
          </div>

          <RegisterForm />

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
