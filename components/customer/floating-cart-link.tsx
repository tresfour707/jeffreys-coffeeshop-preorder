"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";

type FloatingCartLinkProps = {
  itemsCount: number;
  totalPrice: number;
  href?: string;
  tone?: "light" | "dark";
};

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <path d="M6 8.5h2.6l2.2 10.4h10.8l3.3-8.1H11.7" />
      <circle cx="13" cy="24" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="22" cy="24" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FloatingCartLink({
  itemsCount,
  totalPrice,
  href = "/cart",
  tone = "light",
}: FloatingCartLinkProps) {
  const badgeLabel = itemsCount > 99 ? "99+" : String(itemsCount);
  const isDark = tone === "dark";

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-30">
      <Link
        href={href}
        aria-label={`Открыть корзину: ${itemsCount} позиций на ${formatMoney(totalPrice)}`}
        className="group flex flex-col items-center gap-2 no-underline"
      >
        <span
          className={cn(
            "relative flex h-[62px] w-[62px] items-center justify-center rounded-full border backdrop-blur-[24px] transition duration-200 group-active:scale-[0.96]",
            isDark
              ? "border-[#f4ecdc]/14 bg-[#f4ecdc]/8 text-[#f4ecdc] shadow-[0_18px_42px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(244,236,220,0.12)]"
              : "border-brand-900/10 bg-white/66 text-brand-900 shadow-[0_16px_36px_rgba(7,56,74,0.13),inset_0_1px_0_rgba(255,255,255,0.75)]",
          )}
        >
          <span
            className={cn(
              "absolute -right-1 -top-1 inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none tracking-tight shadow-[0_10px_20px_rgba(0,0,0,0.18)]",
              isDark ? "bg-[#d9c7aa] text-[#101719]" : "bg-brand-900 text-white",
            )}
          >
            {badgeLabel}
          </span>

          <CartIcon />
        </span>

        <span
          className={cn(
            "inline-flex min-h-8 items-center justify-center rounded-full border px-3.5 text-[13px] font-bold tracking-tight backdrop-blur-[22px]",
            isDark
              ? "border-[#f4ecdc]/10 bg-[#f4ecdc]/9 text-[#f4ecdc] shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
              : "border-brand-900/8 bg-white/70 text-brand-900 shadow-[0_14px_28px_rgba(7,56,74,0.11)]",
          )}
        >
          {formatMoney(totalPrice)}
        </span>
      </Link>
    </div>
  );
}
