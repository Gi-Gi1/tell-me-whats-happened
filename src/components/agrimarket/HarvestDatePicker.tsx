import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function HarvestDatePicker({
  value,
  onChange,
}: {
  value: Date | null;
  onChange: (next: Date | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl border border-agri-border bg-white px-4 py-2.5 text-left text-sm transition-colors hover:border-agri-primary/50 focus:border-agri-primary focus:outline-none focus:ring-2 focus:ring-agri-primary/30",
            !value && "text-agri-ink/50",
          )}
        >
          <span className="truncate">
            {value ? format(value, "PPP") : t("selectHarvestDate")}
          </span>
          <CalendarIcon className="h-4 w-4 text-agri-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(d) => {
            onChange(d ?? null);
            setOpen(false);
          }}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
