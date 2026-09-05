/**
 * PriceFetcher — Mexico marketplace price checks (Mercado Libre MX).
 *
 * From typical serverless / datacenter IPs:
 * - sites/MLM/search API → 403 (PolicyAgent)
 * - listado HTML → 302 account-verification (bot wall)
 * - items/products API often also 403 without app token
 *
 * When the product string is a ML URL or MLM id, we try the item/product
 * endpoints first (sometimes work). Otherwise search → HTML → null.
 * Use PRICE_FETCHER=mock or USE_MOCK_PRICES=1 for demos.
 */

export type PriceQuote = {
  product: string;
  price: number;
  currency: "MXN";
  source: string;
  checkedAt: Date;
};

export interface PriceFetcher {
  fetchPrice(product: string, category?: string): Promise<PriceQuote | null>;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const FETCH_MS = 12_000;
const MIN_PRICE = 10;
const MAX_PRICE = 5_000_000;

function browserHeaders(): HeadersInit {
  return {
    "User-Agent": UA,
    Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
  };
}

function sanePrice(n: unknown): number | null {
  const v = typeof n === "string" ? Number(n) : typeof n === "number" ? n : NaN;
  if (!Number.isFinite(v)) return null;
  if (v < MIN_PRICE || v > MAX_PRICE) return null;
  return Math.round(v * 100) / 100;
}

function lowestSane(prices: number[]): number | null {
  const ok = prices.filter((p) => Number.isFinite(p) && p >= MIN_PRICE && p <= MAX_PRICE);
  if (!ok.length) return null;
  return Math.min(...ok);
}

/** Extract MLM item or catalog product id from free text / URL. */
export function extractMlId(input: string): { kind: "item" | "product"; id: string } | null {
  const s = input.trim();
  // /p/MLM123 catalog product
  const productPath = s.match(/\/p\/(MLM\d{6,})/i);
  if (productPath) return { kind: "product", id: productPath[1].toUpperCase() };

  // articulo.mercadolibre.com.mx/MLM-123 or .../MLM123
  const articulo = s.match(/(?:articulo\.mercadolibre\.com\.mx\/)?MLM-?(\d{6,})/i);
  if (articulo && /mercadolibre\.com\.mx/i.test(s)) {
    // Prefer item form when URL looks like articulo or bare MLM-id in URL path
    if (/\/p\//i.test(s)) {
      /* already handled */
    } else if (/articulo\./i.test(s) || /MLM-\d/i.test(s) || /items?\//i.test(s)) {
      return { kind: "item", id: `MLM${articulo[1]}` };
    }
  }

  // Bare MLM123 / MLM-123 as whole product string
  const bare = s.match(/^MLM-?(\d{6,})$/i);
  if (bare) return { kind: "item", id: `MLM${bare[1]}` };

  // Generic mercadolibre.com.mx URL with MLM digits
  if (/mercadolibre\.com\.mx/i.test(s)) {
    const any = s.match(/MLM-?(\d{6,})/i);
    if (any) {
      if (/\/p\//i.test(s)) return { kind: "product", id: `MLM${any[1]}` };
      return { kind: "item", id: `MLM${any[1]}` };
    }
  }

  return null;
}

function toListadoSlug(query: string): string {
  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parsePricesFromHtml(html: string): { price: number | null; permalink?: string } {
  const prices: number[] = [];
  let permalink: string | undefined;

  // JSON-LD Offer / AggregateOffer
  const ldBlocks = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const m of ldBlocks) {
    try {
      const data = JSON.parse(m[1]!);
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const offers = node?.offers;
        if (!offers) continue;
        const list = Array.isArray(offers) ? offers : [offers];
        for (const o of list) {
          const p = sanePrice(o?.price ?? o?.lowPrice);
          if (p != null) prices.push(p);
          if (typeof o?.url === "string") permalink = permalink || o.url;
        }
        if (typeof node?.url === "string") permalink = permalink || node.url;
      }
    } catch {
      /* ignore bad JSON-LD */
    }
  }

  // "price": NUMBER embeds
  for (const m of html.matchAll(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/g)) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }

  // meta itemprop="price"
  for (const m of html.matchAll(
    /itemprop=["']price["'][^>]*content=["'](\d+(?:\.\d+)?)["']/gi
  )) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }
  for (const m of html.matchAll(
    /content=["'](\d+(?:\.\d+)?)["'][^>]*itemprop=["']price["']/gi
  )) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }

  // permalink hints
  const perma = html.match(/"permalink"\s*:\s*"(https?:\/\/[^"]+)"/);
  if (perma) permalink = permalink || perma[1];

  return { price: lowestSane(prices), permalink };
}

async function fetchJson(url: string): Promise<{ ok: boolean; status: number; json: unknown }> {
  const res = await fetch(url, {
    headers: { ...browserHeaders(), Accept: "application/json" },
    signal: AbortSignal.timeout(FETCH_MS),
    redirect: "follow",
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { ok: res.ok, status: res.status, json };
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string; finalUrl: string }> {
  const res = await fetch(url, {
    headers: browserHeaders(),
    signal: AbortSignal.timeout(FETCH_MS),
    redirect: "follow",
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text, finalUrl: res.url };
}

/** Deterministic mock: price drifts around a hash of the product name. */
export class MockPriceFetcher implements PriceFetcher {
  async fetchPrice(product: string, category?: string): Promise<PriceQuote | null> {
    const seed = [...product].reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = 500 + (seed % 4500);
    const wobble = ((Date.now() / 3_600_000) | 0) % 17; // changes ~hourly
    const price = Math.round((base - wobble * 23) * 100) / 100;
    return {
      product,
      price: Math.max(99, price),
      currency: "MXN",
      source: `mock://${(category || "general").toLowerCase()}`,
      checkedAt: new Date(),
    };
  }
}

/**
 * Hybrid ML MX fetcher:
 * 1) If product is ML URL / MLM id → items or products API
 * 2) Else search API → listado HTML parse
 * Returns null cleanly when blocked (403 / bot wall).
 */
export class MercadoLibreMxPriceFetcher implements PriceFetcher {
  private warned = false;

  private warnOnce(msg: string) {
    if (this.warned) return;
    this.warned = true;
    console.warn(`[MercadoLibreMxPriceFetcher] ${msg}`);
  }

  async fetchPrice(product: string, _category?: string): Promise<PriceQuote | null> {
    const checkedAt = new Date();
    const trimmed = product.trim();
    if (!trimmed) return null;

    try {
      const ml = extractMlId(trimmed);
      if (ml) {
        const byId = await this.fetchById(ml.kind, ml.id, trimmed, checkedAt);
        if (byId) return byId;
      }

      const bySearch = await this.fetchBySearch(trimmed, checkedAt);
      if (bySearch) return bySearch;
    } catch (err) {
      this.warnOnce(
        `falló fetch para "${trimmed}": ${err instanceof Error ? err.message : String(err)}`
      );
      return null;
    }

    this.warnOnce(
      `sin precio para "${trimmed}" (API 403 / listado bot-wall frecuentes desde IPs serverless). ` +
        `Pega URL o id MLM del producto, o usa PRICE_FETCHER=mock. App token ML pendiente.`
    );
    return null;
  }

  private async fetchById(
    kind: "item" | "product",
    id: string,
    product: string,
    checkedAt: Date
  ): Promise<PriceQuote | null> {
    if (kind === "item") {
      const { ok, json } = await fetchJson(`https://api.mercadolibre.com/items/${id}`);
      if (ok && json && typeof json === "object") {
        const row = json as Record<string, unknown>;
        const price = sanePrice(row.price);
        if (price != null) {
          return {
            product,
            price,
            currency: "MXN",
            source: typeof row.permalink === "string" ? row.permalink : `https://api.mercadolibre.com/items/${id}`,
            checkedAt,
          };
        }
      }
    }

    // Catalog product → buy box / items
    const prod = await fetchJson(`https://api.mercadolibre.com/products/${id}`);
    if (prod.ok && prod.json && typeof prod.json === "object") {
      const row = prod.json as Record<string, unknown>;
      const buyBox = row.buy_box_winner as Record<string, unknown> | undefined;
      const price =
        sanePrice(buyBox?.price) ??
        sanePrice((row as { price?: unknown }).price) ??
        null;
      if (price != null) {
        const permalink =
          (typeof buyBox?.permalink === "string" && buyBox.permalink) ||
          (typeof row.permalink === "string" && row.permalink) ||
          `https://www.mercadolibre.com.mx/p/${id}`;
        return { product, price, currency: "MXN", source: permalink, checkedAt };
      }
    }

    const items = await fetchJson(`https://api.mercadolibre.com/products/${id}/items`);
    if (items.ok && items.json && typeof items.json === "object") {
      const results = (items.json as { results?: unknown[] }).results;
      if (Array.isArray(results)) {
        const prices: number[] = [];
        let source = `https://www.mercadolibre.com.mx/p/${id}`;
        for (const r of results) {
          if (!r || typeof r !== "object") continue;
          const row = r as Record<string, unknown>;
          const p = sanePrice(row.price);
          if (p != null) {
            prices.push(p);
            if (typeof row.permalink === "string") source = row.permalink;
          }
        }
        const price = lowestSane(prices);
        if (price != null) {
          return { product, price, currency: "MXN", source, checkedAt };
        }
      }
    }

    return null;
  }

  private async fetchBySearch(query: string, checkedAt: Date): Promise<PriceQuote | null> {
    // Official search API (often 403 from datacenter IPs)
    const apiUrl = `https://api.mercadolibre.com/sites/MLM/search?q=${encodeURIComponent(query)}&limit=20`;
    try {
      const { ok, status, json } = await fetchJson(apiUrl);
      if (ok && json && typeof json === "object") {
        const results = (json as { results?: unknown[] }).results;
        if (Array.isArray(results) && results.length) {
          const prices: number[] = [];
          let source = apiUrl;
          for (const r of results) {
            if (!r || typeof r !== "object") continue;
            const row = r as Record<string, unknown>;
            const p = sanePrice(row.price);
            if (p != null) {
              prices.push(p);
              if (typeof row.permalink === "string") source = row.permalink;
            }
          }
          const price = lowestSane(prices);
          if (price != null) {
            return { product: query, price, currency: "MXN", source, checkedAt };
          }
        }
      } else if (status === 403) {
        // fall through to HTML
      }
    } catch {
      // fall through
    }

    // Listado HTML (often redirected to account-verification from bots)
    const slug = toListadoSlug(query);
    const listadoUrl = slug
      ? `https://listado.mercadolibre.com.mx/${slug}`
      : `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;

    try {
      const { text, finalUrl } = await fetchText(listadoUrl);
      if (/account-verification|suspicious-traffic/i.test(finalUrl) || /account-verification|suspicious-traffic/i.test(text.slice(0, 2000))) {
        return null;
      }
      const parsed = parsePricesFromHtml(text);
      if (parsed.price != null) {
        return {
          product: query,
          price: parsed.price,
          currency: "MXN",
          source: parsed.permalink || listadoUrl,
          checkedAt,
        };
      }
    } catch {
      return null;
    }

    return null;
  }
}

/** Alias: URL/id-aware hybrid (same as MercadoLibreMxPriceFetcher). */
export class MxPriceFetcher extends MercadoLibreMxPriceFetcher {}

export function createPriceFetcher(): PriceFetcher {
  const mode = (process.env.PRICE_FETCHER || "").toLowerCase();
  if (mode === "mock" || process.env.USE_MOCK_PRICES === "1") {
    return new MockPriceFetcher();
  }
  return new MercadoLibreMxPriceFetcher();
}

export const priceFetcher = createPriceFetcher();
