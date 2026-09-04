"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/crear", label: "Crear", icon: "＋" },
  { href: "/mis-alertas", label: "Alertas", icon: "🔔" },
  { href: "/cuenta", label: "Cuenta", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/confirm")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-3 pb-3 pt-2">
      <div className="flex items-center justify-between gap-1 rounded-[24px] border border-white/70 bg-white/70 px-2 py-2 shadow-clay backdrop-blur-xl">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-bold transition ${
                active
                  ? "bg-primary/10 text-primary-dark"
                  : "text-muted hover:text-ink"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
