"use client";

import { useSignIn } from "@/app/(auth)/sign-in/_hooks/use-sign-in";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-bold text-muted-foreground";
const INPUT_CLS = "h-10 text-[14px] auth-input";

export function SignInForm() {
  const { form, isSubmitting, onSubmit } = useSignIn();

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        Sign in
      </p>
      <h1 className="mt-2 text-[28px] font-extrabold leading-[1.1] tracking-[-0.02em] text-foreground">
        Welcome back.
      </h1>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        Pick up where you left off.
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
          <ControlledInput
            name="password"
            label="Password"
            type="password"
            placeholder="Your password"
            showEyeIcon
            rightLink={{ label: "Forgot?", href: "/forgot-password" }}
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />
        </div>

        <Button
          className="mt-7  w-full text-[13px] font-black uppercase text-xs capitalize"
          loading={isSubmitting}
          onClick={() => onSubmit()}
        >
          Sign in
        </Button>
      </Form>

      <p className="mt-7 text-[13px] text-muted-foreground">
        New to Qoollege?{" "}
        <a
          href="/sign-up"
          className="font-semibold text-primary hover:opacity-80"
        >
          Create an account
        </a>
      </p>
    </div>
  );
}
