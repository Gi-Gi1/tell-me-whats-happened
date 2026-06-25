import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, Wheat, Sprout, Sun, CloudRain, Droplets, Flame,
  Bug, Truck, DollarSign, AlertTriangle, MapPin, Calendar, Gauge, Brain, ShieldAlert,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/agrimarket/analytics")({
  head: () => ({
    meta: [
      { title: "Market Analytics & Forecast — Orvia" },
      { name: "description", content: "Historical crop prices, AI market forecast, weather impact and agricultural challenges for Myanmar farmers." },
    ],
  }),
  component: AnalyticsPage,
});

// ---------- Demo data ----------
const CROPS = ["Rice", "Pulses", "Sesame", "Groundnut", "Onion", "Corn"] as const;
type Crop = (typeof CROPS)[number];

const REGIONS = ["All", "Ayeyarwady", "Bago", "Mandalay", "Sagaing", "Shan"] as const;
const YEARS = ["All", "2022", "2023", "2024", "2025", "2026"] as const;

const CROP_META: Record<Crop, { icon: typeof Wheat; emoji: string; region: string; season: string; demand: "High" | "Medium" | "Low"; price: number; my: string }> = {
  Rice:      { icon: Wheat,   emoji: "🌾", region: "Ayeyarwady", season: "Nov – Feb", demand: "High",   price: 1850, my: "ဆန်" },
  Pulses:    { icon: Sprout,  emoji: "🫘", region: "Sagaing",    season: "Oct – Jan", demand: "High",   price: 2200, my: "ပဲ" },
  Sesame:    { icon: Sprout,  emoji: "🌱", region: "Magway",     season: "Jun – Sep", demand: "Medium", price: 3100, my: "နှမ်း" },
  Groundnut: { icon: Sprout,  emoji: "🥜", region: "Mandalay",   season: "Jul – Oct", demand: "Medium", price: 2700, my: "မြေပဲ" },
  Onion:     { icon: Sprout,  emoji: "🧅", region: "Shan",       season: "Sep – Dec", demand: "High",   price: 1450, my: "ကြက်သွန်နီ" },
  Corn:      { icon: Wheat,   emoji: "🌽", region: "Shan",       season: "May – Aug", demand: "Medium", price: 1100, my: "ပြောင်း" },
};

// Generate demo monthly price history (MMK / viss)
function genHistory(crop: Crop, year: string) {
  const base = CROP_META[crop].price;
  const yearSeed = year === "All" ? 2024 : Number(year);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months.map((m, i) => {
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * base * 0.08;
    const drift = ((yearSeed - 2022) * base * 0.04);
    const noise = ((i * 31 + crop.length * 7 + yearSeed) % 13 - 6) * (base * 0.012);
    return { month: m, price: Math.round(base + seasonal + drift + noise) };
  });
}

const CHALLENGES = [
  { key: "Price Volatility", value: 82, icon: DollarSign },
  { key: "Weather Risks",    value: 74, icon: CloudRain },
  { key: "Pest & Disease",   value: 61, icon: Bug },
  { key: "Fertilizer Cost",  value: 88, icon: Sprout },
  { key: "Transportation",   value: 57, icon: Truck },
  { key: "Water Access",     value: 49, icon: Droplets },
];

const WEATHER = [
  { name: "Normal Rainfall", impact: 8,   tone: "good",    icon: CloudRain },
  { name: "Heavy Rain",      impact: -18, tone: "warn",    icon: CloudRain },
  { name: "Flood",           impact: -42, tone: "bad",     icon: Droplets },
  { name: "Drought",         impact: -35, tone: "bad",     icon: Sun },
  { name: "Extreme Heat",    impact: -22, tone: "warn",    icon: Flame },
];

function AnalyticsPage() {
  const { lang, t } = useI18n();
  const L = (my: string, en: string) => t(en, { my, en });
  const [crop, setCrop] = useState<Crop>("Rice");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [year, setYear] = useState<(typeof YEARS)[number]>("2025");

  const history = useMemo(() => genHistory(crop, year), [crop, year]);
  const avgPrice = Math.round(history.reduce((s, h) => s + h.price, 0) / history.length);
  const trend = history[history.length - 1].price - history[0].price;
  const trendPct = ((trend / history[0].price) * 100).toFixed(1);

  // AI Forecast (deterministic from inputs so it feels stable)
  const seed = (crop.length * 7 + region.length * 3 + year.length) % 3;
  const forecast = seed === 0
    ? { dir: "up" as const, label: L("ဈေးနှုန်း တက်လာနိုင်သည် 📈", "Price Expected to Increase 📈"), confidence: 78, demand: "High", risk: "Medium" }
    : seed === 1
    ? { dir: "flat" as const, label: L("ဈေးကွက် တည်ငြိမ်နေပါမည် ➖", "Market Stable ➖"), confidence: 64, demand: "Medium", risk: "Low" }
    : { dir: "down" as const, label: L("ဈေးနှုန်း ကျဆင်းနိုင်သည် 📉", "Price Expected to Decrease 📉"), confidence: 71, demand: "Low", risk: "High" };

  const TrendIcon = forecast.dir === "up" ? TrendingUp : forecast.dir === "down" ? TrendingDown : Minus;
  const trendTone = forecast.dir === "up" ? "text-emerald-600 bg-emerald-50" : forecast.dir === "down" ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50";

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      {/* Header */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-agri-primary-soft px-3 py-1 text-xs font-semibold text-agri-primary-dark">
            <Brain className="h-3.5 w-3.5" />
            {L("ဈေးကွက် ဉာဏ်ရည် AI", "Market Intelligence")}
          </div>
          <h1 className="mt-2 truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
            {L("လယ်ယာ ဈေးကွက် ဒက်ရှ်ဘုတ်", "Agricultural Analytics Dashboard")}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {L("သမိုင်းဝင် ဈေးနှုန်းများ၊ AI ခန့်မှန်းချက်နှင့် ရာသီဥတု သက်ရောက်မှု — *နမူနာ အချက်အလက်များ*", "Historical prices, AI forecasts, weather impact — *demo data, AI estimates*")}
          </p>

        </div>
        <div className="hidden shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-800 sm:block">
          <ShieldAlert className="mr-1 inline h-3.5 w-3.5" />
          {L("သရုပ်ပြ ဒေတာ", "Demonstration data")}
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={L("ပျမ်းမျှ ဈေး", "Avg Price")} value={`${avgPrice.toLocaleString()} MMK`} tone="primary" icon={DollarSign} />
        <StatCard label={L("ပြောင်းလဲမှု", "YoY Change")} value={`${trend > 0 ? "+" : ""}${trendPct}%`} tone={trend >= 0 ? "good" : "bad"} icon={trend >= 0 ? TrendingUp : TrendingDown} />
        <StatCard label={L("AI ယုံကြည်မှု", "AI Confidence")} value={`${forecast.confidence}%`} tone="info" icon={Gauge} />
        <StatCard label={L("လိုအပ်မှု", "Demand")} value={forecast.demand} tone="primary" icon={Sprout} />
      </section>

      {/* Filters + Historical chart */}
      <section className="rounded-3xl border border-agri-border bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-agri-ink">
            {L("သမိုင်းဝင် ဈေးနှုန်း လမ်းကြောင်း", "Historical Price Trend")}
          </h2>
          <span className="rounded-full bg-agri-primary-soft/60 px-2.5 py-1 text-xs font-semibold text-agri-primary-dark">
            {CROP_META[crop].emoji} {crop}
          </span>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Select label={L("သီးနှံ", "Crop")} value={crop} onChange={(v) => setCrop(v as Crop)} options={CROPS as readonly string[]} />
          <Select label={L("ဒေသ", "Region")} value={region} onChange={(v) => setRegion(v as typeof region)} options={REGIONS as readonly string[]} />
          <Select label={L("နှစ်", "Year")} value={year} onChange={(v) => setYear(v as typeof year)} options={YEARS as readonly string[]} />
          <div className="rounded-xl border border-agri-border bg-agri-surface/60 px-3 py-2 text-xs text-agri-ink/70">
            <div className="flex items-center gap-1 font-semibold"><Calendar className="h-3.5 w-3.5" /> {L("ကာလ", "Range")}</div>
            <div className="mt-0.5">Jan – Dec</div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <AreaChart data={history} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2e7d32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
              <XAxis dataKey="month" stroke="#6b7563" fontSize={12} />
              <YAxis stroke="#6b7563" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e2d6" }} formatter={(v: number) => [`${v.toLocaleString()} MMK`, "Price"]} />
              <Area type="monotone" dataKey="price" stroke="#2e7d32" strokeWidth={2.5} fill="url(#priceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* AI Forecast */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-agri-border bg-gradient-to-br from-agri-primary-soft/60 to-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-agri-ink">
              {L("AI ဈေးကွက် ခန့်မှန်းချက်", "AI Market Forecast")}
            </h2>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${trendTone}`}>
              <TrendIcon className="h-3.5 w-3.5" /> {forecast.label}
            </span>
          </div>
          <p className="mt-2 text-xs text-agri-ink/60">
            {L("* AI မှ ခန့်မှန်းသော အကြံပြုချက် — အာမခံချက် မဟုတ်ပါ။", "* AI-generated estimate, not a guaranteed prediction.")}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label={L("ယုံကြည်မှု", "Confidence")} value={`${forecast.confidence}%`} />
            <MiniStat label={L("ဦးတည်ချက်", "Direction")} value={forecast.dir.toUpperCase()} />
            <MiniStat label={L("လိုအပ်မှု", "Demand")} value={forecast.demand} />
            <MiniStat label={L("အန္တရာယ်", "Risk")} value={forecast.risk} />
          </div>
          <div className="mt-5 h-40 w-full">
            <ResponsiveContainer>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis dataKey="month" stroke="#6b7563" fontSize={11} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#1b5e20" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-agri-ink">
            {L("ဈေးကွက် အချက်အလက်", "Market Snapshot")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <Row icon={MapPin}    label={L("အဓိက ဒေသ", "Main Region")} value={CROP_META[crop].region} />
            <Row icon={Calendar}  label={L("ရိတ်သိမ်းရာသီ", "Harvest")} value={CROP_META[crop].season} />
            <Row icon={Sprout}    label={L("လိုအပ်မှု", "Demand")} value={CROP_META[crop].demand} />
            <Row icon={DollarSign} label={L("ပျမ်းမျှ ဈေး", "Avg Selling")} value={`${CROP_META[crop].price} MMK`} />
          </ul>
        </div>
      </section>

      {/* Major Crops Grid */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-white">
          {L("အဓိက သီးနှံများ", "Major Crops")}
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CROPS.map((c) => {
            const m = CROP_META[c];
            const active = c === crop;
            return (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`group rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  active ? "border-agri-primary bg-agri-primary-soft/50" : "border-agri-border bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    m.demand === "High" ? "bg-emerald-100 text-emerald-700" : m.demand === "Medium" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}>{m.demand}</span>
                </div>
                <h3 className="mt-2 font-bold text-agri-ink">{c}</h3>
                <p className="text-xs text-agri-ink/60">{L(m.my, m.region)}</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-[11px] text-agri-ink/50">{m.season}</span>
                  <span className="text-sm font-black text-agri-primary-dark">{m.price.toLocaleString()}<span className="text-[10px] font-medium text-agri-ink/50"> MMK</span></span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Challenges + Weather */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-bold text-agri-ink">
              {L("လယ်ယာ စိန်ခေါ်မှုများ", "Agriculture Challenges")}
            </h2>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mb-3 text-xs text-agri-ink/50">{L("* သရုပ်ပြ ဒေတာ", "* demonstration data")}</p>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <RadarChart data={CHALLENGES} outerRadius="78%">
                <PolarGrid stroke="#e6e2d6" />
                <PolarAngleAxis dataKey="key" tick={{ fontSize: 11, fill: "#1f2a1f" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Severity" dataKey="value" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-bold text-agri-ink">
              {L("ရာသီဥတု သက်ရောက်မှု", "Weather Impact")}
            </h2>
            <CloudRain className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mb-3 text-xs text-agri-ink/50">{L("* ခန့်မှန်းသော သရုပ်ပြ %", "* estimated demo %")}</p>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={WEATHER} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis type="number" domain={[-50, 20]} fontSize={11} stroke="#6b7563" />
                <YAxis dataKey="name" type="category" fontSize={11} width={110} stroke="#6b7563" />
                <Tooltip formatter={(v: number) => [`${v}%`, "Yield impact"]} />
                <Bar dataKey="impact" radius={[6, 6, 6, 6]}>
                  {WEATHER.map((w, i) => (
                    <Bar key={i} dataKey="impact" fill={w.tone === "good" ? "#2e7d32" : w.tone === "warn" ? "#f59e0b" : "#dc2626"} />
                  ))}
                </Bar>
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {WEATHER.map((w) => (
              <li key={w.name} className="flex items-center gap-2 rounded-lg border border-agri-border bg-agri-surface/40 px-2 py-1.5">
                <w.icon className={`h-3.5 w-3.5 ${w.tone === "good" ? "text-emerald-600" : w.tone === "warn" ? "text-amber-600" : "text-rose-600"}`} />
                <span className="truncate text-agri-ink/70">{w.name}</span>
                <span className="ml-auto font-bold text-agri-ink">{w.impact > 0 ? "+" : ""}{w.impact}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

// ---------- Subcomponents ----------
function StatCard({ label, value, tone, icon: Icon }: { label: string; value: string; tone: "primary" | "good" | "bad" | "info"; icon: typeof Wheat }) {
  const tones = {
    primary: "from-agri-primary-soft to-white text-agri-primary-dark",
    good:    "from-emerald-50 to-white text-emerald-700",
    bad:     "from-rose-50 to-white text-rose-700",
    info:    "from-sky-50 to-white text-sky-700",
  } as const;
  return (
    <div className={`rounded-2xl border border-agri-border bg-gradient-to-br ${tones[tone]} p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</span>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <p className="mt-2 truncate text-xl font-black sm:text-2xl">{value}</p>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block rounded-xl border border-agri-border bg-agri-surface/60 px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-agri-ink/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-agri-border bg-white/80 p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-agri-ink/50">{label}</div>
      <div className="mt-1 text-base font-black text-agri-ink">{value}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Wheat; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-agri-border bg-agri-surface/40 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-agri-primary" />
      <span className="min-w-0 flex-1 truncate text-agri-ink/70">{label}</span>
      <span className="shrink-0 font-bold text-agri-ink">{value}</span>
    </li>
  );
}
