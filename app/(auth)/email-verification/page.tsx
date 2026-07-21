import { Suspense } from "react";
import { EmailVerificationForm } from "./_components/email-verification-form";

export default function EmailVerificationPage() {
  return (
    <Suspense>
      <EmailVerificationForm />
    </Suspense>
  );
}
