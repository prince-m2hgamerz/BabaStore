import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Reset Password"
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-canvas-soft px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[420px] mesh-soft opacity-80"
      />
      <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
        <LogoMark className="size-8" />
        <span className="text-[15px] font-semibold text-neutral-950">BabaStore</span>
      </Link>

      <div className="relative z-10 w-full max-w-[400px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-level-3 sm:p-8">
        <h1 className="display-tight text-[22px] font-semibold text-neutral-950 sm:text-[26px]">
          Reset password
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
          We&apos;ll send a secure link to your email.
        </p>
        <div className="mt-6">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
