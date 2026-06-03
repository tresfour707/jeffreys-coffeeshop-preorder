"use client";

import { type ChangeEvent } from "react";

type PhoneInputProps = {
  value: string;
  onChange: (digits: string) => void;
  className?: string;
  autoFocus?: boolean;
};

function formatDisplayValue(digits: string): string {
  if (!digits) return "";
  const d = digits.slice(0, 10);
  let result = "+7 ";
  if (d.length > 0) result += "(";
  result += d.slice(0, 3);
  if (d.length >= 3) result += ") ";
  result += d.slice(3, 6);
  if (d.length >= 6) result += "-";
  result += d.slice(6, 8);
  if (d.length >= 8) result += "-";
  result += d.slice(8, 10);
  return result;
}

export function PhoneInput({ value, onChange, className, autoFocus }: PhoneInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    let digits = raw;
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    onChange(digits.slice(0, 10));
  }

  return (
    <input
      type="tel"
      inputMode="numeric"
      value={formatDisplayValue(value)}
      onChange={handleChange}
      placeholder="+7 (___) ___-__-__"
      autoComplete="tel"
      autoFocus={autoFocus}
      className={className}
    />
  );
}
