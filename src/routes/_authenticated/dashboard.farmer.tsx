import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/farmer")({
  component: () => (
    <RoleDashboard
      role="farmer"
      title="တောင်သူ ပင်မမျက်နှာစာ"
      subtitle="သင်၏ သီးနှံများကို ကြော်ငြာတင်ပါ၊ AI ဖြင့် ရောဂါ စစ်ဆေးပါ၊ ဈေးကွက်နှင့် ဝယ်ယူသူများထံ တိုက်ရိုက် ဆက်သွယ်နိုင်ပါသည်။"
      primaryCta={{ label: "သီးနှံ ကြော်ငြာတင်ရန်", to: "/agrimarket/post" }}
    />
  ),
});
