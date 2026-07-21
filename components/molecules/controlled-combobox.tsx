"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
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

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ControlledComboboxProps<T extends ComboboxOption = ComboboxOption> {
  name: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  description?: string;
  optional?: boolean;
  options: T[];
  className?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  renderOption?: (option: T) => React.ReactNode;
}

export default function ControlledCombobox<
  T extends ComboboxOption = ComboboxOption,
>({
  name,
  label,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  description,
  optional,
  options,
  className,
  disabled = false,
  onChange,
  renderOption,
}: ControlledComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      name={name}
      render={({ field }) => {
        const selectedOption = options.find(
          (option) => option.value === field.value,
        );

        return (
          <FormItem className="space-y-2 text-left">
            {label && (
              <div className="flex items-baseline justify-between">
                <FormLabel className="text-sm font-medium">
                  {label}{" "}
                  {optional && (
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  )}
                </FormLabel>
              </div>
            )}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between bg-[#252239] shadow-custom-drop h-10",
                      !field.value && "text-muted-foreground",
                      className,
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0 flex-1">
                      {selectedOption ? (
                        renderOption ? (
                          renderOption(selectedOption)
                        ) : (
                          <>
                            {selectedOption.icon}
                            <span className="truncate">
                              {selectedOption.label}
                            </span>
                          </>
                        )
                      ) : (
                        <span className="truncate">{placeholder}</span>
                      )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>{emptyText}</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          keywords={[option.label, option.value]}
                          onSelect={() => {
                            const newValue =
                              option.value === field.value ? "" : option.value;
                            field.onChange(newValue);
                            if (onChange) onChange(newValue);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          {renderOption ? (
                            renderOption(option)
                          ) : (
                            <span className="flex items-center gap-2 flex-1">
                              {option.icon}
                              {option.label}
                            </span>
                          )}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              field.value === option.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
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
