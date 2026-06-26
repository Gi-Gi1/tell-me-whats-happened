import { Link, useNavigate } from "@tanstack/react-router";
import { Leaf, Bell, Stethoscope, Home, Plus, LogOut, LogIn, LayoutDashboard, BarChart3, Sparkles, Trophy, Truck, CloudRain, Calendar, Sprout, Coins, Bug, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n, type DictKey } from "@/lib/i18n";
import { ROLE_META, routeForRole } from "@/lib/auth/roles";
import { LanguageSelector } from "@/components/LanguageSelector";

type NavItem = {
  to:
    | "/agrimarket" | "/agrimarket/analytics" | "/agrimarket/ai-insights" | "/agrimarket/impact"
    | "/agrimarket/doctor" | "/agrimarket/transport" | "/agrimarket/notifications"
    | "/agrimarket/prices" | "/agrimarket/weather" | "/agrimarket/calendar"
    | "/agrimarket/fertilizer" | "/agrimarket/diseases" | "/agrimarket/profit";
  label: string;
  icon: typeof Home;
  exact: boolean;
};

const baseItems: NavItem[] = [
  { to: "/agrimarket",                label: "Home",        icon: Home,        exact: true },
  { to: "/agrimarket/prices",         label: "Prices",      icon: DollarSign,  exact: false },
  { to: "/agrimarket/weather",        label: "Weather",     icon: CloudRain,   exact: false },
  { to: "/agrimarket/calendar",       label: "Calendar",    icon: Calendar,    exact: false },
  { to: "/agrimarket/fertilizer",     label: "Fertilizer",  icon: Sprout,      exact: false },
  { to: "/agrimarket/diseases",       label: "Diseases",    icon: Bug,         exact: false },
  { to: "/agrimarket/profit",         label: "Profit",      icon: Coins,       exact: false },
  { to: "/agrimarket/doctor",         label: "AI Doctor",   icon: Stethoscope, exact: false },
  { to: "/agrimarket/transport",      label: "Transport",   icon: Truck,       exact: false },
  { to: "/agrimarket/notifications",  label: "Alerts",      icon: Bell,        exact: false },
];

// keep DictKey import alive
void {} as DictKey;



export function AgriNav() {
  const { user, primaryRole, signOut } = useAuth();
  const { t } = useI18n();
  const roleLabel = (r: keyof typeof ROLE_META) =>
    t(`role.${r}`, { en: ROLE_META[r].en, my: ROLE_META[r].my });
  const navigate = useNavigate();

  // Role-based filter: officers / students / buyers don't need the AI doctor as a top item
  const items = baseItems.filter((i) => {
    if (i.to === "/agrimarket/doctor") {
      return primaryRole === "farmer" || primaryRole === "agribusiness" || primaryRole === "officer" || !primaryRole;
    }
    return true;
  });

  const canPost = !primaryRole || primaryRole === "farmer" || primaryRole === "agribusiness" || primaryRole === "buyer" || primaryRole === "trader";

  async function onSignOut() {
    await signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-agri-primary-dark/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:h-[68px] sm:px-4">
        <Link to="/agrimarket" className="flex min-w-0 items-center gap-2.5 font-semibold text-white">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-agri-tiger text-white shadow-lg shadow-agri-tiger/40 sm:h-10 sm:w-10">
            <Leaf className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </span>
          <span className="truncate font-display text-base font-bold tracking-tight sm:text-lg">Orvia <span className="text-agri-butter">AI</span></span>
        </Link>

        <nav className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white md:inline-flex"
              activeProps={{ className: "text-agri-butter bg-white/10" }}

            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          ))}

          <div className="hidden md:inline-flex">
            <LanguageSelector compact />
          </div>

          {user && primaryRole && primaryRole !== "admin" && (
            <Link
              to={routeForRole(primaryRole)}
              className="hidden items-center gap-1 rounded-full bg-agri-primary-soft/60 px-2.5 py-1 text-xs font-bold text-agri-primary md:inline-flex"
              title="Dashboard"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{ROLE_META[primaryRole].emoji} {roleLabel(primaryRole)}</span>
            </Link>
          )}

          {/* Mobile-only language selector */}
          <div className="md:hidden">
            <LanguageSelector compact />
          </div>

          {canPost && user && (
            <Link
              to="/agrimarket/post"
              className="agri-btn-tiger inline-flex shrink-0 !px-3 !py-2 !text-xs sm:!px-5 sm:!text-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("postCrop")}</span>
              <span className="sm:hidden">{t("postShort")}</span>
            </Link>
          )}

          {user ? (
            <button
              onClick={onSignOut}
              aria-label={t("signOut")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90 hover:bg-agri-cherry hover:border-agri-cherry sm:px-3 sm:py-2 sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/20 sm:px-3 sm:py-2 sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">{t("signIn")}</span>
            </Link>
          )}

        </nav>
      </div>

      {/* Mobile bottom tabs — horizontally scrollable */}
      <nav className="flex items-stretch gap-1 overflow-x-auto border-t border-white/10 bg-agri-primary-dark/70 px-2 py-1 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="flex min-w-[68px] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/65"
            activeProps={{ className: "text-agri-butter bg-white/10" }}
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{t(item.key)}</span>
          </Link>
        ))}

        {user && primaryRole && primaryRole !== "admin" && (
          <Link
            to={routeForRole(primaryRole)}
            className="flex min-w-[68px] shrink-0 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-agri-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="truncate">{ROLE_META[primaryRole].emoji} {roleLabel(primaryRole)}</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
