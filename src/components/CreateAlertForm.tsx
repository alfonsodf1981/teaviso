"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export function CreateAlertForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState(params.get("categoria") || "electronics");
  const [targetPrice, setTargetPrice] = useState("");
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: product.trim(),
          category,
          targetPrice: Number(targetPrice),
          emailOn,
          pushOn,
        }),
      });
      if (res.status === 401) {
        router.push("/cuenta?next=/crear");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "No se pudo crear la alerta");
        return;
      }
      const alert = await res.json();
      router.push(`/confirm?id=${alert.id}`);
    } catch {
      setError("Error de red, inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-card mx-3.5 mt-3 space-y-4 p-4">
      <div>
        <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-wider text-muted">
          Producto
        </label>
        <div className="field">
          <span>🔍</span>
          <input
            required
            minLength={2}
            placeholder="Ej. Sony HT-S40R"
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
          <span>📂</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="font-semibold"
          >
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
            step={1}
            placeholder="Ej. 2499"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2 rounded-2xl bg-white/50 p-3">
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>✉️ Aviso por email</span>
          <input
            type="checkbox"
            checked={emailOn}
            onChange={(e) => setEmailOn(e.target.checked)}
            className="h-5 w-5 accent-cta"
          />
        </label>
        <label className="flex items-center justify-between text-sm font-semibold">
          <span>📲 Aviso por push</span>
          <input
            type="checkbox"
            checked={pushOn}
            onChange={(e) => setPushOn(e.target.checked)}
            className="h-5 w-5 accent-cta"
          />
        </label>
        <p className="text-[11px] font-medium text-muted">
          Nunca WhatsApp. Solo los canales que actives.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-off">
          {error}
        </p>
      )}

      <button type="submit" className="btn-cta" disabled={loading}>
        {loading ? "Guardando…" : "Empezar a vigilar"}
      </button>
    </form>
  );
}
