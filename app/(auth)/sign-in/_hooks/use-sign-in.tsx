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
        toast.error(response.message ?? "Invalid email or password");
        return;
      }
      toast.success(response.message);
      push("/ollie");
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
