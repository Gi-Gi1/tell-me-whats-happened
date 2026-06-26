-- ============================================================
-- Orvia: Realistic Myanmar agricultural reference datasets
-- Run in Supabase SQL editor. Idempotent: safe to re-run.
-- Data source: DOA Myanmar / Bayintnaung wholesale market reports
-- (2024-2025), FAO/IRRI extension materials. Marked as sample
-- demonstration data; refresh from upstream when available.
-- ============================================================

-- ---------- 1. MARKETS ----------
CREATE TABLE IF NOT EXISTS public.crop_markets (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  region      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.crop_markets TO anon, authenticated;
GRANT ALL    ON public.crop_markets TO service_role;
ALTER TABLE public.crop_markets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "markets read all" ON public.crop_markets;
CREATE POLICY "markets read all" ON public.crop_markets FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.crop_markets (id, name, region) VALUES
  ('bayintnaung', 'Bayintnaung Wholesale', 'Yangon'),
  ('mandalay',    'Mandalay Zaycho',       'Mandalay'),
  ('monywa',      'Monywa Central',        'Sagaing'),
  ('pyay',        'Pyay Riverside',        'Bago'),
  ('pakokku',     'Pakokku Trading',       'Magway'),
  ('taunggyi',    'Taunggyi Highland',     'Shan')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, region = EXCLUDED.region;

-- ---------- 2. CROPS (lookup) ----------
CREATE TABLE IF NOT EXISTS public.crops (
  id        text PRIMARY KEY,
  name_en   text NOT NULL,
  name_my   text NOT NULL,
  category  text NOT NULL,  -- grain | pulse | oilseed | vegetable | fruit
  emoji     text
);
GRANT SELECT ON public.crops TO anon, authenticated;
GRANT ALL    ON public.crops TO service_role;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crops read all" ON public.crops;
CREATE POLICY "crops read all" ON public.crops FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.crops (id, name_en, name_my, category, emoji) VALUES
  ('rice_pawsan',  'Paw San Rice',    'ပေါ်ဆန်း',          'grain',     '🌾'),
  ('rice_emata',   'Emata Rice',      'ဧမတ',                'grain',     '🌾'),
  ('rice_sinthuk', 'Sin Thukha Rice', 'စင်သုခ',              'grain',     '🌾'),
  ('green_gram',   'Green Gram',      'ပဲတီစိမ်း',          'pulse',     '🫘'),
  ('black_gram',   'Black Gram',      'မတ်ပဲ',                'pulse',     '🫘'),
  ('chickpea',     'Chickpea',        'ကုလားပဲ',             'pulse',     '🫘'),
  ('corn',         'Corn',            'ပြောင်း',              'grain',     '🌽'),
  ('sesame',       'Sesame (white)',  'နှမ်းဖြူ',             'oilseed',   '🌱'),
  ('groundnut',    'Groundnut',       'မြေပဲ',                'oilseed',   '🥜'),
  ('onion',        'Onion',           'ကြက်သွန်နီ',         'vegetable', '🧅'),
  ('garlic',       'Garlic',          'ကြက်သွန်ဖြူ',        'vegetable', '🧄'),
  ('tomato',       'Tomato',          'ခရမ်းချဉ်သီး',         'vegetable', '🍅'),
  ('chili',        'Chili (dried)',   'ငရုတ်ခြောက်',          'vegetable', '🌶️')
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_my = EXCLUDED.name_my,
  category = EXCLUDED.category, emoji = EXCLUDED.emoji;

-- ---------- 3. PRICES (current snapshot) ----------
CREATE TABLE IF NOT EXISTS public.crop_prices (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id       text NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  market_id     text NOT NULL REFERENCES public.crop_markets(id) ON DELETE CASCADE,
  grade         text,
  unit          text NOT NULL CHECK (unit IN ('viss','basket','bag')),
  price_mmk     integer NOT NULL,
  trend         text NOT NULL CHECK (trend IN ('up','down','stable')),
  recorded_on   date NOT NULL,
  source        text NOT NULL DEFAULT 'DOA/Bayintnaung wholesale reports (sample)',
  last_verified date NOT NULL DEFAULT current_date,
  UNIQUE (crop_id, market_id, recorded_on)
);
GRANT SELECT ON public.crop_prices TO anon, authenticated;
GRANT ALL    ON public.crop_prices TO service_role;
ALTER TABLE public.crop_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "prices read all" ON public.crop_prices;
CREATE POLICY "prices read all" ON public.crop_prices FOR SELECT TO anon, authenticated USING (true);

-- Seed current prices for each (crop, market) pair + 12-month history.
-- Realistic 2024-2025 Myanmar wholesale ranges (MMK), per viss unless noted.
WITH base AS (
  SELECT * FROM (VALUES
    ('rice_pawsan',  'Standard',    'bag',    125000),
    ('rice_emata',   'Standard',    'bag',     62000),
    ('rice_sinthuk', 'Standard',    'bag',     72000),
    ('green_gram',   'FAQ',         'viss',     5200),
    ('black_gram',   'SQ',          'viss',     4100),
    ('chickpea',     'Bold',        'viss',     4600),
    ('corn',         'Yellow',      'viss',     1250),
    ('sesame',       'White',       'viss',    11000),
    ('groundnut',    'Shelled',     'viss',     6800),
    ('onion',        'Medium',      'viss',     3200),
    ('garlic',       'Domestic',    'viss',     9500),
    ('tomato',       'Fresh',       'viss',     1400),
    ('chili',        'Dried hot',   'viss',    12500)
  ) AS t(crop_id, grade, unit, base_price)
),
markets AS ( SELECT id, name FROM public.crop_markets ),
pairs AS (
  SELECT b.*, m.id AS market_id, m.name AS market_name FROM base b CROSS JOIN markets m
),
months AS (
  SELECT generate_series(0, 11) AS m
)
INSERT INTO public.crop_prices (crop_id, market_id, grade, unit, price_mmk, trend, recorded_on)
SELECT
  p.crop_id,
  p.market_id,
  p.grade,
  p.unit,
  -- realistic monthly variation: ±12% seasonal sine + ±5% market drift + small noise
  GREATEST(50, ROUND(
    p.base_price
    * (1 + 0.12 * SIN((m.m::float / 12.0) * 2 * PI()))
    * (1 + ((('x' || substr(md5(p.crop_id || p.market_id), 1, 8))::bit(32)::int % 11) / 100.0))
    * (1 + ((('x' || substr(md5(p.crop_id || p.market_id || m.m::text), 1, 8))::bit(32)::int % 7 - 3) / 100.0))
  )::int),
  CASE
    WHEN m.m = 0 THEN
      CASE ((('x' || substr(md5(p.crop_id || p.market_id), 1, 8))::bit(32)::int) % 3)
        WHEN 0 THEN 'up' WHEN 1 THEN 'stable' ELSE 'down'
      END
    ELSE 'stable'
  END,
  (current_date - (m.m || ' months')::interval)::date
FROM pairs p CROSS JOIN months m
ON CONFLICT (crop_id, market_id, recorded_on) DO NOTHING;

-- ---------- 4. CROP DISEASES ----------
CREATE TABLE IF NOT EXISTS public.crop_diseases (
  id          text PRIMARY KEY,
  crop_id     text NOT NULL,
  name_en     text NOT NULL,
  name_my     text NOT NULL,
  severity    text NOT NULL CHECK (severity IN ('low','medium','high')),
  symptoms    text NOT NULL,
  causes      text NOT NULL,
  prevention  text NOT NULL,
  treatment   text NOT NULL,
  source      text NOT NULL DEFAULT 'IRRI / FAO / DOA Myanmar extension materials'
);
GRANT SELECT ON public.crop_diseases TO anon, authenticated;
GRANT ALL    ON public.crop_diseases TO service_role;
ALTER TABLE public.crop_diseases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "diseases read all" ON public.crop_diseases;
CREATE POLICY "diseases read all" ON public.crop_diseases FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.crop_diseases (id, crop_id, name_en, name_my, severity, symptoms, causes, prevention, treatment) VALUES
  ('rice_blast', 'rice', 'Rice Blast', 'စပါးမီးပြာ',
    'high',
    'Diamond-shaped lesions on leaves with grey centres and brown borders. Neck blast causes panicles to break and turn white (white head).',
    'Fungus Magnaporthe oryzae. Favoured by high humidity (>85%), heavy nitrogen use, prolonged leaf wetness, and cool nights (20-28°C).',
    'Use resistant varieties (Sinthukha, IR64-MAS). Avoid excess nitrogen. Drain field intermittently. Maintain proper spacing for airflow.',
    'Apply tricyclazole 75% WP at 0.6 g/L or carbendazim at 1 g/L at first symptom. Repeat after 10-14 days if humidity stays high.'
  ),
  ('rice_brown_spot', 'rice', 'Brown Spot', 'အညိုပြောက်',
    'medium',
    'Small circular brown spots with yellow halos on leaves; spots may merge. Grain discolouration and chalkiness on heads.',
    'Fungus Bipolaris oryzae. Common in nutrient-poor soils (low K and Si) and water-stressed fields.',
    'Balanced NPK fertilization with potassium and silicon. Treat seeds with hot water (53°C, 12 min) or carbendazim before sowing.',
    'Foliar spray of mancozeb 75% WP at 2 g/L, or propiconazole 25% EC at 1 ml/L. Improve soil potassium with MoP topdress.'
  ),
  ('rice_blb', 'rice', 'Bacterial Leaf Blight', 'ဘက်တီးရီးယားရွက်ခြောက်',
    'high',
    'Water-soaked yellow streaks from leaf tips that turn straw-coloured. Whole leaves wilt; in severe cases the plant looks scalded.',
    'Bacterium Xanthomonas oryzae. Spreads via irrigation water, rain splash, and wounded leaves. Worsened by typhoons and heavy rain.',
    'Plant resistant varieties (IR20, Manawthukha). Avoid clipping seedlings. Drain field after heavy rain. Disinfect tools.',
    'No effective curative chemical. Copper oxychloride 0.3% may suppress spread. Remove affected tillers; apply balanced fertilizer; avoid late-season nitrogen.'
  ),
  ('rice_sheath_blight', 'rice', 'Sheath Blight', 'ရွက်လွှာရောဂါ',
    'medium',
    'Oval greenish-grey lesions on leaf sheath near waterline, expanding upward. Bordered by dark brown margins.',
    'Fungus Rhizoctonia solani. Favoured by dense planting, high nitrogen, and continuous flooding.',
    'Wider spacing (20×20 cm). Avoid excess nitrogen. Remove weeds and crop debris. Rotate with pulses.',
    'Validamycin 3% L at 2 ml/L or hexaconazole 5% EC at 2 ml/L sprayed at boot stage and 14 days later.'
  ),
  ('bean_anthracnose', 'bean', 'Anthracnose', 'အန်သရက်ကို့စ်',
    'high',
    'Dark sunken lesions on pods with pink spore masses in the centre. Brown streaks on stems and leaf veins.',
    'Fungus Colletotrichum lindemuthianum. Seed-borne; spreads in cool, wet weather (17-24°C).',
    'Use certified disease-free seed. Crop rotation (3+ years). Avoid overhead irrigation. Remove infected debris.',
    'Foliar spray with mancozeb 75% WP at 2 g/L or chlorothalonil at 2 ml/L every 10 days during flowering and pod-fill.'
  ),
  ('bean_rust', 'bean', 'Rust', 'သံချေးရောဂါ',
    'medium',
    'Small reddish-brown pustules on the underside of leaves; in severe attacks leaves yellow and drop early.',
    'Fungus Uromyces appendiculatus. Spreads by wind. Favoured by 17-25°C with prolonged dew.',
    'Plant rust-tolerant varieties. Avoid dense canopies. Remove volunteer bean plants between seasons.',
    'Apply propiconazole 25% EC at 1 ml/L or sulphur dust at 25 kg/ha at first sign of pustules. Repeat after 14 days.'
  ),
  ('bean_mosaic_virus', 'bean', 'Bean Common Mosaic Virus', 'မိုဆိုက်ဗိုင်းရပ်စ်',
    'high',
    'Light/dark green mottling on leaves; leaves curl and become narrow. Stunted plants, fewer pods, malformed seeds.',
    'BCMV virus spread by aphids and infected seed. Seed-borne infection up to 90% if uncontrolled.',
    'Use certified virus-free seed only. Plant resistant varieties. Control aphid vectors early with neem or imidacloprid.',
    'No chemical cure. Rogue and destroy infected plants immediately. Spray imidacloprid 17.8% SL at 0.3 ml/L weekly to control aphids.'
  ),
  ('corn_armyworm', 'corn', 'Fall Armyworm', 'အာရှပိုးကောင်',
    'high',
    'Window-pane holes on young leaves, then ragged feeding into the whorl. Sawdust-like frass visible. Cobs may be hollowed out.',
    'Spodoptera frugiperda larvae. Highly mobile; multiple generations per season. Active in warm dry conditions.',
    'Early sowing with synchronised neighbours. Pheromone traps (5/acre). Encourage natural enemies. Pull and destroy egg masses.',
    'Spray emamectin benzoate 5% SG at 0.4 g/L or spinetoram 11.7% SC at 0.5 ml/L directly into the whorl in evening. Rotate actives to delay resistance.'
  ),
  ('corn_leaf_blight', 'corn', 'Northern Corn Leaf Blight', 'ပြောင်းရွက်ခြောက်',
    'medium',
    'Long cigar-shaped grey-green lesions on lower leaves, turning tan with darker borders.',
    'Fungus Exserohilum turcicum. Favoured by 18-27°C with heavy dew. Carries on crop residue.',
    'Plant tolerant hybrids. Bury or remove infected stubble. Rotate with pulses or sesame. Avoid late planting in monsoon.',
    'Mancozeb 75% WP at 2.5 g/L or propiconazole 25% EC at 1 ml/L at first lesion. Repeat after 12-14 days.'
  )
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_my = EXCLUDED.name_my,
  severity = EXCLUDED.severity, symptoms = EXCLUDED.symptoms,
  causes = EXCLUDED.causes, prevention = EXCLUDED.prevention,
  treatment = EXCLUDED.treatment;

-- ---------- 5. CROP CALENDAR ----------
CREATE TABLE IF NOT EXISTS public.crop_calendar (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region          text NOT NULL,
  crop_id         text NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  season          text NOT NULL,           -- 'Monsoon' | 'Winter' | 'Summer'
  sow_month_start int  NOT NULL CHECK (sow_month_start BETWEEN 1 AND 12),
  sow_month_end   int  NOT NULL CHECK (sow_month_end   BETWEEN 1 AND 12),
  harvest_month_start int NOT NULL CHECK (harvest_month_start BETWEEN 1 AND 12),
  harvest_month_end   int NOT NULL CHECK (harvest_month_end   BETWEEN 1 AND 12),
  fertilizer_notes text NOT NULL,
  irrigation_notes text NOT NULL,
  UNIQUE (region, crop_id, season)
);
GRANT SELECT ON public.crop_calendar TO anon, authenticated;
GRANT ALL    ON public.crop_calendar TO service_role;
ALTER TABLE public.crop_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calendar read all" ON public.crop_calendar;
CREATE POLICY "calendar read all" ON public.crop_calendar FOR SELECT TO anon, authenticated USING (true);

-- Generic Myanmar-wide seasonal patterns; per-region small offsets handled in UI.
INSERT INTO public.crop_calendar (region, crop_id, season, sow_month_start, sow_month_end, harvest_month_start, harvest_month_end, fertilizer_notes, irrigation_notes) VALUES
  -- Monsoon rice (most regions)
  ('Ayeyarwady','rice_emata',   'Monsoon', 6, 7, 10, 11, 'Basal NPK 15:15:15 at 50 kg/ac; topdress urea 30 kg/ac at tillering (25 DAS) and panicle initiation (55 DAS).', 'Maintain 3-5 cm standing water from transplanting until heading; drain 7 days before harvest.'),
  ('Bago',      'rice_pawsan',  'Monsoon', 6, 7, 11, 12, 'Basal compound 16:16:8 at 50 kg/ac; urea split: 25 DAS, 55 DAS.', 'Continuous flooding; intermittent drying allowed during tillering.'),
  ('Yangon',    'rice_emata',   'Monsoon', 6, 7, 10, 11, 'Basal NPK; topdress urea at 25 and 55 DAS.', 'Standing water 3-5 cm; drain before harvest.'),
  ('Sagaing',   'rice_sinthuk', 'Monsoon', 6, 7, 10, 11, 'Lower basal in light soils; emphasise potash at heading.', 'Field needs supplementary irrigation during August dry spell.'),
  ('Mandalay',  'rice_sinthuk', 'Summer',  1, 2,  4,  5, 'Full basal NPK; nitrogen split into 3 doses.', 'Irrigated rice — daily checks; never let soil crack.'),

  -- Pulses (winter / cool dry)
  ('Magway',    'green_gram',   'Winter', 10,11,  1,  2, 'Apply 25 kg/ac DAP at sowing; rhizobium inoculation increases nodulation.', 'One pre-sowing irrigation; supplementary at flowering if rainfall fails.'),
  ('Sagaing',   'black_gram',   'Winter', 10,11,  1,  2, 'Basal 25 kg DAP/ac; foliar 2% urea at flowering.', 'Rainfed; one irrigation at pod-fill in dry years.'),
  ('Mandalay',  'chickpea',     'Winter', 10,11,  2,  3, 'Sulphur 10 kg/ac improves seed quality. Avoid heavy nitrogen.', 'Generally rainfed on residual soil moisture.'),

  -- Oilseeds
  ('Magway',    'sesame',       'Monsoon', 6, 7,  9, 10, 'Basal 20 kg DAP/ac + 25 kg MoP/ac; light urea at 30 DAS.', 'Strictly rainfed; ensure good drainage to avoid root rot.'),
  ('Mandalay',  'groundnut',    'Monsoon', 6, 7, 10, 11, 'Gypsum 100 kg/ac at flowering for pod-fill. Avoid nitrogen excess.', 'Rainfed monsoon crop; irrigation only at peg formation in dry spells.'),

  -- Corn
  ('Shan',      'corn',         'Monsoon', 5, 6,  9, 10, 'Basal NPK 15:15:15 at 60 kg/ac; urea split at 30 and 50 DAS.', 'Rainfed at higher altitude; supplementary irrigation in valleys.'),
  ('Shan',      'corn',         'Winter', 11,12,  3,  4, 'Same basal; cooler temps need slow N release.', 'Furrow or sprinkler irrigation every 10-12 days.'),

  -- Vegetables
  ('Shan',      'onion',        'Winter', 10,11,  2,  3, 'Basal 50 kg compound + 30 kg MoP/ac; topdress urea at bulb initiation.', 'Drip or furrow every 6-8 days; stop 10 days before harvest.'),
  ('Shan',      'garlic',       'Winter', 10,11,  3,  4, 'Heavy organic manure (4 t/ac) + 50 kg compound NPK.', 'Light frequent irrigation; bulb cracking if irregular.'),
  ('Shan',      'tomato',       'Winter', 10,11,  1,  3, 'Basal 50 kg compound NPK + 25 kg MoP; topdress urea after first picking.', 'Drip irrigation preferred; mulch to conserve moisture.'),
  ('Magway',    'chili',        'Winter', 10,11,  2,  4, 'Basal NPK 50 kg/ac; foliar boron at flowering improves fruit set.', 'Furrow irrigation every 10 days; stop 7 days before final harvest.')
ON CONFLICT (region, crop_id, season) DO UPDATE SET
  sow_month_start = EXCLUDED.sow_month_start, sow_month_end = EXCLUDED.sow_month_end,
  harvest_month_start = EXCLUDED.harvest_month_start, harvest_month_end = EXCLUDED.harvest_month_end,
  fertilizer_notes = EXCLUDED.fertilizer_notes, irrigation_notes = EXCLUDED.irrigation_notes;

-- ---------- 6. BUYER REQUESTS ----------
CREATE TABLE IF NOT EXISTS public.buyer_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id       text NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  qty_viss      integer NOT NULL,
  max_price_mmk integer NOT NULL,
  region        text NOT NULL,
  township      text,
  deadline      date NOT NULL,
  buyer_name    text NOT NULL,
  contact_phone text NOT NULL,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.buyer_requests TO anon, authenticated;
GRANT ALL    ON public.buyer_requests TO service_role;
ALTER TABLE public.buyer_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "buyer_requests read all" ON public.buyer_requests;
CREATE POLICY "buyer_requests read all" ON public.buyer_requests FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.buyer_requests (crop_id, qty_viss, max_price_mmk, region, township, deadline, buyer_name, contact_phone, notes) VALUES
  ('rice_pawsan', 5000, 130000, 'Yangon',   'Hlaingthaya', current_date + 14, 'Aung Trading Co.',        '09-555-001-002', 'Need bags of 108 lb; long-grain only.'),
  ('green_gram',  2000,   5500, 'Mandalay', 'Meiktila',    current_date + 21, 'Shwe Pyi Tan Pulses',     '09-555-002-101', 'Export quality FAQ grade.'),
  ('sesame',       800,  11500, 'Magway',   'Pakokku',     current_date +  9, 'Myanmar Oilseed Export',  '09-555-003-088', 'White sesame, max 8% moisture.'),
  ('corn',        4000,   1300, 'Shan',     'Lashio',      current_date + 30, 'Khaing Animal Feed Mill', '09-555-004-077', 'For feed; aflatoxin tested.'),
  ('chili',        300,  13000, 'Yangon',   'Insein',      current_date +  7, 'Daw Khin Spice Shop',     '09-555-005-066', 'Dried hot chili, deep red colour.'),
  ('onion',       1200,   3500, 'Yangon',   'Hlegu',       current_date + 10, 'City Mart Procurement',   '09-555-006-055', 'Medium size, no sprouting.'),
  ('groundnut',   1500,   7200, 'Mandalay', 'Tada-U',      current_date + 18, 'Golden Oil Press',        '09-555-007-044', 'In-shell or shelled both OK.'),
  ('black_gram',  2500,   4300, 'Sagaing',  'Monywa',      current_date + 25, 'Yangon Pulse Exporter',   '09-555-008-033', 'Bagged 60 kg; ship to Bayintnaung.'),
  ('tomato',       400,   1600, 'Shan',     'Taunggyi',    current_date +  5, 'Hotel & Restaurant Supply','09-555-009-022','Daily order, ripe but firm.'),
  ('garlic',       250,  10000, 'Mandalay', 'Pyin Oo Lwin',current_date + 12, 'Spice & Herb Distributors','09-555-010-011','Domestic garlic preferred.')
ON CONFLICT DO NOTHING;

-- ---------- 7. NOTIFICATIONS (per-user) ----------
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    text NOT NULL,        -- weather|disease|price|ai|calendar|gov
  priority    text NOT NULL DEFAULT 'normal', -- low|normal|high
  title       text NOT NULL,
  body        text NOT NULL,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif owner read"   ON public.notifications;
DROP POLICY IF EXISTS "notif owner insert" ON public.notifications;
DROP POLICY IF EXISTS "notif owner update" ON public.notifications;
DROP POLICY IF EXISTS "notif owner delete" ON public.notifications;
CREATE POLICY "notif owner read"   ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif owner insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif owner update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notif owner delete" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
