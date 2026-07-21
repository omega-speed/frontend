"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";

/**
 * Coerce any form value (Date, ISO string, or junk) to a *valid* Date or
 * undefined. react-day-picker throws on an Invalid Date, so nothing invalid may
 * ever reach <Calendar selected/defaultMonth>.
 */
function toValidDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

// Parse "HH:MM" → [hours, minutes], falling back to 0 so a cleared/partial time
// input can't produce NaN (which would create an Invalid Date).
function parseTime(t: string): [number, number] {
  const [h, m] = t.split(":").map(Number);
  return [Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0];
}

export default function ControlledDateTimePicker({
  name,
  label,
  placeholder = "Select date and time",
  description,
  optional,
  className,
  onChange,
  disabled = false,
  showTime = true,
  disablePast = false,
}: {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  optional?: boolean;
  className?: string;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  showTime?: boolean;
  /**
   * Grey out days before today (today itself stays selectable, so you can still
   * schedule for later the same day). Time-of-day isn't covered here — a schema
   * rule should still assert the value is in the future.
   */
  disablePast?: boolean;
}) {
  const [tempTime, setTempTime] = useState("12:00");
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => {
        const selectedDate = toValidDate(field.value);
        return (
        <FormItem className="gap-1 text-left">
          {label && (
            <FormLabel className="text-sm font-bolder">
              {label}{" "}
              {optional ? (
                <span className="text-muted-foreground font-normal text-xs">
                  (optional)
                </span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </FormLabel>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  disabled={disabled}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-between text-left font-normal h-[48px]",
                    !field.value && "text-muted-foreground",
                    fieldState.error && "border-red-500",
                    className
                  )}
                >
                  <span className="truncate">
                    {selectedDate
                      ? showTime
                        ? selectedDate.toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : selectedDate.toLocaleDateString()
                      : placeholder}
                  </span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent
              // Cap to the viewport so the calendar never overflows small screens.
              className="w-auto max-w-[calc(100vw-2rem)] p-4 space-y-4 overflow-hidden"
              align="start"
            >
              <Calendar
                mode="single"
                captionLayout="dropdown"
                selected={selectedDate}
                defaultMonth={selectedDate}
                disabled={disablePast ? { before: startOfToday } : undefined}
                startMonth={
                  disablePast
                    ? new Date(startOfToday.getFullYear(), startOfToday.getMonth())
                    : new Date(1900, 0)
                }
                endMonth={new Date(new Date().getFullYear() + 10, 11)}
                onSelect={(date) => {
                  if (!date) return;

                  if (showTime) {
                    const [hours, minutes] = parseTime(tempTime);
                    const newDateTime = new Date(date);
                    newDateTime.setHours(hours, minutes, 0, 0);

                    field.onChange(newDateTime);
                    onChange?.(newDateTime);
                  } else {
                    field.onChange(date);
                    onChange?.(date);
                  }
                }}
              />

              {showTime && (
                <Input
                  type="time"
                  value={tempTime}
                  onChange={(e) => {
                    const time = e.target.value;
                    setTempTime(time);

                    // Only apply when there's a valid base date AND a non-empty
                    // time — a cleared time field must not create an Invalid Date.
                    const base = toValidDate(field.value);
                    if (base && time) {
                      const [hours, minutes] = parseTime(time);
                      const newDateTime = new Date(base);
                      newDateTime.setHours(hours, minutes, 0, 0);
                      field.onChange(newDateTime);
                      onChange?.(newDateTime);
                    }
                  }}
                />
              )}
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
        );
      }}
    />
  );
}
