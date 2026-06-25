import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import {
  Trophy, Users, Store, Sparkles, Handshake, Wheat, TrendingUp, ArrowRight,
  ShoppingCart, Eye, DollarSign, Stethoscope, Brain, CloudRain, Phone, ShieldCheck,
  Calendar, AlertTriangle, Sprout, BarChart3, Activity, MapPin,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/agrimarket/impact")({
  head: () => ({
    meta: [
      { title: "Impact & Performance — Orvia" },
      { name: "description", content: "Before vs after, platform benefits, agriculture statistics, and executive KPIs for the Orvia platform." },
    ],
  }),
  component: ImpactPage,
});

// ---------- demo data ----------
const KPIS = [
  { label: { my: "မှတ်ပုံတင် တောင်သူ", en: "Registered Farmers" }, value: 12480, delta: "+18%", icon: Users,       tone: "from-emerald-500 to-emerald-700" },
  { label: { my: "တက်ကြွ ဝယ်သူ",       en: "Active Buyers" },       value: 3120,  delta: "+24%", icon: ShoppingCart, tone: "from-sky-500 to-sky-700" },
  { label: { my: "ဈေးကွက် စာရင်း",     en: "Marketplace Listings" }, value: 8740,  delta: "+31%", icon: Store,        tone: "from-amber-500 to-amber-700" },
  { label: { my: "AI အကြံပြုချက်",     en: "AI Recommendations" },   value: 24560, delta: "+62%", icon: Sparkles,     tone: "from-fuchsia-500 to-fuchsia-700" },
  { label: { my: "အရောင်းအဝယ်",        en: "Successful Trades" },    value: 5210,  delta: "+27%", icon: Handshake,    tone: "from-lime-500 to-lime-700" },
  { label: { my: "သီးနှံ အမျိုးအစား",  en: "Crop Categories" },      value: 42,    delta: "+6",   icon: Wheat,        tone: "from-rose-500 to-rose-700" },
];

const COMPARES = [
  { key: "Buyer Access",       my: "ဝယ်သူ ဝင်ရောက်မှု",      before: 25, after: 88, icon: ShoppingCart },
  { key: "Market Visibility",  my: "ဈေးကွက် မြင်နိုင်မှု",   before: 30, after: 92, icon: Eye },
  { key: "Price Information",  my: "ဈေးနှုန်း သတင်း",         before: 20, after: 85, icon: DollarSign },
  { key: "Disease Detection",  my: "ရောဂါ ရှာဖွေမှု",          before: 15, after: 90, icon: Stethoscope },
  { key: "Farming Decisions",  my: "လယ်ယာ ဆုံးဖြတ်ချက်",      before: 35, after: 87, icon: Brain },
  { key: "Weather Awareness",  my: "ရာသီဥတု သိရှိမှု",         before: 28, after: 89, icon: CloudRain },
];

const BENEFITS = [
  { icon: DollarSign,  my: "ပိုကောင်းသော ရောင်းချ ဆုံးဖြတ်ချက်", en: "Better Selling Decisions" },
  { icon: Stethoscope, my: "ရောဂါ စောစီး ရှာဖွေ",                 en: "Early Disease Detection" },
  { icon: Brain,       my: "AI လယ်ယာ အကြံပြုချက်",                en: "AI Farming Recommendations" },
  { icon: CloudRain,   my: "ရာသီဥတု သတိပေးချက်",                  en: "Weather Awareness" },
  { icon: Phone,       my: "တိုက်ရိုက် ဝယ်သူ ဆက်သွယ်မှု",         en: "Direct Buyer Connections" },
  { icon: ShieldCheck, my: "သီးနှံ ဆုံးရှုံးမှု လျှော့ချ",          en: "Reduced Crop Loss" },
  { icon: Calendar,    my: "ပိုကောင်းသော လယ်ယာ စီမံချက်",         en: "Better Farm Planning" },
];

const CROP_DIST = [
  { name: "Rice",      value: 38 },
  { name: "Pulses",    value: 18 },
  { name: "Sesame",    value: 12 },
  { name: "Groundnut", value: 10 },
  { name: "Onion",     value: 12 },
  { name: "Corn",      value: 10 },
];
const CROP_COLORS = ["#2e7d32", "#1b5e20", "#558b2f", "#9ccc65", "#fbc02d", "#ef6c00"];

const FARMER_CATS = [
  { name: "Smallholder", value: 62 },
  { name: "Mid-size",    value: 26 },
  { name: "Commercial",  value: 9 },
  { name: "Cooperative", value: 3 },
];

const REGION_PROD = [
  { region: "Ayeyarwady", value: 920 },
  { region: "Bago",       value: 780 },
  { region: "Mandalay",   value: 650 },
  { region: "Sagaing",    value: 720 },
  { region: "Shan",       value: 540 },
  { region: "Magway",     value: 480 },
];

const MARKETPLACE = [
  { month: "Jan", listings: 320, deals: 110 },
  { month: "Feb", listings: 410, deals: 140 },
  { month: "Mar", listings: 520, deals: 190 },
  { month: "Apr", listings: 470, deals: 175 },
  { month: "May", listings: 610, deals: 230 },
  { month: "Jun", listings: 720, deals: 290 },
  { month: "Jul", listings: 880, deals: 360 },
  { month: "Aug", listings: 940, deals: 410 },
];

const REGIONS = ["All", "Ayeyarwady", "Bago", "Mandalay", "Sagaing", "Shan", "Magway"] as const;
const CROPS = ["All", "Rice", "Pulses", "Sesame", "Groundnut", "Onion", "Corn"] as const;
const SEASONS = ["All", "Monsoon", "Winter", "Summer"] as const;
const YEARS = ["All", "2023", "2024", "2025", "2026"] as const;

function ImpactPage() {
  const { t } = useI18n();
  const L = (my: string, en: string) => t(en, { my, en });

  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All");
  const [crop, setCrop]     = useState<(typeof CROPS)[number]>("All");
  const [season, setSeason] = useState<(typeof SEASONS)[number]>("All");
  const [year, setYear]     = useState<(typeof YEARS)[number]>("2025");

  // Deterministic filter scaling so charts feel "interactive"
  const factor = useMemo(() => {
    const seed = (region.length + crop.length + season.length + year.length) % 7;
    return 0.7 + seed * 0.07;
  }, [region, crop, season, year]);

  const cropDist     = CROP_DIST.map((d) => ({ ...d, value: Math.round(d.value * factor) }));
  const regionProd   = REGION_PROD.map((d) => ({ ...d, value: Math.round(d.value * factor) }));
  const marketplace  = MARKETPLACE.map((d) => ({ ...d, listings: Math.round(d.listings * factor), deals: Math.round(d.deals * factor) }));

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-agri-border bg-gradient-to-br from-agri-primary via-agri-primary-dark to-emerald-900 p-6 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
              <Trophy className="h-3.5 w-3.5" /> {L("ထိရောက်မှု ဒက်ရှ်ဘုတ်", "Impact Dashboard")}
            </span>
            <h1 className="mt-3 truncate text-2xl font-black tracking-tight sm:text-4xl">
              Orvia {L("စွမ်းဆောင်ရည် နှင့် သက်ရောက်မှု", "Performance & Impact")}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
              {L("မြန်မာ့ လယ်ယာ ဈေးကွက်အတွက် AI ပံ့ပိုးထားသော ဖြေရှင်းချက်များ၏ ထိရောက်မှု — *သရုပ်ပြ ဒေတာ*",
                 "AI-powered impact across Myanmar's agricultural marketplace — *demonstration data*")}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold text-amber-100 backdrop-blur sm:inline-flex">
            <AlertTriangle className="h-3.5 w-3.5" /> Demo data
          </span>
        </div>
      </header>

      {/* Executive KPIs */}
      <section>
        <SectionTitle icon={Activity}>{L("အရေးကြီး ကိန်းဂဏန်း", "Executive KPIs")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {KPIS.map((k, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${k.tone}`} />
              <div className="flex items-center justify-between">
                <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${k.tone} text-white shadow`}>
                  <k.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{k.delta}</span>
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight text-agri-ink">{k.value.toLocaleString()}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-agri-ink/60">{L(k.label.my, k.label.en)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Before vs After */}
      <section>
        <SectionTitle icon={ArrowRight}>{L("Platform မတိုင်မီ vs အပြီး", "Before vs After Orvia")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPARES.map((c, i) => {
            const gain = c.after - c.before;
            return (
              <div
                key={c.key}
                className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-agri-primary-soft text-agri-primary-dark">
                      <c.icon className="h-4 w-4" />
                    </span>
                    <h3 className="font-bold text-agri-ink">{L(c.my, c.key)}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">+{gain}%</span>
                </div>
                <div className="mt-4 space-y-2">
                  <Bar2 label={L("မတိုင်မီ", "Before")} value={c.before} tone="bg-rose-400" />
                  <Bar2 label={L("အပြီး", "After")}    value={c.after}  tone="bg-emerald-500" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section>
        <SectionTitle icon={Sparkles}>{L("Platform အကျိုးကျေးဇူး", "Platform Benefits")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BENEFITS.map((b, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white/80 to-agri-primary-soft/40 p-4 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-agri-primary text-white shadow transition-transform group-hover:scale-110">
                <b.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-bold leading-snug text-agri-ink">{L(b.my, b.en)}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Filters */}
      <section className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <SectionTitle icon={BarChart3} onCard>{L("အပြန်အလှန် ဆန်းစစ်ချက်", "Interactive Analytics")}</SectionTitle>
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Filter label={L("ဒေသ", "Region")} value={region} onChange={(v) => setRegion(v as typeof region)} options={REGIONS as readonly string[]} />
          <Filter label={L("သီးနှံ", "Crop")} value={crop} onChange={(v) => setCrop(v as typeof crop)} options={CROPS as readonly string[]} />
          <Filter label={L("ရာသီ", "Season")} value={season} onChange={(v) => setSeason(v as typeof season)} options={SEASONS as readonly string[]} />
          <Filter label={L("နှစ်", "Year")} value={year} onChange={(v) => setYear(v as typeof year)} options={YEARS as readonly string[]} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title={L("သီးနှံ ဖြန့်ဝေမှု", "Crop Distribution")} demo>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cropDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {cropDist.map((_, i) => <Cell key={i} fill={CROP_COLORS[i % CROP_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e2d6" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title={L("တောင်သူ အမျိုးအစား", "Farmer Categories")} demo>
            <ResponsiveContainer>
              <BarChart data={FARMER_CATS} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis dataKey="name" fontSize={11} stroke="#6b7563" />
                <YAxis fontSize={11} stroke="#6b7563" />
                <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(v: number) => [`${v}%`, "Share"]} />
                <Bar dataKey="value" fill="#2e7d32" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title={L("ဒေသအလိုက် ထုတ်လုပ်မှု", "Regional Production")} demo icon={MapPin}>
            <ResponsiveContainer>
              <BarChart data={regionProd} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis type="number" fontSize={11} stroke="#6b7563" />
                <YAxis dataKey="region" type="category" fontSize={11} width={90} stroke="#6b7563" />
                <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(v: number) => [`${v} t`, "Output"]} />
                <Bar dataKey="value" fill="#1b5e20" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title={L("ဈေးကွက် လှုပ်ရှားမှု", "Marketplace Activity")} demo icon={TrendingUp}>
            <ResponsiveContainer>
              <AreaChart data={marketplace} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="listFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2e7d32" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dealsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbc02d" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#fbc02d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis dataKey="month" fontSize={11} stroke="#6b7563" />
                <YAxis fontSize={11} stroke="#6b7563" />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="listings" stroke="#2e7d32" strokeWidth={2} fill="url(#listFill)" />
                <Area type="monotone" dataKey="deals"    stroke="#fbc02d" strokeWidth={2} fill="url(#dealsFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </section>

      <footer className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-center text-xs text-amber-800 backdrop-blur">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        {L("* ဤစာမျက်နှာ ပေါ်ရှိ ဂဏန်းများသည် သရုပ်ပြ ဒေတာသာ ဖြစ်ပါသည်။",
           "* All figures on this page are demonstration data for showcase purposes.")}
      </footer>
    </main>
  );
}

// ---------- subcomponents ----------
function SectionTitle({ icon: Icon, children, onCard = false }: { icon: typeof Wheat; children: React.ReactNode; onCard?: boolean }) {
  return (
    <h2 className={`mb-4 flex items-center gap-2 text-lg font-bold ${onCard ? "text-agri-ink" : "text-white"}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-agri-primary-soft text-agri-primary-dark">
        <Icon className="h-4 w-4" />
      </span>
      {children}
    </h2>
  );
}



function Bar2({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-agri-ink/70">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-agri-surface">
        <div className={`h-full rounded-full ${tone} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <label className="block rounded-xl border border-white/50 bg-white/60 px-3 py-2 backdrop-blur">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-agri-ink/50">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Card({ title, children, demo, icon: Icon }: { title: string; children: React.ReactNode; demo?: boolean; icon?: typeof Wheat }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm backdrop-blur-xl animate-fade-in">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-agri-ink">
          {Icon && <Icon className="h-4 w-4 text-agri-primary" />}
          {title}
        </h3>
        {demo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">DEMO</span>}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}
