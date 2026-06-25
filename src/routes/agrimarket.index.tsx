import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/agrimarket/Hero";
import { FeatureCards } from "@/components/agrimarket/FeatureCards";
import { ListingsPreview } from "@/components/agrimarket/ListingsPreview";

export const Route = createFileRoute("/agrimarket/")({
  head: () => ({
    meta: [
      { title: "Orvia — တောင်သူမှ ဝယ်ယူသူသို့ တိုက်ရိုက် ရောင်းချရန်" },
      {
        name: "description",
        content: "မြန်မာတောင်သူများနှင့် ဝယ်ယူသူများကို တိုက်ရိုက်ချိတ်ဆက်ပေးသော AI လယ်ယာဈေးကွက်။ ကြားပွဲစားမပါ၊ မျှတသောဈေးနှုန်း၊ မိုဘိုင်းအသုံးပြုရလွယ်ကူ။",
      },
      { property: "og:title", content: "Orvia — မြန်မာ့လယ်ယာဈေးကွက်" },
      { property: "og:description", content: "သင့်သီးနှံကို မြန်မာတစ်နိုင်ငံလုံးရှိ ဝယ်ယူသူများထံ တိုက်ရိုက်ရောင်းချပါ။" },
    ],
  }),
  component: AgriHome,
});

function AgriHome() {
  return (
    <main>
      <Hero />
      <FeatureCards />
      <ListingsPreview />
    </main>
  );
}
