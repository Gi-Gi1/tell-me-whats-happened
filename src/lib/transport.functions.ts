import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const VehicleInput = z.object({
  vehicle_type: z.enum(["truck", "pickup", "van", "tractor", "motorbike"]),
  title: z.string().min(1).max(120),
  capacity_kg: z.number().int().nonnegative().default(0),
  region: z.string().optional().default(""),
  township: z.string().optional().default(""),
  base_location: z.string().optional().default(""),
  price_note: z.string().optional().default(""),
  contact_phone: z.string().optional().default(""),
  is_available: z.boolean().default(true),
  notes: z.string().optional().default(""),
});

export type Vehicle = {
  id: string;
  owner_id: string;
  vehicle_type: string;
  title: string;
  capacity_kg: number;
  region: string | null;
  township: string | null;
  base_location: string | null;
  price_note: string | null;
  contact_phone: string | null;
  is_available: boolean;
  notes: string | null;
  created_at: string;
};

const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "demo-1",
    owner_id: "demo",
    vehicle_type: "truck",
    title: "Hino 6-wheel truck",
    capacity_kg: 5000,
    region: "Mandalay",
    township: "Mandalay",
    base_location: "Mandalay Market",
    price_note: "150,000 MMK / trip (city)",
    contact_phone: "+95 9 770 000 111",
    is_available: true,
    notes: "Long-distance bulk rice / pulses transport.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    owner_id: "demo",
    vehicle_type: "pickup",
    title: "Toyota Hilux pickup",
    capacity_kg: 1000,
    region: "Yangon",
    township: "Hlegu",
    base_location: "Hlegu Township",
    price_note: "40,000 MMK / trip",
    contact_phone: "+95 9 421 222 333",
    is_available: true,
    notes: "Vegetables & fruits, cool-night delivery available.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    owner_id: "demo",
    vehicle_type: "van",
    title: "Refrigerated cargo van",
    capacity_kg: 1500,
    region: "Yangon",
    township: "North Dagon",
    base_location: "Yangon",
    price_note: "Quote on request",
    contact_phone: "+95 9 555 444 333",
    is_available: true,
    notes: "Cold-chain — onions, eggs, fresh produce.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    owner_id: "demo",
    vehicle_type: "tractor",
    title: "Kubota tractor + trailer",
    capacity_kg: 2000,
    region: "Sagaing",
    township: "Monywa",
    base_location: "Monywa",
    price_note: "30,000 MMK / day",
    contact_phone: "+95 9 250 111 222",
    is_available: false,
    notes: "Farm-to-village hauling. Currently on contract.",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    owner_id: "demo",
    vehicle_type: "motorbike",
    title: "Motorbike + cart (50 kg)",
    capacity_kg: 50,
    region: "Mandalay",
    township: "Pyin Oo Lwin",
    base_location: "Pyin Oo Lwin",
    price_note: "5,000 MMK / drop",
    contact_phone: "+95 9 333 222 111",
    is_available: true,
    notes: "Last-mile delivery in hilly areas.",
    created_at: new Date().toISOString(),
  },
];

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

// PUBLIC list — no auth required
export const listVehicles = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ vehicles: Vehicle[]; demo: boolean }> => {
    const supa = publicClient();
    if (!supa) return { vehicles: DEMO_VEHICLES, demo: true };
    const { data, error } = await supa
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data || data.length === 0) {
      return { vehicles: DEMO_VEHICLES, demo: true };
    }
    return { vehicles: data as Vehicle[], demo: false };
  },
);

export const createVehicle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => VehicleInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await (supabase as never as {
      from: (t: string) => {
        insert: (v: unknown) => { select: (s: string) => { single: () => Promise<{ data: Vehicle | null; error: { message: string } | null }> } };
      };
    })
      .from("vehicles")
      .insert({ ...data, owner_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as Vehicle;
  });

export const myVehicles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await (supabase as never as {
      from: (t: string) => {
        select: (s: string) => { eq: (c: string, v: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: Vehicle[] | null; error: unknown }> } };
      };
    })
      .from("vehicles")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) return [] as Vehicle[];
    return (data ?? []) as Vehicle[];
  });


const RequestInput = z.object({
  vehicle_id: z.string().min(1),
  owner_id: z.string().min(1),
  pickup: z.string().min(1),
  dropoff: z.string().min(1),
  cargo: z.string().optional().default(""),
  cargo_kg: z.number().int().nonnegative().default(0),
  needed_on: z.string().optional().default(""),
  contact_phone: z.string().optional().default(""),
});

export const requestTransport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RequestInput.parse(d))
  .handler(async ({ data, context }): Promise<{ ok: true; id: string }> => {
    const { supabase, userId } = context;
    const payload = {
      vehicle_id: data.vehicle_id,
      owner_id: data.owner_id,
      requester_id: userId,
      pickup: data.pickup,
      dropoff: data.dropoff,
      cargo: data.cargo,
      cargo_kg: data.cargo_kg,
      needed_on: data.needed_on || null,
      contact_phone: data.contact_phone,
    };
    const sb = supabase as never as {
      from: (t: string) => {
        insert: (v: unknown) => { select: (s: string) => { single: () => Promise<{ data: { id: string } | null; error: { message: string } | null }> } };
      };
    };
    const { data: row, error } = await sb
      .from("transport_requests")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row?.id ?? "" };
  });


export type TransportRequestRow = {
  id: string;
  vehicle_id: string;
  owner_id: string;
  requester_id: string;
  pickup: string;
  dropoff: string;
  cargo: string | null;
  cargo_kg: number;
  needed_on: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  vehicles?: { title: string; vehicle_type: string } | null;
};

export const myTransportRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TransportRequestRow[]> => {
    const { supabase, userId } = context;
    const sb = supabase as never as {
      from: (t: string) => {
        select: (s: string) => { or: (q: string) => { order: (c: string, o: { ascending: boolean }) => Promise<{ data: TransportRequestRow[] | null; error: unknown }> } };
      };
    };
    const { data, error } = await sb
      .from("transport_requests")
      .select("*, vehicles(title, vehicle_type)")
      .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data ?? [];
  });


