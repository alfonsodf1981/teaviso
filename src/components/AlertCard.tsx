import Link from "next/link";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import { formatMxn } from "@/lib/format";

export type AlertCardData = {
  id: string;
  product: string;
  category: string;
  targetPrice: number;
  currentPrice: number | null;
  emailOn: boolean;
  pushOn: boolean;
  paused: boolean;
};

export function AlertCard({ alert }: { alert: AlertCardData }) {
  return (
    <Link
      href={`/editar/${alert.id}`}
      className="glass-card block p-4 transition hover:bg-white/75"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/80 text-xl shadow-soft">
            {categoryEmoji(alert.category)}
          </span>
          <div>
            <h3 className="text-[15px] font-extrabold leading-snug tracking-tight">
              {alert.product}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-muted">
              {categoryLabel(alert.category)}
            </p>
          </div>
        </div>
        {alert.paused ? (
          <span className="badge-off">Off</span>
        ) : (
          <span className="badge-on">Vigilando</span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Objetivo
          </div>
          <div className="text-lg font-extrabold text-ink">
            {formatMxn(alert.targetPrice)}
          </div>
        </div>
        {alert.currentPrice != null && (
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Último
            </div>
            <div
              className={`text-base font-extrabold ${
                alert.currentPrice <= alert.targetPrice
                  ? "text-cta"
                  : "text-ink"
              }`}
            >
              {formatMxn(alert.currentPrice)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2 text-[11px] font-semibold text-muted">
        <span>{alert.emailOn ? "✉️ Email" : "✉️ Off"}</span>
        <span>·</span>
        <span>{alert.pushOn ? "📲 Push" : "📲 Off"}</span>
      </div>
    </Link>
  );
}
