import type { MenuProductSummary } from "@/lib/types";

export type MenuCategoryDefinition = {
  name: string;
  slug: string;
  label: string;
  preview: string;
  imageSrc: string;
  imageAlt: string;
  imagePosition: string;
};

export type MenuCategoryEntry = {
  category: string;
  definition: MenuCategoryDefinition;
  products: MenuProductSummary[];
};

export const menuCategoryDefinitions: MenuCategoryDefinition[] = [
  {
    name: "Кофе",
    slug: "coffee",
    label: "Кофе",
    preview: "Классические напитки",
    imageSrc: "/category-images/drinks.png",
    imageAlt: "Кофейный напиток",
    imagePosition: "center center",
  },
  {
    name: "В стиле Jeffreys",
    slug: "jeffreys-style",
    label: "В стиле Jeffreys",
    preview: "Авторские позиции",
    imageSrc: "/category-images/breakfast.png",
    imageAlt: "Авторский кофейный напиток",
    imagePosition: "center center",
  },
  {
    name: "Напитки",
    slug: "drinks",
    label: "Напитки",
    preview: "Какао и матча",
    imageSrc: "/category-images/cold-snacks.png",
    imageAlt: "Напиток в стакане",
    imagePosition: "center center",
  },
  {
    name: "Чай",
    slug: "tea",
    label: "Чай",
    preview: "Горячий чай",
    imageSrc: "/category-images/mains.png",
    imageAlt: "Чайный напиток",
    imagePosition: "center center",
  },
] as const;

export const menuCategoryOrder = menuCategoryDefinitions.map(
  (definition) => definition.name,
);

export function getMenuCategoryDefinitionByName(category: string) {
  return menuCategoryDefinitions.find((definition) => definition.name === category) ?? null;
}

export function getMenuCategoryDefinitionBySlug(slug: string) {
  return menuCategoryDefinitions.find((definition) => definition.slug === slug) ?? null;
}

export function getMenuCategoryHref(category: string) {
  const definition = getMenuCategoryDefinitionByName(category);
  return definition ? `/menu/${definition.slug}` : "/menu";
}

export function buildMenuCategoryEntries(products: MenuProductSummary[]) {
  const groups = new Map<string, MenuProductSummary[]>();

  for (const product of products) {
    const category = product.category ?? "Другое";
    groups.set(category, [...(groups.get(category) ?? []), product]);
  }

  const orderedEntries: MenuCategoryEntry[] = menuCategoryDefinitions
    .map((definition) => ({
      category: definition.name,
      definition,
      products: groups.get(definition.name) ?? [],
    }))
    .filter((entry) => entry.products.length > 0);

  return orderedEntries;
}

export function sortProductVariants(products: MenuProductSummary["variants"]) {
  return [...products].sort((left, right) => {
    const leftSort = left.sizeSort ?? Number.MAX_SAFE_INTEGER;
    const rightSort = right.sizeSort ?? Number.MAX_SAFE_INTEGER;

    return leftSort - rightSort || left.price - right.price || left.name.localeCompare(right.name, "ru");
  });
}

export function getCategoryFilterChips(
  category: string,
  products: MenuProductSummary[],
) {
  void category;
  void products;

  return ["Все"];
}

export function matchesCategoryFilter(
  product: MenuProductSummary,
  category: string,
  filter: string,
) {
  void product;
  void category;
  void filter;

  return true;
}
