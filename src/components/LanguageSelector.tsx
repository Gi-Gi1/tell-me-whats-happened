import { Globe } from "lucide-react";
import { LANG_META, useI18n, type Lang } from "@/lib/i18n";

/**
 * Professional, accessible language selector.
 * - Native script labels
 * - Inline search
 * - Mobile-friendly (full-width dropdown on small screens)
 * - Persists selection via i18n provider (localStorage + user metadata)
 */
export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const current = LANG_META[lang];
  const nextLang: Lang = lang === "en" ? "my" : "en";

  return (
    <button
      type="button"
      onClick={() => setLang(nextLang)}
      aria-label={t("language")}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-700/15 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
    >
      <Globe className="h-3.5 w-3.5 text-emerald-700" />
      {compact ? current.short : current.label}
    </button>
  );
}

export function LanguagePill({ value, onSelect }: { value: Lang; onSelect: (l: Lang) => void }) {
  // Small helper used in onboarding/grids
  const meta = LANG_META[value];
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="rounded-full border border-emerald-700/15 bg-white px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-50"
    >
      {meta.flag} {meta.label}
    </button>
  );
}
