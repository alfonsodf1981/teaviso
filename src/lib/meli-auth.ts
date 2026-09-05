/**
 * Mercado Libre OAuth access token (client_credentials).
 * Tokens last ~6h; mint on demand and cache in-module.
 * Never log the token or client secret.
 */

type Cache = { token: string; expiresAtMs: number };

let cache: Cache | null = null;

const SKEW_MS = 5 * 60 * 1000; // refresh if fewer than 5 minutes left

function env(name: string): string {
  return (process.env[name] || "").trim();
}

function clientId(): string {
  return env("MELI_CLIENT_ID") || env("MERCADOLIBRE_CLIENT_ID");
}

function clientSecret(): string {
  return env("MELI_CLIENT_SECRET") || env("MERCADOLIBRE_CLIENT_SECRET");
}

function staticAccessToken(): string {
  const t = env("MERCADOLIBRE_ACCESS_TOKEN");
  if (!t || t === "PENDING" || t === "REPLACE_ME") return "";
  return t;
}

/**
 * Returns a usable APP_USR (or similar) access token.
 * Prefers client_credentials mint when MELI_CLIENT_ID + MELI_CLIENT_SECRET
 * (or MERCADOLIBRE_CLIENT_ID/SECRET) are set; else falls back to
 * MERCADOLIBRE_ACCESS_TOKEN (ignoring PENDING/REPLACE_ME).
 */
export async function getMeliAccessToken(): Promise<string> {
  const now = Date.now();
  if (cache && cache.expiresAtMs - now > SKEW_MS) {
    return cache.token;
  }

  const id = clientId();
  const secret = clientSecret();
  if (id && secret) {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: id,
      client_secret: secret,
    });
    const res = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      const fallback = staticAccessToken();
      if (fallback) return fallback;
      throw new Error(`Mercado Libre oauth/token failed: HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    const token = (json.access_token || "").trim();
    const expiresIn = Number(json.expires_in);
    if (!token) {
      const fallback = staticAccessToken();
      if (fallback) return fallback;
      throw new Error("Mercado Libre oauth/token missing access_token");
    }
    const ttlSec = Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 21_600;
    cache = { token, expiresAtMs: now + ttlSec * 1000 };
    return token;
  }

  return staticAccessToken();
}
