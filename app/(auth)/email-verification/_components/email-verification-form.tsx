"use client";

import { ArrowRight, MailOpen } from "lucide-react";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CornerAccents } from "@/components/ui/corner-accents";
import { Form } from "@/components/ui/form";
import { OtpInput } from "@/components/molecules/otp-input";
import { useVerifyOtp } from "../_hooks/use-verify-otp";

export function EmailVerificationForm() {
  const { form, onSubmit, isSubmitting, email, cooldown, handleResend } =
    useVerifyOtp();

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
            <MailOpen className="size-6 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h2
          className="m-0 text-[26px] font-black text-foreground text-center"
          style={{ letterSpacing: "0.02em" }}
        >
          Verify your email
        </h2>

        {/* Subtitle */}
        <p
          className="mt-[10px] mb-[30px] text-[13px] text-muted-foreground text-center leading-relaxed"
          style={{ letterSpacing: "0.03em" }}
        >
          We sent a 6-digit code to{" "}
          {email ? (
            <span className="text-foreground font-semibold break-all">{email}</span>
          ) : (
            "your email"
          )}
        </p>

        <Form {...form}>
          {/* OTP input wired via Controller */}
          <Controller
            control={form.control}
            name="otp"
            render={({ field, fieldState }) => (
              <div className="flex flex-col items-center gap-2">
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
                {fieldState.error && (
                  <p className="text-[12px] text-loss mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />

          <div className="mt-[28px]">
            <Button
              className="cta-btn w-full h-[54px] text-[14px] font-bold tracking-[0.18em] uppercase hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 4px 16px oklch(0 0 0 / 0.35)" }}
              loading={isSubmitting}
              onClick={() => onSubmit()}
            >
              Verify email
              <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover/button:translate-x-[3px]" />
            </Button>
          </div>
        </Form>

        {/* Resend */}
        <p
          className="mt-[22px] text-center text-[12px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Didn&apos;t receive it?{" "}
          {cooldown > 0 ? (
            <span className="text-faint">
              Resend in{" "}
              <span className="tabular-nums text-foreground font-semibold">
                {cooldown}s
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-semibold hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            >
              Resend code
            </button>
          )}
        </p>

        <p
          className="mt-[14px] text-center text-[12px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Wrong email?{" "}
          <a
            href="/sign-up"
            className="text-primary font-semibold hover:opacity-80 transition-opacity duration-200"
          >
            Go back
          </a>
        </p>
      </div>
    </div>
  );
}
