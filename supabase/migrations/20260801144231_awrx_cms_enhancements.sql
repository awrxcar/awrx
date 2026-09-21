/*
# AWRX Schema Enhancement — CMS Features

## Overview
Adds fields needed for the enhanced CMS:
- Model cover image (cover_image_url on models table)
- Hotspot icon and color fields on car_hotspots
- Custom gallery categories support (gallery_categories table)

## Changes
1. ALTER models: add cover_image_url
2. ALTER car_hotspots: add icon_name, icon_color
3. CREATE gallery_categories: per-car custom categories

## Security
- RLS enabled on gallery_categories with anon+authenticated full CRUD (public content).
*/

-- 1. Add cover_image_url to models
ALTER TABLE models ADD COLUMN IF NOT EXISTS cover_image_url text;

-- 2. Add icon_name and icon_color to car_hotspots
ALTER TABLE car_hotspots ADD COLUMN IF NOT EXISTS icon_name text;
ALTER TABLE car_hotspots ADD COLUMN IF NOT EXISTS icon_color text;

-- 3. Custom gallery categories per car
CREATE TABLE IF NOT EXISTS gallery_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_gallery_cats" ON gallery_categories;
CREATE POLICY "anon_read_gallery_cats" ON gallery_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_gallery_cats" ON gallery_categories;
CREATE POLICY "anon_write_gallery_cats" ON gallery_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_gallery_cats" ON gallery_categories;
CREATE POLICY "anon_update_gallery_cats" ON gallery_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_gallery_cats" ON gallery_categories;
CREATE POLICY "anon_delete_gallery_cats" ON gallery_categories FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_gallery_cats_car ON gallery_categories(car_id);
