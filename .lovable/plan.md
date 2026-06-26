# Orvia — Realistic Myanmar Agricultural Data Pass

Goal: replace every demo/lorem value across the 8 feature areas with realistic Myanmar-specific data, hook up a real weather API, and add rule-based farming advisories. Where live public APIs aren't available (prices, disease, calendar, listings), seed the database with researched Myanmar values clearly labeled "sample / demonstration data — last verified <date>" so the app looks production-grade without claiming to be a live data feed.

## Scope per area

**1. Market Prices (DB-seeded + scrape-ready)**
- New tables: `crop_markets`, `crop_prices` (crop, grade, market, region, unit=viss|basket, price_mmk, trend, recorded_on, source).
- Seed ~120 rows covering: Paw San / Emata / Sin Thukha rice, green gram, black gram, chickpeas, corn, sesame, groundnut, onion, garlic, tomato, chili — across Bayintnaung (Yangon), Mandalay, Monywa, Pyay, Pakokku markets, with 12 months of synthetic-but-realistic history per crop+market for the trend chart.
- Optional Firecrawl-powered refresher server fn (`refreshMarketPrices`) that scrapes a public commodity page when a Firecrawl connection exists; otherwise no-op with a clear message. Not wired to cron — user can trigger from Analytics.
- Analytics page rewritten to read from DB instead of in-file `CROP_META` / `genHistory`.

**2. Weather (live OpenWeatherMap)**
- Server fn `getWeather({ townshipId })` using `OPENWEATHER_API_KEY` (already saved). Uses One Call 3.0 for current + 7-day; if user is on free tier, falls back to `/weather` + `/forecast` (5d/3h aggregated to daily).
- Returns temp, humidity, wind, UV, rain probability, 7-day daily summary.
- New rule engine `weatherAdvisories(forecast, crop?)` producing the four example advisory types (rain → fertilize today; heavy rain → delay harvest; high humidity → disease risk; high wind → no spraying), plus frost/heat alerts.
- New route `/agrimarket/weather` with current panel + 7-day strip + advisories list. Township selector backed by existing `myanmar-regions.ts`.

**3. Crop Disease Library (DB-seeded)**
- Table `crop_diseases` (crop, name_en, name_my, symptoms, causes, prevention, treatment, severity, image_keywords).
- Seed real entries: rice (blast, brown spot, BLB, sheath blight), beans (anthracnose, rust, mosaic virus), corn (fall armyworm, leaf blight) — sourced from FAO / IRRI / DOA Myanmar extension pamphlets.
- `CropDoctor` AI page extended with a "Browse known diseases" tab that lists from the DB. AI result tries to match against DB entries for richer prevention/treatment text.

**4. Fertilizer Recommendation (rule-based)**
- New server fn `recommendFertilizer({ crop, growthStage, soilType, weather })` returning NPK ratio, dose kg/acre, timing, cautions.
- Backed by a small in-code matrix (rice, pulses, sesame, groundnut, onion, corn × seedling/vegetative/flowering/maturity × loam/sandy/clay), values from DOA Myanmar fertilizer guides.
- New route `/agrimarket/fertilizer` with a 4-input form and recommendation card.

**5. Crop Calendar (DB-seeded)**
- Table `crop_calendar` (region, crop, sow_start, sow_end, fertilizer_schedule jsonb, irrigation_schedule jsonb, harvest_start, harvest_end).
- Seed all 14 states/regions × 6 major crops with realistic monsoon/winter/summer windows.
- New route `/agrimarket/calendar` with region picker + Gantt-style timeline.

**6. Marketplace**
- Update existing `ListingsPreview` + listings table seed to include 25 realistic sample listings (farmer name in Burmese transliteration, township from regions list, crop, viss qty, MMK/viss, contact 09XXXXXXXX masked, available_date).
- New `buyer_requests` table + seed 10 buyer requests (commodity, qty needed, max price, region, deadline). Surface on marketplace page in a "Buyer requests" tab.

**7. Profit Calculator**
- New route `/agrimarket/profit`. Form: crop, area (acres), expected yield (viss), selling price (MMK/viss). Defaults pre-filled per crop from a Myanmar cost matrix (seed, fertilizer, labor, transport per acre).
- Outputs total cost, revenue, profit, margin %, breakeven price.

**8. Notifications**
- Server fn `generateNotifications({ userId })` that computes intelligent items from real DB state: price change > 5% week-over-week, upcoming heavy rain (weather API), disease risk (humidity > 85% × susceptible crop in season), harvest window opening (calendar).
- Update `/agrimarket/notifications` to render these instead of static items. Inserts into existing notifications table (or new `notifications` table if missing) so they persist.

**Data quality + labeling**
- Every seeded dataset gets a `source` and `last_verified` column; UI shows a small "Sample data — last verified Jun 2026" footer on each page so we never falsely claim live numbers.
- Remove all remaining hardcoded `CROP_META`, `WEATHER`, `CHALLENGES`, `genHistory`, mock listings arrays.

## Technical plan

```
supabase/sql/004_realistic_data.sql   — new tables + seeds (one migration)
src/lib/data/
  prices.functions.ts                 — listPrices, getPriceHistory, refreshMarketPrices (Firecrawl-gated)
  weather.functions.ts                — getWeather (OpenWeatherMap) + advisories
  diseases.functions.ts               — listDiseases, getDisease
  fertilizer.functions.ts             — recommendFertilizer (pure)
  calendar.functions.ts               — getCropCalendar
  marketplace.functions.ts            — listListings, listBuyerRequests
  profit.ts                           — cost matrix + pure calculator
  notifications.functions.ts          — generateNotifications
src/routes/
  agrimarket.weather.tsx              — NEW
  agrimarket.calendar.tsx             — NEW
  agrimarket.fertilizer.tsx           — NEW
  agrimarket.profit.tsx               — NEW
  agrimarket.diseases.tsx             — NEW (library browser)
  agrimarket.analytics.tsx            — rewrite to read from DB
  agrimarket.notifications.tsx       — read from notifications fn
  agrimarket.index.tsx               — link new pages from nav
src/components/agrimarket/
  AgriNav.tsx                         — add new menu items
  CropDoctor.tsx                      — wire to disease DB matcher
  ListingsPreview.tsx                 — read from DB seed
```

Migration uses the canonical pattern (`CREATE TABLE` → `GRANT` → `ENABLE RLS` → public `SELECT` policies for read-only reference data; user-scoped policies for notifications). Server fns are public-readable; only `refreshMarketPrices` and `generateNotifications` require `requireSupabaseAuth`.

## What I'm explicitly NOT doing in this pass
- Real-time price scraping on a schedule (no cron in this stack; one-shot manual refresh only, gated on Firecrawl).
- Image-based disease detection improvements (existing AI flow stays as-is; only the knowledge base gets real).
- SMS/push notification delivery (in-app only).
- Per-user role-specific notification preferences.

## After this lands
You can incrementally upgrade any area to a real live source (e.g. plug a real DOA price feed into `refreshMarketPrices`) without UI changes — pages already read from DB.

Reply "go" to start, or tell me which area to drop or expand.