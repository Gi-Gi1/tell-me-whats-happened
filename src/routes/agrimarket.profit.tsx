import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { calculateProfit, COSTS, type Crop } from "@/lib/data/profit";
import { Coins, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/agrimarket/profit")({
  head: () => ({
    meta: [
      { title: "Profit Calculator — Orvia" },
      { name: "description", content: "Estimate per-acre profit for Myanmar crops with realistic seed, fertilizer, labor and transport costs." },
    ],
  }),
  component: ProfitPage,
});

const CROPS: { v: Crop; l: string }[] = [
  { v: "rice", l: "Rice" }, { v: "corn", l: "Corn" }, { v: "green_gram", l: "Green Gram" },
  { v: "black_gram", l: "Black Gram" }, { v: "chickpea", l: "Chickpea" },
  { v: "sesame", l: "Sesame" }, { v: "groundnut", l: "Groundnut" },
  { v: "onion", l: "Onion" }, { v: "tomato", l: "Tomato" }, { v: "chili", l: "Chili" },
];

function ProfitPage() {
  const [crop, setCrop] = useState<Crop>("rice");
  const [acres, setAcres] = useState(5);
  const profile = COSTS[crop];
  const [yieldVal, setYieldVal] = useState(profile.typical_yield_viss);
  const [price, setPrice] = useState(profile.typical_price_mmk);

  // When crop changes, reset yield/price to typical
  const handleCrop = (c: Crop) => {
    setCrop(c);
    setYieldVal(COSTS[c].typical_yield_viss);
    setPrice(COSTS[c].typical_price_mmk);
  };

  const result = useMemo(() => calculateProfit({
    crop, acres, yield_viss_per_acre: yieldVal, price_mmk_per_viss: price,
  }), [crop, acres, yieldVal, price]);

  const fmt = (n: number) => `${n.toLocaleString()} MMK`;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Profit Calculator</h1>
        <p className="mt-1 text-sm text-white/70">Per-acre cost defaults from DOA Myanmar 2024-25 cost-of-cultivation surveys.</p>
      </header>

      <section className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
        <label className="block rounded-xl border border-agri-border bg-agri-surface/40 px-3 py-2">
          <span className="text-[10px] font-bold uppercase text-agri-ink/55">Crop</span>
          <select className="mt-1 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none" value={crop} onChange={(e) => handleCrop(e.target.value as Crop)}>
            {CROPS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </label>
        <Num label="Area (acres)" value={acres} onChange={setAcres} min={0.25} step={0.25} />
        <Num label="Yield (viss / acre)" value={yieldVal} onChange={setYieldVal} min={0} step={50} />
        <Num label="Selling price (MMK / viss)" value={price} onChange={setPrice} min={0} step={50} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card label="Total cost"    value={fmt(result.total_cost)}    tone="bad" />
        <Card label="Total revenue" value={fmt(result.total_revenue)} tone="info" />
        <Card label="Profit"        value={fmt(result.profit)}        tone={result.profit >= 0 ? "good" : "bad"} icon={<TrendingUp className="h-4 w-4" />} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-agri-ink"><Coins className="mr-1 inline h-4 w-4 text-agri-primary" /> Cost breakdown</h2>
          <ul className="divide-y divide-agri-border text-sm">
            {result.cost_breakdown.map((c) => (
              <li key={c.key} className="flex justify-between py-1.5">
                <span className="text-agri-ink/75">{c.label}</span>
                <span className="font-semibold text-agri-ink">{fmt(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-base font-bold text-agri-ink">Key metrics</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Margin"           v={`${result.margin_pct}%`} />
            <Row k="Break-even price" v={`${result.breakeven_price.toLocaleString()} MMK / viss`} />
            <Row k="Yield"            v={`${(yieldVal * acres).toLocaleString()} viss`} />
            <Row k="Cost per viss"    v={fmt(Math.round(result.total_cost / Math.max(1, yieldVal * acres)))} />
          </dl>
          <p className="mt-3 rounded-lg bg-agri-primary-soft/40 p-2 text-[11px] text-agri-ink/70">
            Costs are typical statewide averages. Adjust yield/price to reflect your fields and current market.
          </p>
        </div>
      </section>
    </main>
  );
}

function Num({ label, value, onChange, ...rest }: { label: string; value: number; onChange: (v: number) => void; min?: number; step?: number }) {
  return (
    <label className="block rounded-xl border border-agri-border bg-agri-surface/40 px-3 py-2">
      <span className="text-[10px] font-bold uppercase text-agri-ink/55">{label}</span>
      <input
        type="number" inputMode="decimal"
        className="mt-1 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none"
        value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} {...rest}
      />
    </label>
  );
}
function Card({ label, value, tone, icon }: { label: string; value: string; tone: "good" | "bad" | "info"; icon?: React.ReactNode }) {
  const tones = { good: "from-emerald-50 to-white text-emerald-700", bad: "from-rose-50 to-white text-rose-700", info: "from-sky-50 to-white text-sky-700" } as const;
  return (
    <div className={`rounded-2xl border border-agri-border bg-gradient-to-br ${tones[tone]} p-4 shadow-sm`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-70">{label}{icon}</div>
      <div className="mt-1 text-xl font-black sm:text-2xl">{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-agri-border/60 py-1">
      <dt className="text-agri-ink/70">{k}</dt>
      <dd className="font-bold text-agri-ink">{v}</dd>
    </div>
  );
}
