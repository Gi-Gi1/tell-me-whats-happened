import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Stethoscope,
  Upload,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  analyzeCropImage,
  type CropDiagnosis,
} from "@/lib/agrimarket/cropDoctor.functions";
import { useI18n } from "@/lib/i18n";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

const SEVERITY_LABEL_KEY: Record<CropDiagnosis["severity"], string> = {
  none: "normal",
  low: "low",
  medium: "medium",
  high: "high",
};

const SEVERITY_STYLE: Record<CropDiagnosis["severity"], string> = {
  none: "bg-emerald-100 text-emerald-700",
  low: "bg-amber-100 text-amber-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

function fileToBase64(file: File): Promise<{ base64: string; mime: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      resolve({ base64: result.slice(comma + 1), mime: file.type });
    };
    reader.onerror = () => reject(new Error("fileReadFailed"));
    reader.readAsDataURL(file);
  });
}

export function CropDoctor() {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<CropDiagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const analyzeFn = useServerFn(analyzeCropImage);

  const setSelected = useCallback((f: File) => {
    if (!ACCEPT.includes(f.type)) {
      toast.error(t("invalidImageType"));
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error(t("imageTooLarge"));
      return;
    }
    setFile(f);
    setDiagnosis(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }, [preview, t]);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setDiagnosis(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setDiagnosis(null);
    try {
      const { base64, mime } = await fileToBase64(file);
      const result = await analyzeFn({ data: { imageBase64: base64, mimeType: mime } });
      setDiagnosis(result);
      toast.success(t("aiAnalysisComplete"));
    } catch (err) {
      const msg = err instanceof Error && err.message === "fileReadFailed" ? t("fileReadFailed") : t("aiAnalysisFailed");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-agri-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-agri-primary text-white shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-agri-ink sm:text-2xl">
              🌿 {t("doctorTitle")}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-agri-ink/65 sm:text-sm">
              {t("doctorSubtitle")}
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-agri-border bg-white p-5 shadow-sm sm:p-7">
        {!preview ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) setSelected(f);
            }}
            className={[
              "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-12 text-center transition-colors",
              dragOver
                ? "border-agri-primary bg-agri-primary-soft/50"
                : "border-agri-border bg-agri-surface hover:border-agri-primary/50 hover:bg-agri-primary-soft/20",
            ].join(" ")}
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-agri-primary-soft text-agri-primary">
              <Upload className="h-7 w-7" />
            </div>
            <p className="text-sm font-semibold text-white sm:text-base">
              {t("doctorDrop")}
            </p>
            <p className="text-xs leading-relaxed text-white/70">
              {t("doctorHelp")}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT.join(",")}
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setSelected(f);
              }}
            />
          </button>
        ) : (
          <div className="grid gap-5 md:grid-cols-[1.1fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl border border-agri-border bg-agri-surface">
              <img src={preview} alt={t("selectedCropImage")} className="h-full max-h-[420px] w-full object-cover" />
              <button
                type="button"
                onClick={reset}
                aria-label={t("removeSelectedImage")}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-agri-ink shadow-sm hover:bg-destructive hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="space-y-2 rounded-2xl bg-agri-primary-soft/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-agri-ink">
                  <Sparkles className="h-4 w-4 text-agri-primary" />
                  {t("doctorChecksTitle")}
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-agri-ink/75">
                  <li>• {t("doctorCheckDisease")}</li>
                  <li>• {t("doctorCheckSeverity")}</li>
                  <li>• {t("doctorCheckCauses")}</li>
                  <li>• {t("doctorCheckTreatment")}</li>
                  <li>• {t("doctorCheckPrevention")}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={analyze}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-agri-primary px-5 py-3 text-sm font-semibold text-white shadow-md shadow-agri-primary/20 transition-all hover:bg-agri-primary-dark active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4" />
                    {t("analyzeWithAi")}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="rounded-3xl border border-agri-border bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-agri-primary" />
          <p className="mt-3 text-sm font-semibold text-agri-ink">
            {t("analyzingImage")}
          </p>
          <p className="mt-1 text-xs text-agri-ink/60">
            {t("waitSeconds")}
          </p>
        </div>
      )}

      {diagnosis && <DiagnosisCard d={diagnosis} />}
    </div>
  );
}

function DiagnosisCard({ d }: { d: CropDiagnosis }) {
  const { t } = useI18n();
  return (
    <article className="space-y-5 rounded-3xl border border-agri-border bg-white p-6 shadow-sm sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              "grid h-12 w-12 place-items-center rounded-2xl",
              d.is_healthy ? "bg-emerald-500 text-white" : "bg-agri-primary text-white",
            ].join(" ")}
          >
            {d.is_healthy ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-agri-ink/60">
              {t("diagnosisResult")}
            </p>
            <h2 className="text-lg font-bold text-agri-ink sm:text-xl">
              {d.is_healthy ? t("cropHealthy") : d.disease_name_my}
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${SEVERITY_STYLE[d.severity]}`}>
            {t("severity")} — {t(SEVERITY_LABEL_KEY[d.severity])}
          </span>
          <span className="rounded-full bg-agri-primary-soft px-3 py-1 text-xs font-semibold text-agri-primary">
            {t("confidence")} — {d.confidence}%
          </span>
        </div>
      </header>

      <p className="rounded-2xl bg-agri-primary-soft/50 p-4 text-sm leading-relaxed text-agri-ink/85">
        {d.summary_my}
      </p>


      <Section icon={AlertTriangle} title={t("likelyCauses")} items={d.causes_my} tone="warn" />
      <Section icon={ShieldCheck} title={t("recommendedTreatments")} items={d.treatments_my} tone="primary" />
      <Section icon={Leaf} title={t("organicAlternatives")} items={d.organic_alternatives_my} tone="green" />
      <Section icon={CheckCircle2} title={t("preventionMethods")} items={d.prevention_my} tone="muted" />

      <div className="flex items-start gap-3 rounded-2xl border-2 border-agri-primary/30 bg-gradient-to-br from-agri-primary-soft/70 to-white p-4 shadow-sm">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-agri-primary text-white">
          <Leaf className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-agri-primary">
            {t("recoveryTime")}
          </p>
          <p className="mt-0.5 text-base font-bold text-agri-ink sm:text-lg">
            {d.recovery_time_my || "—"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-agri-ink/65">
            {t("severity")}: {t(SEVERITY_LABEL_KEY[d.severity])}
          </p>
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-agri-ink/55">
        ⚠ {t("aiDisclaimer")}
      </p>
    </article>
  );
}

const TONE: Record<string, string> = {
  warn: "bg-amber-50 text-amber-900 border-amber-200",
  primary: "bg-agri-primary-soft/40 text-agri-ink border-agri-primary/20",
  green: "bg-emerald-50 text-emerald-900 border-emerald-200",
  muted: "bg-agri-surface text-agri-ink border-agri-border",
};

function Section({
  icon: Icon,
  title,
  items,
  tone,
}: {
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
  tone: keyof typeof TONE;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className={`rounded-2xl border p-4 ${TONE[tone]}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
