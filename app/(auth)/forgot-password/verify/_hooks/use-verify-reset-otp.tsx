"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { verifyResetOtp, resendResetOtp } from "../service";
import { verifyResetOtpPayload, type VerifyResetOtpPayload } from "../types";

const RESEND_COOLDOWN = 60;

export function useVerifyResetOtp() {
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const form = useForm<VerifyResetOtpPayload>({
    resolver: zodResolver(verifyResetOtpPayload),
    defaultValues: { otp: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ otp }) => {
    try {
      const response = await verifyResetOtp(email, otp);
      if (!response?.success) {
        toast.error(response?.message ?? "Invalid code, please try again");
        form.resetField("otp");
        return;
      }
      toast.success("Code verified — set your new password");
      push("/reset-password");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  });

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    try {
      const response = await resendResetOtp(email);
      if (!response?.success) {
        toast.error(response?.message ?? "Failed to resend code");
        return;
      }
      toast.success("Reset code resent — check your inbox");
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  }

  return { form, onSubmit, isSubmitting, email, cooldown, handleResend };
}
