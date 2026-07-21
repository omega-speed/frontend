"use client";

import {
  ArrowRight,
  AtSign,
  Check,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSignUp } from "@/app/(auth)/sign-up/_hooks/use-sign-up";
import { checkUsernameAvailability } from "@/app/(auth)/sign-up/service";
import { Button } from "@/components/ui/button";
import { CornerAccents } from "@/components/ui/corner-accents";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import ControlledInput from "@/components/molecules/controlled-input";

const LABEL_CLS =
  "text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground";
const INPUT_CLS =
  "h-[52px] text-[15px] tracking-[0.02em] auth-input transition-all duration-200";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken";

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function UsernameAddon({ status }: { status: AvailabilityStatus }) {
  if (status === "checking")
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  if (status === "available") return <Check className="size-4 text-win" />;
  if (status === "taken") return <X className="size-4 text-loss" />;
  return null;
}

export function SignUpForm() {
  const { form, isSubmitting, onSubmit } = useSignUp();
  const [usernameStatus, setUsernameStatus] =
    useState<AvailabilityStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced availability check, driven by the form's watch subscription
  // (a genuine external-subscription effect — no synchronous setState).
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name !== "username") return;
      const username = values.username ?? "";

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!username || username.length < 3 || !USERNAME_REGEX.test(username)) {
        setUsernameStatus("idle");
        return;
      }

      setUsernameStatus("checking");
      debounceRef.current = setTimeout(async () => {
        const available = await checkUsernameAvailability(username);
        if (available === null) {
          setUsernameStatus("idle");
        } else {
          setUsernameStatus(available ? "available" : "taken");
        }
      }, 500);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form]);

  return (
    <div className="relative w-full max-w-120 px-1 py-2">
      <CornerAccents />

      <div className="px-9 pt-2.5 pb-1">
        <h2
          className="m-0 text-[26px] font-black text-foreground"
          style={{ letterSpacing: "0.02em" }}
        >
          Create account
        </h2>
        <p
          className="mt-2.5 mb-7.5 text-[13px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Create your account to get started.
        </p>

        <Form {...form}>
          <div className="flex flex-col gap-4.5">
            <div className="grid grid-cols-2 gap-3.5">
              <ControlledInput
                name="name"
                label="Display name"
                placeholder="John Doe"
                icon={<User className="size-4.5" />}
                labelClassName={LABEL_CLS}
                inputClassName={INPUT_CLS}
              />
              <ControlledInput
                name="username"
                label="Username"
                placeholder="john_doe"
                icon={<AtSign className="size-4.5" />}
                rightAddon={<UsernameAddon status={usernameStatus} />}
                labelClassName={LABEL_CLS}
                inputClassName={INPUT_CLS}
              />
            </div>

            <ControlledInput
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="size-4.5" />}
              labelClassName={LABEL_CLS}
              inputClassName={INPUT_CLS}
            />

            <ControlledInput
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              showEyeIcon
              icon={<Lock className="size-4.5" />}
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
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="/terms-of-service"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:opacity-80 transition-opacity"
                    >
                      Terms of Service
                    </a>
                    ,{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:opacity-80 transition-opacity"
                    >
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a
                      href="/cookie-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:opacity-80 transition-opacity"
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

          <div className="mt-6.5">
            <Button
              className="cta-btn w-full h-13.5 text-[14px] font-bold tracking-[0.18em] uppercase hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: "0 4px 16px oklch(0 0 0 / 0.35)" }}
              loading={isSubmitting}
              onClick={() => onSubmit()}
            >
              Create account
              <ArrowRight className="size-4 ml-1 transition-transform duration-200 group-hover/button:translate-x-0.75" />
            </Button>
          </div>
        </Form>

        <p
          className="mt-6 text-center text-[12px] text-muted-foreground"
          style={{ letterSpacing: "0.03em" }}
        >
          Already have an account?{" "}
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
