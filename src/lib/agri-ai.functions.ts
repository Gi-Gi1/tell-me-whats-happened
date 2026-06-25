import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const SYSTEM = `You are Orvia, an agricultural advisor for Myanmar farmers.
All answers are RECOMMENDATIONS, not guarantees. Use realistic local context (rice, pulses, sesame, groundnut, onion, corn).
Always respond in valid structured form requested by the schema. Keep text concise and practical.
Match the user's requested language code (my=Myanmar Unicode, en=English).`;

const ContextSchema = z.object({
  region: z.string().default("Mandalay"),
  township: z.string().default(""),
  season: z.string().default("Monsoon"),
  soil: z.string().default("Loamy"),
  farmSize: z.string().default("5 acres"),
  irrigation: z.string().default("Available"),
  lang: z.enum(["my", "en"]).default("en"),
});

type Ctx = z.infer<typeof ContextSchema>;

// Discriminated result so the client never sees a thrown error.
type Ok<T> = { ok: true; data: T; fallback?: false };
type Fail<T> = { ok: false; data: T; fallback: true; error: string };
type Result<T> = Ok<T> | Fail<T>;

async function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  return createLovableAiGatewayProvider(key);
}

function errMsg(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/402/.test(m)) return "AI credits exhausted";
  if (/429/.test(m)) return "AI rate limit reached";
  return "AI service unavailable";
}

// ---------------- INSIGHTS ----------------
const InsightItem = z.object({
  title: z.string(),
  body: z.string(),
  category: z.string(),
  priority: z.string(),
  confidence: z.number(),
});
const InsightsOut = z.object({ insights: z.array(InsightItem) });
type InsightsT = z.infer<typeof InsightsOut>;

function fallbackInsights(lang: string): InsightsT {
  const my = lang === "my";
  return {
    insights: [
      { title: my ? "ဆန် ဈေး တက်နိုင်" : "Rice prices may rise", body: my ? "ထောက်ပံ့မှု လျော့ခြင်းကြောင့် လာမည့်ရက်များတွင် ဈေး တက်နိုင်ပါသည်။" : "Reduced supply may push prices up in the coming weeks.", category: "market", priority: "medium", confidence: 60 },
      { title: my ? "မိုးအသင့်အတင့်" : "Moderate rainfall expected", body: my ? "ရေပေးစနစ်ကို ကြိုတင်ပြင်ဆင်ထားရန် အကြံပြုသည်။" : "Prepare drainage and irrigation in advance.", category: "weather", priority: "medium", confidence: 55 },
      { title: my ? "ပိုးကင်းစစ်ပါ" : "Monitor pests", body: my ? "မိုးရာသီတွင် ပိုးမွှား မြန်ဆန်စွာ ပျံ့နှံ့နိုင်သည်။" : "Pests spread quickly during monsoon — inspect weekly.", category: "pest", priority: "high", confidence: 65 },
      { title: my ? "ပဲမျိုးစုံ ပြည်ပတင်ပို့မှု" : "Pulses export demand", body: my ? "ပဲမျိုးစုံ ပြည်ပ ဝယ်လိုအား မြင့်တက်နေသည်။" : "Export demand for pulses is rising steadily.", category: "export", priority: "medium", confidence: 60 },
    ],
  };
}

export const generateInsights = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContextSchema.partial().parse(d ?? {}))
  .handler(async ({ data }): Promise<Result<InsightsT>> => {
    const lang = data.lang ?? "en";
    try {
      const provider = await gateway();
      const { output } = await generateText({
        model: provider("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt: `Generate 4-6 short AI agricultural insight cards for Myanmar farmers. Mix categories among: market, weather, pest, export, policy, tip. Each item: title, body, category (one of those words), priority (low|medium|high), confidence (0-100). Language code: ${lang}.`,
        output: Output.object({ schema: InsightsOut }),
      });
      return { ok: true, data: output };
    } catch (e) {
      return { ok: false, fallback: true, error: errMsg(e), data: fallbackInsights(lang) };
    }
  });

// ---------------- RECOMMENDATION ----------------
const RecOut = z.object({
  bestCrop: z.string(),
  alternativeCrops: z.array(z.string()),
  profitPotential: z.string(),
  riskLevel: z.string(),
  harvestPeriod: z.string(),
  marketDemand: z.string(),
  tips: z.array(z.string()),
  confidence: z.number(),
  reasoning: z.string(),
});
type RecT = z.infer<typeof RecOut>;

function fallbackRec(ctx: Ctx): RecT {
  const my = ctx.lang === "my";
  const isDry = /Dry|Summer/i.test(ctx.season);
  const isRainfed = /Rain-?fed/i.test(ctx.irrigation);
  const drought = isDry && isRainfed;
  const crop = drought
    ? (my ? "နှမ်း" : "Sesame")
    : isDry
      ? (my ? "ပြောင်း" : "Corn")
      : (my ? "ဆန်စပါး" : "Rice");
  return {
    bestCrop: crop,
    alternativeCrops: my ? ["ပြောင်း", "ပဲတီစိမ်း"] : ["Corn", "Green gram"],
    profitPotential: "Medium",
    riskLevel: "Medium",
    harvestPeriod: my ? "၃-၄ လ" : "3-4 months",
    marketDemand: "High",
    tips: my
      ? ["မြေဆီလွှာစစ်ဆေးပါ", "ပိုးမွှားကို ပုံမှန် စစ်ဆေးပါ", "ဈေးကွက်ဈေး စောင့်ကြည့်ပါ"]
      : ["Test soil before sowing", "Inspect for pests weekly", "Track local market prices"],
    confidence: 50,
    reasoning: my
      ? "AI ယာယီမရနိုင်သဖြင့် ဒေသနှင့် ရာသီ အပေါ်အခြေခံ၍ စံပြ အကြံပြုထားသည်။"
      : "AI temporarily unavailable — showing region/season-based default recommendation.",
  };
}

export const generateRecommendation = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContextSchema.parse(d))
  .handler(async ({ data }): Promise<Result<RecT>> => {
    try {
      const provider = await gateway();
      const { output } = await generateText({
        model: provider("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt: `Recommend the best crop for this Myanmar farm. Language: ${data.lang}.
Region: ${data.region}
Township: ${data.township}
Season: ${data.season}
Soil: ${data.soil}
Farm size: ${data.farmSize}
Irrigation: ${data.irrigation}
Use short strings. profitPotential/marketDemand: Low|Medium|High. riskLevel: Low|Medium|High. Provide 3-5 practical tips.`,
        output: Output.object({ schema: RecOut }),
      });
      return { ok: true, data: output };
    } catch (e) {
      return { ok: false, fallback: true, error: errMsg(e), data: fallbackRec(data) };
    }
  });

// ---------------- SEASONAL PLAN ----------------
const PlanStep = z.object({
  stage: z.string(),
  timeframe: z.string(),
  description: z.string(),
  tip: z.string(),
});
const PlanOut = z.object({
  crop: z.string(),
  steps: z.array(PlanStep),
  confidence: z.number(),
});
type PlanT = z.infer<typeof PlanOut>;

const STAGES = ["Land Preparation", "Planting", "Fertilizing", "Irrigation", "Pest Monitoring", "Harvest"];

function fallbackPlan(ctx: Ctx & { crop: string }): PlanT {
  const my = ctx.lang === "my";
  return {
    crop: ctx.crop,
    confidence: 50,
    steps: STAGES.map((s, i) => ({
      stage: s,
      timeframe: my ? `အပတ် ${i * 2 + 1}-${i * 2 + 2}` : `Week ${i * 2 + 1}-${i * 2 + 2}`,
      description: my ? "ဒေသခံ စံပြ အလေ့အကျင့်များကို လိုက်နာပါ။" : "Follow standard local best practices.",
      tip: my ? "ပုံမှန် မှတ်တမ်းတင်ပါ။" : "Keep regular field notes.",
    })),
  };
}

export const generateSeasonalPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContextSchema.extend({ crop: z.string().default("Rice") }).parse(d))
  .handler(async ({ data }): Promise<Result<PlanT>> => {
    try {
      const provider = await gateway();
      const { output } = await generateText({
        model: provider("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt: `Build a 6-stage seasonal farming schedule for ${data.crop} in ${data.region}, ${data.season} season. Language: ${data.lang}.
Use exactly these stages in order: Land Preparation, Planting, Fertilizing, Irrigation, Pest Monitoring, Harvest.
Each step: timeframe (e.g. "Week 1-2"), description, tip.`,
        output: Output.object({ schema: PlanOut }),
      });
      return { ok: true, data: output };
    } catch (e) {
      return { ok: false, fallback: true, error: errMsg(e), data: fallbackPlan(data) };
    }
  });

// ---------------- OPPORTUNITIES ----------------
const OppItem = z.object({
  type: z.string(),
  title: z.string(),
  body: z.string(),
  expectedUpside: z.string(),
  confidence: z.number(),
  urgency: z.string(),
});
const OppOut = z.object({ opportunities: z.array(OppItem) });
type OppT = z.infer<typeof OppOut>;

function fallbackOpps(lang: string): OppT {
  const my = lang === "my";
  return {
    opportunities: [
      { type: "High Demand Crop", title: my ? "ပဲမျိုးစုံ ဝယ်လိုအား မြင့်" : "Pulses in high demand", body: my ? "ပြည်တွင်း လိုအပ်ချက် မြင့်တက်လျက်ရှိ။" : "Domestic demand trending up.", expectedUpside: "+10%", confidence: 55, urgency: "medium" },
      { type: "Export Opportunity", title: my ? "ပြည်ပ ပြောင်း တင်ပို့မှု" : "Corn export window", body: my ? "ပြည်ပဈေးကွက် ဖွင့်လှစ်ထား။" : "Regional export window open.", expectedUpside: "+8%", confidence: 50, urgency: "medium" },
      { type: "Local Market", title: my ? "ဒေသခံဈေး တက်နေ" : "Local market firming", body: my ? "ဒေသခံ ဈေးနှုန်း တည်ငြိမ်စွာ မြင့်တက်နေ။" : "Local prices firming this week.", expectedUpside: "+5%", confidence: 55, urgency: "low" },
      { type: "Selling Period", title: my ? "ရောင်းချရန် အချိန်" : "Optimal selling window", body: my ? "လာမည့် ၂ ပတ်အတွင်း ရောင်းချရန် သင့်တော်သည်။" : "Sell within the next 2 weeks.", expectedUpside: "+6%", confidence: 60, urgency: "high" },
    ],
  };
}

export const generateOpportunities = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContextSchema.partial().parse(d ?? {}))
  .handler(async ({ data }): Promise<Result<OppT>> => {
    const lang = data.lang ?? "en";
    try {
      const provider = await gateway();
      const { output } = await generateText({
        model: provider("google/gemini-3-flash-preview"),
        system: SYSTEM,
        prompt: `Generate exactly 4 market opportunity cards for Myanmar farmers — one of each type: "High Demand Crop", "Export Opportunity", "Local Market", "Selling Period". Each: title, body, expectedUpside (e.g. "+8%"), confidence (0-100), urgency (low|medium|high). Language: ${lang}.`,
        output: Output.object({ schema: OppOut }),
      });
      return { ok: true, data: output };
    } catch (e) {
      return { ok: false, fallback: true, error: errMsg(e), data: fallbackOpps(lang) };
    }
  });
