"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import type { CartLine, ProductSummary, ViewerSummary } from "@/lib/types";

type CartClientProps = {
  viewer: ViewerSummary | null;
};

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

function getCartDisplayName(item: CartLine) {
  if (!item.sizeLabel) {
    return item.name;
  }

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

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} позиций`;
  }

  if (last === 1) {
    return `${count} позиция`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} позиции`;
  }

  return `${count} позиций`;
}

export function CartClient({ viewer }: CartClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const decrementProduct = useCustomerCartStore((state) => state.decrementProduct);
  const clearCart = useCustomerCartStore((state) => state.clear);
  const [isMounted, setIsMounted] = useState(false);
  const [showClearAction, setShowClearAction] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set());
  const summary = getCartSummary(items);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (items.length === 0) {
      setShowClearAction(false);
    }
  }, [items.length]);

  const header = useMemo(
    () => (
      <section className="relative flex min-h-12 items-center justify-center">
        <h1 className="text-[30px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
          Корзина
        </h1>

        {isMounted && items.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowClearAction((current) => !current)}
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

    setRemovingIds((current) => new Set(current).add(item.productId));
    window.setTimeout(() => {
      decrementProduct(ownerKey, item.productId);
      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(item.productId);

        return next;
      });
    }, 180);
  }

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        contentClassName="mt-6"
        className="pb-28 pt-0"
        header={header}
      >
        <div className="rounded-[20px] border border-black/[0.06] bg-white px-5 py-6 text-sm text-stone-600 shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
          Загружаем корзину...
        </div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        contentClassName="mt-6"
        className="pb-28 pt-0"
        header={header}
      >
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
    <CustomerMobileShell
      viewer={viewer}
      contentClassName="mt-6"
      className="pb-36 pt-0"
      header={header}
    >
      <section className="overflow-hidden rounded-[22px] border border-black/[0.06] bg-white px-3 py-1 shadow-[0_16px_34px_rgba(0,0,0,0.06)]">
        {items.map((item, index) => {
          const isRemoving = removingIds.has(item.productId);
          const product = getCartLineProduct(item);

          return (
            <article
              key={item.productId}
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out",
                isRemoving
                  ? "max-h-0 -translate-y-2 opacity-0"
                  : "max-h-[112px] translate-y-0 opacity-100",
              )}
            >
              <div
                className={cn(
                  "grid grid-cols-[78px_minmax(0,1fr)_auto] items-center gap-3 py-3",
                  index > 0 ? "border-t border-black/[0.06]" : "",
                )}
              >
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
        className="mt-5 flex min-h-12 items-center justify-center rounded-[16px] border border-black/[0.055] bg-white/88 px-5 text-[16px] font-bold tracking-tight text-jeffreys-graphite shadow-[0_14px_28px_rgba(0,0,0,0.055)] backdrop-blur-[22px] transition active:scale-[0.98]"
      >
        Вернуться в меню
      </Link>

      {showClearAction ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.65rem)] z-40 px-4">
          <div className="mx-auto w-full max-w-[398px]">
            <button
              type="button"
              onClick={() => {
                clearCart(ownerKey);
                setShowClearAction(false);
              }}
              className="w-full rounded-[16px] bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(213,31,54,0.22)] transition active:scale-[0.97]"
            >
              Очистить корзину
            </button>
          </div>
        </div>
      ) : null}

      <div className="customer-action-bar">
        <div
          key={`${summary.itemsCount}-${summary.totalPrice}`}
          className="customer-action-bar-inner flex animate-[cartBarRefresh_160ms_ease-out] items-center justify-between gap-4 px-4 py-3 transition-all duration-200"
        >
          <div>
            <p className="text-sm text-stone-500">{getPositionsLabel(summary.itemsCount)}</p>
            <p className="mt-1 text-lg font-bold tracking-tight text-jeffreys-graphite">
              {formatMoney(summary.totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-[16px] bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(213,31,54,0.2)] transition hover:bg-brand-700 active:scale-[0.97]"
          >
            К оформлению
          </Link>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
