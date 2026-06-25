import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/buyer")({
  component: () => (
    <RoleDashboard
      role="buyer"
      title="ဝယ်ယူသူ ပင်မမျက်နှာစာ"
      subtitle="တောင်သူများထံမှ လတ်ဆတ်သော သီးနှံများကို တိုက်ရိုက် ဝယ်ယူနိုင်ပြီး ဈေးနှုန်းများကို နှိုင်းယှဉ်ကြည့်ရှုနိုင်ပါသည်။"
      primaryCta={{ label: "ဈေးကွက်သို့ ဝင်ရောက်ရန်", to: "/agrimarket" }}
    />
  ),
});
