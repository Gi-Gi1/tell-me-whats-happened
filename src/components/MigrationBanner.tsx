import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sql002 from "../../supabase/sql/002_vehicles_chat.sql?raw";
import sql003 from "../../supabase/sql/003_crop_listings.sql?raw";

const REQUIRED_TABLES = ["vehicles", "transport_requests", "crop_listings"] as const;
const SQL_EDITOR_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new";

const SETUP_SQL = `-- Orvia setup — run once in the Supabase SQL Editor.\n\n${sql002}\n\n${sql003}\n`;

async function tableMissing(name: string): Promise<boolean> {
  const { error } = await supabase
    .from(name as never)
    .select("*", { head: true, count: "exact" })
    .limit(0);
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    msg.includes("could not find the table") ||
    msg.includes("does not exist")
  );
}

export function MigrationBanner() {
  const [missing, setMissing] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.all(
        REQUIRED_TABLES.map(async (t) =>
          (await tableMissing(t)) ? (t as string) : null,
        ),
      );
      if (cancelled) return;
      setMissing(results.filter((x): x is string => x !== null));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (dismissed || missing.length === 0) return null;

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: open the raw SQL in a new tab
      const blob = new Blob([SETUP_SQL], { type: "text/plain" });
      window.open(URL.createObjectURL(blob), "_blank");
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[100] border-b border-amber-300 bg-amber-50 text-amber-900 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold">Database setup required</div>
          <div className="mt-0.5">
            Missing table{missing.length > 1 ? "s" : ""}:{" "}
            <code className="rounded bg-amber-100 px-1">{missing.join(", ")}</code>
            . Copy the setup SQL and paste it into the Supabase SQL Editor, then
            click Run.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={copySql}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-900 px-3 py-1.5 text-xs font-medium text-amber-50 hover:bg-amber-800"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy setup SQL"}
            </button>
            <a
              href={SQL_EDITOR_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100"
            >
              Open SQL Editor
            </a>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 hover:bg-amber-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
