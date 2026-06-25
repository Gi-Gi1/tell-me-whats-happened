-- Run this in the Supabase SQL Editor for project fwojtiprslciunafwsyy.
-- Creates the crop_listings table + RLS policies and the storage.objects
-- policies for the existing 'crop-images' bucket.

-- =============================================
-- public.crop_listings
-- =============================================
CREATE TABLE IF NOT EXISTS public.crop_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'ton', 'basket', 'viss')),
  price_per_unit NUMERIC NOT NULL CHECK (price_per_unit >= 0),
  currency TEXT NOT NULL DEFAULT 'MMK',
  region TEXT NOT NULL,
  township TEXT NOT NULL,
  contact TEXT NOT NULL,
  description TEXT,
  image_paths TEXT[] NOT NULL DEFAULT '{}',
  delivery_option TEXT CHECK (delivery_option IN ('delivery', 'pickup')),
  harvest_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crop_listings_created_at_idx
  ON public.crop_listings (created_at DESC);
CREATE INDEX IF NOT EXISTS crop_listings_user_id_idx
  ON public.crop_listings (user_id);

GRANT SELECT ON public.crop_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crop_listings TO authenticated;
GRANT ALL ON public.crop_listings TO service_role;

ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view crop listings" ON public.crop_listings;
CREATE POLICY "Anyone can view crop listings"
  ON public.crop_listings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own crop listings" ON public.crop_listings;
CREATE POLICY "Users can insert their own crop listings"
  ON public.crop_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own crop listings" ON public.crop_listings;
CREATE POLICY "Users can update their own crop listings"
  ON public.crop_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own crop listings" ON public.crop_listings;
CREATE POLICY "Users can delete their own crop listings"
  ON public.crop_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.crop_listings_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS crop_listings_updated_at ON public.crop_listings;
CREATE TRIGGER crop_listings_updated_at
  BEFORE UPDATE ON public.crop_listings
  FOR EACH ROW EXECUTE FUNCTION public.crop_listings_set_updated_at();

-- =============================================
-- storage.objects policies for 'crop-images'
-- (the private bucket has already been created)
-- =============================================
DROP POLICY IF EXISTS "Public can read crop images" ON storage.objects;
CREATE POLICY "Public can read crop images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'crop-images');

DROP POLICY IF EXISTS "Authenticated users can upload crop images to their folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload crop images to their folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'crop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own crop images" ON storage.objects;
CREATE POLICY "Users can update their own crop images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'crop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own crop images" ON storage.objects;
CREATE POLICY "Users can delete their own crop images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'crop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
