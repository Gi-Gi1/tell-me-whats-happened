import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Orvia" },
      { name: "description", content: "Reset your Orvia password by email." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await resetPassword(email);
    setBusy(false);
    if (res.error) {
      toast.error(t("actionFailed"));
      return;
    }
    setSent(true);
    toast.success(t("resetLinkSent"));
  }

  return (
    <div className="agri min-h-screen bg-gradient-to-br from-[#e4ecdf] via-white to-[#fde0c8] px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link to="/auth" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0e2e18] hover:underline">
          <ArrowLeft className="h-4 w-4" /> {t("backToSignIn")}
        </Link>
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl shadow-[#1f4d2b]/5 sm:p-8">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#e4ecdf] text-[#0e2e18]">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-[#0e2e18]">
            {t("resetPassword")}
          </h1>
          <p className="mt-1 text-sm text-[#5a3a24]">
            {t("resetLinkHelp")}
          </p>

          {sent ? (
            <div className="mt-6 rounded-2xl border border-[#1f4d2b]/30 bg-[#e4ecdf] p-4 text-sm text-[#0e2e18]">
              ✅ {t("resetLinkCheckInbox")}
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-3 w-full rounded-xl bg-[#1f4d2b] py-2 text-sm font-bold text-white hover:bg-[#0e2e18]"
              >
                {t("backToSignIn")}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-[#5a3a24]">
                  {t("email")}
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-sm text-[#0e2e18] focus:border-[#1f4d2b] focus:outline-none focus:ring-2 focus:ring-[#1f4d2b]/30"
                  placeholder="you@example.com"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#1f4d2b] py-3 text-sm font-bold text-white shadow hover:bg-[#0e2e18] disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("sendResetLink")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
