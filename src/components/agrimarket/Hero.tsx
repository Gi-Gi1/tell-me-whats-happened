import { Link } from "@tanstack/react-router";
import { ArrowRight, Sprout, Stethoscope, TrendingUp, Sun, Droplets } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import farmerHero from "@/assets/farmer-hero.jpg";


export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:gap-14 sm:py-20 lg:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        {/* Left column — headline inside glass card */}
        <div className="relative animate-fade-in">
          <div className="agri-glass-dark relative space-y-6 p-7 sm:space-y-7 sm:p-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-agri-butter/30 bg-agri-primary-dark/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-agri-butter backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-agri-tiger" />
              <Sprout className="h-3.5 w-3.5" />
              {t("heroBadge")}
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.01em] text-white text-shadow-hero sm:text-5xl lg:text-[3.75rem]">
              Smart Farming <span className="bg-gradient-to-r from-lime-400 via-yellow-300 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_2px_18px_rgba(163,230,53,0.45)]">Made Simple</span>
            </h1>
            <p className="max-w-xl text-base font-medium leading-relaxed text-white/90 text-shadow-hero sm:text-lg">
              {t("heroBody")}
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/agrimarket/post" className="agri-btn-tiger group">
                {t("postCrop")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/agrimarket/doctor" className="agri-btn-glass group">
                <Stethoscope className="h-4 w-4 text-agri-butter" />
                Check Disease with AI
              </Link>
            </div>
            {/* Trust strip */}
            <dl className="mt-2 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-5 text-left">
              {[
                { k: "10k+", v: t("recentListings") },
                { k: "330+", v: t("township") },
                { k: "AI", v: t("aiInsightsNav") },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-display text-2xl font-extrabold text-agri-butter text-shadow-hero">{s.k}</dt>
                  <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/75">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>




        {/* Right column — farmer image with floating cards */}
        <div className="relative group">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[2.75rem] blur-2xl opacity-70"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--color-agri-gold) 35%, transparent), color-mix(in oklab, var(--color-agri-orange) 25%, transparent) 50%, color-mix(in oklab, var(--color-agri-blue) 25%, transparent))",
            }}
          />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 shadow-2xl">
            <img
              src={farmerHero}
              alt="Myanmar farmer holding rice stalks in a golden hour paddy field"
              width={1280}
              height={1280}
              className="h-[460px] w-full object-cover sm:h-[560px]"
            />
            {/* gradient veil */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-agri-primary-dark/70 via-agri-primary-dark/10 to-transparent" />

            {/* Floating live price chip — top-left */}
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-agri-ink shadow-lg backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-agri-orange" />
              LIVE · {t("todayRicePrice")}
            </div>

            {/* Weather chip — top-right */}
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-agri-blue/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-md">
              <Sun className="h-3.5 w-3.5 text-agri-gold" />
              32° · <Droplets className="h-3 w-3" /> 68%
            </div>

            {/* Bottom market price panel */}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-agri-primary-dark/85 p-4 text-white backdrop-blur-xl sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
                    Daily Market · Rice
                  </p>
                  <div className="mt-1 font-display text-3xl font-bold leading-none tracking-tight sm:text-4xl">
                    {t("kyatPerBasket").split(" ")[0] || "75,000"}
                    <span className="ml-1 text-xs font-medium text-white/60">MMK</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-agri-gold/20 px-2 py-1 font-display text-sm font-bold text-agri-gold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +1.2%
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                    vs yesterday
                  </p>
                </div>
              </div>
              <div className="mt-3 flex h-8 w-full items-end gap-1">
                {[40, 60, 35, 70, 50, 95, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background:
                        i === 5
                          ? "var(--color-agri-orange)"
                          : i === 6
                          ? "var(--color-agri-gold)"
                          : "rgba(255,255,255,0.35)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating earth/brown badge */}
          <div className="absolute -left-3 bottom-24 hidden rotate-[-6deg] rounded-2xl border border-agri-brown/20 bg-agri-brown-soft px-3 py-2 text-[11px] font-bold text-agri-brown shadow-xl sm:block">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-agri-brown" />
              Verified Soil
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
