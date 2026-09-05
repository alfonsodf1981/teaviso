"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Green pill FAB — “Crear alerta” (approved mobile mocks). */
export function CreateAlertFab() {
  const pathname = usePathname();
  if (
    pathname?.startsWith("/crear") ||
    pathname?.startsWith("/editar") ||
    pathname?.startsWith("/confirm")
  ) {
    return null;
  }

  return (
    <Link href="/crear" className="fab-create" aria-label="Crear alerta">
      <span className="fab-create-icon">＋</span>
      Crear alerta
    </Link>
  );
}
