import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type GeneratedNotification = {
  category: "weather" | "disease" | "price" | "ai" | "calendar" | "gov";
  priority: "low" | "normal" | "high";
  title: string;
  body: string;
};

/** Generate intelligent notifications from real DB + weather state, store them, and return all. */
export const refreshNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const items: GeneratedNotification[] = [];

    // 1. Price movements — compare latest price to ~7 days back
    const { data: priceRows } = await sb
      .from("crop_prices")
      .select("crop_id, market_id, price_mmk, recorded_on, crops(name_en)")
      .order("recorded_on", { ascending: false })
      .limit(500);
    if (priceRows && priceRows.length) {
      const grouped = new Map<string, typeof priceRows>();
      for (const r of priceRows) {
        const k = `${r.crop_id}|${r.market_id}`;
        if (!grouped.has(k)) grouped.set(k, [] as any);
        grouped.get(k)!.push(r);
      }
      for (const [, rows] of grouped) {
        if (rows.length < 2) continue;
        const latest = rows[0], prev = rows[1];
        const pct = ((latest.price_mmk - prev.price_mmk) / prev.price_mmk) * 100;
        if (Math.abs(pct) >= 5) {
          // @ts-expect-error joined
          const name = latest.crops?.name_en ?? latest.crop_id;
          items.push({
            category: "price",
            priority: Math.abs(pct) >= 10 ? "high" : "normal",
            title: `${pct > 0 ? "📈" : "📉"} ${name} ${pct > 0 ? "up" : "down"} ${Math.abs(pct).toFixed(1)}%`,
            body: `${name} moved from ${prev.price_mmk.toLocaleString()} to ${latest.price_mmk.toLocaleString()} MMK. ${pct > 0 ? "Good window to sell if you have stock ready." : "Hold if storage allows; price may recover."}`,
          });
        }
      }
    }

    // 2. Harvest windows opening this week (from crop_calendar)
    const month = new Date().getMonth() + 1;
    const { data: cal } = await sb
      .from("crop_calendar")
      .select("region, crop_id, harvest_month_start, harvest_month_end, crops(name_en)")
      .eq("harvest_month_start", month);
    for (const c of cal ?? []) {
      // @ts-expect-error joined
      const name = c.crops?.name_en ?? c.crop_id;
      items.push({
        category: "calendar",
        priority: "normal",
        title: `🌾 ${name} harvest window opens in ${c.region}`,
        body: `${name} harvest typically starts this month in ${c.region}. Check ripeness and book transport now to lock in current market prices.`,
      });
    }

    // 3. Sowing reminders
    const { data: sow } = await sb
      .from("crop_calendar")
      .select("region, crop_id, sow_month_start, crops(name_en)")
      .eq("sow_month_start", month);
    for (const c of sow ?? []) {
      // @ts-expect-error joined
      const name = c.crops?.name_en ?? c.crop_id;
      items.push({
        category: "calendar",
        priority: "low",
        title: `🌱 ${name} sowing season starts in ${c.region}`,
        body: `Prepare land and source certified seed. Apply basal fertilizer before sowing.`,
      });
    }

    // Persist (limit 20 newest, dedupe by title within last 24h)
    const trimmed = items.slice(0, 20);
    if (trimmed.length) {
      const { data: existing } = await sb
        .from("notifications")
        .select("title, created_at")
        .eq("user_id", context.userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      const seen = new Set((existing ?? []).map((r: any) => r.title));
      const toInsert = trimmed
        .filter((n) => !seen.has(n.title))
        .map((n) => ({ ...n, user_id: context.userId }));
      if (toInsert.length) await sb.from("notifications").insert(toInsert);
    }

    return { generated: trimmed.length };
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
