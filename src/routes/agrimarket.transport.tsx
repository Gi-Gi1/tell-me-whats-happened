import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Truck, Package, MapPin, Phone, BadgeCheck, Filter, X, Loader2, Plus, CheckCircle2, Inbox } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { listVehicles, requestTransport, createVehicle, type Vehicle } from "@/lib/transport.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/agrimarket/transport")({
  head: () => ({
    meta: [
      { title: "Orvia — သယ်ယူပို့ဆောင်ရေး | Transport & Vehicles" },
      { name: "description", content: "လယ်ယာထွက်ကုန် သယ်ယူပို့ဆောင်ရေး ယာဉ်များ ရှာဖွေ၊ မှာယူပါ။ Find and book trucks, pickups, vans and tractors for agricultural goods across Myanmar." },
      { property: "og:title", content: "Orvia Transport — Vehicles for Agricultural Goods" },
      { property: "og:description", content: "Trucks, pickups, vans and refrigerated transport across Myanmar — book directly from farmers and traders." },
    ],
  }),
  component: TransportPage,
});

const VEHICLE_TYPES = ["all", "truck", "pickup", "van", "tractor", "motorbike"] as const;
type VType = (typeof VEHICLE_TYPES)[number];

const TYPE_LABEL: Record<Exclude<VType, "all">, { en: string; my: string; icon: typeof Truck }> = {
  truck:     { en: "Truck",     my: "ထရပ်ကား",   icon: Truck },
  pickup:    { en: "Pickup",    my: "ပစ်ကပ်",    icon: Truck },
  van:       { en: "Van",       my: "ဗန်ကား",    icon: Package },
  tractor:   { en: "Tractor",   my: "ထွန်စက်",   icon: Truck },
  motorbike: { en: "Motorbike", my: "ဆိုင်ကယ်",  icon: Package },
};

function TransportPage() {
  const { t, lang } = useI18n();
  const { user, primaryRole } = useAuth();
  const list = useServerFn(listVehicles);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VType>("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [booking, setBooking] = useState<Vehicle | null>(null);
  const [posting, setPosting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await list();
      setVehicles(res.vehicles);
      setDemo(res.demo);
    } finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) =>
      (filter === "all" || v.vehicle_type === filter) &&
      (!availableOnly || v.is_available)
    );
  }, [vehicles, filter, availableOnly]);

  const counts: Record<VType, number> = useMemo(() => {
    const base: Record<string, number> = { all: vehicles.length };
    for (const v of vehicles) base[v.vehicle_type] = (base[v.vehicle_type] ?? 0) + 1;
    return base as Record<VType, number>;
  }, [vehicles]);

  const canPostVehicle = user && (primaryRole === "trader" || primaryRole === "agribusiness" || primaryRole === "admin");

  const pick = (v: { en: string; my: string }) => (lang === "en" ? v.en : v.my);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-agri-butter backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-agri-tiger" />
            {t("transportNav", { en: "Transport", my: "သယ်ယူပို့ဆောင်ရေး" })}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white text-shadow-hero sm:text-4xl">
            {t("transportTitle", { en: "Vehicles & Transport", my: "ယာဉ်များနှင့် သယ်ယူပို့ဆောင်ရေး" })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            {t("transportBody", {
              en: "Find trucks, pickups, vans and tractors to move agricultural goods across Myanmar. Book directly with verified owners.",
              my: "ထရပ်ကား၊ ပစ်ကပ်၊ ဗန်နှင့် ထွန်စက်များဖြင့် မြန်မာတစ်နိုင်ငံလုံးတွင် လယ်ယာထွက်ကုန်များ သယ်ယူပါ။ ပိုင်ရှင်နှင့် တိုက်ရိုက် မှာယူပါ။",
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user && (
            <Link
              to="/agrimarket/my-requests"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              <Inbox className="h-4 w-4" />
              {t("myRequests", { en: "My requests", my: "ကျွန်ုပ်၏ မှာယူမှုများ" })}
            </Link>
          )}
          {canPostVehicle && (
            <button
              type="button"
              onClick={() => setPosting(true)}
              className="inline-flex items-center gap-2 rounded-full bg-agri-tiger px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-agri-tiger/90"
            >
              <Plus className="h-4 w-4" />
              {t("postVehicle", { en: "List a vehicle", my: "ယာဉ်တင်ရန်" })}
            </button>
          )}
        </div>
      </header>

      {demo && (
        <div className="mb-6 rounded-2xl border border-agri-butter/30 bg-agri-primary-dark/60 p-3 text-xs text-white/80 backdrop-blur-md">
          {t("transportDemoNote", {
            en: "Showing sample vehicles. Run the Supabase SQL setup (supabase/sql/002_vehicles_chat.sql) to enable live listings.",
            my: "နမူနာ ယာဉ်များ ပြသထားသည်။ Live စာရင်းအတွက် supabase/sql/002_vehicles_chat.sql ကို Supabase တွင် Run ပါ။",
          })}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
          <Filter className="h-3.5 w-3.5" />
          {t("filter", { en: "Filter", my: "စစ်ထုတ်" })}:
        </span>
        {VEHICLE_TYPES.map((vt) => {
          const isActive = filter === vt;
          const meta = vt === "all" ? null : TYPE_LABEL[vt];
          const label = vt === "all"
            ? t("all", { en: "All", my: "အားလုံး" })
            : pick(meta!);
          return (
            <button
              key={vt}
              type="button"
              onClick={() => setFilter(vt)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                isActive
                  ? "bg-agri-butter text-agri-coffee shadow"
                  : "bg-white/10 text-white/80 hover:bg-white/15"
              }`}
            >
              {label}
              <span className={`rounded-full px-1.5 text-[10px] ${isActive ? "bg-agri-coffee/15" : "bg-white/15"}`}>
                {counts[vt] ?? 0}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setAvailableOnly((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
            availableOnly ? "bg-agri-tiger text-white" : "bg-white/10 text-white/80"
          }`}
        >
          <BadgeCheck className="h-3.5 w-3.5" />
          {t("availableOnly", { en: "Available only", my: "ရရှိနိုင်သာ" })}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" /> {t("loading")}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/5 p-10 text-center text-sm text-white/70">
          {t("noVehicles", { en: "No vehicles match these filters.", my: "ရှာဖွေသည့် ယာဉ်မရှိပါ။" })}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => {
            const meta = TYPE_LABEL[v.vehicle_type as Exclude<VType, "all">] ?? TYPE_LABEL.truck;
            const Icon = meta.icon;
            return (
              <article key={v.id} className="agri-glass agri-glass-hover flex flex-col overflow-hidden p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-agri-tiger text-white shadow-md">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-agri-butter">
                        {pick(meta)}
                      </p>
                      <h3 className="font-display text-lg font-extrabold leading-tight text-white">
                        {v.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      v.is_available
                        ? "bg-agri-butter/20 text-agri-butter"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {v.is_available
                      ? t("available", { en: "Available", my: "ရရှိနိုင်" })
                      : t("busy", { en: "Busy", my: "မရရှိ" })}
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5 text-agri-butter" />
                    <span>
                      {t("capacity", { en: "Capacity", my: "ထမ်းနိုင်" })}:{" "}
                      <strong className="text-white">{v.capacity_kg.toLocaleString()} kg</strong>
                    </span>
                  </div>
                  {(v.base_location || v.township || v.region) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-agri-butter" />
                      <span className="truncate">
                        {[v.base_location, v.township, v.region].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {v.price_note && (
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-3.5 w-3.5 text-agri-butter" />
                      <span className="truncate">{v.price_note}</span>
                    </div>
                  )}
                </dl>

                {v.notes && (
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/70">
                    {v.notes}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!v.is_available}
                    onClick={() => setBooking(v)}
                    className="flex-1 rounded-full bg-agri-tiger px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-agri-tiger/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("requestTransport", { en: "Request Transport", my: "သယ်ယူရန် မှာယူ" })}
                  </button>
                  {v.contact_phone && (
                    <a
                      href={`tel:${v.contact_phone}`}
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {t("call", { en: "Call", my: "ဖုန်းခေါ်" })}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {booking && (
        <BookingModal
          vehicle={booking}
          onClose={() => setBooking(null)}
          requireSignIn={!user}
          t={t}
          pick={pick}
        />
      )}
      {posting && (
        <PostVehicleModal onClose={() => setPosting(false)} onDone={refresh} t={t} />
      )}
    </main>
  );
}

function BookingModal({
  vehicle,
  onClose,
  requireSignIn,
  t,
  pick,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  requireSignIn: boolean;
  t: (k: string, fb?: { en: string; my: string }) => string;
  pick: (v: { en: string; my: string }) => string;
}) {
  const requestFn = useServerFn(requestTransport);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    pickup: "",
    dropoff: "",
    cargo: "",
    cargo_kg: 0,
    needed_on: "",
    contact_phone: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pickup.trim() || !form.dropoff.trim()) return;
    setSubmitting(true);
    try {
      await requestFn({
        data: {
          vehicle_id: vehicle.id,
          owner_id: vehicle.owner_id,
          pickup: form.pickup,
          dropoff: form.dropoff,
          cargo: form.cargo,
          cargo_kg: form.cargo_kg,
          needed_on: form.needed_on,
          contact_phone: form.contact_phone,
        },
      });
      setDone(true);
      toast.success(pick({ en: "Transport requested", my: "သယ်ယူရန် တောင်းဆိုပြီး" }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-agri-primary-dark text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-display text-base font-extrabold">
            {pick({ en: "Request transport", my: "သယ်ယူရန် တောင်းဆို" })}
          </p>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </header>

        {requireSignIn ? (
          <div className="p-6 text-center text-sm">
            <p className="mb-3 text-white/85">
              {pick({ en: "Sign in to request transport.", my: "သယ်ယူရန် တောင်းဆိုရန် အကောင့်ဝင်ပါ။" })}
            </p>
            <a href="/auth" className="inline-flex rounded-full bg-agri-tiger px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
              {t("signIn")}
            </a>
          </div>
        ) : done ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-agri-butter" />
            <p className="mt-3 text-sm font-semibold text-white">
              {pick({ en: "Request sent to the vehicle owner.", my: "ယာဉ်ပိုင်ရှင်ထံ တောင်းဆိုပြီးပါပြီ။" })}
            </p>
            <button onClick={onClose} className="mt-5 rounded-full bg-agri-tiger px-5 py-2 text-xs font-bold uppercase tracking-wider text-white">
              {t("close", { en: "Close", my: "ပိတ်ရန်" })}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 p-4">
            <Field label={pick({ en: "Pickup location", my: "ထွက်ခွာရာ" })}>
              <input required value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} className={inputCls} />
            </Field>
            <Field label={pick({ en: "Drop-off location", my: "ပို့ဆောင်ရာ" })}>
              <input required value={form.dropoff} onChange={(e) => setForm({ ...form, dropoff: e.target.value })} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={pick({ en: "Cargo", my: "ကုန်ပစ္စည်း" })}>
                <input value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} className={inputCls} placeholder="Rice" />
              </Field>
              <Field label={pick({ en: "Weight (kg)", my: "ပမာဏ (kg)" })}>
                <input type="number" min={0} value={form.cargo_kg || ""} onChange={(e) => setForm({ ...form, cargo_kg: parseInt(e.target.value) || 0 })} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={pick({ en: "Date needed", my: "လိုအပ်သည့်နေ့" })}>
                <input type="date" value={form.needed_on} onChange={(e) => setForm({ ...form, needed_on: e.target.value })} className={inputCls} />
              </Field>
              <Field label={pick({ en: "Your phone", my: "သင့်ဖုန်း" })}>
                <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputCls} placeholder="+95 9…" />
              </Field>
            </div>
            <button type="submit" disabled={submitting} className="w-full rounded-full bg-agri-tiger px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white shadow disabled:opacity-50">
              {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : pick({ en: "Send request", my: "တောင်းဆိုပို့ရန်" })}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function PostVehicleModal({
  onClose,
  onDone,
  t,
}: {
  onClose: () => void;
  onDone: () => void;
  t: (k: string, fb?: { en: string; my: string }) => string;
}) {
  const createFn = useServerFn(createVehicle);
  const { lang } = useI18n();
  const pick = (v: { en: string; my: string }) => (lang === "en" ? v.en : v.my);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicle_type: "truck" as "truck" | "pickup" | "van" | "tractor" | "motorbike",
    title: "",
    capacity_kg: 1000,
    region: "",
    township: "",
    base_location: "",
    price_note: "",
    contact_phone: "",
    is_available: true,
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFn({ data: form });
      toast.success(pick({ en: "Vehicle listed", my: "ယာဉ်တင်ပြီး" }));
      onDone();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/15 bg-agri-primary-dark text-white shadow-2xl">
        <header className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-agri-primary-dark px-4 py-3">
          <p className="font-display text-base font-extrabold">{pick({ en: "List a vehicle", my: "ယာဉ်တင်ရန်" })}</p>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </header>
        <form onSubmit={submit} className="space-y-3 p-4">
          <Field label={pick({ en: "Type", my: "အမျိုးအစား" })}>
            <select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value as typeof form.vehicle_type })} className={inputCls}>
              {(["truck", "pickup", "van", "tractor", "motorbike"] as const).map((v) => (
                <option key={v} value={v} className="bg-agri-primary-dark">{pick(TYPE_LABEL[v])}</option>
              ))}
            </select>
          </Field>
          <Field label={pick({ en: "Title", my: "ခေါင်းစဉ်" })}>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Hino 6-wheel" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={pick({ en: "Capacity (kg)", my: "ထမ်းနိုင် (kg)" })}>
              <input type="number" min={0} value={form.capacity_kg || ""} onChange={(e) => setForm({ ...form, capacity_kg: parseInt(e.target.value) || 0 })} className={inputCls} />
            </Field>
            <Field label={pick({ en: "Phone", my: "ဖုန်း" })}>
              <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className={inputCls} placeholder="+95 9…" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={pick({ en: "Region", my: "တိုင်း/ပြည်နယ်" })}>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className={inputCls} />
            </Field>
            <Field label={pick({ en: "Township", my: "မြို့နယ်" })}>
              <input value={form.township} onChange={(e) => setForm({ ...form, township: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label={pick({ en: "Price note", my: "ဈေး မှတ်ချက်" })}>
            <input value={form.price_note} onChange={(e) => setForm({ ...form, price_note: e.target.value })} className={inputCls} placeholder="150,000 MMK / trip" />
          </Field>
          <Field label={pick({ en: "Notes", my: "မှတ်ချက်" })}>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-xs text-white/80">
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
            {pick({ en: "Currently available", my: "ယခု ရရှိနိုင်" })}
          </label>
          <button disabled={submitting} className="w-full rounded-full bg-agri-tiger px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider text-white shadow disabled:opacity-50">
            {submitting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : t("save")}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-agri-butter focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/70">{label}</span>
      {children}
    </label>
  );
}
