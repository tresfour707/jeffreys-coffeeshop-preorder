import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-black/[0.06] bg-white px-6 py-8 text-center shadow-[0_16px_34px_rgba(0,0,0,0.055)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-brand-50 text-[28px] text-brand-600 shadow-sm">
        •
      </div>
      <h2 className="mt-5 text-[30px] font-semibold tracking-tight text-jeffreys-graphite">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
