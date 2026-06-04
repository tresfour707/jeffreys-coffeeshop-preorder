"use client";

import Link from "next/link";
import { useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/business-day";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { usePolling } from "@/lib/use-polling";
import type { OrderDetails, ViewerSummary } from "@/lib/types";

type OrderStatusClientProps = {
  initialOrder: OrderDetails;
  viewer: ViewerSummary;
};

// ─── helpers ────────────────────────────────────────────────

function getOrdersWord(count: number) {
  const m10 = count % 10, m100 = count % 100;
  if (m10 === 1 && m100 !== 11) return "заказ";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "заказа";
  return "заказов";
}

function getQueueLabel(order: OrderDetails) {
  if (order.status === "READY")     return "Можно забирать!";
  if (order.status === "PREPARING") return "Готовят сейчас";
  if (order.status === "CANCELLED") return "Заказ отменён";
  if (order.ordersAhead === 0)      return "Вы следующие";
  return `${order.ordersAhead} ${getOrdersWord(order.ordersAhead)} впереди`;
}

function getTimeEstimate(order: OrderDetails): string | null {
  if (order.status === "WAITING" && order.itemsAhead > 0) {
    const mins = Math.ceil((order.itemsAhead * 2.5) / 5) * 5;
    return `~${mins} мин`;
  }
  return null;
}

function getProgressFill(order: OrderDetails): number {
  if (order.status === "READY")     return 100;
  if (order.status === "CANCELLED") return 0;
  if (order.status === "PREPARING") return 93;
  if (order.ordersAhead === 0)      return 88;
  return Math.max(5, Math.round(88 - order.ordersAhead * 7));
}

// ─── progress bar ───────────────────────────────────────────

function ProgressBar({ order }: { order: OrderDetails }) {
  const fill      = getProgressFill(order);
  const isReady   = order.status === "READY";
  const isCancelled = order.status === "CANCELLED";

  const fillColor = isReady ? "#6f9a61" : isCancelled ? "#b7b0a8" : "#8fa878";

  return (
    <div
      className="relative h-[18px] w-full overflow-hidden rounded-full"
      style={{ background: "rgba(143, 168, 120, 0.18)" }}
      role="progressbar"
      aria-valuenow={fill}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Filled portion */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${fill}%`, background: fillColor }}
      />
    </div>
  );
}

// ─── main component ─────────────────────────────────────────

export function OrderStatusClient({ initialOrder, viewer }: OrderStatusClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);

  async function refreshOrder() {
    try {
      const res  = await fetch(`/api/orders/${order.id}`, { cache: "no-store" });
      const data = (await res.json()) as OrderDetails | { error?: string };
      if (!res.ok || !("id" in data)) {
        throw new Error("error" in data && data.error ? data.error : "Не удалось обновить заказ.");
      }
      setOrder(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось обновить заказ.");
    }
  }

  usePolling(refreshOrder, ORDER_STATUS_POLL_INTERVAL_MS);

  const timeEstimate = getTimeEstimate(order);

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-14 pt-0"
      contentClassName="mt-0"
      header={
        <section className="relative flex min-h-12 items-center justify-center">
          <h1 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
            Статус заказа
          </h1>
        </section>
      }
    >
      {/* ── Monolith card ── */}
      <section className="rounded-[34px] border border-black/[0.06] bg-white shadow-[0_16px_34px_rgba(0,0,0,0.07)]">

        {/* Progress bar + status */}
        <div className="px-5 pt-5">
          <ProgressBar order={order} />

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p
                className={cn(
                  "text-[24px] font-bold leading-tight tracking-tight",
                  order.status === "READY"
                    ? "text-[#2d6b30]"
                    : order.status === "CANCELLED"
                      ? "text-stone-400"
                      : "text-stone-950",
                )}
              >
                {getQueueLabel(order)}
              </p>
              {timeEstimate ? (
                <p className="mt-1 text-[15px] font-medium text-stone-400">
                  {timeEstimate}
                </p>
              ) : null}
            </div>
            <StatusBadge status={order.status} className="mt-0.5 shrink-0" />
          </div>
        </div>

        {/* Dashed divider */}
        <div className="mx-5 my-5 border-t border-dashed border-stone-200" />

        {/* Meta row: order number + datetime + total */}
        <div className="flex items-center justify-between gap-4 px-5">
          <div>
            <p className="text-[24px] font-bold tracking-tight text-stone-950">
              {formatOrderNumber(order.publicOrderNumber)}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-stone-400">
              {formatDateTime(order.confirmedAt)}
            </p>
          </div>
          <p className="text-[24px] font-bold tracking-tight text-stone-950">
            {formatMoney(order.totalPrice)}
          </p>
        </div>

        {/* Items list */}
        <div className="mt-3 divide-y divide-stone-100 pb-5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-stone-900">
                  {item.productName}
                </p>
                <p className="mt-0.5 text-[12px] text-stone-400">
                  {item.quantity} шт.
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold text-stone-600">
                {formatMoney(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <section className="mt-4 rounded-[28px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
          {error}
        </section>
      ) : null}

      <Link
        href="/menu#quick-search"
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-brand-600 px-5 py-4 text-[17px] font-semibold text-white shadow-[0_18px_38px_rgba(213,31,54,0.2)] transition hover:bg-brand-700 active:scale-[0.98]"
      >
        Сделать новый заказ
      </Link>
    </CustomerMobileShell>
  );
}
