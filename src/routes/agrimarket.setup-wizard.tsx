import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  AlertTriangle,
  Database,
  PlayCircle,
  Download,

} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sql002 from "../../supabase/sql/002_vehicles_chat.sql?raw";
import sql003 from "../../supabase/sql/003_crop_listings.sql?raw";

export const Route = createFileRoute("/agrimarket/setup-wizard")({
  component: SetupWizard,
});

const SQL_EDITOR_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new";
const STORAGE_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/storage/buckets";

const SETUP_SQL = `-- Orvia setup — paste ALL of this into Supabase SQL Editor and click Run.\n\n${sql002}\n\n${sql003}\n`;

type CheckState = "checking" | "pass" | "fail" | "warn";
type Check = { id: string; label: string; state: CheckState; detail: string };

const initialChecks: Check[] = [
  { id: "table", label: "Table public.crop_listings exists", state: "checking", detail: "" },
  { id: "select_rls", label: "Anonymous SELECT policy on crop_listings", state: "checking", detail: "" },
  { id: "bucket", label: "Storage bucket crop-images exists", state: "checking", detail: "" },
  { id: "bucket_read", label: "Storage read policy on crop-images", state: "checking", detail: "" },
];

function SetupWizard() {
  const [step, setStep] = useState(0);
  const steps = ["Welcome", "Copy SQL", "Run in Supabase", "Verify", "Done"];
  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-white">
          <Database className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Database setup wizard</h1>
        </div>
        <p className="mt-1 text-sm text-white/70">
          One-time setup. Follow the 4 steps and your app will be able to save crop
          listings, vehicles, and transport requests.
        </p>
      </header>

      <Stepper steps={steps} current={step} />

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur">
        {step === 0 && <StepWelcome onNext={goNext} />}
        {step === 1 && <StepCopy onNext={goNext} onBack={goBack} />}
        {step === 2 && <StepRun onNext={goNext} onBack={goBack} />}
        {step === 3 && <StepVerify onNext={goNext} onBack={goBack} />}
        {step === 4 && <StepDone />}
      </div>
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className={
              "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold " +
              (active
                ? "bg-white text-agri-ink"
                : done
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-white/10 text-white/60")
            }
          >
            <span
              className={
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] " +
                (active
                  ? "bg-agri-ink text-white"
                  : done
                  ? "bg-emerald-500 text-white"
                  : "bg-white/20 text-white/70")
              }
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Step 0: Welcome ---------- */

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">What this does</h2>
      <p className="text-sm text-white/80">
        Your Supabase project doesn't have the tables this app needs yet. This wizard
        will:
      </p>
      <ul className="space-y-2 text-sm text-white/80">
        <Bullet>Give you the exact SQL to paste</Bullet>
        <Bullet>Open the Supabase SQL Editor for you</Bullet>
        <Bullet>Automatically verify everything was created correctly</Bullet>
      </ul>
      <p className="text-xs text-white/60">
        Takes ~30 seconds. No coding, no credits required.
      </p>
      <Footer>
        <PrimaryBtn onClick={onNext}>
          Start <ArrowRight className="h-4 w-4" />
        </PrimaryBtn>
      </Footer>
    </div>
  );
}

/* ---------- Step 1: Copy SQL ---------- */

function StepCopy({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
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
  const download = () => {
    const blob = new Blob([SETUP_SQL], { type: "text/sql;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orvia-setup.sql";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 1 — Copy or download the setup SQL</h2>
      <p className="text-sm text-white/80">
        Copy to clipboard, or download as a single <code>orvia-setup.sql</code> file
        you can open and run locally.
      </p>
      <div className="flex flex-wrap gap-2">
        <PrimaryBtn onClick={copy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied to clipboard" : "Copy setup SQL"}
        </PrimaryBtn>
        <SecondaryBtn onClick={download}>
          <Download className="h-4 w-4" /> Download .sql file
        </SecondaryBtn>
      </div>

      <details className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
        <summary className="cursor-pointer font-semibold text-white/80">
          Preview the SQL ({SETUP_SQL.length.toLocaleString()} chars)
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] text-white/70">
          {SETUP_SQL}
        </pre>
      </details>
      <Footer>
        <SecondaryBtn onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </SecondaryBtn>
        <PrimaryBtn onClick={onNext} disabled={!copied}>
          Next <ArrowRight className="h-4 w-4" />
        </PrimaryBtn>
      </Footer>
      {!copied && (
        <p className="text-xs text-white/50">Copy the SQL first, then continue.</p>
      )}
    </div>
  );
}

/* ---------- Step 2: Run in Supabase ---------- */

function StepRun({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [opened, setOpened] = useState(false);
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Step 2 — Run it in Supabase</h2>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-white/80">
        <li>Click <strong>Open SQL Editor</strong> — opens in a new tab.</li>
        <li>Paste (⌘V / Ctrl+V) into the editor.</li>
        <li>
          Click the green <strong>Run</strong> button (▶) — bottom-right of the
          editor.
        </li>
        <li>You should see <em>"Success. No rows returned"</em>.</li>
      </ol>
      <a
        href={SQL_EDITOR_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => setOpened(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-agri-ink hover:bg-white/90"
      >
        <ExternalLink className="h-4 w-4" />
        Open SQL Editor
      </a>
      <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-100">
        <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
        If you don't see the <code>crop-images</code> bucket later, also create it in{" "}
        <a
          href={STORAGE_URL}
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Storage
        </a>{" "}
        (Private is fine).
      </div>
      <Footer>
        <SecondaryBtn onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </SecondaryBtn>
        <PrimaryBtn onClick={onNext} disabled={!opened}>
          I've run the SQL <ArrowRight className="h-4 w-4" />
        </PrimaryBtn>
      </Footer>
    </div>
  );
}

/* ---------- Step 3: Verify (auto-polling) ---------- */

function StepVerify({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [checks, setChecks] = useState<Check[]>(initialChecks);
  const [polling, setPolling] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runChecks = useCallback(async () => {
    const next: Check[] = initialChecks.map((c) => ({ ...c, state: "checking" }));
    setChecks(next);

    // Table + select
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
      next[0] = { ...next[0], state: "fail", detail: "Table not found yet." };
      next[1] = { ...next[1], state: "fail", detail: "Skipped — table missing." };
    } else if (tableRes.error) {
      next[0] = { ...next[0], state: "warn", detail: tableRes.error.message };
      next[1] = { ...next[1], state: "warn", detail: tableRes.error.message };
    } else {
      next[0] = { ...next[0], state: "pass", detail: "Reachable via PostgREST." };
      next[1] = { ...next[1], state: "pass", detail: "Public SELECT allowed." };
    }

    // Bucket + read
    const bucketRes = await supabase.storage.getBucket("crop-images");
    if (bucketRes.error || !bucketRes.data) {
      next[2] = {
        ...next[2],
        state: "fail",
        detail: bucketRes.error?.message ?? "Bucket not found.",
      };
      next[3] = { ...next[3], state: "fail", detail: "Skipped — bucket missing." };
    } else {
      next[2] = {
        ...next[2],
        state: "pass",
        detail: `Found (${bucketRes.data.public ? "public" : "private"}).`,
      };
      const list = await supabase.storage.from("crop-images").list("", { limit: 1 });
      if (list.error) {
        next[3] = { ...next[3], state: "fail", detail: list.error.message };
      } else {
        next[3] = { ...next[3], state: "pass", detail: "Listing succeeded." };
      }
    }

    setChecks(next);
    setAttempts((n) => n + 1);
    return next.every((c) => c.state === "pass");
  }, []);

  // Auto-poll every 3s while not all green
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      const ok = await runChecks();
      if (cancelled) return;
      if (ok) {
        setPolling(false);
        return;
      }
      if (polling) {
        timer.current = setTimeout(tick, 3000);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polling]);

  const allPass = checks.every((c) => c.state === "pass");
  const anyFail = checks.some((c) => c.state === "fail");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Step 3 — Verifying…</h2>
        {polling && !allPass && (
          <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Auto-checking every 3s (attempt {attempts})
          </span>
        )}
      </div>

      <ul className="space-y-2">
        {checks.map((c) => (
          <li
            key={c.id}
            className="flex items-start gap-3 rounded-xl bg-black/20 px-3 py-3"
          >
            <StatusIcon state={c.state} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{c.label}</div>
              {c.detail && (
                <div className="mt-0.5 break-words text-xs text-white/60">
                  {c.detail}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {anyFail && !polling && (
        <div className="rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-xs text-amber-100">
          Some checks failed. Open the SQL Editor again, make sure you pasted the full
          SQL, and click <strong>Re-check now</strong>.
        </div>
      )}

      <Footer>
        <SecondaryBtn onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </SecondaryBtn>
        <SecondaryBtn
          onClick={() => {
            setPolling(true);
          }}
        >
          <PlayCircle className="h-4 w-4" /> Re-check now
        </SecondaryBtn>
        <PrimaryBtn onClick={onNext} disabled={!allPass}>
          Finish <ArrowRight className="h-4 w-4" />
        </PrimaryBtn>
      </Footer>
    </div>
  );
}

/* ---------- Step 4: Done ---------- */

function StepDone() {
  return (
    <div className="space-y-5 text-center">
      <PartyPopper className="mx-auto h-12 w-12 text-emerald-400" />
      <h2 className="text-2xl font-bold">You're all set!</h2>
      <p className="text-sm text-white/80">
        The database is ready. You can now post crop listings, list vehicles, and
        book transport — every submit will save to Supabase.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Link
          to="/agrimarket/post"
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-agri-ink hover:bg-white/90"
        >
          Post a crop listing <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/agrimarket"
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
        >
          Back to marketplace
        </Link>
      </div>
    </div>
  );
}

/* ---------- shared bits ---------- */

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      <span>{children}</span>
    </li>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-2 pt-2">{children}</div>;
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function SecondaryBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
    >
      {children}
    </button>
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
