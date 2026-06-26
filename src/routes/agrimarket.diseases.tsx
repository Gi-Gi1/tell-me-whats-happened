import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDiseases, type Disease } from "@/lib/data/diseases.functions";
import { Bug, ShieldCheck, AlertOctagon, Stethoscope, Search } from "lucide-react";

export const Route = createFileRoute("/agrimarket/diseases")({
  head: () => ({
    meta: [
      { title: "Crop Disease Library — Orvia" },
      { name: "description", content: "Identification, prevention and treatment for major Myanmar rice, bean and corn diseases." },
    ],
  }),
  component: DiseasesPage,
});

const CROP_LABELS: Record<string, { l: string; emoji: string }> = {
  rice: { l: "Rice", emoji: "🌾" },
  bean: { l: "Beans & Pulses", emoji: "🫘" },
  corn: { l: "Corn", emoji: "🌽" },
};

function DiseasesPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const fetchDiseases = useServerFn(listDiseases);
  const { data, isLoading } = useQuery({ queryKey: ["diseases"], queryFn: () => fetchDiseases() });

  const filtered = (data ?? []).filter((d) => {
    if (filter !== "all" && d.crop_id !== filter) return false;
    if (!q) return true;
    const s = `${d.name_en} ${d.name_my} ${d.symptoms} ${d.causes}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  const crops = Array.from(new Set((data ?? []).map((d) => d.crop_id)));

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Crop Disease Library</h1>
        <p className="mt-1 text-sm text-white/70">Real diagnostic info from IRRI, FAO and DOA Myanmar extension materials.</p>
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-agri-border bg-agri-surface/40 px-3 py-2">
          <Search className="h-4 w-4 text-agri-ink/50" />
          <input className="flex-1 bg-transparent text-sm outline-none" placeholder="Search by name or symptom…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button onClick={() => setFilter("all")} className={pillCls(filter === "all")}>All</button>
        {crops.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={pillCls(filter === c)}>
            {CROP_LABELS[c]?.emoji} {CROP_LABELS[c]?.l ?? c}
          </button>
        ))}
      </div>

      {isLoading && <div className="rounded-2xl bg-white/10 p-8 text-center text-white">Loading…</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((d) => <DiseaseCard key={d.id} d={d} />)}
        {!isLoading && filtered.length === 0 && (
          <div className="md:col-span-2 rounded-2xl border border-dashed border-white/30 bg-white/5 p-10 text-center text-sm text-white/70">
            No matching diseases — try a different search term.
          </div>
        )}
      </div>
      <p className="text-center text-[11px] text-white/50">Source: IRRI Rice Doctor, FAO crop protection compendium, DOA Myanmar extension pamphlets.</p>
    </main>
  );
}

function DiseaseCard({ d }: { d: Disease }) {
  const sev = d.severity === "high" ? "bg-rose-100 text-rose-700" :
              d.severity === "medium" ? "bg-amber-100 text-amber-700" :
                                         "bg-emerald-100 text-emerald-700";
  return (
    <article className="rounded-2xl border border-agri-border bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-agri-ink"><Bug className="mr-1 inline h-4 w-4 text-rose-500" /> {d.name_en}</h3>
          <p className="text-xs text-agri-ink/55">{d.name_my} • {CROP_LABELS[d.crop_id]?.l ?? d.crop_id}</p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sev}`}>{d.severity.toUpperCase()}</span>
      </header>
      <Section icon={<AlertOctagon className="h-3.5 w-3.5 text-rose-500" />} title="Symptoms"   body={d.symptoms} />
      <Section icon={<Bug className="h-3.5 w-3.5 text-amber-600" />}        title="Causes"      body={d.causes} />
      <Section icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />} title="Prevention" body={d.prevention} />
      <Section icon={<Stethoscope className="h-3.5 w-3.5 text-sky-600" />}    title="Treatment"  body={d.treatment} />
    </article>
  );
}

function Section({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mt-3">
      <h4 className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-agri-ink/65">{icon} {title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-agri-ink/80">{body}</p>
    </div>
  );
}

function pillCls(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? "border-agri-primary bg-agri-primary text-white" : "border-agri-border bg-white text-agri-ink/75 hover:bg-agri-primary-soft/30"}`;
}
