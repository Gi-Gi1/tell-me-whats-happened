import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import orviaBg from "@/assets/orvia-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orvia — မြန်မာ့လယ်ယာဈေးကွက်" },
      {
        name: "description",
        content: "မြန်မာတောင်သူများနှင့် ဝယ်ယူသူများကို တိုက်ရိုက်ချိတ်ဆက်ပေးသော AI လယ်ယာဈေးကွက်။",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useI18n();
  return (
    <div className="agri relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-white">
      <img
        src={orviaBg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-agri-coffee) 78%, transparent) 0%, color-mix(in oklab, var(--color-agri-primary-dark) 72%, transparent) 55%, color-mix(in oklab, var(--color-agri-tiger) 40%, transparent) 100%)",
        }}
      />

      <div className="absolute right-4 top-4 z-10">
        <LanguageSelector />
      </div>

      <div className="relative z-10 max-w-lg text-center">
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl text-white shadow-2xl ring-1 ring-white/20"
          style={{ background: "linear-gradient(135deg, var(--color-agri-tiger), var(--color-agri-cherry))" }}
        >
          <Leaf className="h-8 w-8" />
        </div>
        <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-agri-butter backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-agri-butter" />
          AI · Myanmar Agriculture
        </span>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight drop-shadow-lg sm:text-6xl">
          Orvia
        </h1>
        <p className="mt-3 text-base text-white/85 sm:text-lg">
          {t("homeSubtitle")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/agrimarket"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-xl transition-transform hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, var(--color-agri-tiger), var(--color-agri-cherry))" }}
          >
            {t("enterMarketplace")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            {t("signInOrRegister")}
          </Link>
        </div>

      </div>
    </div>
  );
}
