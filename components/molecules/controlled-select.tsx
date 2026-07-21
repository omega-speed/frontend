"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ControlledSelect({
  name,
  label,
  placeholder,
  description,
  optional,
  values,
  className,
  onChange,
  onShowMore,
  hasMore,
  paramName,
  disabled = false,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
  values: { name: string; value: string }[];
  className?: string;
  onChange?: (value: string) => void;
  onShowMore?: () => void;
  hasMore?: boolean;
  paramName?: string;
  disabled?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, startTransition] = useTransition();

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault();

    if (paramName) {
      const currentListings = parseInt(searchParams.get(paramName) || "10", 10);
      const newListings = currentListings + 10;

      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, newListings.toString());

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
      if (onShowMore) onShowMore();
    }
  };

  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="text-left">
          {label ? (
            <FormLabel className="text-sm font-medium">
              {label}{" "}
              {optional && (
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              )}
            </FormLabel>
          ) : null}
          <Select
            onValueChange={(value: string) => {
              field.onChange(value);
              if (onChange) onChange(value);
            }}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={`shadow-custom-drop bg-[#252239] border-border ${className}`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {values.map((val, i) => (
                <SelectItem value={val.value} key={val.value + i} className="">
                  {val.name}
                </SelectItem>
              ))}
              {hasMore && (
                <div className="w-full flex justify-center items-center">
                  {loading ? (
                    <Loader className="text-base animate-spin" />
                  ) : (
                    <Button
                      variant="ghost"
                      key="show-more"
                      className="font-dg text-xl w-full bg-transparent cursor-pointer"
                      onClick={handleShowMore}
                      disabled={loading}
                    >
                      Show More
                    </Button>
                  )}
                </div>
              )}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
