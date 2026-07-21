import { Suspense } from "react";
import { VerifyResetForm } from "./_components/verify-reset-form";

export default function VerifyResetPage() {
  return (
    <Suspense>
      <VerifyResetForm />
    </Suspense>
  );
}
