import { PrismaClient, ProductKind } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  description?: string | null;
  price: number;
  category: string;
  kind: ProductKind;
  groupKey?: string | null;
  sizeLabel?: string | null;
  sizeSort?: number | null;
  sortOrder: number;
};

const menu: SeedProduct[] = [];
let sortOrder = 1;

function addDrink(
  category: string,
  groupKey: string,
  name: string,
  sizes: Array<{ label: string; priceRub: number }>,
) {
  sizes.forEach((size, index) => {
    menu.push({
      name,
      price: size.priceRub * 100,
      category,
      kind: ProductKind.DRINK,
      groupKey,
      sizeLabel: size.label,
      sizeSort: index + 1,
      sortOrder,
    });
  });

  sortOrder += 1;
}

function addSingleDrink(
  category: string,
  groupKey: string,
  name: string,
  priceRub: number,
  sizeLabel?: string,
) {
  menu.push({
    name,
    price: priceRub * 100,
    category,
    kind: ProductKind.DRINK,
    groupKey,
    sizeLabel: sizeLabel ?? null,
    sizeSort: sizeLabel ? 1 : null,
    sortOrder,
  });

  sortOrder += 1;
}

addSingleDrink("Кофе", "double-espresso", "Двойной эспрессо", 170);
addDrink("Кофе", "americano", "Американо", [
  { label: "250 мл", priceRub: 185 },
  { label: "350 мл", priceRub: 220 },
]);
addDrink("Кофе", "filter-coffee", "Фильтр-кофе", [
  { label: "250 мл", priceRub: 185 },
  { label: "350 мл", priceRub: 220 },
]);
addDrink("Кофе", "cappuccino", "Капучино", [
  { label: "250 мл", priceRub: 210 },
  { label: "350 мл", priceRub: 255 },
]);
addSingleDrink("Кофе", "latte", "Латте", 255, "350 мл");
addSingleDrink("Кофе", "flat-white", "Флэт Уайт", 245);
addDrink("Кофе", "raf-coffee", "Раф кофе", [
  { label: "250 мл", priceRub: 220 },
  { label: "350 мл", priceRub: 270 },
]);
addSingleDrink("Кофе", "bumble", "Бамбл", 260, "350 мл");
addSingleDrink("Кофе", "espresso-tonic", "Эспрессо-тоник", 245, "350 мл");

addDrink("В стиле Jeffreys", "alaska-cappuccino", "Капучино Аляска", [
  { label: "250 мл", priceRub: 235 },
  { label: "350 мл", priceRub: 290 },
]);
addDrink("В стиле Jeffreys", "salted-caramel-raf", "Раф соленая карамель", [
  { label: "250 мл", priceRub: 235 },
  { label: "350 мл", priceRub: 290 },
]);
addDrink("В стиле Jeffreys", "lavender-raf", "Раф лавандовый", [
  { label: "250 мл", priceRub: 235 },
  { label: "350 мл", priceRub: 290 },
]);
addDrink("В стиле Jeffreys", "urbech-latte", "Латте урбеч", [
  { label: "250 мл", priceRub: 235 },
  { label: "350 мл", priceRub: 290 },
]);

addDrink("Напитки", "matcha-latte", "Матча латте", [
  { label: "250 мл", priceRub: 215 },
  { label: "350 мл", priceRub: 260 },
]);
addDrink("Напитки", "cacao", "Какао", [
  { label: "250 мл", priceRub: 190 },
  { label: "350 мл", priceRub: 230 },
]);
addDrink("Напитки", "strawberry-cacao", "Клубничное какао", [
  { label: "250 мл", priceRub: 210 },
  { label: "350 мл", priceRub: 240 },
]);

addSingleDrink("Чай", "loose-leaf-tea", "Листовой", 190, "350 мл");
addSingleDrink("Чай", "canadian-maple-tea", "Канадский кленовый", 205, "350 мл");
addSingleDrink("Чай", "sea-buckthorn-honey", "Облепиховый с медом", 215, "350 мл");
addDrink("Чай", "spiced-tea-latte", "Пряный чай латте", [
  { label: "250 мл", priceRub: 215 },
  { label: "350 мл", priceRub: 270 },
]);
addSingleDrink("Чай", "alaska-toddy", "Аляска Тодди", 245, "350 мл");

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: menu.map((item) => ({
      ...item,
      description: item.description ?? null,
      available: true,
      groupKey: item.groupKey ?? null,
      sizeLabel: item.sizeLabel ?? null,
      sizeSort: item.sizeSort ?? null,
    })),
  });

  console.log(`Seed completed with ${menu.length} menu positions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
