import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Reset Password"
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[480px] flex-col justify-between bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 p-10 lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <span className="text-lg font-semibold text-white">BabaStore</span>
          </Link>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
            Forgot your password?
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/50">
            No worries. Enter your email and we&apos;ll send you a secure reset link.
          </p>
        </div>
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} BabaStore</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link href="/" className="mb-4">
              <LogoMark />
            </Link>
            <h1 className="text-xl font-bold text-neutral-900">Reset password</h1>
            <p className="mt-1 text-sm text-neutral-500">Enter your email to receive a reset link</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold text-neutral-900">Reset password</h1>
            <p className="mt-1 text-sm text-neutral-500">Enter the email associated with your account</p>
          </div>

          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
