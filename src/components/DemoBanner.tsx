import { isDemoAuthMode } from "@/lib/auth";

export function DemoBanner() {
  if (!isDemoAuthMode()) return null;
  return (
    <div className="mx-3 mb-2 rounded-2xl border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-center text-[11px] font-semibold text-amber-900">
      Modo demo: sin RESEND_API_KEY / EMAIL_SERVER — el login no envía correo real.
    </div>
  );
}
