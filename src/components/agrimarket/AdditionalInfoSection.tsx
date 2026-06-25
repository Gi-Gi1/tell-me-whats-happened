import { useState, type ReactNode } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useI18n } from "@/lib/i18n";

export function AdditionalInfoSection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="overflow-hidden rounded-2xl border border-agri-border bg-agri-surface/50">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-agri-primary-soft/30"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-agri-primary-soft text-agri-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {t("additionalInfo")}
                </span>
                <span className="block truncate text-xs text-white/70">
                  {t("additionalInfoDesc")}
                </span>

              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-xs font-semibold text-agri-primary">
              {open ? t("hide") : t("addMore")}
              <ChevronDown
                className={["h-4 w-4 transition-transform", open ? "rotate-180" : ""].join(" ")}
              />
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-6 border-t border-agri-border bg-white px-5 py-6">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
