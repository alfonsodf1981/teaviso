import Link from "next/link";
import Image from "next/image";
import { AlertCard } from "@/components/AlertCard";
import { TopChrome } from "@/components/TopChrome";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MisAlertasPage() {
  const user = await requireUser();
  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <TopChrome subtitle="Tus vigilancias" />

      <main className="px-3.5 pt-2">
        <div className="mb-3 flex items-center justify-between px-1">
          <h1 className="text-lg font-extrabold tracking-tight">Mis alertas</h1>
          <Link
            href="/crear"
            className="rounded-full bg-cta px-3 py-1.5 text-xs font-extrabold text-white shadow-[0_8px_16px_rgba(22,163,74,.3)]"
          >
            + Nueva
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="glass-card px-5 py-10 text-center">
            <Image
              src="/mascot.png"
              alt=""
              width={108}
              height={108}
              className="mx-auto drop-shadow-[0_14px_24px_rgba(255,106,61,.3)]"
            />
            <h2 className="mt-3 text-base font-extrabold">Aún no hay nada</h2>
            <p className="mx-auto mt-1 max-w-[28ch] text-sm font-medium text-muted">
              Crea tu primera alerta y yo me encargo de vigilar el precio, amigo.
            </p>
            <Link href="/crear" className="btn-cta mt-5 inline-block">
              Crear alerta
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <AlertCard alert={alert} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
