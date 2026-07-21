"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import { useForgotPassword } from "../_hooks/use-forgot-password";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-black text-muted-foreground";
const INPUT_CLS = "h-10 text-[14px] auth-input";

export function ForgotPasswordForm() {
  const { form, onSubmit, isSubmitting } = useForgotPassword();

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
        Forgot password
      </p>
      <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        Let&apos;s get you back in.
      </h1>
      <p className="mt-1.5 text-[12.5px] font-black text-muted-foreground">
        Enter your email and we&apos;ll send a reset code.
      </p>

      <Form {...form}>
        <div className="mt-8 flex flex-col gap-5">
          <ControlledInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />
        </div>

        <Button
          className="mt-7 w-full text-[13px] font-black uppercase capitalize"
          loading={isSubmitting}
          onClick={() => onSubmit()}
        >
          Send reset code
        </Button>
      </Form>

      <p className="mt-7 text-[12.5px] font-black text-muted-foreground">
        Remembered it?{" "}
        <a href="/sign-in" className="font-black text-primary hover:opacity-80">
          Sign in
        </a>
      </p>
    </div>
  );
}
