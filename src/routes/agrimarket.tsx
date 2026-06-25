import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AgriNav } from "@/components/agrimarket/AgriNav";
import { useI18n } from "@/lib/i18n";
import orviaBg from "@/assets/orvia-bg.jpg";

export const Route = createFileRoute("/agrimarket")({
  component: AgriLayout,
});

function AgriLayout() {
  const { t } = useI18n();
  return (
    <div className="agri relative min-h-screen text-agri-ink">
      {/* Fixed background photo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${orviaBg})` }}
      />
      {/* Dark green readability overlay - 60-75% darkness */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,42,30,0.72) 0%, rgba(6,42,30,0.82) 50%, rgba(3,22,16,0.92) 100%)",
        }}
      />
      <AgriNav />
      <Outlet />
      <footer className="mt-16 border-t border-white/10 bg-agri-primary-dark/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs leading-relaxed text-white/70">
          <p>© {new Date().getFullYear()} Orvia — {t("footerMarket")}</p>
          <p>{t("footerBuiltForFarmers")}</p>
        </div>
      </footer>
    </div>
  );
}
