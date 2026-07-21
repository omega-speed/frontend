import { Suspense } from "react";
import { EmailVerificationForm } from "./_components/email-verification-form";

export default function EmailVerificationPage() {
  return (
    <div
      className="min-h-svh flex items-center justify-center relative"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Blueprint grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <Suspense>
        <EmailVerificationForm />
      </Suspense>
    </div>
  );
}
