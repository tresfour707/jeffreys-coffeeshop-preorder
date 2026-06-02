type QuantityControlProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityControlProps) {
  return (
    <div className="inline-flex items-center rounded-[16px] border border-black/[0.06] bg-white/92 p-1 shadow-[0_10px_22px_rgba(0,0,0,0.055)]">
      <button
        type="button"
        onClick={onDecrement}
        className="flex h-10 w-10 items-center justify-center rounded-[12px] text-lg font-semibold text-jeffreys-graphite transition hover:bg-jeffreys-fog"
      >
        -
      </button>
      <span className="min-w-10 text-center text-sm font-bold text-jeffreys-graphite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-600 text-lg font-semibold text-white transition hover:bg-brand-700"
      >
        +
      </button>
    </div>
  );
}
