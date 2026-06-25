import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  CloudRain,
  Sun,
  Wind,
  Sprout,
  TrendingUp,
  Tractor,
  Landmark,
  Bug,
  CalendarClock,
  CheckCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/agrimarket/notifications")({
  head: () => ({
    meta: [
      { title: "အသိပေးချက်များ — Orvia" },
      {
        name: "description",
        content: "ရာသီဥတု၊ ရောဂါ၊ ဈေးနှုန်းနှင့် စိုက်ပျိုးရေး အကြံပြုချက်များကို တစ်နေရာတည်းတွင် ကြည့်ရှုပါ။",
      },
    ],
  }),
  component: NotificationsPage,
});

type Category = "weather" | "disease" | "price" | "ai" | "calendar" | "gov" | "equipment";

type Notification = {
  id: string;
  category: Category;
  title: { my: string; en: string };
  body: { my: string; en: string };
  time: { my: string; en: string };
  priority: "low" | "normal" | "high";
};

const CATEGORY_META: Record<Category, { labelKey: string; icon: typeof Bell; color: string }> = {
  weather: { labelKey: "categoryWeather", icon: CloudRain, color: "bg-sky-100 text-sky-700" },
  disease: { labelKey: "categoryDisease", icon: Bug, color: "bg-red-100 text-red-700" },
  price: { labelKey: "categoryPrice", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700" },
  ai: { labelKey: "categoryAi", icon: Sprout, color: "bg-agri-primary-soft text-agri-primary" },
  calendar: { labelKey: "categoryCalendar", icon: CalendarClock, color: "bg-amber-100 text-amber-700" },
  gov: { labelKey: "categoryGov", icon: Landmark, color: "bg-indigo-100 text-indigo-700" },
  equipment: { labelKey: "categoryEquipment", icon: Tractor, color: "bg-orange-100 text-orange-700" },
};

const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    category: "weather",
    title: { my: "🌧️ မိုးသည်းထန်စွာ ရွာနိုင်ကြောင်း သတိပေးချက်", en: "🌧️ Heavy rain warning" },
    body: { my: "မနက်ဖြန် သင့်မြို့နယ်တွင် မိုးသည်းထန်စွာ ရွာနိုင်ပါသည်။ ယနေ့အတွင်း ဓာတ်မြေဩဇာ ထည့်သွင်းပြီး ရိတ်သိမ်းပြီးသား သီးနှံများကို မိုးလုံသောနေရာတွင် သိမ်းဆည်းထားပါ။", en: "Heavy rain is possible in your township tomorrow. Apply fertilizer today and store harvested crops in a dry place." },
    time: { my: "လွန်ခဲ့သော ၁၀ မိနစ်", en: "10 minutes ago" },
    priority: "high",
  },
  {
    id: "n2",
    category: "price",
    title: { my: "📈 ပဲတီစိမ်း ဈေးနှုန်း ၅% မြင့်တက်လာပါသည်", en: "📈 Green gram prices increased by 5%" },
    body: { my: "ယနေ့ ပဲဈေးနှုန်းသည် မနေ့ကထက် ၅% မြင့်တက်လာပါသည်။ နောက်ထပ်ရက်အနည်းငယ်အတွင်း ဆက်လက်မြင့်တက်နိုင်သဖြင့် ချက်ချင်းမရောင်းသေးဘဲ စောင့်ကြည့်ရန် အကြံပြုပါသည်။", en: "Pulse prices are 5% higher than yesterday and may continue rising over the next few days. Consider watching before selling immediately." },
    time: { my: "လွန်ခဲ့သော ၁ နာရီ", en: "1 hour ago" },
    priority: "normal",
  },
  {
    id: "n3",
    category: "ai",
    title: { my: "🌱 ဓာတ်မြေဩဇာ ထည့်သွင်းရန် အချိန်ကျရောက်ပါပြီ", en: "🌱 Fertilizer application time" },
    body: { my: "သင့်စပါးခင်းသည် စိုက်ပျိုးပြီး ၃၀ ရက်ပြည့်ပါပြီ။ နိုက်ထရိုဂျင် ပါဝင်သော ဓာတ်မြေဩဇာကို မိုးမရွာသော နံနက်စောစောတွင် ထည့်သွင်းရန် အကြံပြုပါသည်။", en: "Your rice field has reached 30 days after planting. Apply nitrogen fertilizer early in the morning when rain is not expected." },
    time: { my: "လွန်ခဲ့သော ၃ နာရီ", en: "3 hours ago" },
    priority: "normal",
  },
  {
    id: "n4",
    category: "disease",
    title: { my: "🐛 စပါးတွင် ရောဂါကျရောက်နိုင်ခြေ မြင့်မားနေပါသည်", en: "🐛 Rice disease risk is high" },
    body: { my: "သင့်ဒေသ၏ စိုထိုင်းဆ မြင့်တက်နေသဖြင့် စပါးရွက်ပြောက်ရောဂါ ကျရောက်နိုင်ခြေ မြင့်မားနေပါသည်။ စိုက်ခင်းကို စစ်ဆေးပြီး လိုအပ်ပါက သင့်လျော်သော မှိုသတ်ဆေးဖြင့် ကာကွယ်ကုသပါ။", en: "Humidity is rising in your area, increasing rice leaf spot risk. Inspect your field and use suitable fungicide if needed." },
    time: { my: "ယနေ့ နံနက် ၇:၁၅", en: "Today 7:15 AM" },
    priority: "high",
  },
  {
    id: "n5",
    category: "weather",
    title: { my: "☀️ အပူချိန် မြင့်တက်နိုင်ပါသည်", en: "☀️ Temperature may rise" },
    body: { my: "ယနေ့ မွန်းလွဲပိုင်းတွင် အပူချိန် ၃၈ °C အထိ ရှိနိုင်ပါသည်။ သီးနှံများကို ရေလုံလောက်စွာ ပေးပြီး နေ့လယ်ပိုင်းတွင် စိုက်ခင်းအခြေအနေကို စစ်ဆေးပါ။", en: "Temperatures may reach 38 °C this afternoon. Water crops adequately and inspect field conditions at midday." },
    time: { my: "ယနေ့ နံနက် ၆:၃၀", en: "Today 6:30 AM" },
    priority: "normal",
  },
  {
    id: "n6",
    category: "weather",
    title: { my: "🌬️ လေပြင်းတိုက်ခတ်နိုင်ပါသည်", en: "🌬️ Strong winds possible" },
    body: { my: "ည ၈ နာရီနောက်ပိုင်း လေပြင်းတိုက်ခတ်နိုင်ပါသည်။ အပင်ငယ်များကို ထောက်တိုင်ဖြင့် ခိုင်ခံ့အောင် ပြုလုပ်ပြီး ရိတ်သိမ်းပြီးသား သီးနှံများကို လုံခြုံစွာ သိမ်းဆည်းထားပါ။", en: "Strong winds are possible after 8 PM. Support young plants and secure harvested crops." },
    time: { my: "မနေ့", en: "Yesterday" },
    priority: "normal",
  },
  {
    id: "n7",
    category: "calendar",
    title: { my: "🌾 ရိတ်သိမ်းရန် သင့်တော်သော အချိန် ရောက်ရှိနေပါပြီ", en: "🌾 Harvest window is open" },
    body: { my: "သင်မှတ်တမ်းတင်ထားသော စပါးခင်းသည် ရိတ်သိမ်းရန် အသင့်ဖြစ်ပါပြီ။ နောက်ထပ် မိုးမရွာမီ ၃ ရက်အတွင်း ရိတ်သိမ်းရန် အကြံပြုပါသည်။", en: "Your recorded rice field is ready for harvest. Harvest within the next three rain-free days if possible." },
    time: { my: "မနေ့", en: "Yesterday" },
    priority: "high",
  },
  {
    id: "n8",
    category: "gov",
    title: { my: "🏛 အစိုးရ ထောက်ပံ့ကြေး လျှောက်ထားနိုင်ပါပြီ", en: "🏛 Government subsidy applications are open" },
    body: { my: "ဦးစီးဌာနမှ ၂၀၂၆ ခုနှစ် မိုးရာသီ စပါးစိုက်တောင်သူများအတွက် ထောက်ပံ့ကြေး လျှောက်လွှာများ ဖွင့်လှစ်ထားပါပြီ။ အသေးစိတ်ကို မြို့နယ်ဦးစီးရုံးတွင် စုံစမ်းနိုင်ပါသည်။", en: "Subsidy applications for 2026 monsoon rice farmers are now open. Ask your township office for details." },
    time: { my: "လွန်ခဲ့သော ၂ ရက်", en: "2 days ago" },
    priority: "low",
  },
];

function NotificationsPage() {
  const { t } = useI18n();
  const localize = (value: { my: string; en: string }) => t(value.en, value);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [read, setRead] = useState<Set<string>>(new Set());

  const filtered = NOTIFICATIONS.filter((n) => filter === "all" || n.category === filter);
  const unreadCount = NOTIFICATIONS.filter((n) => !read.has(n.id)).length;

  const markAllRead = () => setRead(new Set(NOTIFICATIONS.map((n) => n.id)));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-agri-primary text-white shadow-sm">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            <div>
              <h1 className="text-xl font-bold text-agri-ink sm:text-2xl">{t("notificationsTitle")}</h1>
              <p className="text-xs leading-relaxed text-agri-ink/65 sm:text-sm">
                {t("notificationsSubtitle")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 rounded-full border border-agri-border bg-white px-3 py-1.5 text-xs font-semibold text-agri-ink hover:bg-agri-primary-soft/40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t("markAllRead")}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
            {t("all")}
          </FilterPill>
          {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
            const M = CATEGORY_META[c];
            return (
              <FilterPill key={c} active={filter === c} onClick={() => setFilter(c)}>
                <M.icon className="h-3.5 w-3.5" />
                {t(M.labelKey)}
              </FilterPill>
            );
          })}
        </div>
      </header>

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-agri-border bg-white p-10 text-center text-sm text-agri-ink/60">
            {t("noNotificationsCategory")}
          </li>
        )}
        {filtered.map((n) => {
          const M = CATEGORY_META[n.category];
          const isRead = read.has(n.id);
          return (
            <li
              key={n.id}
              className={[
                "group relative rounded-2xl border bg-white p-4 shadow-sm transition-all sm:p-5",
                isRead ? "border-agri-border opacity-80" : "border-agri-primary/30 shadow-md",
              ].join(" ")}
            >
              <div className="flex gap-3 sm:gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${M.color}`}>
                  <M.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${M.color}`}>
                      {t(M.labelKey)}
                    </span>
                    {n.priority === "high" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        {t("important")}
                      </span>
                    )}
                    <span className="text-[11px] text-agri-ink/55">{localize(n.time)}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold leading-snug text-agri-ink sm:text-base">
                    {localize(n.title)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-agri-ink/75">{localize(n.body)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          setRead((s) => {
                            const next = new Set(s);
                            next.add(n.id);
                            return next;
                          })
                        }
                        className="rounded-full bg-agri-primary-soft px-3 py-1 text-xs font-semibold text-agri-primary hover:bg-agri-primary hover:text-white"
                      >
                        {t("markRead")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-agri-ink/55">
        💡 {t("notificationFootnote")}
      </p>
    </main>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-agri-primary bg-agri-primary text-white"
          : "border-agri-border bg-white text-agri-ink/75 hover:bg-agri-primary-soft/30",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// Unused icon imports kept for category meta typing safety.
void Sun;
void Wind;
