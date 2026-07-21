"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { forgotPassword } from "../service";
import { forgotPasswordPayload, type ForgotPasswordPayload } from "../types";

export function useForgotPassword() {
  const { push } = useRouter();

  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordPayload),
    defaultValues: { email: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const response = await forgotPassword(email);
      if (!response?.success) {
        toast.error(response?.message ?? "Something went wrong");
        return;
      }
      toast.success(response.message ?? "Reset code sent — check your email");
      push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  });

  return { form, onSubmit, isSubmitting };
}
