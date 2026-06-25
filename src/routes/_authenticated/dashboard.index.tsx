import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { routeForRole, type AppRole, APP_ROLES } from "@/lib/auth/roles";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });

    let role: AppRole | null = null;
    try {
      const { data } = await supabase
        .from("user_roles" as never)
        .select("role,is_primary")
        .eq("user_id", u.user.id);
      const rows = (data ?? []) as Array<{ role: AppRole; is_primary: boolean }>;
      role = rows.find((r) => r.is_primary)?.role ?? rows[0]?.role ?? null;
    } catch {
      role = null;
    }
    if (!role) {
      const meta = (u.user.user_metadata?.role ?? "") as string;
      if ((APP_ROLES as readonly string[]).includes(meta)) role = meta as AppRole;
    }
    throw redirect({ to: routeForRole(role ?? "farmer") });
  },
  component: () => null,
});
