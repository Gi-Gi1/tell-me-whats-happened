import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sql002 from "../../supabase/sql/002_vehicles_chat.sql?raw";
import sql003 from "../../supabase/sql/003_crop_listings.sql?raw";

export const Route = createFileRoute("/agrimarket/setup")({
  component: SetupPage,
});

const SQL_EDITOR_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new";
const STORAGE_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/storage/buckets";

const SETUP_SQL = `-- Orvia setup — paste ALL of this into Supabase SQL Editor and click Run.\n\n${sql002}\n\n${sql003}\n`;

type CheckState = "checking" | "pass" | "fail" | "warn";
type Check = {
  id: string;
  label: string;
  state: CheckState;
  detail: string;
};

const initial: Check[] = [
  { id: "table", label: "Table public.crop_listings exists", state: "checking", detail: "" },
  { id: "select_rls", label: "RLS read policy on crop_listings", state: "checking", detail: "" },
  { id: "insert_rls", label: "RLS insert policy on crop_listings (auth.uid() = user_id)", state: "checking", detail: "" },
  { id: "bucket", label: "Storage bucket crop-images exists", state: "checking", detail: "" },
  { id: "bucket_read", label: "Storage read policy on crop-images", state: "checking", detail: "" },
  { id: "bucket_write", label: "Storage insert policy on crop-images (per-user folder)", state: "checking", detail: "" },
];

function SetupPage() {
  const [checks, setChecks] = useState<Check[]>(initial);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const set = (id: string, patch: Partial<Check>) =>
    setChecks((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const run = useCallback(async () => {
    setRunning(true);
    setChecks(initial);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    setSignedIn(!!user);

    // 1) table exists + 2) select policy
    const tableRes = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("crop_listings" as any)
      .select("id", { head: true, count: "exact" })
      .limit(0);

    const tableMissing =
      tableRes.error &&
      (tableRes.error.code === "PGRST205" ||
        tableRes.error.code === "42P01" ||
        (tableRes.error.message || "")
          .toLowerCase()
          .includes("could not find the table"));

    if (tableMissing) {
      set("table", { state: "fail", detail: "Table not found — run the setup SQL below." });
      set("select_rls", { state: "fail", detail: "Skipped — table missing." });
      set("insert_rls", { state: "fail", detail: "Skipped — table missing." });
    } else if (tableRes.error) {
      set("table", { state: "warn", detail: tableRes.error.message });
      set("select_rls", { state: "warn", detail: tableRes.error.message });
    } else {
      set("table", { state: "pass", detail: "Reachable via PostgREST." });
      set("select_rls", { state: "pass", detail: "Anonymous SELECT allowed (cl_select_all)." });

      // 3) insert RLS — only meaningful when signed in
      if (!user) {
        set("insert_rls", {
          state: "warn",
          detail: "Sign in to verify the insert policy from the browser.",
        });
      } else {
        // Try a wrong user_id — should be rejected by RLS (42501).
        const badInsert = await supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("crop_listings" as any)
          .insert({
            user_id: "00000000-0000-0000-0000-000000000000",
            crop_name: "__rls_probe__",
            quantity: 0,
            unit: "kg",
            price_per_unit: 0,
            region: "x",
            township: "x",
            contact: "x",
          })
          .select("id")
          .maybeSingle<{ id: string }>();

        if (badInsert.error && badInsert.error.code === "42501") {
          set("insert_rls", {
            state: "pass",
            detail: "RLS correctly blocks inserts with a mismatched user_id.",
          });
        } else if (badInsert.error) {
          set("insert_rls", { state: "warn", detail: badInsert.error.message });
        } else {
          // It went through — RLS is not enforcing! Clean up.
          if (badInsert.data?.id) {
            await supabase
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .from("crop_listings" as any)
              .delete()
              .eq("id", badInsert.data.id);
          }

          set("insert_rls", {
            state: "fail",
            detail: "Insert succeeded with a fake user_id — RLS is not enforced!",
          });
        }
      }
    }

    // 4) bucket exists
    const bucketRes = await supabase.storage.getBucket("crop-images");
    if (bucketRes.error || !bucketRes.data) {
      set("bucket", {
        state: "fail",
        detail: bucketRes.error?.message ?? "Bucket not found.",
      });
      set("bucket_read", { state: "fail", detail: "Skipped — bucket missing." });
      set("bucket_write", { state: "fail", detail: "Skipped — bucket missing." });
    } else {
      set("bucket", {
        state: "pass",
        detail: `Found (${bucketRes.data.public ? "public" : "private"}).`,
      });

      // 5) read policy — list root
      const list = await supabase.storage.from("crop-images").list("", { limit: 1 });
      if (list.error) {
        set("bucket_read", { state: "fail", detail: list.error.message });
      } else {
        set("bucket_read", { state: "pass", detail: "Listing succeeded." });
      }

      // 6) write policy — only when signed in
      if (!user) {
        set("bucket_write", {
          state: "warn",
          detail: "Sign in to verify the upload policy from the browser.",
        });
      } else {
        const path = `${user.id}/__probe_${Date.now()}.txt`;
        const probe = new Blob(["ok"], { type: "text/plain" });
        const up = await supabase.storage
          .from("crop-images")
          .upload(path, probe, { upsert: true });
        if (up.error) {
          set("bucket_write", { state: "fail", detail: up.error.message });
        } else {
          set("bucket_write", {
            state: "pass",
            detail: "Upload to <user-id>/… succeeded.",
          });
          await supabase.storage.from("crop-images").remove([path]);
        }
      }
    }

    setRunning(false);
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const blob = new Blob([SETUP_SQL], { type: "text/plain" });
      window.open(URL.createObjectURL(blob), "_blank");
    }
  };

  const allPass = checks.every((c) => c.state === "pass");
  const anyFail = checks.some((c) => c.state === "fail");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Supabase setup status</h1>
        <p className="mt-1 text-sm text-white/70">
          Verifies that <code className="rounded bg-white/10 px-1">crop_listings</code> and the{" "}
          <code className="rounded bg-white/10 px-1">crop-images</code> storage bucket are
          configured so the Post-a-listing flow can save data.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-agri-ink hover:bg-white/90 disabled:opacity-60"
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {running ? "Running checks…" : "Re-run checks"}
        </button>
        {signedIn === false && (
          <span className="text-xs text-amber-200">
            Not signed in — insert / upload checks are skipped.
          </span>
        )}
      </div>

      <ul className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
        {checks.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-3 rounded-xl bg-black/20 px-3 py-3"
          >
            <StatusIcon state={c.state} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">{c.label}</div>
              {c.detail && (
                <div className="mt-0.5 break-words text-xs text-white/70">{c.detail}</div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {allPass ? (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <div className="font-bold">All checks passed.</div>
            You can post crop listings and upload images — data will save to Supabase.
          </div>
        </div>
      ) : anyFail ? (
        <div className="mt-5 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-base font-bold">Setup needed</div>
                <p className="mt-1 text-sm">
                  Run the SQL below in your Supabase SQL Editor (one-time). If the{" "}
                  <code className="rounded bg-amber-100 px-1">crop-images</code> bucket is
                  missing, create it in Storage first (Private is fine).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-800"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy setup SQL"}
                </button>
                <a
                  href={SQL_EDITOR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                >
                  <ExternalLink className="h-4 w-4" /> Open SQL Editor
                </a>
                <a
                  href={STORAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                >
                  <ExternalLink className="h-4 w-4" /> Open Storage
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusIcon({ state }: { state: CheckState }) {
  if (state === "checking")
    return <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-white/70" />;
  if (state === "pass")
    return <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />;
  if (state === "warn")
    return <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />;
  return <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />;
}
