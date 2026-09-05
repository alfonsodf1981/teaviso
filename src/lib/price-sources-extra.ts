/**
 * Extra MX price sources for TeAviso.
 * Retail HTML fetchers are best-effort (bot walls common) — return null, never throw.
 * Travel/Autos stubs are intentional MVP null-safe placeholders.
 */
import type { PriceFetcher, PriceQuote } from "./price-fetcher";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const FETCH_MS = 10_000;
const MIN_PRICE = 10;
const MAX_PRICE = 5_000_000;

function sanePrice(n: unknown): number | null {
  const v = typeof n === "string" ? Number(n) : typeof n === "number" ? n : NaN;
  if (!Number.isFinite(v) || v < MIN_PRICE || v > MAX_PRICE) return null;
  return Math.round(v * 100) / 100;
}

function lowestSane(prices: number[]): number | null {
  const ok = prices.filter((p) => Number.isFinite(p) && p >= MIN_PRICE && p <= MAX_PRICE);
  if (!ok.length) return null;
  return Math.min(...ok);
}

function parseLoosePrices(html: string): number[] {
  const prices: number[] = [];
  for (const m of html.matchAll(/"price"\s*:\s*"?(\d+(?:\.\d+)?)"?/gi)) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }
  for (const m of html.matchAll(/"priceAmount"\s*:\s*"?(\d+(?:\.\d+)?)"?/gi)) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }
  for (const m of html.matchAll(/itemprop=["']price["'][^>]*content=["'](\d+(?:\.\d+)?)["']/gi)) {
    const p = sanePrice(m[1]);
    if (p != null) prices.push(p);
  }
  for (const m of html.matchAll(/\$\s?([\d,]{2,}\.?\d*)/g)) {
    const p = sanePrice(m[1]!.replace(/,/g, ""));
    if (p != null) prices.push(p);
  }
  return prices;
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (/account-verification|captcha|cf-challenge|verifica tu identidad/i.test(text) && text.length < 80_000) {
      return null;
    }
    return text;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function slugQuery(q: string): string {
  return encodeURIComponent(q.trim().replace(/\s+/g, " "));
}

/** Generic HTML search fetcher for a retailer search URL builder. */
export class HtmlRetailFetcher implements PriceFetcher {
  constructor(
    private readonly name: string,
    private readonly buildUrl: (product: string) => string
  ) {}

  async fetchPrice(product: string, _category?: string): Promise<PriceQuote | null> {
    const trimmed = product.trim();
    if (!trimmed) return null;
    const url = this.buildUrl(trimmed);
    const html = await fetchHtml(url);
    if (!html) {
      console.warn(`[${this.name}] no HTML for "${trimmed}"`);
      return null;
    }
    const price = lowestSane(parseLoosePrices(html));
    if (price == null) {
      console.warn(`[${this.name}] no prices for "${trimmed}"`);
      return null;
    }
    return {
      product: trimmed,
      price,
      currency: "MXN",
      source: url,
      checkedAt: new Date(),
    };
  }
}

export const walmartMxFetcher = new HtmlRetailFetcher(
  "WalmartMx",
  (q) => `https://www.walmart.com.mx/search?q=${slugQuery(q)}`
);

export const coppelFetcher = new HtmlRetailFetcher(
  "Coppel",
  (q) => `https://www.coppel.com/search?q=${slugQuery(q)}`
);

export const elektraFetcher = new HtmlRetailFetcher(
  "Elektra",
  (q) => `https://www.elektra.com.mx/buscar?q=${slugQuery(q)}`
);

export const amazonMxFetcher = new HtmlRetailFetcher(
  "AmazonMx",
  (q) => `https://www.amazon.com.mx/s?k=${slugQuery(q)}`
);

/** MVP stubs — return null until real APIs/partners exist. */
export class StubNullFetcher implements PriceFetcher {
  constructor(private readonly name: string) {}
  async fetchPrice(product: string, _category?: string): Promise<PriceQuote | null> {
    console.warn(`[${this.name} stub] sin cotización aún para "${product.trim()}"`);
    return null;
  }
}

export const despegarStub = new StubNullFetcher("Despegar");
export const skyscannerStub = new StubNullFetcher("Skyscanner");
export const kavakStub = new StubNullFetcher("Kavak");
export const seminuevosStub = new StubNullFetcher("Seminuevos");
export const mlAutosStub = new StubNullFetcher("MLAutos");
export const autocosmosStub = new StubNullFetcher("Autocosmos");
