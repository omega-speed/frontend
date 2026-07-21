"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import { useResetPassword } from "../_hooks/use-reset-password";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-black text-muted-foreground";
const INPUT_CLS = "h-10 text-[14px] auth-input";

export function ResetPasswordForm() {
  const { form, onSubmit, isSubmitting } = useResetPassword();

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
        Reset password
      </p>
      <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        Choose a new password.
      </h1>
      <p className="mt-1.5 text-[12.5px] font-black text-muted-foreground">
        Make it strong — this protects your account.
      </p>

      <Form {...form}>
        <div className="mt-8 flex flex-col gap-5">
          <ControlledInput
            name="new_password"
            label="New password"
            type="password"
            placeholder="Your new password"
            showEyeIcon
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />
        </div>

        <Button
          className="mt-7 w-full text-[13px] font-black uppercase capitalize"
          loading={isSubmitting}
          onClick={() => onSubmit()}
        >
          Reset password
        </Button>
      </Form>

      <p className="mt-7 text-[12.5px] font-black text-muted-foreground">
        Back to{" "}
        <a href="/sign-in" className="font-black text-primary hover:opacity-80">
          Sign in
        </a>
      </p>
    </div>
  );
}
