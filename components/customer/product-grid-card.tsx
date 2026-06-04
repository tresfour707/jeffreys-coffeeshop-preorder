"use client";

import { ProductArtwork } from "@/components/customer/product-artwork";
import { cn } from "@/lib/cn";
import { sortProductVariants } from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary } from "@/lib/types";

type ProductGridCardProps = {
  product: MenuProductSummary;
  onOpen: (product: MenuProductSummary) => void;
  stableLayout?: boolean;
  compact?: boolean;
  className?: string;
  tone?: "light" | "dark";
  showAddButton?: boolean;
};

function getProductMeta(product: MenuProductSummary) {
  const firstVariant = sortProductVariants(
    product.variants.filter((variant) => variant.available),
  )[0];

  return formatMoney(firstVariant?.price ?? product.priceFrom);
}

function PlusGlyph({ compact }: { compact: boolean }) {
  return (
    <span className={cn("relative block", compact ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]")}>
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white",
          compact ? "h-[2px] w-[14px]" : "h-[2.25px] w-[16px]",
        )}
      />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white",
          compact ? "h-[14px] w-[2px]" : "h-[16px] w-[2.25px]",
        )}
      />
    </span>
  );
}

export function ProductGridCard({
  product,
  onOpen,
  stableLayout = false,
  compact = false,
  className,
  tone = "light",
  showAddButton = true,
}: ProductGridCardProps) {
  const isDark = tone === "dark";

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden border",
        isDark
          ? "border-[#f4ecdc]/8 bg-[#171d20] shadow-none"
          : "border-black/[0.055] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.055)]",
        compact ? "rounded-[18px] p-1.5" : "rounded-[20px] p-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        disabled={!product.available}
        className="flex w-full flex-1 flex-col text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ProductArtwork
          product={product}
          size={compact ? "compact" : "regular"}
          className={cn(
            compact ? "rounded-[14px]" : "rounded-[16px]",
            isDark ? "bg-[#142227]" : "",
          )}
        />

        <div className={cn("flex flex-1 flex-col px-1 pb-1", compact ? "pt-2.5" : "pt-3")}>
          <h2
            className={cn(
              "font-medium leading-[1.16] tracking-tight",
              isDark ? "text-[#f4ecdc]" : "text-stone-950",
              compact ? "text-[15px]" : "text-[17px]",
              stableLayout ? (compact ? "min-h-[42px]" : "min-h-[62px]") : "",
            )}
          >
            {product.name}
          </h2>
          <p
            className={cn(
              "font-medium leading-none",
              isDark ? "text-[#f4ecdc]/58" : "text-brand-900/52",
              stableLayout ? "mt-auto" : compact ? "mt-1.5" : "mt-2",
              compact ? "text-[13px]" : "text-[13px]",
            )}
          >
            {product.available ? getProductMeta(product) : "Меня разобрали"}
          </p>
        </div>
      </button>

      {showAddButton ? (
        <div className={cn("mt-auto px-1 pb-1", compact ? "pt-1.5" : "pt-2")}>
          <button
            type="button"
            aria-label={`Добавить ${product.name}`}
            disabled={!product.available}
            onClick={() => onOpen(product)}
            className={cn(
              "ml-auto flex items-center justify-center rounded-full bg-brand-600 shadow-[0_12px_24px_rgba(7,56,74,0.2)] transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none",
              compact ? "h-8 w-[58px]" : "h-10 w-[74px]",
            )}
          >
            <PlusGlyph compact={compact} />
          </button>
        </div>
      ) : null}
    </article>
  );
}
