"use client";

import { useSignUp } from "@/app/(auth)/sign-up/_hooks/use-sign-up";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import ControlledInput from "@/components/molecules/controlled-input";

const LABEL_CLS = "text-[11px] uppercase text-muted-foreground";
const INPUT_CLS = "h-10 text-[14px] auth-input";

export function SignUpForm() {
  const { form, isSubmitting, onSubmit } = useSignUp();

  return (
    <div className="w-full max-w-[400px] mx-auto">
      <p className="text-[11px] font-black uppercase text-primary">
        Create account
      </p>
      <h1 className="mt-2 text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        Start your journey.
      </h1>
      <p className="mt-1.5 text-[12.5px] font-black text-muted-foreground">
        A few details and you&apos;re in.
      </p>

      <Form {...form}>
        <div className="mt-8 flex flex-col gap-4">
          <ControlledInput
            name="name"
            label="Display name"
            placeholder="John Doe"
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />

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
            placeholder="Create a password"
            showEyeIcon
            labelClassName={LABEL_CLS}
            inputClassName={INPUT_CLS}
          />
        </div>

        <FormField
          name="isTermsAgreed"
          render={({ field }) => (
            <FormItem className="mt-5">
              <div className="flex items-start gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 shrink-0"
                  />
                </FormControl>
                <span className="text-[11px] font-black text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-black hover:opacity-80"
                  >
                    Terms of Service
                  </a>
                  ,{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-black hover:opacity-80"
                  >
                    Privacy Policy
                  </a>
                  , and{" "}
                  <a
                    href="/cookie-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-black hover:opacity-80"
                  >
                    Cookie Policy
                  </a>
                  .
                </span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          className="mt-7 w-full text-[13px] font-black uppercase capitalize"
          loading={isSubmitting}
          onClick={() => onSubmit()}
        >
          Create account
        </Button>
      </Form>

      <p className="mt-7 text-[12.5px] font-black text-muted-foreground">
        Already have an account?{" "}
        <a href="/sign-in" className="font-black text-primary hover:opacity-80">
          Sign in
        </a>
      </p>
    </div>
  );
}
