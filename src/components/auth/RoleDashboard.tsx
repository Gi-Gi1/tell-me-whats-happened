import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Bell, UserCircle2, Stethoscope } from "lucide-react";
import { ROLE_META } from "@/lib/auth/roles";
import type { AppRole } from "@/lib/auth/roles";
import { useI18n } from "@/lib/i18n";

export function RoleDashboard({
  role,
  title,
  subtitle,
  primaryCta,
}: {
  role: Exclude<AppRole, "admin">;
  title: string;
  subtitle: string;
  primaryCta: { label: string; to: string };
}) {
  const meta = ROLE_META[role];
  const { t } = useI18n();

  const dashboardTitle = t(`${role}DashboardTitle`);
  const dashboardSubtitle = t(`${role}DashboardSubtitle`);
  const ctaLabel =
    primaryCta.to === "/agrimarket/post"
      ? t("postCrop")
      : primaryCta.to === "/agrimarket/doctor"
      ? t("cropDoctor")
      : t("goToMarketplace");

  const tiles = [
    { icon: Stethoscope, title: t("cropDoctor"),    desc: t("featureDoctorDesc"),       tag: "AI",   to: "/agrimarket/doctor" as const },
    { icon: Bell,        title: t("notifications"), desc: t("notificationsSubtitle"),   tag: "LIVE", to: "/agrimarket/notifications" as const },
    { icon: UserCircle2, title: t("profile"),       desc: t("profileTileDesc"),         tag: "YOU",  to: "/profile" as const },
  ];

  void title;
  void subtitle;

  return (
    <div className="agri dashboard-white min-h-screen bg-agri-surface px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        {/* Header card */}
        <div className="agri-card relative overflow-hidden p-7 sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30"
            style={{ background: "radial-gradient(closest-side, var(--color-agri-gold), transparent)" }}
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-agri-primary-soft text-3xl">
              {meta.emoji}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-agri-ink-soft">
                {t("dashboardFor", { role: t(`role.${role}`, { en: meta.en, my: meta.my }) })}
              </p>
              <h1 className="font-display text-2xl font-bold text-agri-ink sm:text-3xl">
                {dashboardTitle}
              </h1>
            </div>
            <span className="agri-chip ml-auto hidden sm:inline-flex">
              <Sparkles className="h-3 w-3 text-agri-gold" /> AI Ready
            </span>
          </div>

          <p className="relative mt-5 max-w-2xl text-sm leading-relaxed text-agri-ink sm:text-base">
            {dashboardSubtitle}
          </p>

          <div className="relative mt-7 flex flex-wrap gap-3">
            <Link to={primaryCta.to} className="agri-btn-primary group">
              {ctaLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/agrimarket" className="agri-btn-secondary">
              {t("goToMarketplace")}
            </Link>
          </div>
        </div>

        {/* Quick tiles */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              to={tile.to}
              className="agri-card agri-card-hover group block p-5 text-left no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-agri-primary"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-agri-surface text-agri-ink transition-all group-hover:bg-agri-primary-dark group-hover:text-white">
                  <tile.icon className="h-4.5 w-4.5" />
                </span>
                <span className="agri-chip-gold">{tile.tag}</span>
              </div>
              <p className="font-display text-base font-bold text-agri-ink">{tile.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-agri-ink-soft">{tile.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
