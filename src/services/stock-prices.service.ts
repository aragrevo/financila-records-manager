const YAHOO_CHART_ENDPOINT =
  "https://query1.finance.yahoo.com/v8/finance/chart";
const REQUEST_TIMEOUT_MS = 5000;
const CHUNK_SIZE = 3;

export interface StockQuotesResult {
  quotesBySymbol: Record<string, number>;
  failedSymbols: string[];
}

const chunkItems = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const normalizeSymbols = (symbols: string[]): string[] => [
  ...new Set(
    symbols.map((symbol) => symbol.trim().toUpperCase()).filter(Boolean),
  ),
];

const getRegularMarketPrice = (payload: unknown): number | null => {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const chart = Reflect.get(payload, "chart");
  if (typeof chart !== "object" || chart === null) {
    return null;
  }

  const result = Reflect.get(chart, "result");
  if (!Array.isArray(result) || result.length === 0) {
    return null;
  }

  const meta = Reflect.get(result[0], "meta");
  if (typeof meta !== "object" || meta === null) {
    return null;
  }

  const regularMarketPrice = Reflect.get(meta, "regularMarketPrice");
  return typeof regularMarketPrice === "number" &&
    Number.isFinite(regularMarketPrice) &&
    regularMarketPrice > 0
    ? regularMarketPrice
    : null;
};

export class StockPricesService {
  private async getQuoteForSymbol(symbol: string): Promise<number | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        `${YAHOO_CHART_ENDPOINT}/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "financial-records-manager/1.0",
          },
          signal: controller.signal,
        },
      );
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as unknown;
      return getRegularMarketPrice(payload);
    } catch {
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getQuotes(symbols: string[]): Promise<StockQuotesResult> {
    const normalizedSymbols = normalizeSymbols(symbols);
    const quotesBySymbol: Record<string, number> = {};
    const failedSymbols = new Set<string>();

    for (const chunk of chunkItems(normalizedSymbols, CHUNK_SIZE)) {
      const results = await Promise.all(
        chunk.map(async (symbol) => ({
          symbol,
          price: await this.getQuoteForSymbol(symbol),
        })),
      );

      for (const result of results) {
        if (result.price === null) {
          failedSymbols.add(result.symbol);
          continue;
        }

        quotesBySymbol[result.symbol] = result.price;
      }
    }

    return {
      quotesBySymbol,
      failedSymbols: [...failedSymbols],
    };
  }
}

export const stockPricesService = new StockPricesService();
