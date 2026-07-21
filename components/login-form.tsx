"use client";

import { useSignIn } from "@/app/(auth)/sign-in/_hooks/use-sign-in";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";

const LABEL_CLS = "text-[11px] uppercase text-muted-foreground";
const INPUT_CLS = "h-10 text-[14px] auth-input";

export function SignInForm() {
  const { form, isSubmitting, onSubmit } = useSignIn();

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-[11px] font-black uppercase text-primary">Sign In</p>
      <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        Let&apos;s get you back in.
      </h1>
      <Form {...form}>
        <div className="mt-8 flex flex-col gap-2">
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

      <p className="mt-7 text-[12.5px] font-black text-muted-foreground">
        New to Qoollege?{" "}
        <a href="/sign-up" className="font-black text-primary hover:opacity-80">
          Create an account
        </a>
      </p>
    </div>
  );
}
