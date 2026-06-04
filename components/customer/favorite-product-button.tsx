"use client";

import { cn } from "@/lib/cn";
import {
  selectIsFavorite,
  useCustomerFavoritesStore,
} from "@/lib/favorites-store";

type FavoriteProductButtonProps = {
  productId: string;
  productName: string;
  tone?: "light" | "dark";
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[20px] w-[20px]"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.05"
    >
      <path d="M19.4 5.7c-1.85-1.6-4.55-1.28-6.22.6L12 7.63l-1.18-1.32C9.15 4.43 6.45 4.1 4.6 5.7c-2.12 1.84-2.24 5.07-.24 7.07l6.7 6.7a1.33 1.33 0 0 0 1.88 0l6.7-6.7c2-2 1.88-5.23-.24-7.07Z" />
    </svg>
  );
}

export function FavoriteProductButton({
  productId,
  productName,
  tone = "light",
}: FavoriteProductButtonProps) {
  const isDark = tone === "dark";
  const isFavorite = useCustomerFavoritesStore(selectIsFavorite(productId));
  const toggleProduct = useCustomerFavoritesStore((state) => state.toggleProduct);

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`${isFavorite ? "Убрать из избранного" : "Добавить в избранное"}: ${productName}`}
      onClick={() => toggleProduct(productId)}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border transition active:scale-[0.96]",
        isFavorite
          ? isDark
            ? "border-[#d9c7aa]/34 bg-[#d9c7aa]/16 text-[#d9c7aa]"
            : "border-brand-900/16 bg-brand-900 text-white"
          : isDark
            ? "border-[#f4ecdc]/8 bg-[#f4ecdc]/7 text-[#f4ecdc]/72 hover:bg-[#f4ecdc]/10"
            : "border-black/[0.055] bg-jeffreys-fog text-jeffreys-graphite/62 hover:text-jeffreys-graphite",
      )}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );
}
