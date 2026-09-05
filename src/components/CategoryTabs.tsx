"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";

/**
 * Top category tabs: icon + label + orange underline when active.
 * Replaces BottomNav; taps open /crear?categoria=…
 */
export function CategoryTabs() {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCat =
    pathname === "/crear" ? params.get("categoria") || "electronics" : null;

  return (
    <div
      role="tablist"
      aria-label="Categorías"
      className="mt-1.5 flex gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {CATEGORIES.map((cat) => {
        const active = activeCat === cat.id;
        return (
          <Link
            key={cat.id}
            href={`/crear?categoria=${cat.id}`}
            role="tab"
            aria-selected={active}
            className={`relative flex min-w-[70px] flex-col items-center gap-0.5 px-2.5 py-2 text-[11px] font-bold transition ${
              active ? "text-primary-dark" : "text-muted hover:text-ink"
            }`}
          >
            <span className="text-[20px] leading-none drop-shadow-[0_6px_10px_rgba(15,23,42,.12)]">
              {cat.emoji}
            </span>
            <span className="whitespace-nowrap">{cat.label}</span>
            <span
              className={`absolute bottom-0 h-[3px] w-7 rounded-full transition ${
                active
                  ? "bg-primary shadow-[0_2px_8px_rgba(255,106,61,.45)]"
                  : "bg-transparent"
              }`}
            />
          </Link>
        );
      })}
    </div>
  );
}
