"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { OtpInput } from "@/components/molecules/otp-input";
import { useVerifyOtp } from "../_hooks/use-verify-otp";

export function EmailVerificationForm() {
  const { form, onSubmit, isSubmitting, email, cooldown, handleResend } =
    useVerifyOtp();

  return (
    <div className="w-full max-w-[380px] mx-auto">
      <p className="text-[11px] font-black uppercase text-primary">
        Verify your email
      </p>
      <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        Confirm it&apos;s you.
      </h1>
      <p className="mt-1.5 text-[12.5px] font-black text-muted-foreground">
        We sent a 6-digit code to{" "}
        {email ? (
          <span className="text-foreground break-all">{email}</span>
        ) : (
          "your email"
        )}
        .
      </p>

      <Form {...form}>
        <div className="mt-8">
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
                  <p className="text-[12px] font-black text-loss mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <Button
          className="mt-7 w-full text-[13px] font-black uppercase capitalize"
          loading={isSubmitting}
          onClick={() => onSubmit()}
        >
          Verify email
        </Button>
      </Form>

      <p className="mt-7 text-[12.5px] font-black text-muted-foreground">
        Didn&apos;t receive it?{" "}
        {cooldown > 0 ? (
          <span className="text-faint">
            Resend in{" "}
            <span className="tabular-nums text-foreground">{cooldown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-black text-primary hover:opacity-80 cursor-pointer"
          >
            Resend code
          </button>
        )}
      </p>

      <p className="mt-2 text-[12.5px] font-black text-muted-foreground">
        Wrong email?{" "}
        <a href="/sign-up" className="font-black text-primary hover:opacity-80">
          Go back
        </a>
      </p>
    </div>
  );
}
