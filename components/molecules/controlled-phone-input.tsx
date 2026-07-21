"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useController, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  PHONE_COUNTRIES,
  isoToFlag,
  parsePhone,
  type PhoneCountry,
} from "@/lib/phone-countries";

interface ControlledPhoneInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  labelClassName?: string;
  inputClassName?: string;
}

// Mirrors the shared <Input> base styling so the country trigger sits flush with
// the number field.
const TRIGGER_BASE =
  "flex items-center gap-1.5 shrink-0 border border-input bg-transparent px-3 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30";

// A country dial-code picker + national number input. Writes a single E.164
// string (e.g. "+2348012345678") to the form field so validation stays simple.
export default function ControlledPhoneInput({
  name,
  label,
  placeholder = "801 234 5678",
  optional,
  disabled,
  labelClassName,
  inputClassName,
}: ControlledPhoneInputProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });

  const initial = parsePhone(field.value);
  const [country, setCountry] = useState<PhoneCountry>(initial.country);
  const [national, setNational] = useState<string>(initial.national);
  const [open, setOpen] = useState(false);

  function commit(c: PhoneCountry, nat: string) {
    const digits = nat.replace(/\D/g, "");
    setCountry(c);
    setNational(digits);
    field.onChange(digits ? `${c.dial}${digits}` : "");
  }

  return (
    <div className="flex flex-col gap-1 text-left">
      {label && (
        <label className={cn("text-sm font-bolder", labelClassName)}>
          {label}{" "}
          {optional ? (
            <span className="text-muted-foreground font-normal text-xs">
              (optional)
            </span>
          ) : (
            <span className="text-red-500">*</span>
          )}
        </label>
      )}

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-controls="phone-country-list"
              disabled={disabled}
              className={cn(
                TRIGGER_BASE,
                fieldState.error && "border-red-500",
                inputClassName,
              )}
            >
              <span className="text-base leading-none">
                {isoToFlag(country.iso)}
              </span>
              <span className="text-sm text-foreground">{country.dial}</span>
              <ChevronsUpDown className="size-3.5 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search country…" className="h-9" />
              <CommandList id="phone-country-list">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {PHONE_COUNTRIES.map((c) => (
                    <CommandItem
                      key={c.iso}
                      value={c.name}
                      keywords={[c.name, c.dial, c.iso]}
                      onSelect={() => {
                        commit(c, national);
                        setOpen(false);
                      }}
                      className="cursor-pointer gap-2"
                    >
                      <span className="text-base leading-none">
                        {isoToFlag(c.iso)}
                      </span>
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {c.dial}
                      </span>
                      <Check
                        className={cn(
                          "size-4",
                          country.iso === c.iso ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          value={national}
          onChange={(e) => commit(country, e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1",
            fieldState.error && "border-red-500",
            inputClassName,
          )}
        />
      </div>

      {fieldState.error && (
        <p className="text-[12px] text-loss">{fieldState.error.message}</p>
      )}
    </div>
  );
}
