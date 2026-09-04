import Link from "next/link";
import { notFound } from "next/navigation";
import { EditAlertForm } from "@/components/EditAlertForm";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const alert = await prisma.alert.findFirst({
    where: { id, userId: user.id },
  });
  if (!alert) notFound();

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pb-2 pt-3">
        <div className="flex items-center gap-2.5 rounded-[22px] border border-white/70 bg-white/60 px-2 py-2 shadow-clay backdrop-blur-xl">
          <Link
            href="/mis-alertas"
            className="grid h-10 w-10 place-items-center rounded-[14px] bg-white/70 text-lg shadow-soft"
          >
            ←
          </Link>
          <div className="flex flex-1 flex-col leading-tight">
            <strong className="text-[15px]">Editar alerta</strong>
            <span className="text-[11px] font-medium text-muted">
              Ajusta precio o canales
            </span>
          </div>
        </div>
      </header>
      <EditAlertForm alert={alert} />
    </>
  );
}
