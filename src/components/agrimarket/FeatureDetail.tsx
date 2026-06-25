import { Link } from "@tanstack/react-router";
import { Stethoscope, BadgePercent, Tractor, MapPin, Smartphone, Bell, ArrowRight, CheckCircle2, Truck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type FeatureId = "doctor" | "price" | "direct" | "regional" | "mobile" | "alerts" | "transport";


type Stat = { label: { en: string; my: string }; value: string };
type Bullet = { en: string; my: string };

type Detail = {
  icon: typeof Stethoscope;
  title: { en: string; my: string };
  summary: { en: string; my: string };
  bullets: Bullet[];
  stats: Stat[];
  cta: { label: { en: string; my: string }; to: string };
};

const DETAILS: Record<FeatureId, Detail> = {
  doctor: {
    icon: Stethoscope,
    title: { en: "AI Crop Health Clinic", my: "AI သီးနှံကျန်းမာရေး ဆေးခန်း" },
    summary: {
      en: "Snap a photo of a leaf and get instant disease detection with treatment plans tailored for Myanmar farms.",
      my: "သစ်ရွက်ပုံ ရိုက်ပြီး ရောဂါကို ချက်ချင်းသိနိုင်ပြီး မြန်မာတောင်ယာအတွက် ကုသမှု အကြံပြုချက်ရရှိမည်။",
    },
    bullets: [
      { en: "Detects 40+ common crop diseases", my: "သီးနှံရောဂါ ၄၀ ကျော် ဖော်ထုတ်နိုင်" },
      { en: "Organic & chemical treatment options", my: "သဘာဝနှင့် ဓာတုကုသမှု နှစ်မျိုးလုံး" },
      { en: "Severity score with action priority", my: "ပြင်းထန်မှု အဆင့်နှင့် ဦးစားပေး အကြံပြုချက်" },
      { en: "Works offline after first scan", my: "ပထမအကြိမ်ပြီးနောက် အင်တာနက်မလိုဘဲ အသုံးပြုနိုင်" },
    ],
    stats: [
      { label: { en: "Accuracy", my: "တိကျမှု" }, value: "94%" },
      { label: { en: "Scan time", my: "စစ်ဆေးချိန်" }, value: "<3s" },
      { label: { en: "Crops covered", my: "သီးနှံအမျိုးအစား" }, value: "25+" },
    ],
    cta: { label: { en: "Open Crop Doctor", my: "သီးနှံ ဆေးခန်းသို့" }, to: "/agrimarket/doctor" },
  },
  price: {
    icon: BadgePercent,
    title: { en: "Live Market Prices", my: "တိုက်ရိုက် ဈေးနှုန်း သတင်း" },
    summary: {
      en: "Track real-time wholesale prices, forecast trends and find the best selling window for your crop.",
      my: "လက်ကားဈေးနှုန်းများကို တိုက်ရိုက်ကြည့်ပြီး အကောင်းဆုံးရောင်းချချိန်ကို ရှာဖွေပါ။",
    },
    bullets: [
      { en: "Daily prices from major Myanmar markets", my: "မြန်မာ့အဓိကဈေးကွက်များမှ နေ့စဥ်ဈေးနှုန်း" },
      { en: "7 / 30 / 90-day trend charts", my: "၇ / ၃၀ / ၉၀ ရက် လမ်းကြောင်း ဇယား" },
      { en: "AI 14-day price forecast", my: "AI ၁၄ ရက် ဈေးခန့်မှန်းချက်" },
      { en: "Compare regional price gaps", my: "ဒေသအလိုက် ဈေးကွာခြားမှု နှိုင်းယှဉ်" },
    ],
    stats: [
      { label: { en: "Markets tracked", my: "ဈေးကွက်အရေအတွက်" }, value: "32" },
      { label: { en: "Crops", my: "သီးနှံ" }, value: "60+" },
      { label: { en: "Forecast accuracy", my: "ခန့်မှန်းချက် တိကျမှု" }, value: "88%" },
    ],
    cta: { label: { en: "Open Market Analytics", my: "ဈေးကွက် ခွဲခြမ်းစိတ်ဖြာမှု" }, to: "/agrimarket/analytics" },
  },
  direct: {
    icon: Tractor,
    title: { en: "Direct Buyer Matching", my: "ဝယ်ယူသူ တိုက်ရိုက် ချိတ်ဆက်" },
    summary: {
      en: "AI matches your harvest with verified buyers and transport — no middlemen, fair prices, faster sales.",
      my: "AI က သင့်ထွက်ကုန်ကို စစ်ဆေးပြီးသား ဝယ်ယူသူနှင့် သယ်ယူပို့ဆောင်ရေးဆီ တိုက်ရိုက်ချိတ်ဆက်ပေးသည်။",
    },
    bullets: [
      { en: "Verified buyer & trader profiles", my: "အတည်ပြုပြီး ဝယ်ယူသူ၊ ကုန်သည် အကောင့်များ" },
      { en: "Transport / pickup matching", my: "သယ်ယူပို့ဆောင်ရေး ချိတ်ဆက်ပေးခြင်း" },
      { en: "Secure in-app messaging", my: "လုံခြုံသော အက်ပ်တွင်း စကားပြောစနစ်" },
      { en: "Rating & reputation system", my: "အဆင့်သတ်မှတ်မှု စနစ်" },
    ],
    stats: [
      { label: { en: "Active buyers", my: "ဝယ်ယူသူ" }, value: "1,200+" },
      { label: { en: "Avg. price uplift", my: "ပျမ်းမျှ ဈေးတိုးတက်မှု" }, value: "+18%" },
      { label: { en: "Match time", my: "ချိတ်ဆက်ချိန်" }, value: "<24h" },
    ],
    cta: { label: { en: "See AI Recommendations", my: "AI အကြံပြုချက်များ" }, to: "/agrimarket/ai-insights" },
  },
  regional: {
    icon: MapPin,
    title: { en: "Regional & Weather Insights", my: "ဒေသနှင့် ရာသီဥတု သတင်း" },
    summary: {
      en: "Hyper-local weather, rainfall and production data for every Myanmar township and region.",
      my: "မြန်မာတိုင်းဒေသကြီး၊ ပြည်နယ်နှင့် မြို့နယ်အလိုက် ရာသီဥတု၊ မိုးရွာသွန်းမှု အချက်အလက်များ။",
    },
    bullets: [
      { en: "7-day township weather forecast", my: "မြို့နယ်အလိုက် ၇ ရက် ရာသီဥတု ခန့်မှန်းချက်" },
      { en: "Rainfall & temperature trends", my: "မိုးရွာသွန်းမှု၊ အပူချိန် လမ်းကြောင်း" },
      { en: "Regional production heatmap", my: "ဒေသအလိုက် ထုတ်လုပ်မှု မြေပုံ" },
      { en: "Climate-risk alerts", my: "ရာသီဥတု အန္တရာယ် သတိပေးချက်" },
    ],
    stats: [
      { label: { en: "Townships", my: "မြို့နယ်" }, value: "330" },
      { label: { en: "Weather updates", my: "ရာသီဥတု အပ်ဒိတ်" }, value: "Hourly" },
      { label: { en: "Risk alert lead", my: "ကြိုတင် သတိပေးချိန်" }, value: "48h" },
    ],
    cta: { label: { en: "Open Analytics", my: "ခွဲခြမ်းစိတ်ဖြာမှု" }, to: "/agrimarket/analytics" },
  },
  mobile: {
    icon: Smartphone,
    title: { en: "Mobile-First & Offline Ready", my: "မိုဘိုင်းအတွက် အထူးပြုလုပ်ထား" },
    summary: {
      en: "Designed for low-bandwidth Myanmar networks — works on basic Android phones, syncs when online.",
      my: "မြန်မာ့ မိုဘိုင်းကွန်ရက်များအတွက် ပေါ့ပါးစွာ ဒီဇိုင်းပြုလုပ်ထား — အင်တာနက်မရှိချိန် အသုံးပြုနိုင်။",
    },
    bullets: [
      { en: "Less than 8 MB app footprint", my: "အက်ပ်ပမာဏ ၈ MB အောက်" },
      { en: "Myanmar and English only", my: "မြန်မာနှင့် အင်္ဂလိပ် ဘာသာစကား ၂ မျိုး" },
      { en: "Voice input for low literacy users", my: "အသံဖြင့် ထည့်သွင်းနိုင်ခြင်း" },
      { en: "Offline crop & price reference", my: "အင်တာနက်မရှိချိန် သီးနှံ၊ ဈေးနှုန်း ကြည့်နိုင်" },
    ],
    stats: [
      { label: { en: "App size", my: "အက်ပ်အရွယ်" }, value: "<8MB" },
      { label: { en: "Languages", my: "ဘာသာစကား" }, value: "2" },
      { label: { en: "Offline tools", my: "Offline ကိရိယာ" }, value: "12" },
    ],
    cta: { label: { en: "View Impact Dashboard", my: "သက်ရောက်မှု Dashboard" }, to: "/agrimarket/impact" },
  },
  alerts: {
    icon: Bell,
    title: { en: "Smart Marketplace Alerts", my: "ဈေးကွက် သတိပေးချက်များ" },
    summary: {
      en: "Get instant notifications when prices spike, buyers post offers, or weather threatens your crop.",
      my: "ဈေးတက်ချိန်၊ ဝယ်ယူသူ ပေါ်ပေါက်ချိန်နှင့် ရာသီဥတု အန္တရာယ်ရှိချိန် ချက်ချင်း သိရှိနိုင်ပါ။",
    },
    bullets: [
      { en: "Price-threshold alerts per crop", my: "သီးနှံအလိုက် ဈေးနှုန်း သတိပေးချက်" },
      { en: "New buyer & order notifications", my: "ဝယ်ယူသူ၊ မှာယူမှု အသိပေးချက်" },
      { en: "Severe weather warnings", my: "ပြင်းထန် ရာသီဥတု သတိပေးချက်" },
      { en: "Per-channel mute & schedule", my: "သတိပေးချက် စီမံခန့်ခွဲမှု" },
    ],
    stats: [
      { label: { en: "Alert types", my: "သတိပေး အမျိုးအစား" }, value: "8" },
      { label: { en: "Avg. response", my: "ပျမ်းမျှ တုံ့ပြန်ချိန်" }, value: "<2min" },
      { label: { en: "Channels", my: "လမ်းကြောင်း" }, value: "App / SMS" },
    ],
    cta: { label: { en: "Open Notifications", my: "သတိပေးချက်များ" }, to: "/agrimarket/notifications" },
  },
  transport: {
    icon: Truck,
    title: { en: "Vehicle & Transport Hub", my: "ယာဉ်နှင့် သယ်ယူပို့ဆောင်ရေး" },
    summary: {
      en: "Find trucks, pickups, vans, tractors and motorbikes to move agricultural goods across Myanmar — book directly with verified owners.",
      my: "ထရပ်ကား၊ ပစ်ကပ်၊ ဗန်နှင့် ထွန်စက်များဖြင့် မြန်မာတစ်နိုင်ငံလုံးတွင် ထွက်ကုန် သယ်ယူပါ — ပိုင်ရှင်နှင့် တိုက်ရိုက် မှာယူပါ။",
    },
    bullets: [
      { en: "Trucks, pickups, vans, tractors & motorbikes", my: "ထရပ်၊ ပစ်ကပ်၊ ဗန်၊ ထွန်စက်၊ ဆိုင်ကယ်" },
      { en: "Filter by type, capacity & availability", my: "အမျိုးအစား၊ ထမ်းနိုင်မှု၊ ရရှိနိုင်မှု စစ်ထုတ်" },
      { en: "One-tap booking request to the owner", my: "ပိုင်ရှင်ထံ တစ်ချက်နှိပ်ဖြင့် မှာယူ" },
      { en: "Cold-chain & last-mile options", my: "Cold-chain နှင့် last-mile ရွေးချယ်စရာ" },
    ],
    stats: [
      { label: { en: "Vehicle types", my: "ယာဉ်အမျိုးအစား" }, value: "5" },
      { label: { en: "Avg. response", my: "ပျမ်းမျှ တုံ့ပြန်ချိန်" }, value: "<2h" },
      { label: { en: "Coverage", my: "ဝန်ဆောင်နယ်ပယ်" }, value: "Nationwide" },
    ],
    cta: { label: { en: "Browse Vehicles", my: "ယာဉ်များ ကြည့်ရန်" }, to: "/agrimarket/transport" },
  },

};

export function FeatureDetail({ id }: { id: FeatureId }) {
  const { t, lang } = useI18n();
  const d = DETAILS[id];
  const pick = (v: { en: string; my: string }) => (lang === "en" ? v.en : v.my);
  const Icon = d.icon;

  return (
    <div className="agri-glass overflow-hidden p-6 sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-agri-tiger text-white shadow-lg">
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
            {pick(d.title)}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/85 sm:text-base">
            {pick(d.summary)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {d.stats.map((s) => (
          <div
            key={s.value}
            className="rounded-2xl border border-white/15 bg-agri-primary-dark/60 p-5 text-center backdrop-blur-md"
          >
            <p className="font-display text-3xl font-extrabold text-agri-butter">{s.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/70">
              {pick(s.label)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {d.bullets.map((b) => (
          <div
            key={b.en}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-agri-butter" />
            <p className="text-sm leading-relaxed text-white/90">{pick(b)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to={d.cta.to}
          className="inline-flex items-center gap-2 rounded-full bg-agri-tiger px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-agri-tiger/90"
        >
          {pick(d.cta.label)}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {t("liveData", { en: "Live data · updates automatically", my: "Live အချက်အလက် · အလိုအလျောက် အပ်ဒိတ်" })}
        </span>
      </div>
    </div>
  );
}
