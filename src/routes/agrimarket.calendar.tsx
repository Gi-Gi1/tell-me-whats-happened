import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCalendar, listRegions } from "@/lib/data/calendar.functions";
import { Calendar, Droplets, Sprout } from "lucide-react";

export const Route = createFileRoute("/agrimarket/calendar")({
  head: () => ({
    meta: [
      { title: "Myanmar Crop Calendar — Orvia" },
      { name: "description", content: "Regional sowing, fertilizing, irrigation and harvest schedules for major Myanmar crops." },
    ],
  }),
  component: CalendarPage,
});

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CalendarPage() {
  const [region, setRegion] = useState<string>("");
  const fetchRegions = useServerFn(listRegions);
  const fetchCal = useServerFn(listCalendar);
  const { data: regions } = useQuery({ queryKey: ["cal-regions"], queryFn: () => fetchRegions() });
  const { data: rows, isLoading } = useQuery({
    queryKey: ["calendar", region],
    queryFn: () => fetchCal({ data: { region: region || undefined } }),
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Myanmar Crop Calendar</h1>
          <p className="mt-1 text-sm text-white/70">Regional sowing, fertilizing, irrigation and harvest schedules for major crops.</p>
        </div>
        <label className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
          Region:{" "}
          <select className="bg-transparent text-white outline-none" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="" className="text-agri-ink">All regions</option>
            {(regions ?? []).map((r) => <option key={r} value={r} className="text-agri-ink">{r}</option>)}
          </select>
        </label>
      </header>

      {isLoading && <div className="rounded-2xl bg-white/10 p-8 text-center text-white">Loading…</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {(rows ?? []).map((r) => (
          <article key={`${r.region}-${r.crop_id}-${r.season}`} className="rounded-2xl border border-agri-border bg-white p-5 shadow-sm">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{r.emoji ?? "🌱"}</span>
                <div>
                  <h3 className="text-base font-bold text-agri-ink">{r.crop_en} <span className="text-agri-ink/50">— {r.crop_my}</span></h3>
                  <p className="text-[11px] uppercase tracking-wide text-agri-ink/55">{r.region} • {r.season}</p>
                </div>
              </div>
            </header>

            <Timeline sow_s={r.sow_month_start} sow_e={r.sow_month_end} har_s={r.harvest_month_start} har_e={r.harvest_month_end} />

            <div className="mt-3 space-y-2 text-xs text-agri-ink/80">
              <p className="flex gap-2"><Sprout className="h-4 w-4 shrink-0 text-agri-primary" /> {r.fertilizer_notes}</p>
              <p className="flex gap-2"><Droplets className="h-4 w-4 shrink-0 text-sky-600" /> {r.irrigation_notes}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="text-center text-[11px] text-white/50">Source: DOA Myanmar & FAO crop calendars — sample dataset for demonstration.</p>
    </main>
  );
}

function Timeline({ sow_s, sow_e, har_s, har_e }: { sow_s: number; sow_e: number; har_s: number; har_e: number }) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-12 gap-0.5">
        {MONTHS.map((m, i) => {
          const month = i + 1;
          const sowing = inRange(month, sow_s, sow_e);
          const harvest = inRange(month, har_s, har_e);
          return (
            <div key={m} className="text-center">
              <div className={[
                "h-3 rounded-sm",
                harvest ? "bg-agri-tiger" : sowing ? "bg-agri-primary" : "bg-agri-border",
              ].join(" ")} title={`${m}: ${harvest ? "Harvest" : sowing ? "Sow" : ""}`} />
              <div className="mt-1 text-[9px] font-semibold uppercase text-agri-ink/50">{m[0]}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-agri-ink/60">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-agri-primary" /> Sowing</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-agri-tiger" /> Harvest</span>
        <Calendar className="ml-auto h-3 w-3" />
      </div>
    </div>
  );
}

function inRange(m: number, s: number, e: number) {
  return s <= e ? m >= s && m <= e : m >= s || m <= e;
}
