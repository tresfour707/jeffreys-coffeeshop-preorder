"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import { getProductMedia } from "@/lib/product-media";
import { toOrderRequestItems } from "@/lib/cart";
import type {
  CartLine,
  DemoPaymentDetails,
  DemoPaymentResolution,
  PaymentMethod,
  ProductSummary,
  ViewerSummary,
} from "@/lib/types";

type CartClientProps = {
  viewer: ViewerSummary | null;
};

type PaymentChoice = PaymentMethod | "SBERPAY";

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[21px] w-[21px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="m10 11 .35 6" />
      <path d="m14 11-.35 6" />
      <path d="M6.8 7.5 7.6 20h8.8l.8-12.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M20 12v10H4V12" />
      <path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-[#2d6b30]" : "bg-stone-200",
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-all duration-200",
          checked ? "left-[23px]" : "left-[3px]",
        )}
      />
    </button>
  );
}

function CardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-jeffreys-graphite"
      fill="currentColor"
    >
      <path d="M4.75 6.25h14.5A2.75 2.75 0 0 1 22 9v1H2V9a2.75 2.75 0 0 1 2.75-2.75Z" />
      <path d="M2 11.75h20V15a2.75 2.75 0 0 1-2.75 2.75H4.75A2.75 2.75 0 0 1 2 15v-3.25Zm4.25 2.75a.9.9 0 0 0 0 1.8h3.2a.9.9 0 0 0 0-1.8h-3.2Z" />
    </svg>
  );
}

function SbpMark() {
  return (
    <div className="relative h-9 w-9">
      <span className="absolute left-[2px] top-[4px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#6fbf44]" />
      <span className="absolute left-[12px] top-[1px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#f0b32f]" />
      <span className="absolute left-[12px] top-[17px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#33a3dc]" />
      <span className="absolute left-[22px] top-[9px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#553f91]" />
    </div>
  );
}

function SberPayBadge() {
  return (
    <span className="inline-flex h-9 items-center rounded-[13px] bg-[#40c86a] px-3 text-sm font-bold text-white">
      Pay
    </span>
  );
}

function RadioCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[2.5px] transition",
        checked ? "border-brand-600 bg-brand-600" : "border-stone-300 bg-white",
      )}
    >
      {checked ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
    </span>
  );
}

function PaymentOption({
  checked,
  title,
  icon,
  onClick,
}: {
  checked: boolean;
  title: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[16px] px-2 py-3 text-left transition active:scale-[0.99] active:bg-stone-50"
    >
      <RadioCircle checked={checked} />
      <span className="flex-1 text-[17px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
        {title}
      </span>
      {icon}
    </button>
  );
}

function getCartDisplayName(item: CartLine) {
  if (!item.sizeLabel) return item.name;
  const suffix = ` ${item.sizeLabel}`;
  return item.name.endsWith(suffix) ? item.name.slice(0, -suffix.length) : item.name;
}

function getCartLineProduct(item: CartLine): ProductSummary {
  return {
    id: item.productId,
    name: getCartDisplayName(item),
    displayName: item.name,
    description: item.description,
    price: item.price,
    available: true,
    kind: item.category === "Напитки" ? "DRINK" : "FOOD",
    category: item.category,
    groupKey: item.productId,
    sizeLabel: item.sizeLabel,
    sizeSort: null,
  };
}

function CartItemImage({ item }: { item: CartLine }) {
  const media = getProductMedia(getCartDisplayName(item));
  return (
    <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[18px] border border-black/[0.045] bg-jeffreys-fog">
      {media ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="78px"
          className="object-cover"
          style={{ objectPosition: media.objectPosition ?? "center center" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.92),transparent_36%),linear-gradient(180deg,#ffffff,#f0f0ee)]" />
      )}
    </div>
  );
}

function CartStepper({
  quantity,
  onIncrement,
  onDecrement,
  disabled,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-9 w-[108px] shrink-0 items-center justify-between rounded-[14px] border border-black/[0.055] bg-white px-3 text-jeffreys-graphite shadow-[0_8px_18px_rgba(0,0,0,0.045)]">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        className="flex h-7 w-7 items-center justify-center transition active:scale-90 disabled:opacity-40"
      >
        <span className="h-[2.4px] w-[15px] rounded-full bg-jeffreys-graphite" />
      </button>
      <span className="min-w-5 text-center text-[16px] font-bold leading-none text-jeffreys-graphite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="relative flex h-7 w-7 items-center justify-center transition active:scale-90 disabled:opacity-40"
      >
        <span className="absolute h-[2.4px] w-[15px] rounded-full bg-brand-600" />
        <span className="absolute h-[15px] w-[2.4px] rounded-full bg-brand-600" />
      </button>
    </div>
  );
}

function getPositionsLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} позиций`;
  if (last === 1) return `${count} позиция`;
  if (last >= 2 && last <= 4) return `${count} позиции`;
  return `${count} позиций`;
}

function getPaymentMethod(choice: PaymentChoice): PaymentMethod {
  return choice === "DEMO_CARD" ? "DEMO_CARD" : "DEMO_SBP";
}

export function CartClient({ viewer }: CartClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer?.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const decrementProduct = useCustomerCartStore((state) => state.decrementProduct);
  const clearCart = useCustomerCartStore((state) => state.clear);

  const [isMounted, setIsMounted] = useState(false);
  const [showClearAction, setShowClearAction] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set());
  const [method, setMethod] = useState<PaymentChoice>("DEMO_SBP");
  const [useBonus, setUseBonus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const summary = getCartSummary(items);
  const bonusBalance = viewer?.bonusBalance ?? 0;
  const bonusEarned = Math.floor(summary.totalPrice / 1000);
  const maxBonusToUse = Math.min(bonusBalance, Math.floor(summary.totalPrice / 100));
  const bonusToUse = useBonus ? maxBonusToUse : 0;
  const finalPrice = summary.totalPrice - bonusToUse * 100;

  useEffect(() => {
    if (hasHydrated) setIsMounted(true);
  }, [hasHydrated]);

  useEffect(() => {
    if (items.length === 0) setShowClearAction(false);
  }, [items.length]);

  async function handlePay() {
    if (!viewer) {
      router.push(`/sign-in?next=/cart`);
      return;
    }
    setPayError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: getPaymentMethod(method),
          items: toOrderRequestItems(items),
          bonusToUse,
        }),
      });

      const data = (await response.json()) as DemoPaymentDetails | { error?: string };

      if (!response.ok || !("paymentId" in data)) {
        throw new Error("error" in data && data.error ? data.error : "Не удалось начать оплату.");
      }

      const resolutionResponse = await fetch(`/api/payments/${data.paymentId}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: "SUCCESS" }),
      });

      const resolutionData = (await resolutionResponse.json()) as DemoPaymentResolution | { error?: string };

      if (!resolutionResponse.ok || !("paymentId" in resolutionData)) {
        throw new Error("error" in resolutionData && resolutionData.error ? resolutionData.error : "Не удалось завершить оплату.");
      }

      if (!resolutionData.order) {
        throw new Error("Оплата прошла, но заказ не был создан.");
      }

      clearCart(ownerKey);
      router.push(`/order/${resolutionData.order.id}`);
      router.refresh();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Не удалось провести оплату.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const header = useMemo(
    () => (
      <section className="relative flex min-h-12 items-center justify-center">
        <h1 className="text-[30px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
          Корзина
        </h1>
        {isMounted && items.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowClearAction((c) => !c)}
            aria-label="Показать очистку корзины"
            className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-[14px] text-brand-700 transition active:scale-[0.94] active:bg-brand-50"
          >
            <TrashIcon />
          </button>
        ) : null}
      </section>
    ),
    [isMounted, items.length],
  );

  function handleDecrement(item: CartLine) {
    if (item.quantity > 1) {
      decrementProduct(ownerKey, item.productId);
      return;
    }
    setRemovingIds((s) => new Set(s).add(item.productId));
    window.setTimeout(() => {
      decrementProduct(ownerKey, item.productId);
      setRemovingIds((s) => {
        const next = new Set(s);
        next.delete(item.productId);
        return next;
      });
    }, 180);
  }

  if (!isMounted) {
    return (
      <CustomerMobileShell viewer={viewer} contentClassName="mt-6" className="pb-28 pt-0" header={header}>
        <div className="rounded-[20px] border border-black/[0.06] bg-white px-5 py-6 text-sm text-stone-600 shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
          Загружаем корзину...
        </div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell viewer={viewer} contentClassName="mt-6" className="pb-28 pt-0" header={header}>
        <EmptyState
          title="Пока пусто"
          description="Добавьте позицию из меню, и она появится здесь."
          action={
            <Link href="/menu#quick-search" className="btn-primary">
              Вернуться в меню
            </Link>
          }
        />
      </CustomerMobileShell>
    );
  }

  return (
    <CustomerMobileShell viewer={viewer} contentClassName="mt-6" className="pb-40 pt-0" header={header}>

      {/* Состав корзины */}
      <section className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white px-3 py-1 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        {items.map((item, index) => {
          const isRemoving = removingIds.has(item.productId);
          const product = getCartLineProduct(item);
          return (
            <article
              key={item.productId}
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out",
                isRemoving ? "max-h-0 -translate-y-2 opacity-0" : "max-h-[112px] translate-y-0 opacity-100",
              )}
            >
              <div className={cn("grid grid-cols-[78px_minmax(0,1fr)_auto] items-center gap-3 py-3", index > 0 ? "border-t border-black/[0.06]" : "")}>
                <CartItemImage item={item} />
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[16px] font-semibold leading-[1.14] tracking-tight text-jeffreys-graphite">
                    {getCartDisplayName(item)}
                  </h2>
                  <p className="mt-2 text-[14px] font-bold leading-none text-jeffreys-graphite">
                    {formatMoney(item.price)}
                    {item.sizeLabel ? (
                      <span className="font-normal text-stone-400"> · {item.sizeLabel}</span>
                    ) : null}
                  </p>
                </div>
                <CartStepper
                  quantity={item.quantity}
                  disabled={isRemoving}
                  onIncrement={() => addProduct(ownerKey, product)}
                  onDecrement={() => handleDecrement(item)}
                />
              </div>
            </article>
          );
        })}
      </section>

      <Link
        href="/menu#quick-search"
        className="mt-4 flex min-h-11 items-center justify-center rounded-[16px] border border-black/[0.055] bg-white/88 px-5 text-[15px] font-semibold tracking-tight text-jeffreys-graphite shadow-[0_14px_28px_rgba(0,0,0,0.045)] backdrop-blur-[22px] transition active:scale-[0.98]"
      >
        Добавить ещё
      </Link>

      {/* Бонусы */}
      {viewer ? (
        <div className="mt-4 overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
          {/* Заголовок */}
          <div className="flex items-center justify-between gap-3 px-4 pt-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f4e3] text-[#2d6b30]">
                <GiftIcon />
              </span>
              <div>
                <p className="text-[13px] font-bold leading-none text-jeffreys-graphite">
                  Бонусы
                </p>
                <p className="mt-1 text-[12px] leading-none text-stone-400">
                  У вас {bonusBalance} бонусов
                </p>
              </div>
            </div>
            <Toggle
              checked={useBonus && maxBonusToUse > 0}
              onChange={() => maxBonusToUse > 0 && setUseBonus((v) => !v)}
            />
          </div>

          {/* Нижняя строка */}
          <div className="mt-3 border-t border-black/[0.05] px-4 py-3">
            {useBonus && maxBonusToUse > 0 ? (
              <p className="text-[13px] font-medium text-[#2d6b30]">
                Спишем{" "}
                <span className="font-bold">{bonusToUse} бонусов</span>
                {" "}— скидка {formatMoney(bonusToUse * 100)}
              </p>
            ) : (
              <p className="text-[13px] font-medium text-stone-500">
                {bonusEarned > 0 ? (
                  <>
                    Начислим{" "}
                    <span className="font-bold text-[#2d6b30]">+{bonusEarned} бонусов</span>{" "}
                    за этот заказ
                  </>
                ) : (
                  "За каждый заказ начисляем бонусы"
                )}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* Способ оплаты */}
      <section className="mt-4 rounded-[22px] border border-black/[0.06] bg-white px-4 py-2 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        <p className="px-2 pt-3 text-[12px] font-bold uppercase tracking-[0.18em] text-stone-400">
          Способ оплаты
        </p>
        <div className="mt-1 divide-y divide-black/[0.06]">
          <PaymentOption
            checked={method === "DEMO_SBP"}
            title="СБП"
            icon={<SbpMark />}
            onClick={() => setMethod("DEMO_SBP")}
          />
          <PaymentOption
            checked={method === "DEMO_CARD"}
            title="Карта"
            icon={<CardIcon />}
            onClick={() => setMethod("DEMO_CARD")}
          />
          <PaymentOption
            checked={method === "SBERPAY"}
            title="SberPay"
            icon={<SberPayBadge />}
            onClick={() => setMethod("SBERPAY")}
          />
        </div>
      </section>

      {payError ? (
        <div className="mt-4 rounded-[18px] border border-red-100 bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
          {payError}
        </div>
      ) : null}

      {/* Clear cart */}
      {showClearAction ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.65rem)] z-40 px-4">
          <div className="mx-auto w-full max-w-[398px]">
            <button
              type="button"
              onClick={() => { clearCart(ownerKey); setShowClearAction(false); }}
              className="w-full rounded-[16px] bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(213,31,54,0.22)] transition active:scale-[0.97]"
            >
              Очистить корзину
            </button>
          </div>
        </div>
      ) : null}

      {/* Action bar */}
      <div className="customer-action-bar">
        <div
          key={`${summary.itemsCount}-${summary.totalPrice}`}
          className="customer-action-bar-inner flex animate-[cartBarRefresh_160ms_ease-out] items-center justify-between gap-4 px-4 py-3"
        >
          <div>
            <p className="text-sm text-stone-500">{getPositionsLabel(summary.itemsCount)}</p>
            {bonusToUse > 0 ? (
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-[13px] leading-none text-stone-400 line-through">
                  {formatMoney(summary.totalPrice)}
                </p>
                <p className="text-lg font-bold tracking-tight text-jeffreys-graphite">
                  {formatMoney(finalPrice)}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-lg font-bold tracking-tight text-jeffreys-graphite">
                {formatMoney(summary.totalPrice)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={isSubmitting}
            className="rounded-[16px] bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(213,31,54,0.2)] transition hover:bg-brand-700 active:scale-[0.97] disabled:cursor-wait disabled:bg-stone-300 disabled:shadow-none"
          >
            {isSubmitting ? "Оплачиваем…" : viewer ? "Оплатить" : "Войти и оплатить"}
          </button>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
