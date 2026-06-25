export const APP_ROLES = ["farmer", "buyer", "trader", "agribusiness", "student", "officer", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_META: Record<Exclude<AppRole, "admin">, { emoji: string; my: string; en: string; desc: string; route: string }> = {
  farmer:       { emoji: "👨‍🌾", my: "စိုက်ပျိုးသူ",   en: "Farmer",       desc: "သီးနှံ စိုက်ပျိုး၊ ရောင်းချ",   route: "/dashboard/farmer" },
  buyer:        { emoji: "🛒",   my: "ဝယ်သူ",         en: "Buyer",        desc: "သီးနှံ ဝယ်ယူ",                 route: "/dashboard/buyer" },
  trader:       { emoji: "🚚",   my: "ကုန်သည်",        en: "Trader",       desc: "ဝယ်ရောင်း ကုန်သည်",            route: "/dashboard/trader" },
  agribusiness: { emoji: "🏢",   my: "လုပ်ငန်းရှင်",     en: "Agribusiness", desc: "လယ်ယာ လုပ်ငန်းရှင်",          route: "/dashboard/agribusiness" },
  student:      { emoji: "🎓",   my: "ကျောင်းသား",     en: "Student",      desc: "သုတေသန၊ ပညာရေး",            route: "/dashboard/student" },
  officer:      { emoji: "🧑‍🌾", my: "စိုက်ပျိုးရေးအရာရှိ", en: "Officer",      desc: "လယ်ယာ အရာရှိ၊ အစီရင်ခံ",       route: "/dashboard/officer" },
};

export function routeForRole(role: AppRole | null | undefined): string {
  if (!role) return "/dashboard/farmer";
  if (role === "admin") return "/dashboard/admin";
  return ROLE_META[role].route;
}
