import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { statusLabels } from "@/lib/labels";

const toneClasses: Record<OrderStatus, string> = {
  DRAFT: "border-stone-200 bg-stone-100 text-stone-700",
  WAITING: "border-[#d8c7a9]/70 bg-[#f6eedf] text-[#8a6a3a]",
  PREPARING: "border-[#8fa878]/45 bg-[#eef4ea] text-[#5f754f]",
  READY: "border-[#6f9a61]/40 bg-[#e4f1df] text-[#456f42]",
  CANCELLED: "border-stone-300 bg-stone-200 text-stone-700",
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
        toneClasses[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
