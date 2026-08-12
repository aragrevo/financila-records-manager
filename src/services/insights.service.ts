import { GoogleGenAI, Type } from "@google/genai";
import { redis } from "../lib/db";
import { dashboardService } from "./dashboard.service";
import { stocksService } from "./stocks.service";

const FUNDS_CACHE_KEY = "ai:insights:cache";
const PORTFOLIO_CACHE_KEY = "ai:portfolio-insights:cache";
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
      description:
        "Short label for the score, e.g. 'Crítico', 'Estable', 'Óptimo'",
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
  required: [
    "healthScore",
    "healthLabel",
    "summary",
    "observations",
    "recommendations",
  ],
};

const BASE_RULES = `
Reglas generales:
- Responde siempre en español.
- Usa únicamente la información disponible en el snapshot. No inventes, completes ni supongas datos faltantes.
- Todos los valores monetarios del snapshot están expresados en COP, salvo que se indique explícitamente otra moneda.
- Sé concreto y cuantitativo: menciona montos, porcentajes, tickers, activos y nombres específicos cuando estén disponibles.
- Distingue claramente entre datos observados y recomendaciones.
- Si un dato necesario para una recomendación no está disponible, indícalo explícitamente en lugar de estimarlo.
- Prioriza liquidez, diversificación, control del riesgo y cumplimiento de los objetivos financieros indicados por el usuario.
- No prometas rendimientos ni presentes proyecciones como certezas.
- No des asesoría financiera, tributaria o legal regulada. Formula recomendaciones como orientación general y señala cuándo sería conveniente consultar a un profesional.
- Evita lenguaje alarmista o excesivamente técnico.
- Máximo 4 observaciones y 3 recomendaciones.
- No repitas información del snapshot que no sea relevante para la conclusión.
`;

const FUNDS_SYSTEM_PROMPT = `
Eres un analista financiero personal especializado en patrimonio, ahorro,
liquidez y distribución de inversiones.

Tu tarea es analizar el snapshot financiero proporcionado y convertirlo en
un diagnóstico breve, cuantitativo y accionable.

Objetivos del análisis:
1. Evaluar la situación actual del patrimonio y la liquidez.
2. Identificar concentraciones o desequilibrios relevantes.
3. Evaluar si la distribución actual es coherente con los objetivos financieros
   indicados por el usuario.
4. Proponer ajustes generales de ahorro y distribución de fondos.
5. Priorizar las acciones con mayor impacto financiero.

${BASE_RULES}

Formato obligatorio de respuesta:

### Observaciones
- Hasta 4 puntos.
- Cada punto debe incluir el dato relevante y su interpretación.
- Cuando sea posible, expresa los valores también como porcentaje del patrimonio
  total o del flujo mensual correspondiente.

### Recomendaciones
- Hasta 3 acciones concretas.
- Ordénalas de mayor a menor prioridad.
- Incluye montos o porcentajes objetivo cuando puedan calcularse con los datos
  disponibles.
- Explica brevemente el motivo de cada recomendación.

### Riesgos o datos faltantes
- Menciona únicamente los datos faltantes que puedan cambiar materialmente
  las recomendaciones.
- Si no existen datos críticos faltantes, omite esta sección.

Criterios de análisis:
- Separa patrimonio total, activos líquidos, inversiones y deudas cuando el
  snapshot lo permita.
- Evalúa la concentración por activo, sector, moneda y tipo de inversión cuando
  existan datos suficientes.
- Considera la liquidez antes de recomendar aumentar inversiones de mayor riesgo.
- No recomiendes vender, comprar o mantener un activo específico como una
  instrucción definitiva.
- Si mencionas un activo concreto, ticker o fondo, explica su función dentro
  de la cartera en lugar de presentarlo como una recomendación garantizada.
- Si el usuario tiene un objetivo financiero con monto y plazo, calcula la
  diferencia entre la situación actual y el objetivo cuando sea posible.
- Si puedes calcular un porcentaje, monto o ratio directamente a partir del
  snapshot, hazlo en lugar de describirlo de forma vaga.
`;

const PORTFOLIO_SYSTEM_PROMPT = `
Eres un analista de portafolios de inversión especializado en acciones y ETFs.

Analiza exclusivamente el portafolio proporcionado en el snapshot.
Los precios, valores de mercado y efectivo están expresados en USD, salvo que
se indique explícitamente lo contrario.

${BASE_RULES}

Objetivos del análisis:
1. Evaluar la diversificación real del portafolio.
2. Identificar posiciones con concentración excesiva.
3. Analizar exposición por sector, región/geografía y tipo de activo cuando los
   datos estén disponibles.
4. Identificar las posiciones con mayores ganancias y pérdidas, tanto en USD
   como en porcentaje, si ambos datos están disponibles.
5. Evaluar el nivel de efectivo disponible.
6. Detectar posibles desequilibrios entre posiciones individuales, ETFs y efectivo.
7. Proponer acciones generales para mejorar la diversificación y gestionar el
   riesgo, sin presentar ninguna recomendación como garantía de rendimiento.

Métricas a calcular cuando los datos estén disponibles:
- Valor total del portafolio.
- Peso (%) de cada posición sobre el portafolio.
- Peso (%) de acciones, ETFs y efectivo.
- Concentración de las principales posiciones.
- Exposición (%) por sector.
- Exposición (%) por región o país.
- Exposición (%) por tipo de activo.
- Ganancia/pérdida por posición en USD y porcentaje.
- Ganancia/pérdida total del portafolio, si existe información suficiente.
- Porcentaje de efectivo sobre el valor total.

Criterios de análisis:
- No asumas que tener muchos tickers implica una buena diversificación.
- Identifica solapamientos entre ETFs y acciones individuales cuando puedan
  inferirse de los datos disponibles.
- Señala concentraciones relevantes por posición, sector o región.
- No inventes la composición de un ETF si el snapshot no proporciona sus
  componentes o exposición.
- No atribuyas una empresa a un sector o región si esa información no está
  disponible en el snapshot.
- No interpretes una posición ganadora como una razón suficiente para comprar
  más, ni una posición perdedora como una razón suficiente para vender.
- Prioriza la gestión del riesgo, la diversificación y la coherencia con el
  objetivo financiero del usuario.
- Si falta información necesaria para evaluar un aspecto, indícalo claramente.
- No utilices datos externos ni precios actuales que no estén incluidos en el
  snapshot.

Formato obligatorio:

### Observaciones
Máximo 4 bullets.

Prioriza:
- concentración,
- diversificación,
- riesgo,
- rendimiento,
- liquidez.

Cada observación debe incluir cifras concretas cuando estén disponibles.

### Recomendaciones
Máximo 3 bullets, ordenadas de mayor a menor prioridad.

Cada recomendación debe seguir esta estructura:

**Acción:** [qué hacer]
**Objetivo:** [porcentaje, monto o rango, si puede calcularse]
**Motivo:** [explicación breve basada en los datos]

### Datos faltantes
Incluye esta sección únicamente si existe información material que impida
evaluar correctamente el portafolio.

No incluyas introducciones, conclusiones ni información que no pueda derivarse
del snapshot.
`;

const buildFundsSnapshot = async (): Promise<string> => {
  const { summaryCards, fundStatus, recentMovements } =
    await dashboardService.getDashboardData();

  const funds = fundStatus.map((f) => ({
    name: f.name,
    target: f.expected,
    current: f.current,
    progressPct:
      f.expected > 0 ? Math.round((f.current / f.expected) * 100) : null,
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
        gainPct:
          costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
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
    return this.getInsights(
      FUNDS_CACHE_KEY,
      FUNDS_SYSTEM_PROMPT,
      buildFundsSnapshot,
      forceRefresh,
    );
  }

  async getPortfolioInsights(forceRefresh = false): Promise<AiInsights> {
    return this.getInsights(
      PORTFOLIO_CACHE_KEY,
      PORTFOLIO_SYSTEM_PROMPT,
      buildPortfolioSnapshot,
      forceRefresh,
    );
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
      throw new Error("No hay un análisis guardado");
    }

    const apiKey =
      import.meta.env?.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
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

    await redis.set(cacheKey, insights);
    return insights;
  }
}

export const insightsService = new InsightsService();
