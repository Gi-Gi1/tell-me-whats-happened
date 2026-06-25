import { useEffect, useState } from "react";
import { AlertTriangle, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import sql002 from "../../../supabase/sql/002_vehicles_chat.sql?raw";
import sql003 from "../../../supabase/sql/003_crop_listings.sql?raw";

const SQL_EDITOR_URL =
  "https://supabase.com/dashboard/project/fwojtiprslciunafwsyy/sql/new";

const SETUP_SQL = `-- Orvia setup — paste ALL of this into Supabase SQL Editor and click Run.\n\n${sql002}\n\n${sql003}\n`;

type Status = "checking" | "ok" | "missing";

export function CropSetupAlert() {
  const [status, setStatus] = useState<Status>("checking");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { error } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("crop_listings" as any)
        .select("*", { head: true, count: "exact" })
        .limit(0);
      if (cancelled) return;
      if (
        error &&
        (error.code === "PGRST205" ||
          error.code === "42P01" ||
          (error.message || "").toLowerCase().includes("could not find the table"))
      ) {
        setStatus("missing");
      } else {
        setStatus("ok");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "missing") return null;

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

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-base font-bold">Database not set up yet</div>
            <p className="mt-1 text-sm">
              The <code className="rounded bg-amber-100 px-1">crop_listings</code>{" "}
              table and storage permissions don't exist in your Supabase project
              yet, so saving will fail with "row-level security policy" or "table
              not found". You only need to do this <strong>once</strong>:
            </p>
          </div>

          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Click <strong>Copy setup SQL</strong> below.</li>
            <li>Click <strong>Open SQL Editor</strong> — it opens in a new tab.</li>
            <li>Paste into the editor and press <strong>Run</strong> (▶).</li>
            <li>Come back here and submit the form again.</li>
          </ol>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50 hover:bg-amber-800"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied to clipboard" : "Copy setup SQL"}
            </button>
            <a
              href={SQL_EDITOR_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              <ExternalLink className="h-4 w-4" />
              Open SQL Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
