import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignInPayload, signInPayload } from "../types";
import { toast } from "sonner";
import { SignIn } from "../service";
import { useRouter } from "next/navigation";

export function useSignIn() {
  const form = useForm({
    resolver: zodResolver(signInPayload),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { push } = useRouter();
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const onSubmit = handleSubmit(async (data: SignInPayload) => {
    try {
      const response = await SignIn(data);

      if (!response.success) {
        if (response.status_code === 403) {
          // A 403 means an unverified account. The backend has already re-sent
          // the verification code; route to the verification step.
          push(`/email-verification?email=${encodeURIComponent(data.email)}`);
        }

        toast.info(response.message);
        return;
      }
      toast.success(response.message);
      push("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting,
  };
}
