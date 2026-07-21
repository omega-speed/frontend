"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPassword } from "../service";
import { resetPasswordPayload, type ResetPasswordPayload } from "../types";

export function useResetPassword() {
  const { push } = useRouter();

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordPayload),
    defaultValues: { new_password: "" },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async ({ new_password }) => {
    try {
      const response = await resetPassword(new_password);
      if (!response?.success) {
        toast.error(response?.message ?? "Something went wrong");
        return;
      }
      toast.success(response.message ?? "Password reset — sign in to continue");
      push("/sign-in");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  });

  return { form, onSubmit, isSubmitting };
}
