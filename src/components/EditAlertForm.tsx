"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

type AlertData = {
  id: string;
  product: string;
  category: string;
  targetPrice: number;
  emailOn: boolean;
  pushOn: boolean;
  paused: boolean;
};

export function EditAlertForm({ alert }: { alert: AlertData }) {
  const router = useRouter();
  const [product, setProduct] = useState(alert.product);
  const [category, setCategory] = useState(alert.category);
  const [targetPrice, setTargetPrice] = useState(String(alert.targetPrice));
  const [emailOn, setEmailOn] = useState(alert.emailOn);
  const [pushOn, setPushOn] = useState(alert.pushOn);
  const [paused, setPaused] = useState(alert.paused);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.trim(),
          category,
          targetPrice: Number(targetPrice),
          emailOn,
          pushOn,
          paused,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo guardar");
        return;
      }
      router.push("/mis-alertas");
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("¿Seguro que quieres borrar esta alerta?")) return;
    setLoading(true);
    try {
      await fetch(`/api/alerts/${alert.id}`, { method: "DELETE" });
      router.push("/mis-alertas");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={save} className="glass-card mx-3.5 mt-3 space-y-4 p-4">
      <div className="flex items-center justify-between rounded-2xl bg-white/50 px-3 py-2.5">
        <span className="text-sm font-bold">
          {paused ? "Pausada" : "Vigilando"}
        </span>
        {paused ? (
          <span className="badge-off">Off</span>
        ) : (
          <span className="badge-on">On</span>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Producto
        </label>
        <div className="field">
          <input
            required
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Categoría
        </label>
        <div className="field">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Precio objetivo (MXN)
        </label>
        <div className="field">
          <span>$</span>
          <input
            required
            type="number"
            min={1}
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-white/50 p-3">
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>✉️ Email</span>
          <input
            type="checkbox"
            checked={emailOn}
            onChange={(e) => setEmailOn(e.target.checked)}
            className="h-5 w-5 accent-cta"
          />
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>📲 Push</span>
          <input
            type="checkbox"
            checked={pushOn}
            onChange={(e) => setPushOn(e.target.checked)}
            className="h-5 w-5 accent-cta"
          />
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>⏸ Pausar alerta</span>
          <input
            type="checkbox"
            checked={paused}
            onChange={(e) => setPaused(e.target.checked)}
            className="h-5 w-5 accent-off"
          />
        </label>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-off">
          {error}
        </p>
      )}

      <button type="submit" className="btn-cta" disabled={loading}>
        {loading ? "Guardando…" : "Guardar cambios"}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={loading}
        className="w-full rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-bold text-off"
      >
        Eliminar alerta
      </button>
    </form>
  );
}
