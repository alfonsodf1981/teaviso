import Image from "next/image";
import { Suspense } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { LoginForm } from "@/components/LoginForm";
import { isDemoAuthMode } from "@/lib/auth";
import { getSession } from "@/lib/session";

export default async function CuentaPage() {
  const session = await getSession();
  const demoMode = isDemoAuthMode();

  return (
    <>
      <BrandHeader subtitle="Tu cuenta" showChannels={false} />

      <main className="px-0 pt-1">
        <div className="px-3.5 text-center">
          <Image
            src="/mascot.png"
            alt=""
            width={88}
            height={88}
            className="mx-auto"
          />
          <h1 className="mt-2 text-[20px] font-extrabold tracking-tight">
            {session?.user ? "Tu espacio" : "Entra, amigo"}
          </h1>
          <p className="mx-auto mt-1 max-w-[30ch] text-sm font-medium text-muted">
            {session?.user
              ? "Aquí administras tu sesión y preferencias."
              : (
                <>
                  Magic link por email.{" "}
                  <strong className="text-primary-dark">Sin WhatsApp.</strong>
                </>
              )}
          </p>
        </div>

        <Suspense fallback={<div className="p-6 text-center text-sm text-muted">Cargando…</div>}>
          <LoginForm demoMode={demoMode} userEmail={session?.user?.email} />
        </Suspense>
      </main>
    </>
  );
}
