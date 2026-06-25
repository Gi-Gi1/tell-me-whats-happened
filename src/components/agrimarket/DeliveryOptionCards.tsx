import { Truck, MapPin, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type DeliveryOption = "delivery" | "pickup";

const OPTIONS: { id: DeliveryOption; icon: typeof Truck; title: string; desc: string }[] = [
  {
    id: "delivery",
    icon: Truck,
    title: "deliveryAvailable",
    desc: "deliveryAvailableDesc",
  },
  {
    id: "pickup",
    icon: MapPin,
    title: "pickupOnly",
    desc: "pickupOnlyDesc",
  },
];

export function DeliveryOptionCards({
  value,
  onChange,
}: {
  value: DeliveryOption | null;
  onChange: (next: DeliveryOption | null) => void;
}) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            key={opt.id}
            onClick={() => onChange(selected ? null : opt.id)}
            className={[
              "group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
              selected
                ? "border-agri-primary bg-agri-primary-soft/50 shadow-sm"
                : "border-agri-border bg-white hover:border-agri-primary/40 hover:bg-agri-primary-soft/20",
            ].join(" ")}
          >
            <div
              className={[
                "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors",
                selected
                  ? "bg-agri-primary text-white"
                  : "bg-agri-primary-soft text-agri-primary",
              ].join(" ")}
            >
              <opt.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-agri-ink">{t(opt.title)}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-agri-ink/70">{t(opt.desc)}</p>
            </div>
            <span
              aria-hidden
              className={[
                "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-all",
                selected
                  ? "border-agri-primary bg-agri-primary text-white"
                  : "border-agri-border bg-white",
              ].join(" ")}
            >
              {selected && <Check className="h-3 w-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
