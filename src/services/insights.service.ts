import { GoogleGenAI, Type } from "@google/genai";
import { redis } from "../lib/db";
import { dashboardService } from "./dashboard.service";
import { stocksService } from "./stocks.service";

const FUNDS_CACHE_KEY = "ai:insights:cache";
const PORTFOLIO_CACHE_KEY = "ai:portfolio-insights:cache";
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const MODEL = "gemini-flash-latest";

export interface AiInsights {
  healthScore: number;
  healthLabel: string;
  summary: string;
  observations: Array<{
    sentiment: "positive" | "warning" | "info";
    text: string;
  }>;
  recommendations: Array<{
    title: string;
    detail: string;
    priority: "high" | "medium" | "low";
  }>;
  generatedAt: string;
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    healthScore: {
      type: Type.NUMBER,
      description: "Overall score from 0 to 100",
    },
    healthLabel: {
      type: Type.STRING,
      description: "Short label for the score, e.g. 'Crítico', 'Estable', 'Óptimo'",
    },
    summary: {
      type: Type.STRING,
      description: "One-paragraph overall analysis",
    },
    observations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          sentiment: {
            type: Type.STRING,
            enum: ["positive", "warning", "info"],
          },
          text: { type: Type.STRING },
        },
        required: ["sentiment", "text"],
      },
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          detail: { type: Type.STRING },
          priority: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: ["title", "detail", "priority"],
      },
    },
  },
  required: ["healthScore", "healthLabel", "summary", "observations", "recommendations"],
};

const BASE_RULES = `Reglas:
- Responde en español.
- Sé específico: menciona montos, porcentajes, tickers y nombres cuando aplique.
- Máximo 4 observaciones y 3 recomendaciones.
- No inventes datos que no estén en el snapshot.
- No des asesoría financiera regulada; sugiere acciones generales.`;

const FUNDS_SYSTEM_PROMPT = `Eres un analista financiero personal. Analiza los datos financieros
proporcionados (valores en COP) y devuelve un análisis conciso con recomendaciones prácticas de
ahorro y distribución de fondos.
${BASE_RULES}`;

const PORTFOLIO_SYSTEM_PROMPT = `Eres un analista de portafolios de inversión. Analiza el portafolio
de acciones/ETFs proporcionado (precios y valores en USD) y evalúa: diversificación por sector,
región y tipo de activo, concentración de riesgo, posiciones ganadoras/perdedoras y efectivo
disponible. Devuelve un análisis conciso con recomendaciones prácticas de diversificación y gestión.
${BASE_RULES}`;

const buildFundsSnapshot = async (): Promise<string> => {
  const { summaryCards, fundStatus, recentMovements } =
    await dashboardService.getDashboardData();

  const funds = fundStatus.map((f) => ({
    name: f.name,
    target: f.expected,
    current: f.current,
    progressPct: f.expected > 0 ? Math.round((f.current / f.expected) * 100) : null,
    difference: f.difference,
  }));

  return JSON.stringify(
    {
      summaryCards: summaryCards.map((c) => ({
        title: c.title,
        value: c.value,
        subtitle: c.subtitle,
      })),
      funds,
      recentMovements,
    },
    null,
    2,
  );
};

const buildPortfolioSnapshot = async (): Promise<string> => {
  const [accounts, positions] = await Promise.all([
    stocksService.getAccounts(),
    stocksService.getPositions(),
  ]);

  const active = positions.filter((p) => p.status === "active");
  const accountById = new Map(accounts.map((a) => [a.id, a]));

  const marketValue = active.reduce(
    (sum, p) => sum + p.shares * p.currentPrice,
    0,
  );
  const investedCapital = active.reduce(
    (sum, p) => sum + p.shares * p.averageCost,
    0,
  );
  const availableCash = accounts.reduce((sum, a) => sum + a.availableCash, 0);

  const holdings = active
    .map((p) => {
      const currentValue = p.shares * p.currentPrice;
      const costBasis = p.shares * p.averageCost;
      return {
        symbol: p.symbol,
        name: p.name,
        assetType: p.assetType,
        sector: p.sector ?? null,
        region: p.region ?? null,
        broker: accountById.get(p.accountId)?.broker ?? null,
        shares: p.shares,
        averageCost: p.averageCost,
        currentPrice: p.currentPrice,
        currentValue,
        gain: currentValue - costBasis,
        gainPct: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
        weightPct: marketValue > 0 ? (currentValue / marketValue) * 100 : 0,
      };
    })
    .sort((a, b) => b.currentValue - a.currentValue);

  const groupSum = (key: "assetType" | "sector" | "region") => {
    const groups: Record<string, number> = {};
    for (const h of holdings) {
      const label = String(h[key] ?? "desconocido");
      groups[label] = (groups[label] || 0) + h.currentValue;
    }
    return Object.entries(groups).map(([label, value]) => ({
      label,
      value,
      pct: marketValue > 0 ? (value / marketValue) * 100 : 0,
    }));
  };

  return JSON.stringify(
    {
      totals: {
        portfolioValue: marketValue + availableCash,
        marketValue,
        investedCapital,
        unrealizedGain: marketValue - investedCapital,
        performancePct:
          investedCapital > 0
            ? ((marketValue - investedCapital) / investedCapital) * 100
            : 0,
        availableCash,
        monthlyContribution: accounts.reduce(
          (sum, a) => sum + a.monthlyContribution,
          0,
        ),
      },
      allocationByAssetType: groupSum("assetType"),
      allocationBySector: groupSum("sector"),
      allocationByRegion: groupSum("region"),
      holdings,
    },
    null,
    2,
  );
};

export class InsightsService {
  async getFundsInsights(forceRefresh = false): Promise<AiInsights> {
    return this.getInsights(FUNDS_CACHE_KEY, FUNDS_SYSTEM_PROMPT, buildFundsSnapshot, forceRefresh);
  }

  async getPortfolioInsights(forceRefresh = false): Promise<AiInsights> {
    return this.getInsights(PORTFOLIO_CACHE_KEY, PORTFOLIO_SYSTEM_PROMPT, buildPortfolioSnapshot, forceRefresh);
  }

  private async getInsights(
    cacheKey: string,
    systemPrompt: string,
    buildSnapshot: () => Promise<string>,
    forceRefresh: boolean,
  ): Promise<AiInsights> {
    if (!forceRefresh) {
      const cached = await redis.get<AiInsights>(cacheKey);
      if (cached) return cached;
    }

    const apiKey = import.meta.env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({ apiKey });
    const snapshot = await buildSnapshot();

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: snapshot,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text) as Omit<AiInsights, "generatedAt">;
    const insights: AiInsights = {
      ...parsed,
      generatedAt: new Date().toISOString(),
    };

    await redis.set(cacheKey, insights, { ex: CACHE_TTL_SECONDS });
    return insights;
  }
}

export const insightsService = new InsightsService();
