import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { recommendFertilizer, type Crop, type Stage, type Soil, type Weather } from "@/lib/data/fertilizer";
import { Sprout, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/agrimarket/fertilizer")({
  head: () => ({
    meta: [
      { title: "Fertilizer Recommendation — Orvia" },
      { name: "description", content: "Rule-based NPK fertilizer recommendations for Myanmar crops by growth stage, soil and weather." },
    ],
  }),
  component: FertilizerPage,
});

const CROPS: { v: Crop; l: string }[] = [
  { v: "rice", l: "Rice" }, { v: "corn", l: "Corn" },
  { v: "green_gram", l: "Green Gram" }, { v: "black_gram", l: "Black Gram" }, { v: "chickpea", l: "Chickpea" },
  { v: "sesame", l: "Sesame" }, { v: "groundnut", l: "Groundnut" },
  { v: "onion", l: "Onion" }, { v: "tomato", l: "Tomato" }, { v: "chili", l: "Chili" },
];
const STAGES: { v: Stage; l: string }[] = [
  { v: "seedling", l: "Seedling" }, { v: "vegetative", l: "Vegetative" },
  { v: "flowering", l: "Flowering / Heading" }, { v: "maturity", l: "Maturity" },
];
const SOILS: { v: Soil; l: string }[] = [
  { v: "loam", l: "Loam" }, { v: "sandy", l: "Sandy" }, { v: "clay", l: "Clay" },
];
const WEATHERS: { v: Weather; l: string }[] = [
  { v: "dry", l: "Dry" }, { v: "normal", l: "Normal" }, { v: "wet", l: "Wet / Rainy" },
];

function FertilizerPage() {
  const [crop, setCrop] = useState<Crop>("rice");
  const [stage, setStage] = useState<Stage>("vegetative");
  const [soil, setSoil] = useState<Soil>("loam");
  const [weather, setWeather] = useState<Weather>("normal");

  const rec = useMemo(() => recommendFertilizer({ crop, stage, soil, weather }), [crop, stage, soil, weather]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Fertilizer Recommendation</h1>
        <p className="mt-1 text-sm text-white/70">NPK guidance based on DOA Myanmar fertilizer guides and IRRI nutrient manager.</p>
      </header>

      <section className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-2">
        <Sel label="Crop"   value={crop}    onChange={setCrop as any}   options={CROPS} />
        <Sel label="Stage"  value={stage}   onChange={setStage as any}  options={STAGES} />
        <Sel label="Soil"   value={soil}    onChange={setSoil as any}   options={SOILS} />
        <Sel label="Weather"value={weather} onChange={setWeather as any} options={WEATHERS} />
      </section>

      <section className="rounded-3xl border border-agri-primary/20 bg-agri-primary-soft/40 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-agri-ink"><Sprout className="mr-1 inline h-5 w-5 text-agri-primary" /> Recommendation</h2>
          <span className="rounded-full bg-agri-primary px-3 py-1 text-xs font-bold text-white">
            NPK {rec.npk.n}:{rec.npk.p}:{rec.npk.k}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Stat label="Basal (at sowing)"  value={`${rec.basal_kg_per_acre} kg/acre`} />
          <Stat label="Topdress"           value={`${rec.topdress_kg_per_acre} kg/acre`} />
        </div>
        <p className="mt-3 text-sm text-agri-ink/80"><strong>Timing:</strong> {rec.timing}</p>
        <p className="mt-2 text-sm text-agri-ink/80"><strong>Note:</strong> {rec.notes}</p>

        {rec.cautions.length > 0 && (
          <ul className="mt-4 space-y-2">
            {rec.cautions.map((c, i) => (
              <li key={i} className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0" /> <span>{c}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-[11px] text-white/50">Sample guidance — confirm with your local agricultural extension officer before large applications.</p>
    </main>
  );
}

function Sel<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <label className="block rounded-xl border border-agri-border bg-agri-surface/50 px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-agri-ink/55">{label}</span>
      <select className="mt-1 w-full bg-transparent text-sm font-semibold text-agri-ink outline-none" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-agri-border bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-agri-ink/55">{label}</div>
      <div className="mt-1 text-lg font-black text-agri-ink">{value}</div>
    </div>
  );
}
