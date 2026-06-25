import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/student")({
  component: () => (
    <RoleDashboard
      role="student"
      title="ကျောင်းသား ပင်မမျက်နှာစာ"
      subtitle="လယ်ယာ စိုက်ပျိုးရေး အသိပညာ၊ AI တန်ဆာပလာများနှင့် သုတေသန ရင်းမြစ်များကို လေ့လာနိုင်ပါသည်။"
      primaryCta={{ label: "သီးနှံ ဆရာဝန် AI", to: "/agrimarket/doctor" }}
    />
  ),
});
