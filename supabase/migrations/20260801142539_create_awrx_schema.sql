/*
# AWRX Premium Automotive Database — Core Schema

## Overview
Creates the full database schema for AWRX, a premium automotive database website.
The app is single-tenant with no user sign-in (public visitors). An admin gate
(password AWRX2025) is handled client-side; the database itself is fully open
to the anon role because all content is intentionally public/shared.

## New Tables
- `brands` — car manufacturers (Mercedes-Benz, BMW, Porsche, etc.)
- `models` — car models belonging to a brand
- `cars` — a specific car (variant/trim) belonging to a model, with full technical specs
- `gallery_photos` — photos per car, categorized (front/rear/side/interior/engine/detail)
- `car_hotspots` — interactive anatomy hotspots on a car image with part details
- `exhaust_sounds` — exhaust audio files per car
- `car_ratings` — AWRX rating scores across 6 categories
- `car_facts` — "Did you know?" interesting facts per car
- `map_locations` — locations where cars were photographed
- `notifications` — admin-published notifications shown to visitors

## Security
- RLS enabled on every table.
- All tables allow anon + authenticated full CRUD (intentionally public content).
*/

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  logo_url text,
  country text,
  founded int,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_brands" ON brands;
CREATE POLICY "anon_read_brands" ON brands FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_brands" ON brands;
CREATE POLICY "anon_write_brands" ON brands FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_brands" ON brands;
CREATE POLICY "anon_update_brands" ON brands FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_brands" ON brands;
CREATE POLICY "anon_delete_brands" ON brands FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- MODELS
-- ============================================================
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (brand_id, slug)
);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_models" ON models;
CREATE POLICY "anon_read_models" ON models FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_models" ON models;
CREATE POLICY "anon_write_models" ON models FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_models" ON models;
CREATE POLICY "anon_update_models" ON models FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_models" ON models;
CREATE POLICY "anon_delete_models" ON models FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- CARS (variants with full technical specs)
-- ============================================================
CREATE TABLE IF NOT EXISTS cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  cover_image_url text,
  hero_image_url text,
  -- Technical specs
  engine text,
  engine_code text,
  cylinders int,
  displacement text,
  turbo_system text,
  hybrid_system text,
  horsepower int,
  torque text,
  acceleration_0_100 text,
  top_speed text,
  transmission text,
  drivetrain text,
  fuel_type text,
  weight text,
  production_years text,
  production_count text,
  estimated_value text,
  description text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (model_id, slug)
);

ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_cars" ON cars;
CREATE POLICY "anon_read_cars" ON cars FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_cars" ON cars;
CREATE POLICY "anon_write_cars" ON cars FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cars" ON cars;
CREATE POLICY "anon_update_cars" ON cars FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cars" ON cars;
CREATE POLICY "anon_delete_cars" ON cars FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- GALLERY PHOTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'detail',
  shot_by text DEFAULT 'AWRX',
  camera text,
  lens text,
  shot_date date,
  location text,
  description text,
  tags text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_gallery" ON gallery_photos;
CREATE POLICY "anon_read_gallery" ON gallery_photos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_gallery" ON gallery_photos;
CREATE POLICY "anon_write_gallery" ON gallery_photos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_gallery" ON gallery_photos;
CREATE POLICY "anon_update_gallery" ON gallery_photos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_gallery" ON gallery_photos;
CREATE POLICY "anon_delete_gallery" ON gallery_photos FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- CAR ANATOMY HOTSPOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS car_hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  part_name text NOT NULL,
  x_position numeric NOT NULL,
  y_position numeric NOT NULL,
  title text NOT NULL,
  description text,
  specs text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE car_hotspots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_hotspots" ON car_hotspots;
CREATE POLICY "anon_read_hotspots" ON car_hotspots FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_hotspots" ON car_hotspots;
CREATE POLICY "anon_write_hotspots" ON car_hotspots FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_hotspots" ON car_hotspots;
CREATE POLICY "anon_update_hotspots" ON car_hotspots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_hotspots" ON car_hotspots;
CREATE POLICY "anon_delete_hotspots" ON car_hotspots FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- EXHAUST SOUNDS
-- ============================================================
CREATE TABLE IF NOT EXISTS exhaust_sounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  audio_url text NOT NULL,
  title text DEFAULT 'Exhaust Sound',
  duration text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exhaust_sounds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_sounds" ON exhaust_sounds;
CREATE POLICY "anon_read_sounds" ON exhaust_sounds FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_sounds" ON exhaust_sounds;
CREATE POLICY "anon_write_sounds" ON exhaust_sounds FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sounds" ON exhaust_sounds;
CREATE POLICY "anon_update_sounds" ON exhaust_sounds FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sounds" ON exhaust_sounds;
CREATE POLICY "anon_delete_sounds" ON exhaust_sounds FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- CAR RATINGS (AWRX Rating)
-- ============================================================
CREATE TABLE IF NOT EXISTS car_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL UNIQUE REFERENCES cars(id) ON DELETE CASCADE,
  design_score numeric DEFAULT 0,
  sound_score numeric DEFAULT 0,
  driving_experience_score numeric DEFAULT 0,
  daily_usability_score numeric DEFAULT 0,
  rarity_score numeric DEFAULT 0,
  photography_score numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE car_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_ratings" ON car_ratings;
CREATE POLICY "anon_read_ratings" ON car_ratings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_ratings" ON car_ratings;
CREATE POLICY "anon_write_ratings" ON car_ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ratings" ON car_ratings;
CREATE POLICY "anon_update_ratings" ON car_ratings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ratings" ON car_ratings;
CREATE POLICY "anon_delete_ratings" ON car_ratings FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- CAR FACTS ("Did you know?")
-- ============================================================
CREATE TABLE IF NOT EXISTS car_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  fact text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE car_facts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_facts" ON car_facts;
CREATE POLICY "anon_read_facts" ON car_facts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_facts" ON car_facts;
CREATE POLICY "anon_write_facts" ON car_facts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_facts" ON car_facts;
CREATE POLICY "anon_update_facts" ON car_facts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_facts" ON car_facts;
CREATE POLICY "anon_delete_facts" ON car_facts FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- MAP LOCATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS map_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_locations" ON map_locations;
CREATE POLICY "anon_read_locations" ON map_locations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_locations" ON map_locations;
CREATE POLICY "anon_write_locations" ON map_locations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_locations" ON map_locations;
CREATE POLICY "anon_update_locations" ON map_locations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_locations" ON map_locations;
CREATE POLICY "anon_delete_locations" ON map_locations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  type text DEFAULT 'new_car',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_notifications" ON notifications;
CREATE POLICY "anon_read_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_write_notifications" ON notifications;
CREATE POLICY "anon_write_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_models_brand ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_model ON cars(model_id);
CREATE INDEX IF NOT EXISTS idx_gallery_car ON gallery_photos(car_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_car ON car_hotspots(car_id);
CREATE INDEX IF NOT EXISTS idx_sounds_car ON exhaust_sounds(car_id);
CREATE INDEX IF NOT EXISTS idx_ratings_car ON car_ratings(car_id);
CREATE INDEX IF NOT EXISTS idx_facts_car ON car_facts(car_id);
CREATE INDEX IF NOT EXISTS idx_locations_car ON map_locations(car_id);
CREATE INDEX IF NOT EXISTS idx_brands_order ON brands(display_order);
