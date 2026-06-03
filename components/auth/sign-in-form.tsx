"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PhoneInput } from "@/components/ui/phone-input";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const router = useRouter();
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `7${phoneDigits}`, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось войти.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось войти.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="customer-soft-card mx-auto w-full px-5 py-8"
    >
      <div>
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">
          Jeffrey&apos;s Coffeeshop
        </p>
        <h2 className="mt-3 text-[38px] font-semibold leading-[0.96] tracking-tight text-jeffreys-graphite">
          Войти в аккаунт
        </h2>
      </div>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Телефон</span>
          <PhoneInput
            value={phoneDigits}
            onChange={setPhoneDigits}
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input"
            placeholder="Ваш пароль"
            autoComplete="current-password"
            required
          />
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || phoneDigits.length < 10}
        className="btn-primary mt-7 w-full disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Входим…" : "Войти"}
      </button>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-[15px] leading-none text-stone-600">
          Нет аккаунта?{" "}
          <Link
            href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-4"
          >
            Создать
          </Link>
        </p>
        <Link
          href={`/forgot-password`}
          className="text-[15px] font-medium text-stone-500 underline decoration-stone-300 underline-offset-4"
        >
          Забыл пароль
        </Link>
      </div>
    </form>
  );
}
