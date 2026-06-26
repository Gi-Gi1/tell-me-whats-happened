// Pure rule-based fertilizer recommendation engine.
// Values from DOA Myanmar fertilizer guidance & IRRI rice nutrient manager.

export type Crop = "rice" | "green_gram" | "black_gram" | "chickpea" | "sesame" | "groundnut" | "corn" | "onion" | "tomato" | "chili";
export type Stage = "seedling" | "vegetative" | "flowering" | "maturity";
export type Soil  = "loam" | "sandy" | "clay";
export type Weather = "dry" | "normal" | "wet";

export type Recommendation = {
  npk: { n: number; p: number; k: number };  // ratio
  basal_kg_per_acre: number;
  topdress_kg_per_acre: number;
  timing: string;
  cautions: string[];
  notes: string;
};

const BASE: Record<Crop, { npk: [number, number, number]; basal: number; top: number; note: string }> = {
  rice:        { npk: [2, 1, 1], basal: 50, top: 30, note: "Apply urea in 2 splits (tillering + panicle initiation)." },
  green_gram:  { npk: [1, 2, 1], basal: 25, top:  5, note: "Inoculate seed with Rhizobium for better nodulation." },
  black_gram:  { npk: [1, 2, 1], basal: 25, top:  5, note: "Avoid heavy N — encourages vines over pods." },
  chickpea:    { npk: [1, 2, 1], basal: 25, top:  0, note: "Apply sulphur 10 kg/ac for better seed quality." },
  sesame:      { npk: [1, 1, 1], basal: 25, top: 10, note: "Sensitive to waterlogging; ensure drainage." },
  groundnut:   { npk: [1, 2, 2], basal: 30, top: 10, note: "Add gypsum 100 kg/ac at flowering for pod-fill." },
  corn:        { npk: [3, 1, 1], basal: 60, top: 40, note: "Split urea at 30 and 50 DAS." },
  onion:       { npk: [2, 1, 2], basal: 60, top: 25, note: "Stop nitrogen 30 days before harvest to avoid soft bulbs." },
  tomato:      { npk: [2, 2, 3], basal: 60, top: 25, note: "Calcium spray prevents blossom-end rot." },
  chili:       { npk: [2, 2, 2], basal: 50, top: 20, note: "Boron foliar at flowering improves fruit set." },
};

const STAGE_MULT: Record<Stage, number> = {
  seedling: 0.4, vegetative: 1.0, flowering: 0.8, maturity: 0.2,
};

const SOIL_NOTES: Record<Soil, string> = {
  loam:  "Loam holds nutrients well — apply at standard rates.",
  sandy: "Sandy soil leaches nitrogen fast — split urea into 3 doses instead of 2.",
  clay:  "Clay drains slowly — reduce basal P by 20% and watch for waterlogging.",
};

export function recommendFertilizer(input: {
  crop: Crop; stage: Stage; soil: Soil; weather: Weather;
}): Recommendation {
  const b = BASE[input.crop];
  const mult = STAGE_MULT[input.stage];
  const cautions: string[] = [];
  let basal = Math.round(b.basal * mult);
  let top   = Math.round(b.top   * mult);

  if (input.soil === "sandy") {
    top = Math.round(top * 1.2);
    cautions.push("Sandy soil: split topdress urea into 3 doses, not 2.");
  }
  if (input.soil === "clay") {
    basal = Math.round(basal * 0.85);
    cautions.push("Clay soil: reduced basal to avoid waterlogging; check drainage.");
  }
  if (input.weather === "wet") {
    cautions.push("Wet conditions: do NOT apply fertilizer before heavy rain — N will wash away. Wait for a 24-hour dry window.");
    top = Math.round(top * 0.9);
  }
  if (input.weather === "dry") {
    cautions.push("Dry conditions: irrigate lightly within 24h of urea application or N will volatilise.");
  }

  let timing = "Apply basal at sowing/transplanting; topdress at active vegetative growth.";
  if (input.stage === "flowering") timing = "Apply at panicle initiation / flowering — boosts grain or pod fill.";
  if (input.stage === "maturity")  timing = "Avoid late-season nitrogen. Only a light potassium topdress if leaves yellow.";

  return {
    npk: { n: b.npk[0], p: b.npk[1], k: b.npk[2] },
    basal_kg_per_acre: basal,
    topdress_kg_per_acre: top,
    timing,
    cautions: [SOIL_NOTES[input.soil], ...cautions],
    notes: b.note,
  };
}
