import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { APP_ROLES, type AppRole } from "@/lib/auth/roles";

export type SignUpExtras = {
  phone?: string;
  region?: string;
  township?: string;
  preferredLanguage?: string;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  primaryRole: AppRole | null;
  loading: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (args: { email: string; password: string; displayName: string; role: AppRole } & SignUpExtras) => Promise<{ error?: string; role?: AppRole; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  refreshRole: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

function metadataRole(u: User | null): AppRole | null {
  const r = (u?.user_metadata?.role ?? "") as string;
  return (APP_ROLES as readonly string[]).includes(r) ? (r as AppRole) : null;
}

async function fetchPrimaryRole(user: User): Promise<AppRole | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles" as never)
      .select("role,is_primary,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (!error && data && data.length) {
      const rows = data as Array<{ role: AppRole; is_primary: boolean }>;
      const primary = rows.find((r) => r.is_primary) ?? rows[0];
      if (primary?.role) return primary.role;
    }
  } catch { /* table may not exist yet */ }
  // Fallback to signup metadata so the app keeps working before the
  // user_roles table migration has been applied.
  return metadataRole(user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [primaryRole, setPrimaryRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const loadRole = useCallback(async (u: User | null) => {
    if (!u) { setPrimaryRole(null); return; }
    setPrimaryRole(await fetchPrimaryRole(u));
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      loadRole(data.session?.user ?? null).finally(() => setLoading(false));
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        if (sess) { setSession(sess); setUser(sess.user); }
        return;
      }
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (event === "SIGNED_OUT") {
        setPrimaryRole(null);
        qc.clear();
      } else {
        loadRole(sess?.user ?? null);
        qc.invalidateQueries();
      }
    });

    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [loadRole, qc]);

  const signIn: AuthCtx["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp: AuthCtx["signUp"] = async ({ email, password, displayName, role, phone, region, township, preferredLanguage }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { display_name: displayName, role, phone, region, township, preferred_language: preferredLanguage },
      },
    });
    if (error) {
      const msg = error.message || "";
      const code = (error as { code?: string }).code || "";
      if (code === "over_email_send_rate_limit" || /rate limit/i.test(msg)) {
        return {
          error:
            "Too many signup attempts in a short time. Supabase limits confirmation emails to a few per hour. Please wait ~60 minutes and try again, or ask the project owner to disable email confirmation in the Supabase dashboard (Auth → Providers → Email → uncheck 'Confirm email').",
        };
      }
      if (/already registered|already exists/i.test(msg)) {
        return { error: "This email is already registered. Please sign in instead." };
      }
      return { error: msg };
    }
    if (!data.session) {
      return { role, needsConfirmation: true };
    }
    // Seed primaryRole immediately from the chosen role so redirects work
    // even before the DB trigger row is visible to the client.
    setPrimaryRole(role);
    return { role };
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    setPrimaryRole(null);
  };

  const resetPassword: AuthCtx["resetPassword"] = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    });
    return error ? { error: error.message } : {};
  };

  const updatePassword: AuthCtx["updatePassword"] = async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  };

  const refreshRole = async () => { await loadRole(user); };

  return (
    <Ctx.Provider value={{ session, user, primaryRole, loading, isLoading: loading, signIn, signUp, signOut, resetPassword, updatePassword, refreshRole }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
}
