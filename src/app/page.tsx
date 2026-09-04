import Image from "next/image";
import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { DemoBanner } from "@/components/DemoBanner";
import { CATEGORIES } from "@/lib/categories";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getSession();
  const alertCount = session?.user?.id
    ? await prisma.alert.count({ where: { userId: session.user.id, paused: false } })
    : 0;

  return (
    <>
      <BrandHeader />
      <DemoBanner />

      <main className="px-3.5 pt-2">
        <section className="glass-card relative overflow-hidden p-5 text-center">
          <div className="pointer-events-none absolute inset-x-8 top-6 h-36 rounded-full bg-primary/15 blur-2xl" />
          <Image
            src="/mascot.png"
            alt="Mascota TeAviso"
            width={120}
            height={120}
            className="relative mx-auto drop-shadow-[0_12px_24px_rgba(255,106,61,.35)]"
            priority
          />
          <h1 className="relative mt-2 text-[22px] font-extrabold tracking-tight">
            Órale, yo te aviso
          </h1>
          <p className="relative mx-auto mt-2 max-w-[32ch] text-sm font-medium leading-relaxed text-muted">
            Vigilamos precios en México.{" "}
            <strong className="text-primary-dark">Email + push</strong>, nunca
            WhatsApp. No vendemos nada — solo te avisamos cuando baje.
          </p>
          <Link href="/crear" className="btn-cta relative mt-5 inline-block">
            Crear alerta
          </Link>
          {session?.user ? (
            <p className="relative mt-3 text-xs font-semibold text-muted">
              Hola {session.user.name || session.user.email} · {alertCount} activa
              {alertCount === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="relative mt-3 text-xs font-medium text-muted">
              ¿Ya tienes cuenta?{" "}
              <Link href="/cuenta" className="font-bold text-primary-dark">
                Entra aquí
              </Link>
            </p>
          )}
        </section>

        <section className="mt-5">
          <h2 className="mb-2 px-1 text-[11px] font-extrabold uppercase tracking-wider text-muted">
            Categorías
          </h2>
          <div className="flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/crear?categoria=${cat.id}`}
                className="flex min-w-[86px] flex-col items-center gap-1 rounded-full border border-white/65 bg-white/40 px-3.5 py-2.5 text-[11px] font-bold text-muted shadow-soft backdrop-blur"
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-4 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-sm font-extrabold">1. Dime qué quieres</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              Producto, categoría y el precio que te late.
            </p>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-extrabold">2. Yo lo cuido</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              Revisamos cada pocas horas (job cada 6 h).
            </p>
          </div>
          <div className="glass-card p-4">
            <h3 className="text-sm font-extrabold">3. Te avisa cuando baje</h3>
            <p className="mt-1 text-xs font-medium text-muted">
              Correo y/o push. Sin spam de WhatsApp.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
