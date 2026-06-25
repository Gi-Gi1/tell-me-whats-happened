import { supabase } from "@/integrations/supabase/client";

export type CropListing = {
  id: string;
  user_id: string;
  crop_name: string;
  quantity: number;
  unit: "kg" | "ton" | "basket" | "viss";
  price_per_unit: number;
  currency: string;
  region: string;
  township: string;
  contact: string;
  description: string | null;
  image_paths: string[];
  delivery_option: "delivery" | "pickup" | null;
  harvest_date: string | null;
  created_at: string;
};

const TABLE = "crop_listings";
const BUCKET = "crop-images";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => (supabase as any).from(TABLE);

export async function listRecentListings(limit = 8): Promise<CropListing[]> {
  const { data, error } = await db()
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[agrimarket] listRecentListings error", error);
    return [];
  }
  return (data ?? []) as CropListing[];
}

export type NewCropListing = Omit<
  CropListing,
  "id" | "user_id" | "created_at" | "currency"
> & { currency?: string };

export async function createCropListing(input: NewCropListing) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("You need to sign in first.");
  const { data, error } = await db()
    .insert({ ...input, user_id: user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as CropListing;
}

export async function uploadCropImage(file: File): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("You need to sign in first.");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getSignedImageUrls(paths: string[], expiresIn = 60 * 60) {
  if (paths.length === 0) return [] as { path: string; url: string | null }[];
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, expiresIn);
  if (error) {
    console.warn("[agrimarket] signed urls error", error);
    return paths.map((p) => ({ path: p, url: null }));
  }
  return data.map((d, i) => ({ path: paths[i], url: d.signedUrl ?? null }));
}
