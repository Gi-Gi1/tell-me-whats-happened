import { createFileRoute } from "@tanstack/react-router";
import { CropDoctor } from "@/components/agrimarket/CropDoctor";

export const Route = createFileRoute("/agrimarket/doctor")({
  head: () => ({
    meta: [
      { title: "AI သီးနှံကျန်းမာရေး ဆေးခန်း — Orvia" },
      {
        name: "description",
        content: "သီးနှံပုံကို တင်ပြီး AI ၏ ရောဂါစစ်ဆေးချက်နှင့် ကုသနည်းအကြံပြုချက်များကို မြန်မာဘာသာဖြင့် ချက်ချင်း ရယူပါ။",
      },
    ],
  }),
  component: DoctorPage,
});

function DoctorPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <CropDoctor />
    </main>
  );
}
