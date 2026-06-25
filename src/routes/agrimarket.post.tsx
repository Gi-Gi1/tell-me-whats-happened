import { createFileRoute } from "@tanstack/react-router";
import { PostCropForm } from "@/components/agrimarket/PostCropForm";

export const Route = createFileRoute("/agrimarket/post")({
  head: () => ({
    meta: [
      { title: "သီးနှံ ကြော်ငြာတင်ရန် — Orvia" },
      {
        name: "description",
        content: "သင့်သီးနှံကို ကြော်ငြာတင်ပြီး မြန်မာတစ်နိုင်ငံလုံးရှိ ဝယ်ယူသူများနှင့် ချိတ်ဆက်ပါ။",
      },
    ],
  }),
  component: PostCropPage,
});

function PostCropPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <PostCropForm />
    </main>
  );
}
