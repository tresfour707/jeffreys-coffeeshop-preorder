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
          50: "#edf8fa",
          100: "#d6eef3",
          200: "#addde6",
          300: "#78c6d4",
          400: "#43a9bb",
          500: "#1f879b",
          600: "#07384a",
          700: "#062f3f",
          800: "#052837",
          900: "#041f2b",
        },
        jeffreys: {
          red: "#07384a",
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
