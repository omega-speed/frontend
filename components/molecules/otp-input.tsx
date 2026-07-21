"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ value, onChange, disabled, className }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function update(index: number, char: string) {
    const next = digits.map((d, i) => (i === index ? char : d));
    onChange(next.join(""));
  }

  function handleChange(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    const char = raw[raw.length - 1]; // take last digit if somehow >1 char
    update(index, char);
    refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        update(index, "");
      } else {
        const prev = refs.current[index - 1];
        if (prev) {
          prev.focus();
          update(index - 1, "");
        }
      }
    } else if (e.key === "ArrowLeft") {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] ?? digits[i] ?? "");
    onChange(next.join(""));
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  }

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-[52px] text-center text-[20px] font-bold tabular-nums bg-muted/60 border-2 border-border text-foreground outline-none transition-all duration-200 auth-input disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ letterSpacing: 0 }}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
