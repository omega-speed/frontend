import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { signUp } from "../service";
import { signUpPayload, type SignUpPayload } from "../types";

export function useSignUp() {
  const { push } = useRouter();

  const form = useForm<SignUpPayload>({
    resolver: zodResolver(signUpPayload),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      isTermsAgreed: false,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await signUp(data);

      if (!response?.success) {
        toast.error(response?.message ?? "Something went wrong");
        return;
      }

      toast.success(response.message ?? "Account created — check your email");
      push(`/email-verification?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  });

  return { form, onSubmit, isSubmitting };
}
