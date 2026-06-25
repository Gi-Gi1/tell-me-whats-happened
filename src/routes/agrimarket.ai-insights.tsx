import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Sparkles, Brain, TrendingUp, ShieldAlert, ChevronDown, ChevronUp,
  Sprout, CloudRain, Bug, Globe2, Lightbulb, Tractor,
  Calendar, Droplets, Beaker, Wheat, Eye, Loader2, AlertTriangle, BadgeCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  generateInsights, generateRecommendation, generateSeasonalPlan, generateOpportunities,
} from "@/lib/agri-ai.functions";

export const Route = createFileRoute("/agrimarket/ai-insights")({
  head: () => ({
    meta: [
      { title: "AI Insights & Recommendations — Orvia" },
      { name: "description", content: "AI-powered agricultural insights, crop recommendations, seasonal plans and market opportunities for Myanmar farmers." },
    ],
  }),
  component: AiInsightsPage,
});

type Opt = { value: string; my: string };
const REGIONS: Opt[] = [
  { value: "Ayeyarwady",  my: "ဧရာဝတီ" },
  { value: "Bago",        my: "ပဲခူး" },
  { value: "Mandalay",    my: "မန္တလေး" },
  { value: "Sagaing",     my: "စစ်ကိုင်း" },
  { value: "Shan",        my: "ရှမ်း" },
  { value: "Magway",      my: "မကွေး" },
  { value: "Yangon",      my: "ရန်ကုန်" },
  { value: "Kayin",       my: "ကရင်" },
  { value: "Mon",         my: "မွန်" },
  { value: "Chin",        my: "ချင်း" },
  { value: "Kachin",      my: "ကချင်" },
  { value: "Kayah",       my: "ကယား" },
  { value: "Tanintharyi", my: "တနင်္သာရီ" },
];
const SEASONS: Opt[] = [
  { value: "Early Monsoon",       my: "မိုးဦးရာသီ" },
  { value: "Late Monsoon",        my: "မိုးနှောင်းရာသီ" },
  { value: "Cool Dry Season",     my: "ဆောင်းရာသီ (အေး/ခြောက်)" },
  { value: "Hot Dry Season",      my: "နွေရာသီ (ပူ/ခြောက်)" },
  { value: "Pre-Monsoon Transition",  my: "မိုးမတိုင်မီ ကူးပြောင်းကာလ" },
  { value: "Post-Monsoon Transition", my: "မိုးပြီး ကူးပြောင်းကာလ" },
];
const SOILS: Opt[] = [
  { value: "Loamy",         my: "နုန်းမြေ" },
  { value: "Clay",          my: "ရွှံ့မြေ" },
  { value: "Sandy",         my: "သဲမြေ" },
  { value: "Silt",          my: "နုန်းသဲမြေ" },
  { value: "Black Cotton",  my: "မြေနက်" },
];
const IRRIGATION: Opt[] = [
  { value: "Rain-fed",            my: "မိုးရေအခြေပြု" },
  { value: "Canal Irrigation",    my: "မြောင်းရေပေး" },
  { value: "Groundwater Pump",    my: "မြေအောက်ရေ စုပ်စက်" },
  { value: "River-based Irrigation", my: "မြစ်ရေ သုံးစနစ်" },
  { value: "Drip Irrigation",     my: "စက်ပက် (Drip)" },
  { value: "Mixed System",        my: "ပေါင်းစပ်စနစ်" },
];

const CAT_META: Record<string, { icon: typeof Sprout; tone: string }> = {
  market:  { icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  weather: { icon: CloudRain,  tone: "bg-sky-50 text-sky-700 border-sky-200" },
  pest:    { icon: Bug,        tone: "bg-rose-50 text-rose-700 border-rose-200" },
  export:  { icon: Globe2,     tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  policy:  { icon: BadgeCheck, tone: "bg-amber-50 text-amber-700 border-amber-200" },
  tip:     { icon: Lightbulb,  tone: "bg-lime-50 text-lime-700 border-lime-200" },
};

const STAGE_ICON: Record<string, typeof Tractor> = {
  "Land Preparation": Tractor,
  "Planting": Sprout,
  "Fertilizing": Beaker,
  "Irrigation": Droplets,
  "Pest Monitoring": Eye,
  "Harvest": Wheat,
};

const OPP_TONE: Record<string, string> = {
  "High Demand Crop":    "from-emerald-500 to-emerald-700",
  "Export Opportunity":  "from-indigo-500 to-indigo-700",
  "Local Market":        "from-amber-500 to-amber-700",
  "Selling Period":      "from-rose-500 to-rose-700",
};

function AiInsightsPage() {
  const { lang, t } = useI18n();
  const [form, setForm] = useState({
    region: "Mandalay", township: "", season: "Early Monsoon",
    soil: "Loamy", farmSize: "5 acres", irrigation: "Rain-fed",
  });

  const insightsFn  = useServerFn(generateInsights);
  const recFn       = useServerFn(generateRecommendation);
  const planFn      = useServerFn(generateSeasonalPlan);
  const oppFn       = useServerFn(generateOpportunities);

  const insights = useMutation({ mutationFn: () => insightsFn({ data: { lang } }) });
  const rec      = useMutation({ mutationFn: () => recFn({ data: { ...form, lang } }) });
  const plan     = useMutation({ mutationFn: (crop: string) => planFn({ data: { ...form, lang, crop } }) });
  const opps     = useMutation({ mutationFn: () => oppFn({ data: { lang } }) });

  const L = (my: string, en: string) => t(en, { my, en });

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-agri-primary-soft px-3 py-1 text-xs font-semibold text-agri-primary-dark">
            <Sparkles className="h-3.5 w-3.5" />
            {L("AI ပံ့ပိုးထားသော အကြံပြုချက်များ", "AI-Powered Recommendations")}
          </div>
          <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
            {L("AI လယ်ယာ ဉာဏ်ရည် ဒက်ရှ်ဘုတ်", "AI Agricultural Insights")}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {L("* AI မှ ထုတ်ပေးသော အကြံပြုချက်များသာ — အာမခံချက် မဟုတ်ပါ။",
               "* AI-generated recommendations — not guarantees.")}
          </p>

        </div>
        <span className="hidden shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-800 sm:inline-flex">
          <AlertTriangle className="h-3.5 w-3.5" /> {L("AI အကြံပြုချက်", "AI advice")}
        </span>
      </header>

      {/* 1. INSIGHTS */}
      <Section
        title={L("AI လယ်ယာ အသိပညာ ကဒ်များ", "AI Agricultural Insights")}
        icon={Brain}
        action={
          <RunButton loading={insights.isPending} onClick={() => insights.mutate()}>
            {insights.data ? L("ပြန်လည် ထုတ်ပေးမည်", "Regenerate") : L("ထုတ်ပေးမည်", "Generate")}
          </RunButton>
        }
      >
        {insights.isError && <ErrorBox onRetry={() => insights.mutate()} />}
        {!insights.data && !insights.isPending && (
          <Empty msg={L("ဈေးကွက်နှင့် ရာသီဥတု အကြောင်း AI အသိပညာ ကဒ်များ ထုတ်ပေးပါ။",
                       "Generate AI insight cards from market + weather context.")} />
        )}
        {insights.isPending && <Skeleton lines={4} />}
        {insights.data?.fallback && <FallbackNote msg={insights.data.error} L={L} />}
        {insights.data && (
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.data.data.insights.map((it, i) => {
              const meta = CAT_META[it.category] ?? CAT_META.tip;
              return (
                <ExpandableCard
                  key={i}
                  icon={meta.icon}
                  tone={meta.tone}
                  title={it.title}
                  body={it.body}
                  badges={[
                    { label: it.category.toUpperCase(), kind: "neutral" },
                    { label: `${L("ဦးစားပေး", "Priority")}: ${it.priority}`, kind: it.priority === "high" ? "bad" : it.priority === "medium" ? "warn" : "good" },
                  ]}
                  confidence={it.confidence}
                />
              );
            })}
          </div>
        )}
      </Section>

      {/* 2. CROP RECOMMENDATION */}
      <Section title={L("AI သီးနှံ အကြံပြုချက်", "AI Crop Recommendation")} icon={Sprout}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label={L("ပြည်နယ်/တိုင်း", "Region")} value={form.region} onChange={(v) => setForm({ ...form, region: v })} options={REGIONS} />
          <Field label={L("မြို့နယ်", "Township")} value={form.township} onChange={(v) => setForm({ ...form, township: v })} placeholder={L("ဥပမာ - မိတ္ထီလာ", "e.g. Meiktila")} />
          <Field label={L("ရာသီ", "Season")} value={form.season} onChange={(v) => setForm({ ...form, season: v })} options={SEASONS} />
          <Field label={L("မြေအမျိုးအစား", "Soil Type")} value={form.soil} onChange={(v) => setForm({ ...form, soil: v })} options={SOILS} />
          <Field label={L("လယ်ဧက", "Farm Size")} value={form.farmSize} onChange={(v) => setForm({ ...form, farmSize: v })} placeholder="5 acres" />
          <Field label={L("ရေပေး စနစ်", "Irrigation")} value={form.irrigation} onChange={(v) => setForm({ ...form, irrigation: v })} options={IRRIGATION} />
        </div>
        <div className="mt-4 flex justify-end">
          <RunButton loading={rec.isPending} onClick={() => rec.mutate()}>
            {L("AI အကြံပြုချက် ရယူရန်", "Get AI Recommendation")}
          </RunButton>
        </div>
        {rec.isError && <div className="mt-4"><ErrorBox onRetry={() => rec.mutate()} /></div>}
        {rec.isPending && <div className="mt-4"><Skeleton lines={3} /></div>}
        {rec.data?.fallback && <FallbackNote msg={rec.data.error} L={L} />}
        {rec.data && (
          <div className="mt-5 rounded-3xl border border-agri-border bg-gradient-to-br from-agri-primary-soft/60 to-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-black text-agri-ink">🌱 {rec.data.data.bestCrop}</h3>
              <ConfidencePill value={rec.data.data.confidence} />
            </div>
            <p className="mt-1 text-sm text-agri-ink/70">{rec.data.data.reasoning}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={L("အမြတ်အလား", "Profit")} value={rec.data.data.profitPotential} />
              <Stat label={L("အန္တရာယ်", "Risk")} value={rec.data.data.riskLevel} />
              <Stat label={L("လိုအပ်မှု", "Demand")} value={rec.data.data.marketDemand} />
              <Stat label={L("ရိတ်သိမ်းချိန်", "Harvest")} value={rec.data.data.harvestPeriod} />
            </div>
            {rec.data.data.alternativeCrops.length > 0 && (
              <p className="mt-3 text-xs text-agri-ink/60">
                {L("အခြားရွေးချယ်စရာ", "Alternatives")}: {rec.data.data.alternativeCrops.join(", ")}
              </p>
            )}
            <div className="mt-4">
              <div className="text-xs font-bold uppercase tracking-wide text-agri-ink/60">{L("လယ်ယာ အကြံပြုချက်", "Farming Tips")}</div>
              <ul className="mt-2 space-y-1.5">
                {rec.data.data.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-agri-ink/80">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => plan.mutate(rec.data!.data.bestCrop)}
                className="inline-flex items-center gap-1.5 rounded-full bg-agri-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-agri-primary-dark"
              >
                <Calendar className="h-3.5 w-3.5" />
                {L("ရာသီ အစီအစဉ် ထုတ်ပေးမည်", "Generate Seasonal Plan")}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* 3. SEASONAL PLAN */}
      <Section
        title={L("AI ရာသီ စိုက်ပျိုးရေး အစီအစဉ်", "AI Seasonal Planning")}
        icon={Calendar}
        action={
          <RunButton loading={plan.isPending} onClick={() => plan.mutate(rec.data?.data.bestCrop ?? "Rice")}>
            {plan.data ? L("ပြန်လည် ထုတ်ပေးမည်", "Regenerate") : L("အစီအစဉ် ထုတ်ပေးမည်", "Generate Plan")}
          </RunButton>
        }
      >
        {plan.isError && <ErrorBox onRetry={() => plan.mutate(rec.data?.data.bestCrop ?? "Rice")} />}
        {!plan.data && !plan.isPending && (
          <Empty msg={L("စိုက်ပျိုးရေး အဆင့်ဆင့်ကို Timeline အဖြစ် ထုတ်ပေးပါ။",
                       "Build a 6-stage farming timeline from land prep to harvest.")} />
        )}
        {plan.isPending && <Skeleton lines={4} />}
        {plan.data?.fallback && <FallbackNote msg={plan.data.error} L={L} />}
        {plan.data && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-agri-ink">🌾 {plan.data.data.crop}</span>
              <ConfidencePill value={plan.data.data.confidence} />
            </div>
            <ol className="relative space-y-3 border-l-2 border-agri-primary-soft pl-5">
              {plan.data.data.steps.map((s, i) => {
                const Icon = STAGE_ICON[s.stage] ?? Sprout;
                return (
                  <li key={i} className="relative">
                    <span className="absolute -left-[30px] grid h-7 w-7 place-items-center rounded-full bg-agri-primary text-white shadow ring-4 ring-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="rounded-2xl border border-agri-border bg-white p-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-agri-ink">{s.stage}</h4>
                        <span className="rounded-full bg-agri-primary-soft/60 px-2 py-0.5 text-[11px] font-bold text-agri-primary-dark">{s.timeframe}</span>
                      </div>
                      <p className="mt-1 text-sm text-agri-ink/70">{s.description}</p>
                      <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {s.tip}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </Section>

      {/* 4. OPPORTUNITIES */}
      <Section
        title={L("Smart အခွင့်အလမ်း ကဒ်များ", "Smart Opportunity Cards")}
        icon={TrendingUp}
        action={
          <RunButton loading={opps.isPending} onClick={() => opps.mutate()}>
            {opps.data ? L("ပြန်လည် ထုတ်ပေးမည်", "Regenerate") : L("ထုတ်ပေးမည်", "Generate")}
          </RunButton>
        }
      >
        {opps.isError && <ErrorBox onRetry={() => opps.mutate()} />}
        {!opps.data && !opps.isPending && (
          <Empty msg={L("ဈေးကွက် အခွင့်အလမ်း ၄ ခု AI မှ ထုတ်ပေးပါ။",
                       "Generate 4 smart market opportunity cards.")} />
        )}
        {opps.isPending && <Skeleton lines={4} />}
        {opps.data?.fallback && <FallbackNote msg={opps.data.error} L={L} />}
        {opps.data && (
          <div className="grid gap-3 sm:grid-cols-2">
            {opps.data.data.opportunities.map((o, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-agri-border bg-white shadow-sm">
                <div className={`bg-gradient-to-r ${OPP_TONE[o.type] ?? "from-agri-primary to-agri-primary-dark"} px-4 py-2 text-xs font-bold uppercase tracking-wide text-white`}>
                  {o.type}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-agri-ink">{o.title}</h4>
                    <ConfidencePill value={o.confidence} />
                  </div>
                  <p className="mt-1.5 text-sm text-agri-ink/70">{o.body}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">↑ {o.expectedUpside}</span>
                    <PriorityChip level={(o.urgency as "low" | "medium" | "high")} L={L} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}

// ---------- subcomponents ----------
function Section({ title, icon: Icon, children, action }: { title: string; icon: typeof Sprout; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-agri-border bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-agri-ink">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-agri-primary-soft text-agri-primary-dark">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RunButton({ loading, onClick, children }: { loading: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-agri-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-agri-primary-dark active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

function Field({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options?: Array<{ value: string; my: string }>; placeholder?: string }) {
  const { lang } = useI18n();
  return (
    <label className="block rounded-xl border border-agri-border bg-agri-surface/60 px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-agri-ink/50">{label}</span>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-0.5 max-h-60 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {lang === "my" ? `${o.my} (${o.value})` : o.value}
            </option>
          ))}
        </select>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-0.5 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none placeholder:text-agri-ink/30"
        />
      )}
    </label>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const tone = value >= 75 ? "bg-emerald-100 text-emerald-700" : value >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700";
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tone}`}>
      <BadgeCheck className="h-3 w-3" /> {Math.round(value)}%
    </span>
  );
}

function PriorityChip({ level, L }: { level: "low" | "medium" | "high"; L: (my: string, en: string) => string }) {
  const tone = level === "high" ? "bg-rose-100 text-rose-700" : level === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  return <span className={`rounded-full px-2 py-0.5 font-bold ${tone}`}>{L("ဦးစားပေး", "Priority")}: {level}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-agri-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-agri-ink/50">{label}</div>
      <div className="mt-0.5 text-sm font-black text-agri-ink">{value}</div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-agri-border bg-agri-surface/40 p-6 text-center text-sm text-agri-ink/60">
      {msg}
    </div>
  );
}

function Skeleton({ lines }: { lines: number }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-agri-primary-soft/40" />
      ))}
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
      <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> {t("aiAnalysisFailed")}</span>
      <button onClick={onRetry} className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700">{t("retry")}</button>
    </div>
  );
}

function FallbackNote({ msg, L }: { msg: string; L: (my: string, en: string) => string }) {
  return (
    <div className="mb-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>
        {L("AI အကြံပြုချက် ယာယီမရနိုင်ပါ — အရန် အကြံပြုချက်ကို ပြသထားသည်။",
           `AI temporarily unavailable (${msg}) — showing fallback recommendation.`)}
      </span>
    </div>
  );
}



function ExpandableCard({
  icon: Icon, tone, title, body, badges, confidence,
}: {
  icon: typeof Sprout; tone: string; title: string; body: string;
  badges: { label: string; kind: "good" | "warn" | "bad" | "neutral" }[]; confidence: number;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const badgeTone = {
    good: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    bad:  "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  } as const;
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <h3 className="font-bold leading-snug">{title}</h3>
        </div>
        <ConfidencePill value={confidence} />
      </div>
      <p className={`mt-2 text-sm text-agri-ink/80 ${open ? "" : "line-clamp-2"}`}>{body}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeTone[b.kind]}`}>{b.label}</span>
          ))}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-0.5 text-[11px] font-bold text-agri-ink/70 hover:text-agri-ink">
          {open ? <>{t("less")} <ChevronUp className="h-3 w-3" /></> : <>{t("more")} <ChevronDown className="h-3 w-3" /></>}
        </button>
      </div>
    </div>
  );
}
