import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function publicClient(): any {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type Disease = {
  id: string;
  crop_id: string;
  name_en: string;
  name_my: string;
  severity: "low" | "medium" | "high";
  symptoms: string;
  causes: string;
  prevention: string;
  treatment: string;
  source: string;
};

export const listDiseases = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("crop_diseases")
    .select("*")
    .order("crop_id")
    .order("name_en");
  if (error) throw new Error(error.message);
  return (data ?? []) as Disease[];
});
