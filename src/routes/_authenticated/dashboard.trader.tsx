import { createFileRoute } from "@tanstack/react-router";
import { RoleDashboard } from "@/components/auth/RoleDashboard";

export const Route = createFileRoute("/_authenticated/dashboard/trader")({
  component: () => (
    <RoleDashboard
      role="trader"
      title="ကုန်သည် ပင်မမျက်နှာစာ"
      subtitle="အစုလိုက်အပြုံလိုက် ဝယ်ယူရောင်းချရန် ဈေးကွက် အလားအလာများကို ခြေရာခံပြီး အရောင်းအဝယ် အကောင်းဆုံး အခွင့်အလမ်းများကို ရှာဖွေပါ။"
      primaryCta={{ label: "ဈေးကွက်သို့ ဝင်ရောက်ရန်", to: "/agrimarket" }}
    />
  ),
});
