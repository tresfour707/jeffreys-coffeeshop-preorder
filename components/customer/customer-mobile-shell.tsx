"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/customer/brand-mark";
import { cn } from "@/lib/cn";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CustomerMobileShellProps = {
  viewer: ViewerSummary | null;
  header?: ReactNode;
  queueSummary?: PublicQueueSummary | null;
  queueHeadline?: string;
  queueClassName?: string;
  contentClassName?: string;
  className?: string;
  chrome?: "light" | "dark";
  menuChromeExpanded?: boolean;
  onThemeToggle?: () => void;
  children: ReactNode;
};

type LocationOption = {
  id: string;
  name: string;
  address: string;
  note?: string;
  opensAt: string;
};

const LOCATION_STORAGE_KEY = "jeffreys-preorder-location";

const locationOptions: LocationOption[] = [
  {
    id: "hse-pokrovka",
    name: "НИУ ВШЭ Покровка",
    address: "Покровский бульвар, 11с4",
    note: "по пропуску",
    opensAt: "08:00",
  },
  {
    id: "hse-myasnitskaya",
    name: "НИУ ВШЭ Мясницкая",
    address: "Мясницкая ул., 20",
    opensAt: "08:00",
  },
];

const defaultLocationId = "hse-pokrovka";

function getLocationById(id: string) {
  return (
    locationOptions.find((location) => location.id === id) ??
    locationOptions.find((location) => location.id === defaultLocationId) ??
    locationOptions[0]
  );
}

function getLocationMeta(location: LocationOption) {
  return location.note ? `${location.address} · ${location.note}` : location.address;
}
function QueueStrip({
  queueSummary,
  queueHeadline,
  className,
}: {
  queueSummary: PublicQueueSummary;
  queueHeadline?: string;
  className?: string;
}) {
  const fallbackHeadline =
    queueSummary.activeOrdersCount === 0
      ? "Нет заказов"
      : `Перед вами ${queueSummary.activeOrdersCount} заказов`;
  const headline = queueHeadline ?? fallbackHeadline;

  return (
    <section className={cn("mt-5 flex justify-center px-1", className)}>
      <p className="text-center text-[24px] font-medium tracking-tight text-stone-900">
        {headline}
      </p>
    </section>
  );
}

function MenuIcon() {
  return (
    <span className="relative block h-[20px] w-[29px]">
      <span className="absolute left-0 top-[2px] h-[3px] w-[23px] rounded-full bg-jeffreys-graphite" />
      <span className="absolute left-0 top-[9px] h-[3px] w-[29px] rounded-full bg-jeffreys-graphite" />
      <span className="absolute left-0 top-[16px] h-[3px] w-[18px] rounded-full bg-jeffreys-graphite" />
      <span className="absolute right-0 top-[1px] h-[5px] w-[5px] rounded-full bg-brand-600" />
    </span>
  );
}

function AccountIcon() {
  return (
    <img
      aria-hidden="true"
      src="/brand/jeffreys-wordmark.png"
      alt=""
      className="h-10 w-10 select-none object-contain"
    />
  );
}

function BrandLogoIcon({ className }: { className?: string }) {
  return (
    <img
      aria-hidden="true"
      src="/brand/jeffreys-wordmark.png"
      alt=""
      className={cn("h-[56px] w-[56px] select-none object-contain", className)}
    />
  );
}

function ThemeToggleIcon({ theme }: { theme: "light" | "dark" }) {
  if (theme === "dark") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-[25px] w-[25px]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.35"
      >
        <circle cx="12" cy="12" r="4.15" />
        <path d="M12 3.3v1.85" />
        <path d="M12 18.85v1.85" />
        <path d="m5.85 5.85 1.3 1.3" />
        <path d="m16.85 16.85 1.3 1.3" />
        <path d="M3.3 12h1.85" />
        <path d="M18.85 12h1.85" />
        <path d="m5.85 18.15 1.3-1.3" />
        <path d="m16.85 7.15 1.3-1.3" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[25px] w-[25px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M19.4 15.2A7.2 7.2 0 0 1 8.8 4.6a7.8 7.8 0 1 0 10.6 10.6Z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.1" />
    </svg>
  );
}

function LocationChevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function AccountChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function AccountPersonalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <circle cx="12" cy="8.3" r="3.2" />
      <path d="M5.8 19c1.2-3 3.5-4.5 6.2-4.5S17 16 18.2 19" />
    </svg>
  );
}

function AccountHistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M5.2 6.5h13.6" />
      <path d="M6.8 4.5h10.4a1.8 1.8 0 0 1 1.8 1.8v13.2l-2.3-1.2-2.3 1.2-2.4-1.2-2.4 1.2-2.3-1.2L5 19.5V6.3a1.8 1.8 0 0 1 1.8-1.8Z" />
      <path d="M8.5 10.3h7" />
      <path d="M8.5 13.6h5.2" />
    </svg>
  );
}

function AccountPaymentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4.6 6.5h14.8A2.4 2.4 0 0 1 21.8 9v6a2.4 2.4 0 0 1-2.4 2.5H4.6A2.4 2.4 0 0 1 2.2 15V9a2.4 2.4 0 0 1 2.4-2.5Z" />
      <path d="M2.5 10h19" />
      <path d="M6.8 14.4h4.6" />
    </svg>
  );
}

function AccountSignOutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M10.2 5H6.7A2.2 2.2 0 0 0 4.5 7.2v9.6A2.2 2.2 0 0 0 6.7 19h3.5" />
      <path d="M13.5 8.2 17.3 12l-3.8 3.8" />
      <path d="M17.1 12H9" />
    </svg>
  );
}

function SideMenuHomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4.5 10.7 12 4.5l7.5 6.2" />
      <path d="M6.8 9.5v9.2h10.4V9.5" />
      <path d="M9.8 18.7v-5h4.4v5" />
    </svg>
  );
}

function SideMenuCartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4.5 5.5h2l1.6 9.1a2 2 0 0 0 2 1.7h6.6a2 2 0 0 0 2-1.5l1.2-5.7H7.4" />
      <circle cx="10.2" cy="19" r="1.1" />
      <circle cx="17.2" cy="19" r="1.1" />
    </svg>
  );
}

function SideMenuOrdersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M6.7 4.7h10.6a2 2 0 0 1 2 2v12.5l-2.2-1.1-2.2 1.1-2.3-1.1-2.3 1.1-2.2-1.1-2.2 1.1V6.7a2 2 0 0 1 2-2Z" />
      <path d="M8.8 9.2h6.5" />
      <path d="M8.8 12.4h5" />
      <path d="M8.8 15.6h6.5" />
    </svg>
  );
}

function SideMenuSearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <circle cx="10.7" cy="10.7" r="5.4" />
      <path d="m15.1 15.1 4.4 4.4" />
    </svg>
  );
}

function getViewerInitials(viewer: ViewerSummary) {
  const parts = viewer.name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (initials || viewer.email?.[0] || "A").toUpperCase();
}

function AccountMenuRow({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-[54px] items-center justify-between gap-4 rounded-[18px] px-2 text-jeffreys-graphite transition active:scale-[0.99] active:bg-white/72"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-brand-50 text-brand-700">
          {icon}
        </span>
        <span className="block truncate text-[19px] font-semibold leading-tight tracking-tight text-jeffreys-graphite">
          {label}
        </span>
      </span>
      <AccountChevron />
    </Link>
  );
}

function SideMenuRow({
  href,
  label,
  description,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  description: string;
  icon: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex min-h-[64px] items-center gap-3 rounded-[20px] px-3 py-2 text-left transition active:scale-[0.99] active:bg-white/78"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white text-brand-700 shadow-[0_10px_24px_rgba(0,0,0,0.055)] ring-1 ring-black/5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[20px] font-semibold leading-tight tracking-tight text-jeffreys-graphite">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[13px] font-medium leading-tight text-stone-500">
          {description}
        </span>
      </span>
      <AccountChevron />
    </Link>
  );
}

export function CustomerMobileShell({
  viewer,
  header,
  queueSummary,
  queueHeadline,
  queueClassName,
  contentClassName,
  className,
  children,
  chrome = "light",
  menuChromeExpanded = false,
  onThemeToggle,
}: CustomerMobileShellProps) {
  const pathname = usePathname();
  const [activePanel, setActivePanel] = useState<"menu" | "account" | "locations" | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState(defaultLocationId);
  const [pendingLocationId, setPendingLocationId] = useState(defaultLocationId);

  useEffect(() => {
    const searchParams =
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search);

    setActivePanel(searchParams?.get("panel") === "account" ? "account" : null);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLocationId = window.localStorage.getItem(LOCATION_STORAGE_KEY);

    if (storedLocationId && getLocationById(storedLocationId).id === storedLocationId) {
      setSelectedLocationId(storedLocationId);
      setPendingLocationId(storedLocationId);
    }
  }, []);

  useEffect(() => {
    if (activePanel === "locations") {
      setPendingLocationId(selectedLocationId);
    }
  }, [activePanel, selectedLocationId]);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePanel]);

  const isMenuOpen = activePanel === "menu";
  const isAccountOpen = activePanel === "account";
  const isLocationsOpen = activePanel === "locations";
  const isDarkChrome = chrome === "dark";
  const hasThemeToggle = typeof onThemeToggle === "function";
  const selectedLocation = getLocationById(selectedLocationId);
  const pendingLocation = getLocationById(pendingLocationId);

  function commitLocationSelection() {
    setSelectedLocationId(pendingLocation.id);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, pendingLocation.id);
    }

    setActivePanel(null);
  }

  return (
    <main
      className={cn(
        "min-h-screen",
        hasThemeToggle
          ? isDarkChrome
            ? "bg-black text-[#f4ecdc]"
            : "bg-[#eef7f9] text-brand-900"
          : isDarkChrome
            ? "bg-black text-[#f4ecdc]"
            : "",
      )}
    >
      {hasThemeToggle ? (
        <div
          aria-hidden="true"
          className={cn(
            "customer-menu-glass-backdrop",
            !isDarkChrome ? "customer-menu-glass-backdrop-light" : "",
            menuChromeExpanded ? "customer-menu-glass-backdrop-expanded" : "",
          )}
        />
      ) : null}

      <div className="fixed inset-x-0 top-0 z-50 w-full">
        <div
          className={cn(
            "customer-top-island",
            hasThemeToggle
              ? cn(
                  "customer-top-island-menu",
                  !isDarkChrome ? "customer-top-island-menu-light" : "",
                )
              : isDarkChrome
                ? "customer-top-island-dark"
                : "",
          )}
        >
          <div
            className={cn(
              "customer-top-island-inner",
              hasThemeToggle
                ? cn(
                    "customer-top-island-inner-menu",
                    isDarkChrome ? "customer-top-island-inner-menu-dark" : "",
                  )
                : isDarkChrome
                  ? "customer-top-island-inner-dark"
                  : "",
            )}
          >
            {hasThemeToggle ? (
              <button
                type="button"
                onClick={() => setActivePanel("account")}
                aria-label={viewer ? "Открыть профиль" : "Открыть вход и регистрацию"}
                className="flex h-14 w-[60px] shrink-0 items-center justify-start"
              >
                <BrandLogoIcon className={isDarkChrome ? "customer-brand-logo-ivory" : ""} />
              </button>
            ) : isDarkChrome ? (
              <Link
                href="/menu"
                aria-label="Открыть главный экран"
                className="flex h-14 w-[60px] shrink-0 items-center justify-start"
              >
                <BrandLogoIcon className="customer-brand-logo-ivory" />
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setActivePanel("locations")}
              aria-label="Выбрать кофейню"
              className={cn(
                "group min-w-0 flex-1 transition active:scale-[0.99]",
                isDarkChrome || hasThemeToggle ? "text-center" : "text-left",
                isDarkChrome ? "text-[#f4ecdc]" : "text-brand-900",
              )}
            >
              {!isDarkChrome && !hasThemeToggle ? (
                <span className="block text-[10px] font-extrabold uppercase leading-none tracking-[0.18em] text-brand-600">
                  Jeffrey&apos;s Coffeeshop
                </span>
              ) : null}
              <span
                className={cn(
                  "flex min-w-0 items-center gap-1.5 font-semibold leading-none tracking-tight",
                  isDarkChrome
                    ? "mt-0 justify-center text-[17px] text-[#f4ecdc]"
                    : hasThemeToggle
                      ? "mt-0 justify-center text-[17px] text-brand-900"
                      : "mt-2 text-[19px] text-jeffreys-graphite",
                )}
              >
                <PinIcon
                  className={cn(
                    "h-[15px] w-[15px] shrink-0",
                    isDarkChrome ? "text-[#f4ecdc]/82" : "text-brand-600",
                  )}
                />
                <span className="truncate">{selectedLocation.name}</span>
                <LocationChevron
                  className={isDarkChrome ? "text-[#f4ecdc]/82" : "text-brand-600"}
                />
              </span>
              <span
                className={cn(
                  "customer-location-marquee mt-1.5 font-medium leading-none",
                  isDarkChrome
                    ? "text-[11px] text-[#f4ecdc]/58"
                    : hasThemeToggle
                      ? "text-[11px] text-brand-900/58"
                      : "text-[13px] text-stone-500",
                )}
              >
                <span className="customer-location-marquee-track">
                  <span className="customer-location-marquee-item">
                    {getLocationMeta(selectedLocation)}
                  </span>
                  <span aria-hidden="true" className="customer-location-marquee-item">
                    {getLocationMeta(selectedLocation)}
                  </span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (hasThemeToggle) {
                  onThemeToggle?.();
                  return;
                }

                setActivePanel("account");
              }}
              aria-label={hasThemeToggle ? "Переключить тему" : viewer ? "Открыть профиль" : "Открыть вход и регистрацию"}
              className={cn(
                "shrink-0 transition active:scale-[0.96]",
                hasThemeToggle
                  ? cn(
                      "inline-flex h-10 w-10 justify-self-end items-center justify-center rounded-full backdrop-blur-[18px]",
                      isDarkChrome
                        ? "bg-[#f4ecdc]/10 text-[#f4ecdc]/86 ring-1 ring-[#f4ecdc]/10"
                        : "bg-white/78 text-brand-900 shadow-[0_8px_20px_rgba(7,56,74,0.12)] ring-1 ring-brand-900/10",
                    )
                  : isDarkChrome
                    ? "inline-flex h-11 w-16 items-center justify-center gap-1 rounded-full bg-white/16 px-3 text-[18px] font-semibold leading-none text-[#ffef3d] ring-1 ring-white/18 backdrop-blur-[18px]"
                    : "flex h-12 w-12 items-center justify-center rounded-[16px] border border-black/[0.055] bg-white shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:border-brand-200",
              )}
            >
              {hasThemeToggle ? (
                <ThemeToggleIcon theme={isDarkChrome ? "dark" : "light"} />
              ) : isDarkChrome ? (
                <>
                  <span>64</span>
                  <span className="text-[17px] leading-none">●</span>
                </>
              ) : (
                <AccountIcon />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "customer-page",
          hasThemeToggle || isDarkChrome ? "pt-0" : "pt-[126px]",
        )}
      >
        <div className={cn("pb-10 pt-4", className)}>
          {header ? <div>{header}</div> : null}
          {queueSummary ? (
            <QueueStrip
              queueSummary={queueSummary}
              queueHeadline={queueHeadline}
              className={queueClassName}
            />
          ) : null}
          <div className={cn("mt-5", contentClassName)}>{children}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          activePanel ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!activePanel}
      >
        <div
          className={cn(
            "absolute inset-0 bg-white/6 transition-opacity duration-300",
            activePanel ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setActivePanel(null)}
        />

        <aside
          className={cn(
            "customer-matte-overlay absolute inset-y-0 left-0 isolate w-full max-w-[430px] overflow-hidden transition-transform duration-300",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/82" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-full w-[6px] bg-brand-600" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,56,74,0.065)_0%,rgba(255,255,255,0)_36%),linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(243,243,241,0.74)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(9,9,9,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(9,9,9,0.035)_1px,transparent_1px)] bg-[length:34px_34px] opacity-45" />
          </div>

          <div className="relative z-10 h-full overflow-y-scroll overscroll-y-contain px-5 pb-24 pt-6 [-webkit-overflow-scrolling:touch] [touch-action:pan-y]">
            <div className="min-h-[calc(100dvh+96px)]">
              <div className="relative flex items-center justify-center pt-16">
                <Link href="/menu" onClick={() => setActivePanel(null)}>
                  <BrandMark tone="dark" size="md" />
                </Link>

                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  aria-label="Закрыть меню"
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[34px] font-light leading-none text-jeffreys-graphite"
                >
                  ×
                </button>
              </div>

              <div className="flex min-h-[58vh] flex-col justify-center pb-6 pt-12">
                <nav className="mx-auto w-full max-w-[340px] space-y-2">
                  <SideMenuRow
                    href="/menu#quick-search"
                    label="Меню"
                    description="Категории и быстрый поиск"
                    icon={<SideMenuHomeIcon />}
                    onNavigate={() => setActivePanel(null)}
                  />
                  <SideMenuRow
                    href="/cart"
                    label="Корзина"
                    description="Позиции перед оплатой"
                    icon={<SideMenuCartIcon />}
                    onNavigate={() => setActivePanel(null)}
                  />
                  <SideMenuRow
                    href="/orders/current"
                    label="Текущие заказы"
                    description="Статусы и готовность"
                    icon={<SideMenuOrdersIcon />}
                    onNavigate={() => setActivePanel(null)}
                  />
                  <SideMenuRow
                    href="/menu/search"
                    label="Быстрый поиск"
                    description="Найти блюдо или напиток"
                    icon={<SideMenuSearchIcon />}
                    onNavigate={() => setActivePanel(null)}
                  />
                </nav>
              </div>
            </div>
          </div>
        </aside>

        <aside
          className={cn(
            "absolute inset-x-0 bottom-0 mx-auto flex max-h-[86vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[30px] shadow-[0_-18px_54px_rgba(0,0,0,0.18)] transition-transform duration-300",
            isDarkChrome
              ? "bg-[#201b1e] text-[#f4ecdc]"
              : "bg-[#eef7f9] text-brand-900",
            isLocationsOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div
            className={cn(
              "relative flex min-h-16 items-center justify-center border-b px-5",
              isDarkChrome ? "border-[#f4ecdc]/8" : "border-brand-900/10",
            )}
          >
            <h2 className="text-[19px] font-semibold leading-none tracking-tight">
              Локации
            </h2>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              aria-label="Закрыть выбор локации"
              className={cn(
                "absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-[28px] font-light leading-none transition active:scale-95",
                isDarkChrome
                  ? "bg-[#f4ecdc]/7 text-[#f4ecdc]/68"
                  : "bg-brand-900/[0.065] text-brand-900/62",
              )}
            >
              ×
            </button>
          </div>

          <div className="overflow-y-auto px-5 pb-28 [-webkit-overflow-scrolling:touch]">
            {locationOptions.map((location) => {
              const isSelected = location.id === pendingLocationId;

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => setPendingLocationId(location.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b py-4 text-left transition active:scale-[0.99]",
                    isDarkChrome ? "border-[#f4ecdc]/8" : "border-brand-900/10",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      isSelected
                        ? "border-brand-500"
                        : isDarkChrome
                          ? "border-[#f4ecdc]/18"
                          : "border-brand-900/16",
                    )}
                  >
                    {isSelected ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "flex min-w-0 items-center gap-2 text-[18px] font-semibold leading-tight",
                        isDarkChrome ? "text-[#f4ecdc]/84" : "text-brand-900",
                      )}
                    >
                      <PinIcon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isDarkChrome ? "text-brand-500" : "text-brand-600",
                        )}
                      />
                      <span className="truncate">{location.name}</span>
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 block text-[14px] font-medium leading-5",
                        isDarkChrome ? "text-[#f4ecdc]/56" : "text-brand-900/60",
                      )}
                    >
                      {location.address}
                      {location.note ? ` (${location.note})` : ""}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-[9px] px-2.5 py-1 text-[12px] font-semibold",
                      isDarkChrome
                        ? "bg-[#f4ecdc]/7 text-[#f4ecdc]/50"
                        : "bg-brand-900/[0.055] text-brand-900/48",
                    )}
                  >
                    С {location.opensAt}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={cn(
              "absolute inset-x-0 bottom-0 border-t px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur-xl",
              isDarkChrome
                ? "border-[#f4ecdc]/8 bg-[#201b1e]/92"
                : "border-brand-900/10 bg-[#eef7f9]/92",
            )}
          >
            <button
              type="button"
              onClick={commitLocationSelection}
              className={cn(
                "flex min-h-14 w-full items-center justify-center rounded-[18px] bg-brand-600 px-5 text-[18px] font-extrabold tracking-tight shadow-[0_16px_34px_rgba(7,56,74,0.22)] transition active:scale-[0.98]",
                isDarkChrome ? "text-[#f4ecdc]" : "text-white",
              )}
            >
              Выбрать
            </button>
          </div>
        </aside>

        <aside
          className={cn(
            "customer-matte-overlay absolute inset-y-0 right-0 isolate w-full max-w-[430px] overflow-hidden transition-transform duration-300",
            isAccountOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/82" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-full w-[6px] bg-brand-600" />
            <div className="absolute inset-0 bg-[linear-gradient(225deg,rgba(7,56,74,0.06)_0%,rgba(255,255,255,0)_38%),linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(243,243,241,0.76)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(9,9,9,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(9,9,9,0.035)_1px,transparent_1px)] bg-[length:34px_34px] opacity-42" />
          </div>

          <div className="relative z-10 h-full overflow-y-scroll overscroll-y-contain px-5 pb-24 pt-6 [-webkit-overflow-scrolling:touch] [touch-action:pan-y]">
            <div className="min-h-[calc(100dvh+96px)]">
              <div className="relative flex min-h-12 items-center justify-center pt-14">
                <h2 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
                  Аккаунт
                </h2>

                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  aria-label="Закрыть аккаунт"
                  className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[34px] font-light leading-none text-jeffreys-graphite"
                >
                  ×
                </button>
              </div>

              {!viewer ? (
                <div className="flex min-h-[70vh] flex-col justify-center pb-8 pt-10 text-center">
                  <div className="mx-auto max-w-[290px]">
                    <h2 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
                      Авторизация
                    </h2>
                    <p className="mt-5 text-sm leading-6 text-stone-600">
                      Войдите или создайте аккаунт, чтобы оформить заказ.
                    </p>
                  </div>

                  <div className="mx-auto mt-9 flex w-full max-w-[282px] flex-col gap-3">
                    <Link
                      href="/sign-in?next=%2Fmenu"
                      onClick={() => setActivePanel(null)}
                      className="flex min-h-14 items-center justify-center rounded-[16px] bg-brand-600 px-6 py-4 text-[17px] font-extrabold tracking-tight text-white shadow-[0_18px_36px_rgba(7,56,74,0.22)]"
                    >
                      Войти
                    </Link>
                    <Link
                      href="/sign-up?next=%2Fmenu"
                      onClick={() => setActivePanel(null)}
                      className="flex min-h-14 items-center justify-center rounded-[16px] border border-black/10 bg-white/86 px-6 py-4 text-[17px] font-bold tracking-tight text-jeffreys-graphite shadow-[0_14px_32px_rgba(0,0,0,0.075)] backdrop-blur-xl"
                    >
                      Создать аккаунт
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pb-8 pt-12">
                  <div className="mx-auto flex w-full max-w-[350px] flex-col">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-brand-50 text-[28px] font-bold tracking-tight text-brand-700 shadow-[0_16px_38px_rgba(7,56,74,0.1)] ring-1 ring-brand-100">
                        {getViewerInitials(viewer)}
                      </div>
                      <h2 className="mt-5 text-[28px] font-semibold leading-none tracking-tight text-stone-950">
                        {viewer.name}
                      </h2>
                    </div>

                    <nav className="mt-8 space-y-2">
                      <AccountMenuRow
                        href="/profile"
                        label="Личные данные"
                        icon={<AccountPersonalIcon />}
                        onNavigate={() => setActivePanel(null)}
                      />
                      <AccountMenuRow
                        href="/orders"
                        label="История покупок"
                        icon={<AccountHistoryIcon />}
                        onNavigate={() => setActivePanel(null)}
                      />
                      <AccountMenuRow
                        href="/payment-methods"
                        label="Способы оплаты"
                        icon={<AccountPaymentIcon />}
                        onNavigate={() => setActivePanel(null)}
                      />
                    </nav>

                    <div className="pt-10">
                      <SignOutButton className="mx-auto flex min-h-11 items-center justify-center gap-2 rounded-[16px] px-6 text-[17px] font-bold tracking-tight text-brand-700 disabled:cursor-wait disabled:opacity-60">
                        <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-brand-50 text-brand-700">
                          <AccountSignOutIcon />
                        </span>
                      </SignOutButton>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
