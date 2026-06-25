import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


const InputSchema = z.object({
  imageBase64: z.string().min(50),
  mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/),
});

export type CropDiagnosis = {
  is_healthy: boolean;
  disease_name_my: string;
  severity: "low" | "medium" | "high" | "none";
  confidence: number; // 0-100
  causes_my: string[];
  treatments_my: string[];
  organic_alternatives_my: string[];
  prevention_my: string[];
  recovery_time_my: string;
  summary_my: string;
};

const SYSTEM_PROMPT = `သင်သည် မြန်မာနိုင်ငံအတွက် အတွေ့အကြုံရှိ စိုက်ပျိုးရေး ဆေးခန်းအထူးကု AI တစ်ဦးဖြစ်သည်။
တောင်သူပေးပို့လာသော သီးနှံ၏ဓာတ်ပုံကို စိစစ်ပြီး ရောဂါ၊ ပိုးမွှား သို့မဟုတ် ဓာတ်ချို့တဲ့မှုကို သတ်မှတ်ပါ။
အဖြေအားလုံးကို သဘာဝကျသော မြန်မာဘာသာ (ယူနီကုဒ်) ဖြင့်သာ ပြန်ပါ။ စပ်ထားသော အင်္ဂလိပ်စကားလုံးများ မထည့်ပါနှင့်။
ဖြေဆိုပုံစံကို JSON အတိအကျ လိုက်နာပါ။ ပုံကို မမှန်းဆနိုင်ပါက summary_my ထဲတွင် ပွင့်လင်းစွာ ဖော်ပြပါ။`;

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_healthy",
    "disease_name_my",
    "severity",
    "confidence",
    "causes_my",
    "treatments_my",
    "organic_alternatives_my",
    "prevention_my",
    "recovery_time_my",
    "summary_my",
  ],
  properties: {
    is_healthy: { type: "boolean" },
    disease_name_my: { type: "string" },
    severity: { type: "string", enum: ["low", "medium", "high", "none"] },
    confidence: { type: "number" },
    causes_my: { type: "array", items: { type: "string" } },
    treatments_my: { type: "array", items: { type: "string" } },
    organic_alternatives_my: { type: "array", items: { type: "string" } },
    prevention_my: { type: "array", items: { type: "string" } },
    recovery_time_my: { type: "string" },
    summary_my: { type: "string" },
  },
} as const;

export const analyzeCropImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<CropDiagnosis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY မရှိပါ — Lovable AI ဂိတ်ဝေး မချိတ်ဆက်ထားသေးပါ။");

    const dataUrl = `data:${data.mimeType};base64,${data.imageBase64}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "ဤသီးနှံပုံကို စစ်ဆေးပြီး ရောဂါအခြေအနေနှင့် ကုသနည်းကို မြန်မာဘာသာဖြင့် JSON ဖော်မြူလာအတိုင်း ပြန်ပါ။",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "crop_diagnosis",
            schema: RESPONSE_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) {
        throw new Error("တောင်းဆိုမှု များလွန်းနေပါသည်။ ခဏနေ၍ ပြန်လည်ကြိုးစားပါ။");
      }
      if (res.status === 402) {
        throw new Error("AI Credit ကုန်ဆုံးနေပါသည်။ စီမံခန့်ခွဲသူထံ ဆက်သွယ်ပါ။");
      }
      console.error("[crop-doctor] gateway error", res.status, text);
      throw new Error("AI စစ်ဆေးခြင်း မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။");
    }

    const json = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: CropDiagnosis;
    try {
      parsed = JSON.parse(content) as CropDiagnosis;
    } catch {
      throw new Error("AI ၏ ပြန်ဖြေချက်ကို ဖတ်၍ မရပါ။");
    }
    // clamp confidence
    parsed.confidence = Math.max(0, Math.min(100, Math.round(parsed.confidence ?? 0)));

    // Always enforce a deterministic recovery window based on severity so the
    // UI never shows an empty / hallucinated value.
    const RECOVERY_BY_SEVERITY: Record<CropDiagnosis["severity"], string> = {
      none:   "ကျန်းမာသန်စွမ်းသည် — ပြန်လည်နာလန်ထူရန် မလို",
      low:    "၃–၅ ရက် (Low severity)",
      medium: "၁–၂ ပတ် (Medium severity)",
      high:   "၂–၃ ပတ် (High severity)",
    };
    const sev: CropDiagnosis["severity"] =
      parsed.severity && ["low", "medium", "high", "none"].includes(parsed.severity)
        ? parsed.severity
        : (parsed.is_healthy ? "none" : "medium");
    parsed.severity = sev;
    parsed.recovery_time_my = RECOVERY_BY_SEVERITY[sev];

    return parsed;
  });
