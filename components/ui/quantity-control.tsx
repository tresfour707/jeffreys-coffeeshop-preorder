import { cn } from "@/lib/cn";

type QuantityControlProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  tone?: "light" | "dark";
};

function QuantityGlyph({
  type,
  tone,
}: {
  type: "minus" | "plus";
  tone: "light" | "dark";
}) {
  const lineClassName = tone === "dark" ? "bg-[#f4ecdc]" : "bg-brand-900";

  return (
    <span className="relative block h-[18px] w-[18px]">
      <span
        className={cn(
          "absolute left-1/2 top-1/2 h-[2.4px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full",
          lineClassName,
        )}
      />
      {type === "plus" ? (
        <span
          className={cn(
            "absolute left-1/2 top-1/2 h-[15px] w-[2.4px] -translate-x-1/2 -translate-y-1/2 rounded-full",
            lineClassName,
          )}
        />
      ) : null}
    </span>
  );
}

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  tone = "light",
}: QuantityControlProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-[16px] border p-1 shadow-[0_10px_22px_rgba(0,0,0,0.055)] backdrop-blur-[18px]",
        isDark
          ? "border-[#f4ecdc]/8 bg-[#f4ecdc]/[0.055]"
          : "border-black/[0.06] bg-white/74",
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-10 w-10 items-center justify-center transition active:scale-[0.92] active:opacity-65"
      >
        <QuantityGlyph type="minus" tone={tone} />
      </button>
      <span
        className={cn(
          "min-w-10 text-center text-[15px] font-semibold leading-none",
          isDark ? "text-[#f4ecdc]" : "text-brand-900",
        )}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center transition active:scale-[0.92] active:opacity-65"
      >
        <QuantityGlyph type="plus" tone={tone} />
      </button>
    </div>
  );
}
