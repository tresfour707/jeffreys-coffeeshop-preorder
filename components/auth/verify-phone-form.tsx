"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type VerifyPhoneFormProps = {
  phone: string;
  demoCode: string;
  purpose: string;
  nextPath: string;
};

type Step = "code" | "name";

export function VerifyPhoneForm({ phone, demoCode, purpose, nextPath }: VerifyPhoneFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [freshDemoCode, setFreshDemoCode] = useState(demoCode);

  const displayPhone = phone.replace(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 ($1) $2-$3-$4");

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = (await response.json()) as { ok?: boolean; needsName?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось подтвердить номер.");
      }

      if (data.needsName) {
        setStep("name");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось подтвердить номер.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось создать аккаунт.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось создать аккаунт.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/sign-up/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });

      const data = (await response.json()) as { demoCode?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось отправить код.");
      }

      if (data.demoCode) {
        setFreshDemoCode(data.demoCode);
      }

      setCode("");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Не удалось отправить код.",
      );
    } finally {
      setIsResending(false);
    }
  }

  // Step: enter name (sign-up only, after code verified)
  if (step === "name") {
    return (
      <div className="customer-soft-card-strong mx-auto w-full px-5 py-8">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Jeffrey&apos;s Coffeeshop
          </p>
          <h2 className="mt-3 text-[38px] font-semibold leading-[0.96] tracking-tight text-jeffreys-graphite">
            Как вас зовут?
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            Номер <span className="font-semibold text-jeffreys-graphite">{displayPhone}</span> подтверждён.
            Введите своё имя для завершения регистрации.
          </p>
        </div>

        <form onSubmit={handleCompleteName} className="mt-8">
          <label className="block">
            <span className="text-sm font-medium text-stone-700">Имя</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-input"
              placeholder="Например, Анна"
              autoComplete="name"
              autoFocus
              required
            />
          </label>

          {error ? (
            <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || name.trim().length < 2}
            className="btn-primary mt-7 w-full disabled:cursor-wait disabled:bg-stone-400"
          >
            {isSubmitting ? "Создаём аккаунт…" : "Готово"}
          </button>
        </form>
      </div>
    );
  }

  // Step: enter code
  return (
    <div className="customer-soft-card-strong mx-auto w-full px-5 py-8">
      <div>
        <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">
          Jeffrey&apos;s Coffeeshop
        </p>
        <h2 className="mt-3 text-[38px] font-semibold leading-[0.96] tracking-tight text-jeffreys-graphite">
          Код из SMS
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          Отправили на{" "}
          <span className="font-semibold text-jeffreys-graphite">{displayPhone}</span>
        </p>
      </div>

      {freshDemoCode ? (
        <div className="mt-5 rounded-[20px] border border-dashed border-brand-300 bg-brand-50 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Demo — код из SMS
          </p>
          <p className="mt-2 text-[36px] font-bold tracking-[0.22em] text-jeffreys-graphite">
            {freshDemoCode.split("").join(" ")}
          </p>
          <p className="mt-1 text-[12px] text-stone-400">
            В продакшне придёт настоящая SMS
          </p>
        </div>
      ) : null}

      <form onSubmit={handleVerifyCode} className="mt-5">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Код из SMS</span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="field-input text-center text-[22px] font-bold tracking-[0.3em]"
            placeholder="• • • •"
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </label>

        {error ? (
          <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm text-red-700">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || code.length < 4}
          className="btn-primary mt-5 w-full disabled:cursor-wait disabled:bg-stone-400"
        >
          {isSubmitting ? "Проверяем…" : "Подтвердить"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending}
        className="mt-4 text-[15px] font-medium text-brand-600 disabled:opacity-50"
      >
        {isResending ? "Отправляем…" : "Отправить ещё раз"}
      </button>
    </div>
  );
}
