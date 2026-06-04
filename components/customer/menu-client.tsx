"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ProductArtwork } from "@/components/customer/product-artwork";
import { ProductGridCard } from "@/components/customer/product-grid-card";
import { ProductSheet } from "@/components/customer/product-sheet";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { buildMenuCategoryEntries } from "@/lib/menu-catalog";
import { formatOrderNumber } from "@/lib/format";
import { statusLabels } from "@/lib/labels";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type {
  MenuProductSummary,
  ProductSummary,
  PublicQueueSummary,
  UserOrderSummary,
  ViewerSummary,
} from "@/lib/types";

type MenuClientProps = {
  products: MenuProductSummary[];
  purchasedProducts: MenuProductSummary[];
  trackableOrders: UserOrderSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

type MenuTheme = "light" | "dark";

const MENU_THEME_STORAGE_KEY = "jeffreys-menu-theme";
const CATEGORY_NAV_STICKY_OFFSET = 76;

function getOrderStatusTone(status: UserOrderSummary["status"]) {
  switch (status) {
    case "READY":
      return {
        dotClassName: "bg-[#6f9a61]",
        textClassName: "text-[#456f42]",
        chipClassName: "bg-[#e4f1df] text-[#456f42]",
      };
    case "PREPARING":
      return {
        dotClassName: "bg-[#8fa878]",
        textClassName: "text-[#5f754f]",
        chipClassName: "bg-[#e7efdd] text-[#5f754f]",
      };
    case "WAITING":
      return {
        dotClassName: "bg-brand-600",
        textClassName: "text-brand-700",
        chipClassName: "bg-brand-50 text-brand-700",
      };
    case "CANCELLED":
      return {
        dotClassName: "bg-stone-400",
        textClassName: "text-stone-500",
        chipClassName: "bg-stone-200 text-stone-600",
      };
    default:
      return {
        dotClassName: "bg-stone-400",
        textClassName: "text-stone-500",
        chipClassName: "bg-jeffreys-fog text-stone-600",
      };
  }
}

function getActiveOrdersLabel(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} активных`;
  }

  if (lastDigit === 1) {
    return `${count} активный`;
  }

  return `${count} активных`;
}

function getOrderPriority(order: UserOrderSummary) {
  if (order.status === "READY") {
    return 0;
  }

  if (order.status === "PREPARING") {
    return 1;
  }

  return 2;
}

function ActiveOrderTracker({
  orders,
  theme,
}: {
  orders: UserOrderSummary[];
  theme: MenuTheme;
}) {
  if (orders.length === 0) {
    return null;
  }

  const sortedOrders = [...orders].sort((first, second) => {
    const priorityDiff = getOrderPriority(first) - getOrderPriority(second);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const queueDiff = first.ordersAhead - second.ordersAhead;

    if (queueDiff !== 0) {
      return queueDiff;
    }

    return (
      new Date(second.confirmedAt).getTime() - new Date(first.confirmedAt).getTime()
    );
  });
  const [primaryOrder, ...otherOrders] = sortedOrders;
  const statusTone = getOrderStatusTone(primaryOrder.status);
  const hasMultipleOrders = otherOrders.length > 0;
  const href = hasMultipleOrders ? "/orders/current" : `/order/${primaryOrder.id}`;
  const isDark = theme === "dark";

  return (
    <section className="mt-5 px-5">
      <Link
        href={href}
        className={cn(
          "group flex min-h-[72px] items-center gap-4 rounded-[20px] border px-4 py-3 no-underline backdrop-blur-[22px] transition active:scale-[0.99]",
          isDark
            ? "border-[#f4ecdc]/8 bg-[#101719]/86 text-[#f4ecdc] shadow-[0_18px_42px_rgba(0,0,0,0.3)]"
            : "border-brand-900/8 bg-white/72 text-brand-900 shadow-[0_16px_34px_rgba(7,56,74,0.08)]",
        )}
      >
        <span className={cn("shrink-0 text-[22px] font-semibold leading-none tracking-tight", isDark ? "text-[#f4ecdc]" : "text-brand-900")}>
          {formatOrderNumber(primaryOrder.publicOrderNumber)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", statusTone.dotClassName)}
            />
            <span
              className={cn(
                "truncate text-[17px] font-medium leading-none tracking-tight",
                primaryOrder.status === "WAITING"
                  ? isDark ? "text-[#f4ecdc]/88" : "text-brand-700"
                  : isDark ? "text-[#f4ecdc]/74" : "text-brand-900/62",
              )}
            >
              {statusLabels[primaryOrder.status]}
            </span>
          </span>
        </span>

        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold leading-none",
            isDark ? "bg-[#f4ecdc]/10 text-[#f4ecdc]/78" : "bg-brand-900/7 text-brand-900/68",
          )}
        >
          {hasMultipleOrders ? getActiveOrdersLabel(sortedOrders.length) : "Открыть"}
        </span>

        <span className={cn("shrink-0 text-[26px] font-light leading-none transition group-active:translate-x-0.5", isDark ? "text-[#f4ecdc]/42" : "text-brand-900/34")}>
          ›
        </span>
      </Link>
    </section>
  );
}

function getMenuSectionId(category: string) {
  return `menu-section-${category
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-|-$/g, "")}`;
}

function HeroPurchasedShowcase({
  products,
  fallbackProducts,
  onOpen,
  theme,
  hasAccount,
}: {
  products: MenuProductSummary[];
  fallbackProducts: MenuProductSummary[];
  onOpen: (product: MenuProductSummary) => void;
  theme: MenuTheme;
  hasAccount: boolean;
}) {
  const hasPurchaseHistory = hasAccount && products.length > 0;
  const popularProducts = fallbackProducts.filter((product) => product.kind === "DRINK");
  const visibleProducts = (hasPurchaseHistory ? products : popularProducts).slice(0, 8);
  const isDark = theme === "dark";
  const title = hasPurchaseHistory ? "Вы заказывали" : "Популярное сейчас";

  return (
    <section
      className="relative -mx-4 overflow-hidden px-4 pb-3 pt-[82px]"
    >
      <div className="relative z-10">
        <div className="flex items-end justify-between gap-4 px-1">
          <div>
            <h1
              className={cn(
                "font-medium leading-none tracking-tight",
                hasPurchaseHistory ? "text-[29px]" : "text-[23px]",
                isDark ? "text-[#f4ecdc]" : "text-brand-900",
              )}
            >
              {title}
            </h1>
          </div>

          {hasPurchaseHistory ? (
            <Link
              href="/menu/purchased"
              className={cn(
                "mb-0.5 inline-flex h-9 items-center rounded-full px-4 text-[14px] font-semibold leading-none backdrop-blur-[18px] transition active:scale-[0.97]",
                isDark
                  ? "bg-[#f4ecdc]/12 text-[#f4ecdc]/76 ring-1 ring-[#f4ecdc]/10"
                  : "bg-white/72 text-brand-900/68 ring-1 ring-brand-900/8",
              )}
            >
              Все
            </Link>
          ) : null}
        </div>

        {visibleProducts.length > 0 ? (
          <div className="mt-5 -mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            <div className="flex gap-3.5">
              {visibleProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onOpen(product)}
                  className={cn(
                    "flex w-[148px] shrink-0 flex-col rounded-[20px] p-2 text-left transition active:scale-[0.98]",
                    isDark
                      ? "bg-[#171d20] shadow-none"
                      : "bg-white shadow-none",
                  )}
                >
                  <ProductArtwork
                    product={product}
                    size="compact"
                    className={cn(
                      "jeffreys-repeat-product-art shrink-0 rounded-[16px]",
                      isDark ? "bg-[#142227]" : "",
                    )}
                  />
                  <span className="mt-3 min-w-0 px-1 pb-1">
                    <span className={cn("line-clamp-2 block min-h-[37px] text-[14px] font-semibold leading-[1.25]", isDark ? "text-[#f4ecdc]" : "text-brand-900")}>
                      {product.name}
                    </span>
                    <span className={cn("mt-2 block text-[13px] font-medium leading-none", isDark ? "text-[#f4ecdc]/58" : "text-brand-900/52")}>
                      {formatMoney(product.priceFrom)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function MenuClient({
  products,
  purchasedProducts,
  trackableOrders,
  viewer,
  initialQueueSummary: _initialQueueSummary,
  queueHeadline: _queueHeadline,
}: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);
  const [menuTheme, setMenuTheme] = useState<MenuTheme>("light");
  const categoryEntries = useMemo(() => buildMenuCategoryEntries(products), [products]);
  const [activeCategory, setActiveCategory] = useState(categoryEntries[0]?.category ?? "");
  const [isCategoryNavStuck, setIsCategoryNavStuck] = useState(false);
  const categoryNavRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    const storedTheme =
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(MENU_THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
      setMenuTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (
      categoryEntries.length > 0 &&
      !categoryEntries.some((entry) => entry.category === activeCategory)
    ) {
      setActiveCategory(categoryEntries[0].category);
    }
  }, [activeCategory, categoryEntries]);

  useEffect(() => {
    if (categoryEntries.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];

        if (!visibleEntry) {
          return;
        }

        const category = visibleEntry.target.getAttribute("data-menu-category");

        if (category) {
          setActiveCategory(category);
        }
      },
      {
        rootMargin: "-150px 0px -52% 0px",
        threshold: [0, 0.2, 0.6],
      },
    );

    for (const entry of categoryEntries) {
      const section = document.getElementById(getMenuSectionId(entry.category));

      if (section) {
        observer.observe(section);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [categoryEntries]);

  useEffect(() => {
    tabRefs.current[activeCategory]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategory]);

  useEffect(() => {
    let animationFrame = 0;

    function updateCategoryNavState() {
      const node = categoryNavRef.current;

      if (!node) {
        return;
      }

      setIsCategoryNavStuck(
        node.getBoundingClientRect().top <= CATEGORY_NAV_STICKY_OFFSET + 0.5,
      );
    }

    function scheduleUpdate() {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateCategoryNavState();
      });
    }

    updateCategoryNavState();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const cartSummary = getCartSummary(items);

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  function handleCategorySelect(category: string) {
    setActiveCategory(category);
    document.getElementById(getMenuSectionId(category))?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleThemeToggle() {
    setMenuTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      if (typeof window !== "undefined") {
        window.localStorage.setItem(MENU_THEME_STORAGE_KEY, nextTheme);
      }

      return nextTheme;
    });
  }

  const isDarkTheme = menuTheme === "dark";

  return (
    <CustomerMobileShell
      viewer={viewer}
      chrome={menuTheme}
      menuChromeExpanded={isCategoryNavStuck}
      onThemeToggle={handleThemeToggle}
      contentClassName="mt-0"
      className="pb-0 pt-0"
    >
      <HeroPurchasedShowcase
        products={purchasedProducts}
        fallbackProducts={products}
        onOpen={setActiveProduct}
        theme={menuTheme}
        hasAccount={viewer !== null}
      />

      <ActiveOrderTracker orders={trackableOrders} theme={menuTheme} />

      <section
        ref={categoryNavRef}
        className={cn(
          "jeffreys-menu-tabs sticky top-[75px] z-40 -mx-4",
          !isDarkTheme ? "jeffreys-menu-tabs-light" : "",
        )}
      >
        <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2.5 pt-1.5">
          {categoryEntries.map((entry) => {
            const isActive = entry.category === activeCategory;

            return (
              <button
                key={entry.category}
                ref={(node) => {
                  tabRefs.current[entry.category] = node;
                }}
                type="button"
                onClick={() => handleCategorySelect(entry.category)}
                className={cn(
                  "relative shrink-0 px-1.5 py-1 text-[16px] font-medium leading-none tracking-tight transition-colors duration-300",
                  isActive
                    ? isDarkTheme
                      ? "text-[#f4ecdc]"
                      : "text-brand-900"
                    : isDarkTheme
                      ? "text-[#f4ecdc]/62"
                      : "text-brand-900/52",
                )}
              >
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "jeffreys-category-tab-halo absolute -inset-x-2 inset-y-0 rounded-full",
                      isDarkTheme
                        ? "bg-[#f4ecdc]/10 shadow-[0_0_18px_rgba(244,236,220,0.08)]"
                        : "bg-brand-900/[0.075] shadow-[0_8px_22px_rgba(7,56,74,0.08)]",
                    )}
                  />
                ) : null}
                <span className="relative z-10">{entry.definition.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="space-y-12 px-4 pb-36 pt-7"
      >
        {categoryEntries.map((entry) => (
          <section
            key={entry.category}
            id={getMenuSectionId(entry.category)}
            data-menu-category={entry.category}
            className="scroll-mt-[116px]"
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className={cn("text-[25px] font-medium leading-none tracking-tight", isDarkTheme ? "text-[#f4ecdc]" : "text-brand-900")}>
                  {entry.definition.label}
                </h2>
                <p className={cn("mt-2 text-[13px] font-medium leading-none", isDarkTheme ? "text-[#f4ecdc]/46" : "text-brand-900/42")}>
                  {entry.products.length} позиций
                </p>
              </div>

            </div>

            <div className="grid auto-rows-fr grid-cols-2 gap-2.5">
              {entry.products.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onOpen={setActiveProduct}
                  stableLayout
                  tone={menuTheme}
                  showAddButton={false}
                  className="min-h-[288px]"
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <FloatingCartLink
          itemsCount={cartSummary.itemsCount}
          totalPrice={cartSummary.totalPrice}
          tone={menuTheme}
        />
      ) : null}

      {activeProduct ? (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAdd={handleAddProduct}
          tone={menuTheme}
        />
      ) : null}
    </CustomerMobileShell>
  );
}
