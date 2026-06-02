import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 22px 54px rgba(0, 0, 0, 0.08)",
        panel: "0 12px 32px rgba(0, 0, 0, 0.07)",
      },
      colors: {
        brand: {
          50: "#fff0f2",
          100: "#ffe0e5",
          200: "#f7b7c0",
          300: "#ee8996",
          400: "#e65469",
          500: "#d51f36",
          600: "#c01931",
          700: "#a8142b",
          800: "#811323",
          900: "#55111a",
        },
        jeffreys: {
          red: "#d51f36",
          black: "#090909",
          graphite: "#171717",
          ash: "#ebebeb",
          fog: "#f3f3f1",
          white: "#ffffff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
