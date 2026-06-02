import { cn } from "@/lib/cn";

type BrandMarkProps = {
  tone?: "light" | "dark" | "coffee";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "text-[13px]",
  md: "text-[17px]",
  lg: "text-[21px]",
} as const;

export function BrandMark({
  tone = "dark",
  size = "md",
  className,
}: BrandMarkProps) {
  const toneClass =
    tone === "light"
      ? "text-white"
      : tone === "coffee"
        ? "text-brand-600"
        : "text-jeffreys-graphite";

  return (
    <span
      className={cn(
        "block select-none whitespace-nowrap text-center font-extrabold uppercase leading-none tracking-[0.055em]",
        sizeClasses[size],
        toneClass,
        className,
      )}
    >
      Jeffrey&apos;s Coffeeshop
    </span>
  );
}
