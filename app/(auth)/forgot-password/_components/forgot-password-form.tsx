"use client";

import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CornerAccents } from "@/components/ui/corner-accents";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import { useForgotPassword } from "../_hooks/use-forgot-password";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground";
const INPUT_CLS =
  "h-[52px] text-[15px] tracking-[0.02em] auth-input transition-all duration-200";

export function ForgotPasswordForm() {
  const { form, onSubmit, isSubmitting } = useForgotPassword();

  return (
    <div className="relative w-full max-w-[440px] px-1 py-2 mx-4">
      <CornerAccents />

      <div className="px-[36px] pt-[10px] pb-[30px]">
        {/* Icon */}
        <div className="flex justify-center mb-6 mt-4">
          <div
            className="size-[56px] flex items-center justify-center"
            style={{
              background: "oklch(1 0 0 / 0.06)",
              border: "1px solid oklch(1 0 0 / 0.18)",
              boxShadow: "0 0 24px oklch(1 0 0 / 0.08)",
            }}
          >
            <Mail className="size-6 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h2
          className="m-0 text-[26px] font-black text-foreground text-center"
          style={{ letterSpacing: "0.02em" }}
        >
          Forgot password?
        </h2>

        {/* Subtitle */}
        <p
          className="mt-[10px] mb-[30px] text-[13px] text-muted-foreground text-center leading-relaxed"
          style={{ letterSpacing: "0.03em" }}
        >
          Enter your email and we&apos;ll send a reset code.
        </p>

        <Form {...form}>
          <ControlledInput
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="size-[18px]" />}
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />

          <div className="mt-[28px]">
            <Button
              className="cta-btn w-full h-[54px] text-[14px] font-bold tracking-[0.18em] uppercase hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 4px 16px oklch(0 0 0 / 0.35)" }}
              loading={isSubmitting}
              onClick={() => onSubmit()}
            >
              Send reset code
              <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover/button:translate-x-[3px]" />
            </Button>
          </div>
        </Form>

        <p
          className="mt-[22px] text-center text-[12px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Remembered it?{" "}
          <a
            href="/sign-in"
            className="text-primary font-semibold hover:opacity-80 transition-opacity duration-200"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
