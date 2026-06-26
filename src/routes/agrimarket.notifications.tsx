import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/useAuth";
import { Bell, RefreshCw, CheckCheck } from "lucide-react";
import { listNotifications, refreshNotifications, markNotificationRead } from "@/lib/data/notifications.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/agrimarket/notifications")({
  head: () => ({
    meta: [
      { title: "Smart Notifications — Orvia" },
      { name: "description", content: "Intelligent alerts based on real Myanmar crop prices, weather and growing-season data." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const fetchList = useServerFn(listNotifications);
  const refresh = useServerFn(refreshNotifications);
  const markRead = useServerFn(markNotificationRead);

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchList(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center">
        <Bell className="mx-auto h-10 w-10 text-white/60" />
        <h1 className="mt-4 text-2xl font-black text-white">Sign in for notifications</h1>
        <p className="mt-2 text-sm text-white/70">Smart alerts about price moves, weather risks, and harvest windows are personalised to your account.</p>
      </main>
    );
  }

  const handleRefresh = async () => {
    try {
      const r = await refresh({});
      toast.success(`Generated ${r.generated} fresh notifications`);
      q.refetch();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleMark = async (id: string) => {
    await markRead({ data: { id } });
    q.refetch();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Smart Notifications</h1>
          <p className="mt-1 text-sm text-white/70">Generated from real price, weather and crop-calendar data.</p>
        </div>
        <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-full bg-agri-tiger px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-agri-tiger/90">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {q.isLoading && <div className="rounded-2xl bg-white/10 p-8 text-center text-white">Loading…</div>}

      <ul className="space-y-3">
        {(q.data ?? []).length === 0 && !q.isLoading && (
          <li className="rounded-2xl border border-dashed border-white/30 bg-white/5 p-10 text-center text-sm text-white/70">
            No notifications yet. Click <strong>Refresh</strong> to generate alerts from current market data.
          </li>
        )}
        {(q.data ?? []).map((n) => (
          <li key={n.id} className={`rounded-2xl border bg-white p-4 shadow-sm ${n.read_at ? "opacity-70" : "border-agri-primary/30"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${categoryColor(n.category)}`}>{n.category}</span>
                  {n.priority === "high" && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Important</span>}
                  <span className="text-[11px] text-agri-ink/55">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-agri-ink sm:text-base">{n.title}</h3>
                <p className="mt-1 text-sm text-agri-ink/75">{n.body}</p>
              </div>
              {!n.read_at && (
                <button onClick={() => handleMark(n.id)} className="shrink-0 rounded-full bg-agri-primary-soft px-3 py-1 text-[11px] font-bold text-agri-primary hover:bg-agri-primary hover:text-white">
                  <CheckCheck className="mr-1 inline h-3 w-3" /> Mark
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

function categoryColor(c: string) {
  switch (c) {
    case "weather":  return "bg-sky-100 text-sky-700";
    case "disease":  return "bg-rose-100 text-rose-700";
    case "price":    return "bg-emerald-100 text-emerald-700";
    case "calendar": return "bg-amber-100 text-amber-700";
    case "gov":      return "bg-indigo-100 text-indigo-700";
    default:         return "bg-agri-primary-soft text-agri-primary";
  }
}
