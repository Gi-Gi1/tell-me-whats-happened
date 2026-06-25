import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Orvia" },
      { name: "description", content: "Set a new password for your Orvia account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in URL hash and exchanges it automatically.
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const isRecovery = hash.includes("type=recovery") || hash.includes("access_token");
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady("ok");
    });
    // Also check an existing session synchronously
    supabase.auth.getSession().then(({ data }) => {
      if (data.session || isRecovery) setReady("ok");
      else setReady("invalid");
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }
    setBusy(true);
    const res = await updatePassword(password);
    setBusy(false);
    if (res.error) {
      toast.error(t("actionFailed"));
      return;
    }
    toast.success(t("passwordUpdated"));
    setTimeout(() => navigate({ to: "/auth" }), 600);
  }

  return (
    <div className="agri min-h-screen bg-gradient-to-br from-[#e4ecdf] via-white to-[#fde0c8] px-4 py-10">
      <div className="mx-auto max-w-md">
        <a href="/" className="mb-6 block text-2xl font-bold text-[#0e2e18]">🌾 Orvia</a>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-[#1f4d2b]/5 sm:p-8">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#e4ecdf] text-[#0e2e18]">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-[#0e2e18]">
            {t("setNewPassword")}
          </h1>

          {ready === "checking" && (
            <p className="mt-4 flex items-center gap-2 text-sm text-[#5a3a24]">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("checkingResetLink")}
            </p>
          )}

          {ready === "invalid" && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                {t("invalidResetLink")}
                <a href="/forgot-password" className="mt-2 block font-bold text-rose-900 underline">
                  {t("requestAgain")}
                </a>
              </div>
            </div>
          )}

          {ready === "ok" && (
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#5a3a24]">
                  {t("newPassword")}
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#0e2e18] focus:border-[#1f4d2b] focus:outline-none focus:ring-2 focus:ring-[#1f4d2b]/30"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#5a3a24]">
                  {t("confirmPassword")}
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#0e2e18] focus:border-[#1f4d2b] focus:outline-none focus:ring-2 focus:ring-[#1f4d2b]/30"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#1f4d2b] py-3 text-sm font-bold text-white shadow hover:bg-[#0e2e18] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("updatePassword")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
