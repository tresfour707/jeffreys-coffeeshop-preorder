"use client";

import { useEffect, useState } from "react";

import { ProductArtwork } from "@/components/customer/product-artwork";
import { QuantityControl } from "@/components/ui/quantity-control";
import { sortProductVariants } from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary, ProductSummary } from "@/lib/types";

type ProductSheetProps = {
  product: MenuProductSummary;
  onClose: () => void;
  onAdd: (variant: ProductSummary, quantity: number) => void;
};

export function ProductSheet({
  product,
  onClose,
  onAdd,
}: ProductSheetProps) {
  const availableVariants = sortProductVariants(
    product.variants.filter((variant) => variant.available),
  );
  const firstAvailableVariantId = availableVariants[0]?.id ?? "";
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariantId);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    availableVariants.find((variant) => variant.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

  useEffect(() => {
    setSelectedVariantId(firstAvailableVariantId);
    setQuantity(1);
  }, [firstAvailableVariantId, product.id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-jeffreys-black/34 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Закрыть карточку товара"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border border-black/[0.06] bg-white shadow-[0_-18px_54px_rgba(0,0,0,0.18)]">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-brand-600/26" />

        <div className="overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">
                {product.kind === "DRINK" ? "Напитки" : product.category}
              </p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-tight text-jeffreys-graphite">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border border-black/[0.055] bg-jeffreys-fog text-[26px] text-jeffreys-graphite transition active:scale-[0.96]"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            <ProductArtwork product={product} emphasis="sheet" />
          </div>

          {product.description ? (
            <p className="mt-4 text-sm leading-6 text-stone-600">{product.description}</p>
          ) : null}

          <section className="mt-5 rounded-[20px] border border-black/[0.06] bg-white px-4 py-4 shadow-[0_14px_32px_rgba(0,0,0,0.055)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker text-stone-400">Стоимость</p>
                <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
                  {selectedVariant
                    ? formatMoney(selectedVariant.price)
                    : formatMoney(product.priceFrom)}
                </p>
              </div>
            </div>

            {availableVariants.length > 1 ||
            availableVariants.some((variant) => variant.sizeLabel !== null) ? (
              <div className="mt-5">
                <p className="kicker text-stone-400">Объём</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-[14px] border px-4 py-3 text-sm font-bold transition ${
                          isSelected
                            ? "border-brand-600 bg-brand-600 text-white shadow-[0_10px_22px_rgba(213,31,54,0.16)]"
                            : "border-black/[0.055] bg-white text-jeffreys-graphite shadow-sm"
                        }`}
                      >
                        {variant.sizeLabel ?? "Стандарт"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="kicker text-stone-400">Количество</p>
              </div>

              <QuantityControl
                quantity={quantity}
                onIncrement={() => setQuantity((current) => current + 1)}
                onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>
          </section>
        </div>

        <div className="border-t border-black/[0.06] bg-white px-4 py-4">
          <div className="customer-action-bar-inner max-w-none px-3 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">{quantity} шт.</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-jeffreys-graphite">
                  {selectedVariant
                    ? formatMoney(selectedVariant.price * quantity)
                    : formatMoney(product.priceFrom * quantity)}
                </p>
              </div>

              <button
                type="button"
                disabled={!selectedVariant}
                onClick={() => {
                  if (!selectedVariant) {
                    return;
                  }

                  onAdd(selectedVariant, quantity);
                  onClose();
                }}
                className="rounded-[16px] bg-brand-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(213,31,54,0.2)] transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
