import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Truck, MapPin, Phone, Calendar, Package, ArrowLeft, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { myTransportRequests, type TransportRequestRow } from "@/lib/transport.functions";

export const Route = createFileRoute("/agrimarket/my-requests")({
  head: () => ({
    meta: [
      { title: "Orvia — My Transport Requests" },
      { name: "description", content: "Review the transport requests you've submitted and those addressed to your vehicles." },
      { property: "og:title", content: "My Transport Requests — Orvia" },
      { property: "og:description", content: "Track the status of your transport bookings on Orvia." },
    ],
  }),
  component: MyRequestsPage,
});

function fmtDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function statusBadge(status: string) {
  const s = status?.toLowerCase() ?? "pending";
  const map: Record<string, string> = {
    pending: "bg-agri-butter/20 text-agri-butter border-agri-butter/30",
    accepted: "bg-agri-primary-soft/30 text-agri-primary-soft border-agri-primary-soft/40",
    completed: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    cancelled: "bg-agri-cherry/20 text-agri-cherry border-agri-cherry/30",
    rejected: "bg-agri-cherry/20 text-agri-cherry border-agri-cherry/30",
  };
  return map[s] ?? "bg-white/10 text-white/80 border-white/20";
}

function MyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const fetchMine = useServerFn(myTransportRequests);
  const [rows, setRows] = useState<TransportRequestRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancel = false;
    setLoading(true);
    setErr(null);
    fetchMine()
      .then((data) => { if (!cancel) setRows(data); })
      .catch((e) => { if (!cancel) setErr(e instanceof Error ? e.message : "Failed to load"); })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [user, fetchMine]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white/80">
        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Inbox className="mx-auto h-10 w-10 text-agri-butter" />
        <h1 className="mt-4 font-display text-2xl font-bold text-white">My Transport Requests</h1>
        <p className="mt-2 text-white/70">Sign in to view the transport requests you've submitted.</p>
        <Link to="/auth" className="agri-btn-tiger mt-6 inline-flex">Sign in</Link>
      </div>
    );
  }

  const sent = rows.filter((r) => r.requester_id === user.id);
  const received = rows.filter((r) => r.owner_id === user.id && r.requester_id !== user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link to="/agrimarket/transport" className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to transport
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">My Transport Requests</h1>
          <p className="text-sm text-white/70">Requests you've sent and bookings for your vehicles.</p>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-lg border border-agri-cherry/40 bg-agri-cherry/15 p-3 text-sm text-agri-cherry">
          {err}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-white/70">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          <Section title="Requests you sent" rows={sent} kind="sent" />
          {received.length > 0 && <Section title="Requests for your vehicles" rows={received} kind="received" />}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur">
      <Inbox className="mx-auto h-10 w-10 text-white/40" />
      <p className="mt-3 text-white/80">You haven't requested transport yet.</p>
      <Link to="/agrimarket/transport" className="agri-btn-tiger mt-5 inline-flex">Browse vehicles</Link>
    </div>
  );
}

function Section({ title, rows, kind }: { title: string; rows: TransportRequestRow[]; kind: "sent" | "received" }) {
  if (rows.length === 0) {
    return (
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-white">{title}</h2>
        <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">None yet.</p>
      </section>
    );
  }
  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-semibold text-white">
        {title} <span className="text-sm font-normal text-white/50">({rows.length})</span>
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-colors hover:bg-white/[0.08]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-agri-tiger/20 text-agri-tiger">
                  <Truck className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">
                    {r.vehicles?.title ?? "Vehicle"}
                  </p>
                  {r.vehicles?.vehicle_type && (
                    <p className="text-[11px] uppercase tracking-wide text-white/50">{r.vehicles.vehicle_type}</p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge(r.status)}`}>
                {r.status || "pending"}
              </span>
            </div>

            <dl className="mt-3 space-y-1.5 text-sm text-white/85">
              <Row icon={MapPin} label="Pickup" value={r.pickup} />
              <Row icon={MapPin} label="Dropoff" value={r.dropoff} />
              {r.cargo && <Row icon={Package} label="Cargo" value={`${r.cargo}${r.cargo_kg ? ` · ${r.cargo_kg} kg` : ""}`} />}
              {r.needed_on && <Row icon={Calendar} label="Needed" value={fmtDate(r.needed_on)} />}
              {r.contact_phone && <Row icon={Phone} label="Contact" value={r.contact_phone} />}
            </dl>

            <p className="mt-3 text-[11px] text-white/45">
              {kind === "sent" ? "Sent" : "Received"} · {fmtDate(r.created_at)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/50" />
      <span className="text-white/55">{label}:</span>
      <span className="flex-1 break-words text-white">{value}</span>
    </div>
  );
}
