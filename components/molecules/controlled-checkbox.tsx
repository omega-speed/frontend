"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ReactNode } from "react";

export default function ControlledCheckboxGroup({
  name,
  options,
  label,
  description,
  className,
  optional,
  disabled = false,
}: {
  name: string;
  options: { label: ReactNode; value: string }[];
  label?: ReactNode;
  description?: string;
  className?: string;
  optional?: boolean;
  disabled?: boolean;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>
            {label} {optional && <span className="text-xs">(optional)</span>}
          </FormLabel>
          <FormControl>
            <div className={`flex flex-row flex-nowrap gap-4 ${className}`}>
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center justify-center space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      value={option.value}
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        const newValue = checked
                          ? [...(field.value || []), option.value]
                          : field.value?.filter(
                              (val: string) => val !== option.value
                            );
                        field.onChange(newValue);
                      }}
                      disabled={disabled}
                      className="!h-5 !w-5 space-y-0 mr-1"
                    />
                  </FormControl>
                  {option.label}
                </FormItem>
              ))}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
