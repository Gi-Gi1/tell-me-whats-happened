import { createServerFn } from "@tanstack/react-start";

// Major Myanmar locations with coords (lat, lon) for OpenWeatherMap.
export const MM_LOCATIONS = [
  { id: "yangon",      label: "Yangon",      lat: 16.8409, lon: 96.1735, region: "Yangon" },
  { id: "mandalay",    label: "Mandalay",    lat: 21.9588, lon: 96.0891, region: "Mandalay" },
  { id: "naypyitaw",   label: "Naypyitaw",   lat: 19.7633, lon: 96.0785, region: "Naypyitaw" },
  { id: "bago",        label: "Bago",        lat: 17.3358, lon: 96.4814, region: "Bago" },
  { id: "magway",      label: "Magway",      lat: 20.1497, lon: 94.9319, region: "Magway" },
  { id: "monywa",      label: "Monywa",      lat: 22.1083, lon: 95.1358, region: "Sagaing" },
  { id: "pathein",     label: "Pathein",     lat: 16.7833, lon: 94.7333, region: "Ayeyarwady" },
  { id: "taunggyi",    label: "Taunggyi",    lat: 20.7833, lon: 97.0333, region: "Shan" },
  { id: "lashio",      label: "Lashio",      lat: 22.9333, lon: 97.7500, region: "Shan" },
  { id: "myitkyina",   label: "Myitkyina",   lat: 25.3833, lon: 97.4000, region: "Kachin" },
  { id: "loikaw",      label: "Loikaw",      lat: 19.6750, lon: 97.2106, region: "Kayah" },
  { id: "hakha",       label: "Hakha",       lat: 22.6457, lon: 93.6093, region: "Chin" },
  { id: "hpa-an",      label: "Hpa-an",      lat: 16.8898, lon: 97.6333, region: "Kayin" },
  { id: "sittwe",      label: "Sittwe",      lat: 20.1500, lon: 92.9000, region: "Rakhine" },
  { id: "mawlamyine",  label: "Mawlamyine",  lat: 16.4904, lon: 97.6280, region: "Mon" },
  { id: "dawei",       label: "Dawei",       lat: 14.0769, lon: 98.1928, region: "Tanintharyi" },
] as const;

export type LocationId = (typeof MM_LOCATIONS)[number]["id"];

export type Advisory = {
  severity: "info" | "warn" | "alert";
  icon: string;
  title: string;
  body: string;
};

export type WeatherResponse = {
  location: { id: string; label: string; region: string };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_kph: number;
    rain_mm: number;
    pop: number;            // probability of precip (0-1) for next 3h
    uv: number | null;
    condition: string;
    icon: string;
  };
  daily: Array<{
    date: string;             // yyyy-mm-dd
    tmin: number;
    tmax: number;
    humidity: number;
    pop: number;
    rain_mm: number;
    wind_kph: number;
    condition: string;
    icon: string;
  }>;
  advisories: Advisory[];
  source: "OpenWeatherMap";
  fetched_at: string;
};

function celsius(k: number) { return Math.round((k - 273.15) * 10) / 10; }

export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((d: { locationId?: string }) => ({ locationId: d.locationId ?? "yangon" }))
  .handler(async ({ data }): Promise<WeatherResponse> => {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error("OPENWEATHER_API_KEY missing");
    const loc = MM_LOCATIONS.find((l) => l.id === data.locationId) ?? MM_LOCATIONS[0];

    // Use free 2.5 endpoints: /weather (current) + /forecast (5d/3h aggregated to daily).
    const base = "https://api.openweathermap.org/data/2.5";
    const [curRes, fcRes] = await Promise.all([
      fetch(`${base}/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${key}`),
      fetch(`${base}/forecast?lat=${loc.lat}&lon=${loc.lon}&appid=${key}`),
    ]);
    if (!curRes.ok) throw new Error(`Weather API failed: ${curRes.status}`);
    if (!fcRes.ok)  throw new Error(`Forecast API failed: ${fcRes.status}`);
    const cur = await curRes.json() as any;
    const fc  = await fcRes.json() as any;

    // Aggregate 3-hour buckets into daily summaries
    const byDate = new Map<string, any[]>();
    for (const item of fc.list ?? []) {
      const date = (item.dt_txt as string).slice(0, 10);
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push(item);
    }
    const daily = Array.from(byDate.entries()).slice(0, 7).map(([date, items]) => {
      const temps = items.map((i) => i.main.temp as number);
      const hums  = items.map((i) => i.main.humidity as number);
      const winds = items.map((i) => (i.wind?.speed ?? 0) as number);
      const pops  = items.map((i) => (i.pop ?? 0) as number);
      const rains = items.map((i) => (i.rain?.["3h"] ?? 0) as number);
      const mid   = items[Math.floor(items.length / 2)];
      return {
        date,
        tmin: celsius(Math.min(...temps)),
        tmax: celsius(Math.max(...temps)),
        humidity: Math.round(hums.reduce((a, b) => a + b, 0) / hums.length),
        wind_kph: Math.round((winds.reduce((a, b) => a + b, 0) / winds.length) * 3.6),
        pop: Math.max(...pops),
        rain_mm: Math.round(rains.reduce((a, b) => a + b, 0) * 10) / 10,
        condition: mid.weather?.[0]?.main ?? "Clear",
        icon: mid.weather?.[0]?.icon ?? "01d",
      };
    });

    const current = {
      temp: celsius(cur.main.temp),
      feels_like: celsius(cur.main.feels_like),
      humidity: cur.main.humidity as number,
      wind_kph: Math.round((cur.wind?.speed ?? 0) * 3.6),
      rain_mm: (cur.rain?.["1h"] ?? cur.rain?.["3h"] ?? 0) as number,
      pop: daily[0]?.pop ?? 0,
      uv: null as number | null,
      condition: cur.weather?.[0]?.main ?? "Clear",
      icon: cur.weather?.[0]?.icon ?? "01d",
    };

    return {
      location: { id: loc.id, label: loc.label, region: loc.region },
      current,
      daily,
      advisories: computeAdvisories(current, daily),
      source: "OpenWeatherMap",
      fetched_at: new Date().toISOString(),
    };
  });

function computeAdvisories(
  current: WeatherResponse["current"],
  daily: WeatherResponse["daily"],
): Advisory[] {
  const out: Advisory[] = [];
  const tomorrow = daily[1] ?? daily[0];

  if (tomorrow && tomorrow.rain_mm >= 1 && tomorrow.rain_mm < 25) {
    out.push({
      severity: "info", icon: "🌦️",
      title: "Rain expected tomorrow — fertilize today",
      body: `Light to moderate rain (${tomorrow.rain_mm}mm) is expected tomorrow in your area. Apply nitrogen fertilizer today so the rain helps it dissolve into the root zone.`,
    });
  }
  if (tomorrow && tomorrow.rain_mm >= 25) {
    out.push({
      severity: "alert", icon: "⛈️",
      title: "Heavy rain warning — delay harvesting & spraying",
      body: `${tomorrow.rain_mm}mm of rain is expected tomorrow. Postpone harvest, fertilizer and pesticide application. Secure stored grain and check drainage.`,
    });
  }
  if (current.humidity >= 85) {
    out.push({
      severity: "warn", icon: "💧",
      title: "High humidity — disease risk increasing",
      body: `Humidity is ${current.humidity}%. Rice blast, brown spot and bean rust risk rises sharply above 85%. Inspect fields and consider a preventive fungicide on susceptible crops.`,
    });
  }
  if (current.wind_kph >= 25) {
    out.push({
      severity: "warn", icon: "🌬️",
      title: "Strong wind — avoid pesticide spraying",
      body: `Wind is ${current.wind_kph} km/h. Spray drift wastes chemical and harms neighbours. Wait for calmer mornings (under 15 km/h) before any foliar application.`,
    });
  }
  const hot = daily.find((d) => d.tmax >= 38);
  if (hot) {
    out.push({
      severity: "warn", icon: "🔥",
      title: "Heat stress likely",
      body: `Peak temperature ${hot.tmax}°C expected on ${hot.date}. Irrigate in the early morning and shade young transplants. Animals need extra drinking water.`,
    });
  }
  const cold = daily.find((d) => d.tmin <= 10);
  if (cold) {
    out.push({
      severity: "warn", icon: "❄️",
      title: "Cold snap forecast",
      body: `Minimum temperature ${cold.tmin}°C on ${cold.date}. Protect seedlings of pulses, tomato and chili with mulch or row cover.`,
    });
  }

  if (out.length === 0) {
    out.push({
      severity: "info", icon: "✅",
      title: "Conditions look favourable",
      body: "No major weather risks detected in the 5-day forecast. Continue your normal schedule and check back daily.",
    });
  }
  return out;
}
