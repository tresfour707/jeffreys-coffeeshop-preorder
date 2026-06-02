"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { ProductGridCard } from "@/components/customer/product-grid-card";
import { ProductSheet } from "@/components/customer/product-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import type {
  MenuProductSummary,
  ProductSummary,
  ViewerSummary,
} from "@/lib/types";

type PurchasedClientProps = {
  purchasedProducts: MenuProductSummary[];
  otherProducts: MenuProductSummary[];
  viewer: ViewerSummary;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[24px] w-[24px] text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.75 15.75 20.5 20.5" />
    </svg>
  );
}

function SmallSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.75 15.75 20.5 20.5" />
    </svg>
  );
}

function getSearchText(product: MenuProductSummary) {
  return [
    product.name,
    product.category ?? "",
    product.description ?? "",
    product.variants.map((variant) => variant.sizeLabel ?? "").join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function PurchasedClient({
  purchasedProducts,
  otherProducts,
  viewer,
}: PurchasedClientProps) {
  const ownerKey = getCartOwnerKey(viewer.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cartSummary = getCartSummary(items);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const normalizedQuery = query.trim().toLowerCase();
  const queryTokens = useMemo(
    () => normalizedQuery.split(/\s+/).filter(Boolean),
    [normalizedQuery],
  );
  const isSearching = queryTokens.length > 0;
  const visiblePurchasedProducts = useMemo(() => {
    if (!isSearching) {
      return purchasedProducts;
    }

    return purchasedProducts.filter((product) => {
      const searchText = getSearchText(product);

      return queryTokens.every((token) => searchText.includes(token));
    });
  }, [isSearching, purchasedProducts, queryTokens]);
  const visibleOtherProducts = useMemo(() => {
    if (!isSearching) {
      return otherProducts;
    }

    return otherProducts.filter((product) => {
      const searchText = getSearchText(product);

      return queryTokens.every((token) => searchText.includes(token));
    });
  }, [isSearching, otherProducts, queryTokens]);
  const visibleProductsCount =
    visiblePurchasedProducts.length + visibleOtherProducts.length;

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell viewer={viewer} className="pb-28 pt-0" contentClassName="mt-0">
      <section className="space-y-6">
        <div className="sticky top-[82px] z-20 -mx-1 flex items-center gap-3 bg-white/78 px-1 py-2 backdrop-blur-[22px]">
          <BackLink />

          {isSearchOpen ? (
            <div className="flex min-h-12 flex-1 items-center gap-3 rounded-[16px] border border-black/[0.055] bg-white/88 px-4 shadow-[0_12px_26px_rgba(0,0,0,0.055)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-brand-50">
                <SmallSearchIcon />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти товар"
                className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-stone-950 outline-none placeholder:text-stone-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (query) {
                    setQuery("");
                    inputRef.current?.focus();
                    return;
                  }

                  setIsSearchOpen(false);
                }}
                aria-label={query ? "Очистить поиск" : "Закрыть поиск"}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-jeffreys-fog text-[18px] leading-none text-jeffreys-graphite"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <h1 className="flex-1 text-[30px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
                Вы покупали
              </h1>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Найти товар"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-black/[0.055] bg-white/86 shadow-[0_10px_22px_rgba(0,0,0,0.055)] transition active:scale-[0.94]"
              >
                <SearchIcon />
              </button>
            </>
          )}
        </div>

        {isSearching ? (
          <h2 className="text-[28px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
            Нашли {visibleProductsCount} позиций
          </h2>
        ) : null}

        {isSearching && visibleProductsCount === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте другое название."
          />
        ) : visiblePurchasedProducts.length === 0 && !isSearching ? (
          <EmptyState
            title="Пока нет покупок"
            description="После первого online-заказа здесь появятся ваши любимые позиции."
          />
        ) : (
          <div className="grid auto-rows-fr grid-cols-2 gap-3.5">
            {visiblePurchasedProducts.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                onOpen={setActiveProduct}
                stableLayout
              />
            ))}
          </div>
        )}

        {visibleOtherProducts.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-[26px] font-semibold leading-none tracking-tight text-jeffreys-graphite">
              {isSearching ? "Еще в меню" : "Остальное меню"}
            </h2>
            <div className="grid auto-rows-fr grid-cols-2 gap-3.5">
              {visibleOtherProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onOpen={setActiveProduct}
                  stableLayout
                />
              ))}
            </div>
          </section>
        ) : null}
      </section>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <FloatingCartLink
          itemsCount={cartSummary.itemsCount}
          totalPrice={cartSummary.totalPrice}
        />
      ) : null}

      {activeProduct ? (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAdd={handleAddProduct}
        />
      ) : null}
    </CustomerMobileShell>
  );
}
