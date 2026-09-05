import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { CreateAlertForm } from "@/components/CreateAlertForm";
import { CategoryTabs } from "@/components/CategoryTabs";
import { requireUser } from "@/lib/session";

export default async function CrearPage() {
  await requireUser();

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-b from-page/95 via-page/80 to-transparent px-3 pb-2 pt-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5 rounded-[22px] border border-white/70 bg-white/60 px-2 py-2 shadow-clay backdrop-blur-xl">
          <Link
            href="/"
            className="grid h-10 w-10 place-items-center rounded-[14px] bg-white/70 text-lg shadow-soft"
          >
            ←
          </Link>
          <div className="flex flex-1 flex-col leading-tight">
            <strong className="text-[15px]">Crear alerta</strong>
            <span className="text-[11px] font-medium text-muted">
              Dime qué quieres y a cuánto
            </span>
          </div>
          <Image src="/isotipo.png" alt="" width={36} height={36} />
        </div>
        <Suspense fallback={<div className="mt-1.5 h-14" />}>
          <CategoryTabs />
        </Suspense>
      </header>

      <Suspense fallback={<div className="p-6 text-center text-sm text-muted">Cargando…</div>}>
        <CreateAlertForm />
      </Suspense>
    </>
  );
}
