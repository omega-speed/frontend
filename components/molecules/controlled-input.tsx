"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOff } from "lucide-react";
import React, { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ControlledInput({
  name,
  label,
  className,
  inputClassName,
  labelClassName,
  placeholder,
  description,
  defaultValue,
  optional = false,
  disabled = false,
  type = "text",
  showEyeIcon,
  readOnly = false,
  onKeyDown,
  onChange,
  min,
  icon,
  rightLink,
  rightAddon,
}: {
  name: string;
  label?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  optional?: boolean;
  disabled?: boolean;
  type?: string;
  showEyeIcon?: boolean;
  readOnly?: boolean;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min?: number;
  /** Optional left icon rendered inside the input at 14px inset */
  icon?: ReactNode;
  /** Optional right-aligned link rendered in the label row */
  rightLink?: { label: string; href: string };
  /** Optional decorative element rendered inside the input on the right */
  rightAddon?: ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);

  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => {
        // Trigger toast only once when error first appears
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (fieldState.error?.message && !hasShownError) {
            toast.error("Please fill in all fields before submission.");
            setHasShownError(true);
          }

          if (!fieldState.error?.message && hasShownError) {
            setHasShownError(false);
          }
        }, [fieldState.error?.message]);

        return (
          <FormItem className="gap-1">
            {(label || rightLink) && (
              <div className="flex items-baseline justify-between">
                {label && (
                  <FormLabel
                    className={cn("text-sm font-bolder ", labelClassName)}
                  >
                    {label}{" "}
                    {optional ? (
                      <span className="text-xs">(optional)</span>
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                )}
                {rightLink && (
                  <a
                    href={rightLink.href}
                    className="text-[11px] text-muted-foreground tracking-[0.04em] hover:text-primary transition-colors duration-200 leading-none"
                  >
                    {rightLink.label}
                  </a>
                )}
              </div>
            )}
            <FormControl>
              <div className="relative">
                {icon && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex text-faint z-10">
                    {icon}
                  </span>
                )}
                <Input
                  readOnly={readOnly}
                  className={cn(
                    fieldState.error ? "border-red-500" : "",
                    inputClassName,
                    className,
                  )}
                  disabled={disabled}
                  placeholder={placeholder}
                  defaultValue={defaultValue}
                  min={min}
                  type={showPassword ? "text" : type}
                  style={icon ? { paddingLeft: "42px" } : undefined}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (onChange) onChange(event);
                    if (type === "number") {
                      field.onChange(value === "" ? "" : Number(value));
                    } else {
                      field.onChange(value);
                    }
                  }}
                  onKeyDown={onKeyDown}
                />
                {rightAddon && !showEyeIcon && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex">
                    {rightAddon}
                  </span>
                )}
                {showEyeIcon &&
                  (!showPassword ? (
                    <EyeIcon
                      className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  ) : (
                    <EyeOff
                      className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ))}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
