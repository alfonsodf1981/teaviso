"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  demoMode,
  userEmail,
}: {
  demoMode: boolean;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/mis-alertas";
  const sent = params.get("sent") === "1";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    sent ? "Revisa tu correo — te mandamos el magic link." : null
  );
  const [error, setError] = useState<string | null>(null);

  if (userEmail) {
    return (
      <div className="glass-card mx-3.5 mt-4 p-5 text-center">
        <p className="text-sm font-medium text-muted">Sesión activa</p>
        <p className="mt-1 text-base font-extrabold">{userEmail}</p>
        <button
          type="button"
          className="btn-primary mt-5"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar sesión
        </button>
        <button
          type="button"
          className="mt-3 w-full rounded-full border border-white/80 bg-white/60 px-5 py-3 text-sm font-bold shadow-soft"
          onClick={() => router.push("/mis-alertas")}
        >
          Ir a mis alertas
        </button>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (demoMode) {
        const res = await signIn("demo-email", {
          email: email.trim().toLowerCase(),
          redirect: false,
          callbackUrl: next,
        });
        if (res?.error) {
          setError("No se pudo iniciar sesión");
          return;
        }
        router.push(next);
        router.refresh();
        return;
      }

      const res = await signIn("email", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: next,
      });
      if (res?.error) {
        setError("No se pudo enviar el magic link");
        return;
      }
      setMessage("Revisa tu correo — te mandamos el magic link.");
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card mx-3.5 mt-4 p-5">
      {demoMode && (
        <div className="mb-4 rounded-2xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-snug text-amber-900">
          <strong>Modo demo</strong> (sin RESEND_API_KEY / EMAIL_SERVER): entra
          con cualquier email y creamos la sesión sin enviar correo.
        </div>
      )}

      <p className="section-label mb-2 text-[11px] font-extrabold uppercase tracking-wider text-muted">
        Tu correo
      </p>
      <div className="field">
        <span>✉️</span>
        <input
          required
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <p className="mt-2 text-xs font-medium text-muted">
        {demoMode
          ? "Demo: sin envío real de email."
          : "Te mandamos un magic link. Sin contraseñas."}
      </p>

      {message && (
        <p className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-cta-dark">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-off">
          {error}
        </p>
      )}

      <button type="submit" className="btn-cta mt-4" disabled={loading}>
        {loading
          ? "Un momento…"
          : demoMode
            ? "Entrar (demo)"
            : "Enviar magic link"}
      </button>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="rounded-full border border-green-300/55 bg-green-100/75 px-2.5 py-1 text-[11px] font-bold text-cta-dark">
          Email
        </span>
        <span className="rounded-full border border-green-300/55 bg-green-100/75 px-2.5 py-1 text-[11px] font-bold text-cta-dark">
          Push
        </span>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium leading-relaxed text-muted">
        Solo email y push. TeAviso no vende productos — solo te avisamos cuando baje el precio.
      </p>
    </form>
  );
}
