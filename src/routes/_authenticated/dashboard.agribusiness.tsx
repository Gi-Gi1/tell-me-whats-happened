import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/agribusiness")({
  component: () => (
    <RoleDashboard
      role="agribusiness"
      title="လုပ်ငန်းရှင် ပင်မမျက်နှာစာ"
      subtitle="ပစ္စည်း ထောက်ပံ့မှု၊ ဝန်ဆောင်မှုနှင့် စာချုပ်စိုက်ပျိုးရေး လုပ်ငန်းများကို တစ်နေရာတည်းတွင် စီမံခန့်ခွဲနိုင်ပါသည်။"
      primaryCta={{ label: "ဈေးကွက်သို့ ဝင်ရောက်ရန်", to: "/agrimarket" }}
    />
  ),
});
