import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/officer")({
  component: () => (
    <RoleDashboard
      role="officer"
      title="စိုက်ပျိုးရေးအရာရှိ ပင်မမျက်နှာစာ"
      subtitle="ဒေသအလိုက် အစီရင်ခံစာများ၊ သီးနှံရောဂါ သတိပေးချက်များနှင့် ခွဲခြမ်းစိတ်ဖြာချက်များကို တစ်စုတစ်စည်းတည်း ကြည့်ရှုနိုင်ပါသည်။"
      primaryCta={{ label: "သီးနှံ ဆရာဝန် AI", to: "/agrimarket/doctor" }}
    />
  ),
});
