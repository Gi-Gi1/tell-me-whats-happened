import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLatestPrices, getPriceHistory } from "@/lib/data/prices.functions";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar } from "lucide-react";

export const Route = createFileRoute("/agrimarket/prices")({
  head: () => ({
    meta: [
      { title: "Live Myanmar Crop Prices — Orvia" },
      { name: "description", content: "Wholesale prices for Myanmar rice, pulses, oilseeds, vegetables across major markets with 12-month trend charts." },
    ],
  }),
  component: PricesPage,
});

function PricesPage() {
  const fetchPrices = useServerFn(listLatestPrices);
  const fetchHistory = useServerFn(getPriceHistory);
  const { data: prices, isLoading } = useQuery({ queryKey: ["prices"], queryFn: () => fetchPrices() });

  const [selected, setSelected] = useState<{ crop_id: string; market_id: string } | null>(null);

  const sel = useMemo(() => (prices ?? []).find((p) => p.crop_id === selected?.crop_id && p.market_id === selected?.market_id) ?? prices?.[0], [prices, selected]);

  const { data: history } = useQuery({
    queryKey: ["price-history", sel?.crop_id, sel?.market_id],
    queryFn: () => fetchHistory({ data: { crop_id: sel!.crop_id, market_id: sel!.market_id } }),
    enabled: !!sel,
  });

  const fmt = (n: number) => n.toLocaleString();

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-black text-white sm:text-3xl">Myanmar Market Prices</h1>
        <p className="mt-1 text-sm text-white/70">
          Wholesale prices across Bayintnaung, Mandalay, Monywa, Pyay, Pakokku and Taunggyi markets.
        </p>
      </header>

      {isLoading && <div className="rounded-2xl bg-white/10 p-8 text-center text-white">Loading…</div>}

      {sel && history && history.length > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-agri-ink">{sel.emoji} {sel.crop_en} <span className="text-agri-ink/50">— {sel.crop_my}</span></h2>
              <p className="text-xs text-agri-ink/55"><MapPin className="mr-1 inline h-3 w-3" />{sel.market_name}, {sel.region} • {sel.grade} • per {sel.unit}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-agri-primary-dark">{fmt(sel.price_mmk)} <span className="text-xs text-agri-ink/55">MMK</span></div>
              <TrendBadge t={sel.trend} />
            </div>
          </header>
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <AreaChart data={history.slice().reverse()}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#2e7d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e2d6" />
                <XAxis dataKey="recorded_on" stroke="#6b7563" fontSize={11} tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: "short" })} />
                <YAxis stroke="#6b7563" fontSize={11} />
                <Tooltip formatter={(v: number) => `${fmt(v)} MMK`} labelFormatter={(d) => new Date(d).toLocaleDateString()} />
                <Area type="monotone" dataKey="price_mmk" stroke="#2e7d32" strokeWidth={2} fill="url(#pg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-bold text-white">All markets</h2>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-agri-primary-soft/40 text-xs uppercase text-agri-ink/65">
              <tr>
                <th className="px-3 py-2 text-left">Crop</th>
                <th className="px-3 py-2 text-left">Grade</th>
                <th className="px-3 py-2 text-left">Market</th>
                <th className="px-3 py-2 text-right">Price (MMK)</th>
                <th className="px-3 py-2 text-center">Unit</th>
                <th className="px-3 py-2 text-center">Trend</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {(prices ?? []).map((p) => (
                <tr key={`${p.crop_id}-${p.market_id}`}
                  className={`cursor-pointer border-t border-agri-border hover:bg-agri-primary-soft/20 ${sel?.crop_id === p.crop_id && sel?.market_id === p.market_id ? "bg-agri-primary-soft/30" : ""}`}
                  onClick={() => setSelected({ crop_id: p.crop_id, market_id: p.market_id })}>
                  <td className="px-3 py-2 font-semibold text-agri-ink">{p.emoji} {p.crop_en}</td>
                  <td className="px-3 py-2 text-agri-ink/70">{p.grade}</td>
                  <td className="px-3 py-2 text-agri-ink/70">{p.market_name}</td>
                  <td className="px-3 py-2 text-right font-bold text-agri-primary-dark">{fmt(p.price_mmk)}</td>
                  <td className="px-3 py-2 text-center text-xs text-agri-ink/60">{p.unit}</td>
                  <td className="px-3 py-2 text-center"><TrendBadge t={p.trend} compact /></td>
                  <td className="hidden px-3 py-2 text-right text-[11px] text-agri-ink/55 sm:table-cell"><Calendar className="mr-1 inline h-3 w-3" />{new Date(p.recorded_on).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-center text-[11px] text-white/50">
          Source: DOA Myanmar / Bayintnaung wholesale market reports (2024-25). Sample dataset for demonstration.
        </p>
      </section>
    </main>
  );
}

function TrendBadge({ t, compact }: { t: string; compact?: boolean }) {
  const I = t === "up" ? TrendingUp : t === "down" ? TrendingDown : Minus;
  const tone = t === "up" ? "text-emerald-700 bg-emerald-100" : t === "down" ? "text-rose-700 bg-rose-100" : "text-amber-700 bg-amber-100";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>
      <I className="h-3 w-3" /> {!compact && t}
    </span>
  );
}
// silence unused import for LineChart/Line if Vite tree-shakes anyway
void LineChart; void Line;
