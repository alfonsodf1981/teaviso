import Image from "next/image";
import Link from "next/link";
import { TopChrome } from "@/components/TopChrome";
import { DemoBanner } from "@/components/DemoBanner";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getSession();
  const alertCount = session?.user?.id
    ? await prisma.alert.count({ where: { userId: session.user.id, paused: false } })
    : 0;

  return (
    <>
      <TopChrome />
      <DemoBanner />

      <main className="px-3.5 pt-2">
        <section className="glass-card relative overflow-hidden p-5 text-center">
          <div className="pointer-events-none absolute inset-x-6 top-4 h-40 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,106,61,.22),rgba(209,213,219,.35)_45%,transparent_70%)] blur-md" />
          <Image
            src="/mascot.png"
            alt="Mascota TeAviso"
            width={132}
            height={132}
            className="relative mx-auto drop-shadow-[0_18px_32px_rgba(255,106,61,.38)]"
            priority
          />
          <p className="relative mt-1 inline-block rounded-full border border-orange-200/70 bg-orange-50/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary-dark">
            Amigo · MX
          </p>
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

        <section className="amigo-glass mt-4 flex items-start gap-2.5 p-3.5">
          <Image
            src="/mascot.png"
            alt=""
            width={44}
            height={44}
            className="shrink-0 drop-shadow-[0_8px_12px_rgba(255,106,61,.25)]"
          />
          <p className="m-0 text-[13px] font-medium leading-snug text-ink">
            <strong className="text-primary-dark">Soy TeAviso.</strong> Dime qué
            vigilar y te aviso por email (y push cuando esté listo). No vendo
            nada — solo te cuido el precio.
          </p>
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
