/**
 * PriceFetcher — stub interface for Mexico marketplace price checks.
 * Swap MockPriceFetcher for a real scraper/API later.
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

export const priceFetcher: PriceFetcher = new MockPriceFetcher();
