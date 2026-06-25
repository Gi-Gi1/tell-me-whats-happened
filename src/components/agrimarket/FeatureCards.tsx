import { Link } from "@tanstack/react-router";
import { Tractor, BadgePercent, MapPin, Smartphone, Stethoscope, Bell, Truck } from "lucide-react";
import { useI18n, type DictKey } from "@/lib/i18n";
import featLeaf from "@/assets/feat-leaf.jpg";
import featWeather from "@/assets/feat-weather.jpg";
import featMarket from "@/assets/feat-market.jpg";
import featDrone from "@/assets/feat-drone.jpg";
import farmerHero from "@/assets/farmer-hero.jpg";
import type { FeatureId } from "./FeatureDetail";

type Route =
  | "/agrimarket/doctor"
  | "/agrimarket/analytics"
  | "/agrimarket/ai-insights"
  | "/agrimarket/transport"
  | "/agrimarket/impact"
  | "/agrimarket/notifications";

export type Feature = {
  id: FeatureId;
  icon: typeof Tractor;
  title: DictKey;
  desc: DictKey;
  tag: string;
  image: string;
  to: Route;
};

const features: readonly Feature[] = [
  { id: "doctor",    icon: Stethoscope,  title: "featureDoctorTitle",    desc: "featureDoctorDesc",    tag: "AI DISEASE",    image: featLeaf,    to: "/agrimarket/doctor" },
  { id: "price",     icon: BadgePercent, title: "featurePriceTitle",     desc: "featurePriceDesc",     tag: "LIVE INSIGHTS", image: featWeather, to: "/agrimarket/analytics" },
  { id: "transport", icon: Truck,        title: "featureTransportTitle", desc: "featureTransportDesc", tag: "TRANSPORT",     image: featMarket,  to: "/agrimarket/transport" },
  { id: "direct",    icon: Tractor,      title: "featureDirectTitle",    desc: "featureDirectDesc",    tag: "AI MATCHING",   image: featDrone,   to: "/agrimarket/ai-insights" },
  { id: "regional",  icon: MapPin,       title: "featureRegionalTitle",  desc: "featureRegionalDesc",  tag: "LOCAL RADAR",   image: farmerHero,  to: "/agrimarket/analytics" },
  { id: "mobile",    icon: Smartphone,   title: "featureMobileTitle",    desc: "featureMobileDesc",    tag: "ON-DEVICE",     image: featDrone,   to: "/agrimarket/impact" },
  { id: "alerts",    icon: Bell,         title: "featureAlertsTitle",    desc: "featureAlertsDesc",    tag: "MARKETPLACE",   image: featMarket,  to: "/agrimarket/notifications" },
] as const;

export function FeatureCards() {
  const { t } = useI18n();

  return (
    <section id="features" className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-agri-butter backdrop-blur-md mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-agri-tiger" />
          AI-Powered Marketplace
        </span>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white text-shadow-hero sm:text-4xl">
          {t("featureTitle")}
        </h2>
        <p className="mt-4 text-base font-medium leading-relaxed text-white/85">
          {t("featureBody")}
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.id}
            to={f.to}
            className="agri-glass agri-glass-hover group relative z-10 block overflow-hidden p-0 text-left no-underline transition focus:outline-none focus-visible:ring-2 focus-visible:ring-agri-butter"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={f.image}
                alt=""
                loading="lazy"
                width={896}
                height={672}
                className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-agri-primary-dark via-agri-primary-dark/40 to-transparent" />
              <div className="pointer-events-none absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-agri-primary-dark/85 text-agri-butter shadow-lg backdrop-blur-md ring-1 ring-white/15 transition-all group-hover:bg-agri-tiger group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-agri-butter/95 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-agri-coffee shadow-md">
                {f.tag}
              </span>
            </div>
            <div className="p-6 sm:p-7">
              <h3 className="font-display text-lg font-extrabold leading-snug text-white">
                {t(f.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                {t(f.desc)}
              </p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-agri-butter">
                {t("exploreFeature", { en: "Explore →", my: "ကြည့်ရန် →" })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
