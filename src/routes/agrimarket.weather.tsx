import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CloudRain, Wind, Droplets, Thermometer, AlertTriangle, Info, MapPin } from "lucide-react";
import { getWeather, MM_LOCATIONS } from "@/lib/data/weather.functions";

export const Route = createFileRoute("/agrimarket/weather")({
  head: () => ({
    meta: [
      { title: "Live Weather & Farm Advisories — Orvia" },
      { name: "description", content: "Real-time Myanmar weather forecast with AI-generated agricultural advisories for farmers." },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const [locationId, setLocationId] = useState<string>("yangon");
  const fetchWeather = useServerFn(getWeather);
  const { data, isLoading, error } = useQuery({
    queryKey: ["weather", locationId],
    queryFn: () => fetchWeather({ data: { locationId } }),
    staleTime: 10 * 60_000,
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">Live Weather & Farm Advisories</h1>
          <p className="mt-1 text-sm text-white/70">Real conditions from OpenWeatherMap with rule-based farming guidance.</p>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur">
          <MapPin className="h-4 w-4" />
          <select
            className="bg-transparent text-white outline-none"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
          >
            {MM_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id} className="text-agri-ink">{l.label} — {l.region}</option>
            ))}
          </select>
        </label>
      </header>

      {isLoading && <div className="rounded-2xl bg-white/10 p-8 text-center text-white">Loading live weather…</div>}
      {error && (
        <div className="rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          Could not load weather: {(error as Error).message}
        </div>
      )}

      {data && (
        <>
          <section className="grid gap-3 sm:grid-cols-4">
            <Stat icon={Thermometer} label="Temperature" value={`${data.current.temp}°C`} sub={`Feels ${data.current.feels_like}°C`} />
            <Stat icon={Droplets} label="Humidity" value={`${data.current.humidity}%`} sub={data.current.humidity >= 85 ? "Disease risk ↑" : "Normal"} />
            <Stat icon={Wind} label="Wind" value={`${data.current.wind_kph} km/h`} sub={data.current.wind_kph >= 25 ? "Avoid spraying" : "OK to spray"} />
            <Stat icon={CloudRain} label="Rain (today)" value={`${Math.round(data.current.pop * 100)}%`} sub={`${data.daily[0]?.rain_mm ?? 0} mm fc`} />
          </section>

          <section className="rounded-3xl border border-white/15 bg-white/95 p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-agri-ink">7-Day Forecast</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {data.daily.map((d) => (
                <div key={d.date} className="rounded-xl border border-agri-border bg-agri-primary-soft/30 p-3 text-center">
                  <div className="text-[11px] font-semibold uppercase text-agri-ink/60">
                    {new Date(d.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                    alt={d.condition}
                    className="mx-auto h-12 w-12"
                  />
                  <div className="text-sm font-bold text-agri-ink">{d.tmax}° / {d.tmin}°</div>
                  <div className="mt-0.5 text-[11px] text-agri-ink/60">{Math.round(d.pop * 100)}% rain</div>
                  <div className="text-[11px] text-agri-ink/60">{d.wind_kph} km/h</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-white">AI Farm Advisories</h2>
            <ul className="space-y-3">
              {data.advisories.map((a, i) => (
                <li key={i} className={[
                  "flex gap-3 rounded-2xl border p-4 shadow-sm",
                  a.severity === "alert" ? "border-rose-200 bg-rose-50" :
                  a.severity === "warn"  ? "border-amber-200 bg-amber-50" :
                                            "border-sky-200 bg-sky-50",
                ].join(" ")}>
                  <span className="text-2xl">{a.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {a.severity === "alert" ? <AlertTriangle className="h-4 w-4 text-rose-600" /> : <Info className="h-4 w-4 text-agri-ink/60" />}
                      <h3 className="text-sm font-bold text-agri-ink">{a.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-agri-ink/80">{a.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-center text-[11px] text-white/50">
            Source: {data.source} • Fetched {new Date(data.fetched_at).toLocaleTimeString()}
          </p>
        </>
      )}
    </main>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/95 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-agri-ink/55">{label}</span>
        <Icon className="h-4 w-4 text-agri-primary" />
      </div>
      <div className="mt-2 text-2xl font-black text-agri-ink">{value}</div>
      <div className="text-[11px] text-agri-ink/55">{sub}</div>
    </div>
  );
}
