import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function publicClient(): any {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type CalendarRow = {
  region: string;
  crop_id: string;
  crop_en: string;
  crop_my: string;
  emoji: string | null;
  season: string;
  sow_month_start: number;
  sow_month_end: number;
  harvest_month_start: number;
  harvest_month_end: number;
  fertilizer_notes: string;
  irrigation_notes: string;
};

export const listCalendar = createServerFn({ method: "GET" })
  .inputValidator((d: { region?: string }) => d)
  .handler(async ({ data }): Promise<CalendarRow[]> => {
    const sb = publicClient();
    let q = sb.from("crop_calendar").select(
      "region, crop_id, season, sow_month_start, sow_month_end, harvest_month_start, harvest_month_end, fertilizer_notes, irrigation_notes, crops(name_en, name_my, emoji)"
    );
    if (data?.region) q = q.eq("region", data.region);
    const { data: rows, error } = await q.order("crop_id");
    if (error) throw new Error(error.message);
    return ((rows ?? []) as any[]).map((r) => {
      const c = Array.isArray(r.crops) ? r.crops[0] : r.crops;
      return {
        region: r.region, crop_id: r.crop_id,
        crop_en: c?.name_en ?? r.crop_id,
        crop_my: c?.name_my ?? "",
        emoji: c?.emoji ?? null,
        season: r.season,
        sow_month_start: r.sow_month_start, sow_month_end: r.sow_month_end,
        harvest_month_start: r.harvest_month_start, harvest_month_end: r.harvest_month_end,
        fertilizer_notes: r.fertilizer_notes, irrigation_notes: r.irrigation_notes,
      };
    });
  });

export const listRegions = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("crop_calendar").select("region");
  if (error) throw new Error(error.message);
  return Array.from(new Set(((data ?? []) as any[]).map((r) => r.region))).sort();
});
