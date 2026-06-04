"use client";

import { useEffect, useState } from "react";

import { FavoriteProductButton } from "@/components/customer/favorite-product-button";
import { ProductArtwork } from "@/components/customer/product-artwork";
import { QuantityControl } from "@/components/ui/quantity-control";
import { cn } from "@/lib/cn";
import { sortProductVariants } from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary, ProductSummary } from "@/lib/types";

type ProductSheetProps = {
  product: MenuProductSummary;
  onClose: () => void;
  onAdd: (variant: ProductSummary, quantity: number) => void;
  tone?: "light" | "dark";
};

export function ProductSheet({
  product,
  onClose,
  onAdd,
  tone = "light",
}: ProductSheetProps) {
  const isDark = tone === "dark";
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-jeffreys-black/52 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Закрыть карточку товара"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] border shadow-[0_-18px_54px_rgba(0,0,0,0.22)]",
          isDark
            ? "customer-product-sheet-surface-dark border-[#f4ecdc]/8 text-[#f4ecdc]"
            : "customer-product-sheet-surface-light border-black/[0.06] text-jeffreys-graphite",
        )}
      >
        <div className="overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={cn("text-xs font-bold uppercase tracking-[0.18em]", isDark ? "text-[#f4ecdc]/58" : "text-brand-600")}>
                {product.category ?? (product.kind === "DRINK" ? "Напитки" : "Меню")}
              </p>
              <h2
                className={cn(
                  "mt-2 text-[32px] font-semibold leading-[0.96] tracking-tight",
                  isDark ? "text-[#f4ecdc]" : "text-jeffreys-graphite",
                )}
              >
                {product.name}
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <FavoriteProductButton
                productId={product.id}
                productName={product.name}
                tone={tone}
              />

              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border text-[26px] transition active:scale-[0.96]",
                  isDark
                    ? "border-[#f4ecdc]/8 bg-[#f4ecdc]/7 text-[#f4ecdc]/78"
                    : "border-black/[0.055] bg-jeffreys-fog text-jeffreys-graphite",
                )}
              >
                ×
              </button>
            </div>
          </div>

          <div className="mt-4">
            <ProductArtwork
              product={product}
              emphasis="sheet"
              className={isDark ? "bg-[#142227]" : undefined}
            />
          </div>

          {product.description ? (
            <p className={cn("mt-4 text-sm leading-6", isDark ? "text-[#f4ecdc]/62" : "text-stone-600")}>
              {product.description}
            </p>
          ) : null}

          <section
            className={cn(
              "mt-5 rounded-[20px] border px-4 py-4",
              isDark ? "customer-product-glass-card-dark" : "customer-product-glass-card-light",
            )}
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={cn("kicker", isDark ? "text-[#f4ecdc]/42" : "text-stone-400")}>Стоимость</p>
                <p
                  className={cn(
                    "mt-2 text-[32px] font-semibold leading-none tracking-tight",
                    isDark ? "text-[#f4ecdc]" : "text-jeffreys-graphite",
                  )}
                >
                  {selectedVariant
                    ? formatMoney(selectedVariant.price)
                    : formatMoney(product.priceFrom)}
                </p>
              </div>
            </div>

            {availableVariants.length > 1 ||
            availableVariants.some((variant) => variant.sizeLabel !== null) ? (
              <div className="mt-5">
                <p className={cn("kicker", isDark ? "text-[#f4ecdc]/42" : "text-stone-400")}>Объём</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "rounded-[14px] border px-4 py-3 text-sm font-bold transition",
                          isSelected
                            ? isDark
                              ? "border-[#d9c7aa]/58 bg-[#d9c7aa]/14 text-[#f4ecdc] shadow-[0_10px_22px_rgba(244,236,220,0.045)]"
                              : "border-brand-900/16 bg-brand-900/[0.075] text-brand-900 shadow-[0_10px_22px_rgba(7,56,74,0.08)]"
                            : isDark
                              ? "border-[#f4ecdc]/8 bg-[#f4ecdc]/7 text-[#f4ecdc]/72"
                              : "border-black/[0.055] bg-white/72 text-jeffreys-graphite shadow-sm",
                        )}
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
                <p className={cn("kicker", isDark ? "text-[#f4ecdc]/42" : "text-stone-400")}>Количество</p>
              </div>

              <QuantityControl
                tone={tone}
                quantity={quantity}
                onIncrement={() => setQuantity((current) => current + 1)}
                onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>
          </section>
        </div>

        <div
          className={cn(
            "border-t px-4 py-4",
            isDark
              ? "border-[#f4ecdc]/8 bg-black/0"
              : "border-black/[0.06] bg-white/0",
          )}
        >
          <div
            className={cn(
              "max-w-none rounded-[22px] border px-3 py-3",
              isDark ? "customer-product-glass-card-dark" : "customer-product-glass-card-light",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className={cn("text-sm", isDark ? "text-[#f4ecdc]/52" : "text-stone-500")}>{quantity} шт.</p>
                <p
                  className={cn(
                    "mt-1 text-lg font-bold tracking-tight",
                    isDark ? "text-[#f4ecdc]" : "text-jeffreys-graphite",
                  )}
                >
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
                className={cn(
                  "rounded-[16px] px-5 py-3.5 text-sm font-bold shadow-[0_14px_28px_rgba(0,0,0,0.12)] transition disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none",
                  isDark
                    ? "bg-[#d9c7aa] text-[#101719] hover:bg-[#eadcc5]"
                    : "bg-brand-900 text-white hover:bg-brand-700",
                )}
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
