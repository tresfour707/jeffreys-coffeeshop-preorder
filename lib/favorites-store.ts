"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CustomerFavoritesStore = {
  productIds: string[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  toggleProduct: (productId: string) => void;
};

export function selectIsFavorite(productId: string) {
  return (state: CustomerFavoritesStore) => state.productIds.includes(productId);
}

export const useCustomerFavoritesStore = create<CustomerFavoritesStore>()(
  persist(
    (set) => ({
      productIds: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      toggleProduct: (productId) =>
        set((state) => {
          const isFavorite = state.productIds.includes(productId);

          return {
            productIds: isFavorite
              ? state.productIds.filter((id) => id !== productId)
              : [productId, ...state.productIds],
          };
        }),
    }),
    {
      name: "jeffreys-preorder-favorites",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
