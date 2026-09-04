import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { categoryLabel } from "@/lib/categories";
import { formatMxn } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ConfirmPage({ searchParams }: Props) {
  const user = await requireUser();
  const { id } = await searchParams;
  if (!id) redirect("/mis-alertas");

  const alert = await prisma.alert.findFirst({
    where: { id, userId: user.id },
  });
  if (!alert) redirect("/mis-alertas");

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pb-2 pt-3">
        <div className="flex items-center justify-between rounded-[22px] border border-white/70 bg-white/60 px-3.5 py-2.5 shadow-clay backdrop-blur-xl">
          <strong className="text-[15px]">Te estoy vigilando</strong>
          <span className="badge-on">Listo</span>
        </div>
      </header>

      <main className="px-3.5 pt-2 text-center">
        <div className="relative mx-auto pt-2">
          <div className="pointer-events-none absolute inset-x-[8%] top-10 h-40 bg-[radial-gradient(ellipse_at_center,rgba(255,106,61,.18),rgba(209,213,219,.35)_40%,transparent_70%)] blur-md" />
          <Image
            src="/mascot.png"
            alt="Mascota"
            width={140}
            height={140}
            className="relative mx-auto drop-shadow-[0_16px_28px_rgba(255,106,61,.35)]"
            priority
          />
        </div>

        <h1 className="mt-2 text-[22px] font-extrabold tracking-tight">
          ¡Ya la tengo, amigo!
        </h1>
        <p className="mx-auto mt-2 max-w-[34ch] text-sm font-medium text-muted">
          Voy a cuidar{" "}
          <strong className="text-ink">{alert.product}</strong> hasta que
          baje a {formatMxn(alert.targetPrice)}.
        </p>

        <div className="glass-card mt-5 p-4 text-left">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Resumen
          </div>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted">Producto</dt>
              <dd className="font-bold">{alert.product}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted">Categoría</dt>
              <dd className="font-bold">{categoryLabel(alert.category)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted">Objetivo</dt>
              <dd className="font-extrabold text-cta">
                {formatMxn(alert.targetPrice)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-muted">Canales</dt>
              <dd className="font-bold">
                {[alert.emailOn && "Email", alert.pushOn && "Push"]
                  .filter(Boolean)
                  .join(" + ") || "Ninguno"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 space-y-3">
          <Link href="/mis-alertas" className="btn-cta inline-block">
            Ver mis alertas
          </Link>
          <Link
            href="/crear"
            className="inline-block w-full rounded-full border border-white/80 bg-white/60 px-5 py-3.5 text-[15px] font-bold text-ink shadow-soft backdrop-blur"
          >
            Crear otra
          </Link>
        </div>
      </main>
    </>
  );
}
