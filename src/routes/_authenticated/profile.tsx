import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_META, routeForRole, type AppRole } from "@/lib/auth/roles";
import { MYANMAR_REGIONS, REGION_NAMES, REGION_LABEL_MY, TOWNSHIP_LABEL_MY } from "@/lib/myanmar-regions";
import { User as UserIcon, Mail, Phone, MapPin, LayoutDashboard, Save, LogOut, Leaf } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Orvia" },
      { name: "description", content: "Manage your Orvia account profile." },
    ],
  }),
  component: ProfilePage,
});

type Profile = {
  display_name: string | null;
  phone: string | null;
  region: string | null;
  township: string | null;
  preferred_language: string | null;
};

function ProfilePage() {
  const { user, primaryRole, signOut } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [township, setTownship] = useState("");

  const townships = region ? (MYANMAR_REGIONS[region] ?? []) : [];

  // Load profile (graceful fallback to user_metadata if the table isn't there yet)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      const meta = user.user_metadata ?? {};
      try {
        const { data, error } = await supabase
          .from("profiles" as never)
          .select("display_name,phone,region,township,preferred_language")
          .eq("id", user.id)
          .maybeSingle();
        if (!mounted) return;
        const p = (data as Profile | null) ?? null;
        if (!error && p) {
          setDisplayName(p.display_name ?? meta.display_name ?? "");
          setPhone(p.phone ?? meta.phone ?? "");
          setRegion(p.region ?? meta.region ?? "");
          setTownship(p.township ?? meta.township ?? "");
        } else {
          setDisplayName(meta.display_name ?? "");
          setPhone(meta.phone ?? "");
          setRegion(meta.region ?? "");
          setTownship(meta.township ?? "");
        }
      } catch {
        setDisplayName(meta.display_name ?? "");
        setPhone(meta.phone ?? "");
        setRegion(meta.region ?? "");
        setTownship(meta.township ?? "");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      id: user.id,
      display_name: displayName || null,
      phone: phone || null,
      region: region || null,
      township: township || null,
      preferred_language: lang,
      updated_at: new Date().toISOString(),
    };

    let dbOk = false;
    try {
      const { error } = await supabase
        .from("profiles" as never)
        .upsert(payload as never, { onConflict: "id" } as never);
      dbOk = !error;
    } catch { /* table may not exist yet */ }

    // Always keep user_metadata in sync so the app works even before
    // the profiles table migration has been applied.
    await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        phone, region, township,
        preferred_language: lang,
      },
    });

    setSaving(false);
    toast.success(dbOk ? t("profileSaved") : t("profileSavedLocal"));
  }

  async function onSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  const meta = primaryRole ? ROLE_META[primaryRole as Exclude<AppRole, "admin">] : null;
  const initials = (displayName || user?.email || "?").trim().slice(0, 2).toUpperCase();

  return (
    <div className="agri min-h-screen bg-gradient-to-br from-[#F1F8E9] via-white to-[#FBE9E7] px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Hero card */}
        <header className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-agri-primary to-agri-primary-dark text-xl font-black text-white shadow-md sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-agri-ink/50">
                <Leaf className="mr-1 inline h-3 w-3" /> {t("yourProfile")}
              </p>
              <h1 className="mt-1 truncate text-2xl font-black text-agri-ink sm:text-3xl">
                {displayName || user?.email?.split("@")[0] || t("yourProfile")}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-agri-primary-soft px-2.5 py-1 font-semibold text-agri-primary-dark">
                  <Mail className="h-3 w-3" /> <span className="truncate max-w-[180px]">{user?.email}</span>
                </span>
                {meta && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                    {meta.emoji} {t(`role.${primaryRole}`, { en: meta.en, my: meta.my })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {primaryRole && primaryRole !== "admin" && (
              <Link
                to={routeForRole(primaryRole)}
                className="inline-flex items-center gap-2 rounded-2xl bg-agri-primary px-4 py-2 text-sm font-bold text-white shadow hover:bg-agri-primary-dark"
              >
                <LayoutDashboard className="h-4 w-4" /> {t("goToDashboard")}
              </Link>
            )}
            <Link
              to="/agrimarket"
              className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-bold text-agri-ink hover:bg-agri-primary-soft/40"
            >
              {t("openMarketplace")}
            </Link>
            <button
              onClick={onSignOut}
              className="ml-auto inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" /> {t("signOut")}
            </button>
          </div>
        </header>

        {/* Edit form */}
        <form
          onSubmit={onSave}
          className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-7"
        >
          <h2 className="text-lg font-bold text-agri-ink">{t("editProfile")}</h2>
          <p className="mt-1 text-xs text-agri-ink/60">{t("editProfileHint")}</p>

          {loading ? (
            <p className="mt-6 text-sm text-agri-ink/60">{t("loading")}</p>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label={t("displayName")} icon={UserIcon}>
                <input
                  className="agri-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("displayName")}
                />
              </Field>
              <Field label={t("phone")} icon={Phone}>
                <input
                  type="tel"
                  className="agri-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxxx"
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t("region")} icon={MapPin}>
                  <select
                    className="agri-input"
                    value={region}
                    onChange={(e) => { setRegion(e.target.value); setTownship(""); }}
                  >
                    <option value="">—</option>
                    {REGION_NAMES.map((r) => (
                      <option key={r} value={r}>
                        {t(`region.${r}`, { en: r, my: REGION_LABEL_MY[r] ?? r })}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("township")} icon={MapPin}>
                  <select
                    className="agri-input disabled:opacity-50"
                    value={township}
                    onChange={(e) => setTownship(e.target.value)}
                    disabled={!region}
                  >
                    <option value="">—</option>
                    {townships.map((tw) => (
                      <option key={tw} value={tw}>
                        {t(`township.${tw}`, { en: tw, my: TOWNSHIP_LABEL_MY[tw] ?? tw })}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-agri-primary py-3 text-sm font-bold text-white shadow hover:bg-agri-primary-dark disabled:opacity-60 sm:w-auto sm:px-6"
              >
                <Save className="h-4 w-4" />
                {saving ? t("pleaseWait") : t("save")}
              </button>
            </div>
          )}
        </form>
      </div>

      <style>{`.agri-input{width:100%;border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:.65rem .85rem;font-size:.9rem;background:#fff;color:#3E2723} .agri-input:focus{outline:none;border-color:#2E7D32;box-shadow:0 0 0 3px rgba(46,125,50,.15)}`}</style>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof UserIcon; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-agri-ink/70">
        <Icon className="h-3.5 w-3.5 text-agri-primary" />
        {label}
      </span>
      {children}
    </label>
  );
}
