# Jeffrey's Coffeeshop Design System

This document captures the first redesign baseline for adapting the preorder app
from the previous Grusha visual language to Jeffrey's Coffeeshop.

## Brand References

- Official site: https://jeffreys.ru
- Primary site palette found in page styles: black, white, light gray, and red
  `#d51f36`.
- Primary fonts used on the official site: `Noto Sans` and `Roboto`.
- Brand mood: coffee travel, Alaska/adventure, energetic coffee culture, clean
  editorial blocks, strong CTA buttons.

## Color Tokens

- `brand.red`: `#d51f36`
- `brand.red.dark`: `#b9162c`
- `brand.red.soft`: `#fff0f2`
- `brand.black`: `#090909`
- `brand.graphite`: `#171717`
- `brand.ash`: `#ebebeb`
- `brand.fog`: `#f3f3f1`
- `brand.white`: `#ffffff`

Use red for primary actions and active states. Use black/graphite for text and
structural UI. Use white and fog/ash for surfaces. Avoid the old beige/brown
palette except where a food image itself contains those colors.

## Typography

- Primary UI font: `Noto Sans`.
- Secondary/system fallback: `Roboto`, then common sans-serif fallbacks.
- Headings should be confident and compact, with medium to bold weight.
- Interface labels can stay uppercase, but with controlled tracking.

## Shape And Surfaces

- The previous app used very soft, cream rounded cards. Jeffrey's should feel
  cleaner and sharper.
- Default cards: 22-24px radius.
- Default buttons/chips/fields: 14-16px radius.
- Surfaces are white or near-white with subtle black shadows.
- Avoid warm cream overlays and brown shadows.

## Interaction Colors

- Primary button: red background, white text.
- Secondary button: white background, graphite text, gray border.
- Active chips/tabs: red background, white text.
- Input focus: red border with a soft red focus ring.

## Next Redesign Steps

1. Replace brand assets and header: text logo plus deer mark.
2. Rework main page composition with the new palette.
3. Rework product cards and add buttons.
4. Rework cart, checkout, order status, account, and staff screens.

## Brand Assets

- Deer mark: `public/brand/jeffreys-deer.png`
- Favicon: `public/brand/jeffreysfavicon.ico`
- The preorder app keeps the Grusha scenarios and product/order flow. Official
  website images for "contacts", "courses", "franchise", and other marketing
  pages are reference-only and should not be introduced as app content.
