"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { PhoneInput } from "@/components/ui/phone-input";

type SignUpFormProps = {
  nextPath: string;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: `7${phoneDigits}`,
          password,
        }),
      });

      const data = (await response.json()) as { phone?: string; demoCode?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось создать аккаунт.");
      }

      router.push(
        `/verify-phone?phone=${encodeURIComponent(data.phone ?? "")}&code=${encodeURIComponent(data.demoCode ?? "")}&next=${encodeURIComponent(nextPath)}`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось создать аккаунт.",
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
          Создать аккаунт
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Нужен, чтобы сохранять историю заказов и корзину между сессиями.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Имя</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
            placeholder="Например, Анна"
            autoComplete="name"
            required
          />
        </label>

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
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
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
        className="btn-primary mt-6 w-full disabled:cursor-wait disabled:bg-stone-400"
      >
        {isSubmitting ? "Создаём…" : "Продолжить"}
      </button>

      <p className="mt-4 text-sm text-stone-600">
        Уже есть аккаунт?{" "}
        <Link
          href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
          className="font-semibold text-brand-600 underline decoration-brand-200 underline-offset-4"
        >
          Войти
        </Link>
      </p>
    </form>
  );
}
