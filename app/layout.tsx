import type { Metadata } from "next";
import { Noto_Sans, Roboto } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Jeffrey's Coffeeshop Preorder",
  description:
    "Предзаказ кофе и еды в Jeffrey's Coffeeshop с единой очередью и статусами заказа.",
  icons: {
    icon: "/brand/jeffreysfavicon.ico",
    apple: "/brand/jeffreys-deer.png",
  },
};

const jeffreysSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jeffreys",
  display: "swap",
});

const jeffreysSecondary = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-jeffreys-secondary",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${jeffreysSans.variable} ${jeffreysSecondary.variable}`}>
        {children}
      </body>
    </html>
  );
}
