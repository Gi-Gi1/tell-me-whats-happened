import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  LogIn, UserPlus, Mail, Lock, Phone, User as UserIcon,
  MapPin, Eye, EyeOff, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_ROLES, ROLE_META, routeForRole, type AppRole } from "@/lib/auth/roles";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import { MYANMAR_REGIONS, REGION_NAMES, REGION_LABEL_MY, TOWNSHIP_LABEL_MY } from "@/lib/myanmar-regions";
import { toast } from "sonner";
import orviaBg from "@/assets/orvia-bg.jpg";


const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional(), redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Orvia — အကောင့်ဝင်ရန် / အကောင့်ဖွင့်ရန်" },
      {
        name: "description",
        content:
          "Orvia ၏ ဝန်ဆောင်မှုများကို အသုံးပြုရန် အကောင့်ဖွင့်ပါ။ တောင်သူ၊ ဝယ်ယူသူ၊ ကုန်သည်၊ လုပ်ငန်းရှင်၊ ကျောင်းသား နှင့် စိုက်ပျိုးရေးအရာရှိများ ချက်ချင်း ဝင်ရောက် အသုံးပြုနိုင်ပါသည်။",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode, redirect: redirectTo } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const { signIn, signUp, user, primaryRole, loading } = useAuth();
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState<string>("");
  const [township, setTownship] = useState<string>("");
  const [role, setRole] = useState<AppRole>("farmer");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [townshipSearch, setTownshipSearch] = useState("");

  const allTownships = useMemo(() => (region ? MYANMAR_REGIONS[region] ?? [] : []), [region]);
  const townships = useMemo(() => {
    const q = townshipSearch.trim().toLowerCase();
    if (!q) return allTownships;
    return allTownships.filter((tw) => {
      const my = TOWNSHIP_LABEL_MY[tw] ?? "";
      return tw.toLowerCase().includes(q) || my.includes(townshipSearch.trim());
    });
  }, [allTownships, townshipSearch]);

  // Password strength: 0..4
  const passwordStrength = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  // Redirect once auth state is known — avoid throwing during render
  // (which can fight Suspense). useEffect is safer here.
  useEffect(() => {
    if (!loading && user) {
      const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : routeForRole(primaryRole);
      navigate({ to: target as "/dashboard/farmer", replace: true });
    }
  }, [loading, user, primaryRole, navigate, redirectTo]);


  function validateMyanmarPhone(p: string): boolean {
    if (!p) return true; // optional
    // accepts +959XXXXXXXX or 09XXXXXXXX (8-11 digits after 09)
    return /^(\+?959\d{7,10}|09\d{7,10})$/.test(p.replace(/\s|-/g, ""));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === "signup") {
      if (password.length < 8) {
        toast.error(t("passwordTooShort"));
        return;
      }
      if (password !== confirmPassword) {
        toast.error(t("passwordsDoNotMatch"));
        return;
      }
      if (!validateMyanmarPhone(phone)) {
        toast.error(t("invalidPhone"));
        return;
      }
      if (!role) {
        toast.error(t("selectRole"));
        return;
      }
      if (!region || !township) {
        toast.error(t("selectTownship", { en: "Please select region and township", my: "တိုင်း/ပြည်နယ်နှင့် မြို့နယ်ကို ရွေးပါ" }));
        return;
      }
    }

    setBusy(true);
    const res = mode === "signin"
      ? await signIn(email, password)
      : await signUp({
          email, password,
          displayName: displayName || email.split("@")[0],
          role, phone, region, township,
          preferredLanguage: lang,
        });
    setBusy(false);

    // Persist remember-me preference (Supabase already persists by default)
    if (typeof window !== "undefined") {
      try { localStorage.setItem("agri.remember", remember ? "1" : "0"); } catch { /* ignore */ }
    }

    if (res.error) {
      toast.error(translateAuthError(res.error, lang));
      return;
    }
    // Sign-up that requires email confirmation: no session yet.
    if (mode === "signup" && "needsConfirmation" in res && res.needsConfirmation) {
      toast.success(t("checkYourEmail"));
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
      return;
    }
    toast.success(mode === "signup" ? t("accountCreated") : t("welcomeBack"));
    const chosenRole = (mode === "signup" ? role : primaryRole) ?? null;
    const target = redirectTo && redirectTo.startsWith("/") ? redirectTo : routeForRole(chosenRole);
    setTimeout(() => navigate({ to: target as "/dashboard/farmer", replace: true }), 150);
  }

  // Map common Supabase auth errors to fluent Myanmar / fallback to English
  function translateAuthError(msg: string, l: string): string {
    const m = msg.toLowerCase();
    void l;
    if (m.includes("invalid login")) return t("invalidLogin");
    if (m.includes("email") && m.includes("already")) return t("emailAlreadyUsed");
    if (m.includes("password") && (m.includes("short") || m.includes("at least") || m.includes("6"))) return t("passwordTooShort");
    if (m.includes("rate limit")) return t("authRateLimited");
    if (m.includes("network") || m.includes("fetch")) return t("networkError");
    return t("actionFailed");
  }

  return (
    <div className="agri relative min-h-screen overflow-hidden px-4 py-10 text-agri-ink">
      <img
        src={orviaBg}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--color-agri-surface) 92%, transparent), color-mix(in oklab, var(--color-agri-butter-soft) 80%, transparent))",
        }}
      />
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between">
          <a href="/" className="font-display text-2xl font-extrabold tracking-tight text-agri-primary-dark">🌾 Orvia</a>
          <LanguageSelector />
        </div>

        <div className="rounded-3xl border border-agri-border bg-white/95 p-6 shadow-2xl shadow-agri-coffee/10 backdrop-blur-md sm:p-8">

          <div className="mb-6 flex gap-2 rounded-2xl bg-[#e4ecdf] p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  mode === m ? "bg-white text-[#0e2e18] shadow" : "text-[#5a3a24]"
                }`}
              >
                {m === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {m === "signin" ? t("signIn") : t("signUp")}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === "signup" && (
              <>
                <Field label={`${t("displayName")} *`} icon={<UserIcon className="h-4 w-4" />}>
                  <input
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="agri-input agri-input-pad"
                    placeholder={t("displayName")}
                    autoComplete="name"
                  />
                </Field>
                <Field label={t("phone")} icon={<Phone className="h-4 w-4" />}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="agri-input agri-input-pad"
                    placeholder="09xxxxxxxxx"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label={`${t("region")} *`} icon={<MapPin className="h-4 w-4" />}>
                    <select
                      required
                      value={region}
                      onChange={(e) => { setRegion(e.target.value); setTownship(""); setTownshipSearch(""); }}
                      className="agri-input agri-input-pad"
                    >
                      <option value="">—</option>
                      {REGION_NAMES.map((r) => (
                        <option key={r} value={r}>{t(`region.${r}`, { en: r, my: REGION_LABEL_MY[r] ?? r })}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={`${t("township")} *`}>
                    <div className="space-y-1.5">
                      <input
                        type="search"
                        value={townshipSearch}
                        onChange={(e) => setTownshipSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && townships.length > 0) {
                            e.preventDefault();
                            setTownship(townships[0]);
                            setTownshipSearch("");
                          }
                        }}
                        disabled={!region}
                        placeholder={
                          region
                            ? t("townshipSearchPlaceholder", {
                                en: `Search ${allTownships.length} townships…`,
                                my: `မြို့နယ် ${allTownships.length} ခု ရှာရန်…`,
                              })
                            : t("selectRegionFirst", { en: "Select region first", my: "တိုင်း/ပြည်နယ် အရင်ရွေးပါ" })
                        }
                        className="agri-input text-xs disabled:opacity-50"
                        aria-label={t("township")}
                      />
                      {township && (
                        <div className="flex items-center justify-between rounded-lg bg-[#1f4d2b] px-3 py-1.5 text-xs text-white">
                          <span className="font-semibold">
                            ✓ {t(`township.${township}`, { en: township, my: TOWNSHIP_LABEL_MY[township] ?? township })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTownship("")}
                            className="ml-2 rounded px-1 text-white/80 hover:bg-white/10 hover:text-white"
                            aria-label="Clear township"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                      <div
                        role="listbox"
                        aria-label={t("township")}
                        className="max-h-44 overflow-y-auto rounded-xl border border-[#ecdfc8] bg-white p-1"
                        style={{ opacity: region ? 1 : 0.5 }}
                      >
                        {!region && (
                          <div className="px-3 py-2 text-xs text-[#8a7a5e]">
                            {t("selectRegionFirst", { en: "Select region first", my: "တိုင်း/ပြည်နယ် အရင်ရွေးပါ" })}
                          </div>
                        )}
                        {region && townships.length === 0 && (
                          <div className="px-3 py-2 text-xs text-[#8a7a5e]">
                            {t("noMatches", { en: "No matches", my: "ရှာဖွေမတွေ့ပါ" })}
                          </div>
                        )}
                        {region && townships.map((tw) => {
                          const selected = township === tw;
                          return (
                            <button
                              type="button"
                              key={tw}
                              role="option"
                              aria-selected={selected}
                              onClick={() => { setTownship(tw); setTownshipSearch(""); }}
                              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selected
                                  ? "bg-[#1f4d2b] text-white font-semibold"
                                  : "text-[#0e2e18] hover:bg-[#f3ead6]"
                              }`}
                            >
                              {t(`township.${tw}`, { en: tw, my: TOWNSHIP_LABEL_MY[tw] ?? tw })}
                            </button>
                          );
                        })}
                      </div>
                      {region && !township && (
                        <p className="text-[11px] text-[#a04040]">
                          {t("selectTownship", { en: "Please select a township", my: "မြို့နယ်တစ်ခု ရွေးပါ" })}
                        </p>
                      )}
                    </div>
                  </Field>

                </div>
              </>
            )}
            <Field label={mode === "signin" ? t("emailOrPhone") : t("email")} icon={<Mail className="h-4 w-4" />}>
              <input
                type="email"
                required
                autoComplete={mode === "signin" ? "username" : "email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="agri-input agri-input-pad"
                placeholder="you@example.com"
              />
            </Field>
            <Field label={t("password")} icon={<Lock className="h-4 w-4" />}>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? 8 : 6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="agri-input agri-input-pad pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#5a3a24] hover:bg-black/5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "signup" && password.length > 0 && (
                <PasswordStrengthMeter score={passwordStrength} />
              )}
            </Field>
            {mode === "signup" && (
              <Field label={`${t("confirmPassword")} *`} icon={<Lock className="h-4 w-4" />}>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="agri-input agri-input-pad pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#5a3a24] hover:bg-black/5"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#1f4d2b]">
                    <Check className="h-3 w-3" /> Passwords match
                  </p>
                )}
              </Field>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 font-semibold text-[#0e2e18]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-black/20 accent-[#1f4d2b]"
                  />
                  {t("rememberMe")}
                </label>
                <Link to="/forgot-password" className="font-bold text-[#1f4d2b] hover:underline">
                  {t("forgotPassword")}
                </Link>
              </div>
            )}

            {mode === "signup" && (
              <div>
                <p className="mb-2 text-sm font-semibold text-[#0e2e18]">{t("chooseRole")} *</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {APP_ROLES.filter((r) => r !== "admin").map((r) => {
                    const meta = ROLE_META[r];
                    const active = role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        aria-pressed={active}
                        className={`rounded-2xl border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d2b] ${
                          active ? "border-[#1f4d2b] bg-[#e4ecdf] ring-2 ring-[#1f4d2b]/30" : "border-black/10 bg-white hover:bg-[#e4ecdf]"
                        }`}
                      >
                        <div className="text-2xl" aria-hidden="true">{meta.emoji}</div>
                        <div className="mt-1 text-xs font-bold text-[#0e2e18]">
                          {t(`role.${r}`, { en: meta.en, my: meta.my })}
                        </div>
                        <div className="text-[10px] text-[#5a3a24]">{t(`roleDesc.${r}`)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f4d2b] py-3 text-sm font-bold text-white shadow hover:bg-[#0e2e18] disabled:opacity-60"
            >
              {mode === "signup" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              {busy
                ? t("pleaseWait")
                : mode === "signup" ? t("createAccount") : t("signIn")}
            </button>


            <p className="text-center text-xs text-[#5a3a24]">
              {mode === "signin"
                ? `${t("noAccountYet")} `
                : `${t("alreadyHaveAccount")} `}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-bold text-[#1f4d2b] hover:underline"
              >
                {mode === "signin" ? t("signUp") : t("signIn")}
              </button>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        .agri-input{width:100%;border:1px solid #ecdfc8;border-radius:14px;padding:.65rem .85rem;font-size:.9rem;background:#ffffff;color:#0e2e18;font-weight:500}
        .agri-input::placeholder{color:#8a7a5e;opacity:1}
        .agri-input:focus{outline:none;border-color:#1f4d2b;box-shadow:0 0 0 3px rgba(31,77,43,.18)}
        .agri-input-pad{padding-left:2.25rem}
        .agri-input option{color:#0e2e18;background:#ffffff}
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#5a3a24]">{label}</span>
      <div className="relative">
        {icon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-[0.95rem] text-[#5a3a24]">
            {icon}
          </span>
        )}
        {children}
      </div>
    </label>
  );
}

function PasswordStrengthMeter({ score }: { score: number }) {
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-green-600"];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? colors[score] : "bg-black/10"}`} />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-semibold text-[#5a3a24]">{labels[score]}</p>
    </div>
  );
}

