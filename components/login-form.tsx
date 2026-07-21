"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import { useSignIn } from "@/app/(auth)/sign-in/_hooks/use-sign-in";
import { Button } from "@/components/ui/button";
import { CornerAccents } from "@/components/ui/corner-accents";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground";
const INPUT_CLS =
  "h-[52px] text-[15px] tracking-[0.02em] auth-input transition-all duration-200";

export function SignInForm() {
  const { form, isSubmitting, onSubmit } = useSignIn();

  return (
    <div className="relative w-full max-w-120 px-1 py-2">
      <CornerAccents />

      <div className="px-[36px] pt-[10px] pb-1">
        {/* Title */}
        <h2
          className="m-0 text-[26px] font-black text-foreground"
          style={{ letterSpacing: "0.02em" }}
        >
          Sign in
        </h2>
        <p
          className="mt-[10px] mb-[30px] text-[13px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Welcome back — sign in to continue.
        </p>

        <Form {...form}>
          <div className="flex flex-col gap-[20px]">
            <ControlledInput
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="size-[18px]" />}
              labelClassName={LABEL_CLS}
              inputClassName={INPUT_CLS}
            />
            <ControlledInput
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              showEyeIcon
              icon={<Lock className="size-[18px]" />}
              rightLink={{ label: "Forgot?", href: "/forgot-password" }}
              labelClassName={LABEL_CLS}
              inputClassName={INPUT_CLS}
            />
          </div>

          <div className="mt-[26px]">
            <Button
              className="cta-btn w-full h-[54px] text-[14px] font-bold tracking-[0.18em] uppercase hover:-translate-y-0.5 transition-all duration-200"
              style={{
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.35)",
              }}
              loading={isSubmitting}
              onClick={() => onSubmit()}
            >
              Sign in
              <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover/button:translate-x-[3px]" />
            </Button>
          </div>
        </Form>

        {/* Footer */}
        <p
          className="mt-[30px] text-center text-[12px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="/sign-up"
            className="text-primary font-semibold hover:opacity-80 transition-opacity duration-200"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}
