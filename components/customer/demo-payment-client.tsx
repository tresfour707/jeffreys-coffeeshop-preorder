"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { getCartOwnerKey, useCustomerCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import type { DemoPaymentDetails, DemoPaymentResolution, ViewerSummary } from "@/lib/types";

type DemoPaymentClientProps = {
  payment: DemoPaymentDetails;
  viewer: ViewerSummary;
};

export function DemoPaymentClient({
  payment,
  viewer,
}: DemoPaymentClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer.id);
  const clearCart = useCustomerCartStore((state) => state.clear);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<null | "SUCCESS" | "FAIL" | "CANCEL">(null);

  async function handleResolve(result: "SUCCESS" | "FAIL" | "CANCEL") {
    setError(null);
    setIsSubmitting(result);

    try {
      const response = await fetch(`/api/payments/${payment.paymentId}/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result }),
      });

      const data = (await response.json()) as DemoPaymentResolution | { error?: string };

      if (!response.ok || !("paymentId" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось завершить демо-оплату.",
        );
      }

      if (result === "SUCCESS" && data.order) {
        clearCart(ownerKey);
        router.push(`/order/${data.order.id}`);
        router.refresh();
        return;
      }

      const nextNotice = result === "FAIL" ? "failed" : "cancelled";
      router.push(`/checkout?payment=${nextNotice}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось завершить демо-оплату.",
      );
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-40"
      header={
        <section className="rounded-[22px] border border-black/[0.06] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Jeffrey&apos;s Coffeeshop
          </p>
          <h1 className="mt-3 text-[36px] font-semibold leading-[0.94] tracking-tight text-jeffreys-graphite">
            Подтвердите оплату
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            Проверьте данные и подтвердите платёж. После подтверждения заказ сразу попадёт в очередь.
          </p>
        </section>
      }
    >
      <div className="space-y-3">
        <section className="rounded-[22px] border border-black/[0.06] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Плательщик</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-jeffreys-graphite">
                {payment.customerName ?? viewer.name}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {viewer.phone.replace(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/, "+7 ($1) $2-$3-$4")}
              </p>
            </div>

            <div className="rounded-[16px] bg-brand-600 px-4 py-3 text-right text-white shadow-[0_12px_24px_rgba(7,56,74,0.18)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                Способ
              </p>
              <p className="mt-2 text-sm font-semibold">
                {payment.method === "DEMO_SBP" ? "Демо-СБП" : "Демо-карта"}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-black/[0.06] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
          <p className="kicker text-stone-400">Сумма</p>
          <h2 className="mt-3 text-[44px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
            {formatMoney(payment.amount)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-500">
            К оплате
          </p>
        </section>

        <section className="rounded-[22px] border border-black/[0.06] bg-white px-5 py-5 shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Состав заказа</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-jeffreys-graphite">
                Что оплачиваем
              </h2>
            </div>
            <p className="text-sm text-stone-500">{payment.items.length} позиций</p>
          </div>

          <div className="mt-4 space-y-3">
            {payment.items.map((item) => (
              <div key={item.id} className="rounded-[16px] border border-black/[0.045] bg-jeffreys-fog px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-jeffreys-graphite">
                      {item.quantity} × {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatMoney(item.unitPrice)} за единицу
                    </p>
                  </div>
                  <p className="text-sm font-bold text-jeffreys-graphite">
                    {formatMoney(item.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="mt-4 rounded-[24px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
              {error}
            </div>
          ) : null}
        </section>
      </div>

      <div className="customer-action-bar">
        <div className="customer-action-bar-inner space-y-3 px-3 py-3">
          <button
            type="button"
            onClick={() => handleResolve("SUCCESS")}
            disabled={isSubmitting !== null}
            className="w-full rounded-[16px] bg-brand-600 px-5 py-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(7,56,74,0.18)] transition hover:bg-brand-700 disabled:cursor-wait disabled:bg-brand-200"
          >
            {isSubmitting === "SUCCESS" ? "Подтверждаем…" : "Успешная оплата"}
          </button>

          <button
            type="button"
            onClick={() => handleResolve("FAIL")}
            disabled={isSubmitting !== null}
            className="w-full rounded-[16px] bg-red-600 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(220,38,38,0.16)] transition disabled:cursor-wait disabled:bg-red-300"
          >
            {isSubmitting === "FAIL" ? "Фиксируем…" : "Ошибка оплаты"}
          </button>

          <button
            type="button"
            onClick={() => handleResolve("CANCEL")}
            disabled={isSubmitting !== null}
            className="w-full rounded-[16px] border border-black/[0.06] bg-white px-5 py-4 text-sm font-bold text-jeffreys-graphite transition disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting === "CANCEL" ? "Отменяем…" : "Отмена"}
          </button>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
