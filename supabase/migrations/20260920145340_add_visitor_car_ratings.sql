/*
# Visitor Car Ratings — Public Anonymous Rating System

## Overview
Creates a new table `visitor_car_ratings` that allows any site visitor
(no login required) to rate a car across 4 categories:
- Konfor (Comfort)
- Motor (Engine)
- Dış Tasarım (Exterior Design)
- Genel Araç (General)

Each visitor gets an anonymous voter_id stored in localStorage.
If the same visitor rates the same car again, their existing rating is updated
rather than creating a duplicate (enforced by UNIQUE constraint on car_id + voter_id).

The AWRX Genel Puanı (overall car score) is calculated as the average of all
visitor ratings for that car.

## New Tables
- `visitor_car_ratings`
  - `id` (uuid, PK)
  - `car_id` (uuid, FK to cars, ON DELETE CASCADE)
  - `voter_id` (text, anonymous visitor identifier from localStorage)
  - `comfort_score` (integer 1-10, default 5)
  - `engine_score` (integer 1-10, default 5)
  - `exterior_design_score` (integer 1-10, default 5)
  - `general_score` (integer 1-10, default 5)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - UNIQUE(car_id, voter_id) — one rating per visitor per car

## Security
- RLS enabled on `visitor_car_ratings`.
- All CRUD open to anon + authenticated (intentionally public, no sign-in app).
*/

CREATE TABLE IF NOT EXISTS visitor_car_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id uuid NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  voter_id text NOT NULL,
  comfort_score integer NOT NULL DEFAULT 5 CHECK (comfort_score >= 1 AND comfort_score <= 10),
  engine_score integer NOT NULL DEFAULT 5 CHECK (engine_score >= 1 AND engine_score <= 10),
  exterior_design_score integer NOT NULL DEFAULT 5 CHECK (exterior_design_score >= 1 AND exterior_design_score <= 10),
  general_score integer NOT NULL DEFAULT 5 CHECK (general_score >= 1 AND general_score <= 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (car_id, voter_id)
);

ALTER TABLE visitor_car_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_visitor_ratings" ON visitor_car_ratings;
CREATE POLICY "anon_read_visitor_ratings" ON visitor_car_ratings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_visitor_ratings" ON visitor_car_ratings;
CREATE POLICY "anon_insert_visitor_ratings" ON visitor_car_ratings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_visitor_ratings" ON visitor_car_ratings;
CREATE POLICY "anon_update_visitor_ratings" ON visitor_car_ratings
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_visitor_ratings" ON visitor_car_ratings;
CREATE POLICY "anon_delete_visitor_ratings" ON visitor_car_ratings
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_visitor_ratings_car ON visitor_car_ratings(car_id);
CREATE INDEX IF NOT EXISTS idx_visitor_ratings_voter ON visitor_car_ratings(voter_id);
