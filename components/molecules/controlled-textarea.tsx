"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EyeIcon, EyeOff } from "lucide-react";
import { useState } from "react";
import { Textarea } from "../ui/textarea";

export default function ControlledTextarea({
  name,
  label,
  className,
  placeholder,
  description,
  defaultValue,
  optional,
  disabled = false,
  showEyeIcon,
  readOnly = false,
}: {
  name: string;
  label?: string;
  className?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  optional?: boolean;
  disabled?: boolean;
  showEyeIcon?: boolean;
  readOnly?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}{" "}
            {optional ? (
              <span className="text-xs">(optional)</span>
            ) : (
              <span className="text-red-500"></span>
            )}{" "}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Textarea
                readOnly={readOnly}
                className={` ${className}`}
                disabled={disabled}
                placeholder={placeholder}
                defaultValue={defaultValue}
                {...field}
              />
              {showEyeIcon &&
                (!showPassword ? (
                  <EyeIcon
                    className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                ) : (
                  <EyeOff
                    className="absolute top-0 right-0 bottom-0 my-auto h-6 w-6 pr-2 text-muted-foreground hover:text-black duration-750 cursor-pointer"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
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
