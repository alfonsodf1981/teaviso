"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/** Client link that refreshes RSC cache after navigation (fixes stale Mis alertas). */
export function RefreshLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        router.push(href);
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
