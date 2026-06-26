// Pure profit calculator with Myanmar-realistic cost matrix (MMK / acre).
// Based on 2024-25 DOA cost-of-cultivation surveys for major crops.

export type Crop = "rice" | "green_gram" | "black_gram" | "chickpea" | "sesame" | "groundnut" | "corn" | "onion" | "tomato" | "chili";

export type CostProfile = {
  seed:           number;
  fertilizer:     number;
  labor:          number;
  pesticide:      number;
  irrigation:     number;
  transport:      number;
  land_prep:      number;
  typical_yield_viss: number; // per acre
  typical_price_mmk:  number; // per viss
};

export const COSTS: Record<Crop, CostProfile> = {
  rice:        { seed:  35000, fertilizer: 180000, labor: 220000, pesticide:  60000, irrigation: 40000, transport: 50000, land_prep: 90000, typical_yield_viss: 1300, typical_price_mmk:   650 },
  green_gram:  { seed:  45000, fertilizer:  60000, labor: 110000, pesticide:  35000, irrigation:  0,    transport: 30000, land_prep: 60000, typical_yield_viss:  280, typical_price_mmk:  5200 },
  black_gram:  { seed:  45000, fertilizer:  60000, labor: 110000, pesticide:  35000, irrigation:  0,    transport: 30000, land_prep: 60000, typical_yield_viss:  300, typical_price_mmk:  4100 },
  chickpea:    { seed:  55000, fertilizer:  70000, labor: 120000, pesticide:  40000, irrigation: 10000, transport: 30000, land_prep: 60000, typical_yield_viss:  250, typical_price_mmk:  4600 },
  sesame:      { seed:  25000, fertilizer:  70000, labor: 130000, pesticide:  30000, irrigation:  0,    transport: 30000, land_prep: 60000, typical_yield_viss:  150, typical_price_mmk: 11000 },
  groundnut:   { seed: 120000, fertilizer:  90000, labor: 180000, pesticide:  45000, irrigation: 15000, transport: 40000, land_prep: 70000, typical_yield_viss:  450, typical_price_mmk:  6800 },
  corn:        { seed:  80000, fertilizer: 170000, labor: 160000, pesticide:  60000, irrigation: 20000, transport: 50000, land_prep: 80000, typical_yield_viss: 1800, typical_price_mmk:  1250 },
  onion:       { seed: 150000, fertilizer: 200000, labor: 280000, pesticide:  90000, irrigation: 70000, transport: 60000, land_prep: 80000, typical_yield_viss: 2200, typical_price_mmk:  3200 },
  tomato:      { seed: 100000, fertilizer: 220000, labor: 320000, pesticide: 120000, irrigation: 80000, transport: 70000, land_prep: 80000, typical_yield_viss: 3500, typical_price_mmk:  1400 },
  chili:       { seed:  90000, fertilizer: 180000, labor: 260000, pesticide: 100000, irrigation: 60000, transport: 50000, land_prep: 80000, typical_yield_viss:  900, typical_price_mmk: 12500 },
};

export const COST_LABELS: Array<[keyof Omit<CostProfile, "typical_yield_viss" | "typical_price_mmk">, string]> = [
  ["land_prep",   "Land preparation"],
  ["seed",        "Seed"],
  ["fertilizer",  "Fertilizer"],
  ["pesticide",   "Pesticide"],
  ["labor",       "Labor"],
  ["irrigation",  "Irrigation"],
  ["transport",   "Transport"],
];

export type ProfitInput = {
  crop: Crop;
  acres: number;
  yield_viss_per_acre: number;
  price_mmk_per_viss: number;
  cost_overrides?: Partial<CostProfile>;
};

export type ProfitResult = {
  total_cost: number;
  total_revenue: number;
  profit: number;
  margin_pct: number;
  breakeven_price: number;
  cost_breakdown: Array<{ key: string; label: string; amount: number }>;
};

export function calculateProfit(input: ProfitInput): ProfitResult {
  const base = COSTS[input.crop];
  const c = { ...base, ...(input.cost_overrides ?? {}) };
  const per_acre =
    c.seed + c.fertilizer + c.labor + c.pesticide + c.irrigation + c.transport + c.land_prep;
  const total_cost = Math.round(per_acre * input.acres);
  const total_yield = input.yield_viss_per_acre * input.acres;
  const total_revenue = Math.round(total_yield * input.price_mmk_per_viss);
  const profit = total_revenue - total_cost;
  const margin_pct = total_revenue > 0 ? (profit / total_revenue) * 100 : 0;
  const breakeven_price = total_yield > 0 ? total_cost / total_yield : 0;
  return {
    total_cost, total_revenue, profit,
    margin_pct: Math.round(margin_pct * 10) / 10,
    breakeven_price: Math.round(breakeven_price),
    cost_breakdown: COST_LABELS.map(([k, label]) => ({
      key: k, label, amount: Math.round((c[k] as number) * input.acres),
    })),
  };
}
