import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
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
    return (rows ?? []).map((r: any) => ({
      region: r.region, crop_id: r.crop_id,
      crop_en: r.crops?.name_en ?? r.crop_id,
      crop_my: r.crops?.name_my ?? "",
      emoji: r.crops?.emoji ?? null,
      season: r.season,
      sow_month_start: r.sow_month_start, sow_month_end: r.sow_month_end,
      harvest_month_start: r.harvest_month_start, harvest_month_end: r.harvest_month_end,
      fertilizer_notes: r.fertilizer_notes, irrigation_notes: r.irrigation_notes,
    }));
  });
