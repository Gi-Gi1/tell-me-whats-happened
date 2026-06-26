import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

// Untyped client — new tables aren't in generated types yet (run migration to regenerate).
function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type PriceRow = {
  crop_id: string;
  crop_en: string;
  crop_my: string;
  emoji: string | null;
  category: string;
  grade: string | null;
  market_id: string;
  market_name: string;
  region: string;
  unit: string;
  price_mmk: number;
  trend: "up" | "down" | "stable";
  recorded_on: string;
  source: string;
  last_verified: string;
};

/** Latest price for each crop+market pair. */
export const listLatestPrices = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  // Fetch most recent recorded_on per crop+market via SQL-ish: pull all, pick latest in JS.
  const { data, error } = await sb
    .from("crop_prices")
    .select("crop_id, market_id, grade, unit, price_mmk, trend, recorded_on, source, last_verified, crops(name_en, name_my, emoji, category), crop_markets(name, region)")
    .order("recorded_on", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);

  const seen = new Set<string>();
  const out: PriceRow[] = [];
  for (const r of data ?? []) {
    const key = `${r.crop_id}|${r.market_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // @ts-expect-error joined types
    const c = r.crops; const m = r.crop_markets;
    out.push({
      crop_id: r.crop_id, crop_en: c?.name_en ?? r.crop_id, crop_my: c?.name_my ?? "",
      emoji: c?.emoji ?? null, category: c?.category ?? "grain",
      grade: r.grade, market_id: r.market_id, market_name: m?.name ?? r.market_id,
      region: m?.region ?? "", unit: r.unit, price_mmk: r.price_mmk,
      trend: r.trend as "up" | "down" | "stable",
      recorded_on: r.recorded_on, source: r.source, last_verified: r.last_verified,
    });
  }
  return out;
});

/** 12-month history for a single crop+market pair. */
export const getPriceHistory = createServerFn({ method: "GET" })
  .inputValidator((d: { crop_id: string; market_id: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("crop_prices")
      .select("price_mmk, recorded_on, trend")
      .eq("crop_id", data.crop_id)
      .eq("market_id", data.market_id)
      .order("recorded_on", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
