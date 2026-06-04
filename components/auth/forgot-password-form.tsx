"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PhoneInput } from "@/components/ui/phone-input";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [phoneDigits, setPhoneDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `7${phoneDigits}` }),
      });

      const data = (await response.json()) as { phone?: string; demoCode?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось отправить код.");
      }

      router.push(
        `/reset-password?phone=${encodeURIComponent(data.phone ?? "")}&code=${encodeURIComponent(data.demoCode ?? "")}`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось отправить код.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="customer-soft-card-strong mx-auto w-full px-5 py-6"
    >
      <div>
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">
          Jeffrey&apos;s Coffeeshop
        </p>
        <h2 className="mt-3 text-[30px] font-semibold leading-[0.98] tracking-tight text-jeffreys-graphite">
          Забыли пароль?
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Введите номер телефона — мы отправим код для сброса пароля.
        </p>
      </div>

      <div className="mt-6">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Телефон</span>
          <PhoneInput
            value={phoneDigits}
            onChange={setPhoneDigits}
            className="field-input"
            autoFocus
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || phoneDigits.length < 10}
        className="btn-primary mt-6 w-full disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Отправляем…" : "Получить код"}
      </button>

      <p className="mt-4 text-center">
        <Link
          href="/sign-in"
          className="text-[15px] text-stone-500 underline decoration-stone-300 underline-offset-4"
        >
          ← Назад к входу
        </Link>
      </p>
    </form>
  );
}
