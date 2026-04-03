-- ============================================================
-- Fork lineage tracking
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS forked_from_id   UUID REFERENCES recipes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS forked_from_name TEXT;

CREATE INDEX IF NOT EXISTS idx_recipes_forked ON recipes (forked_from_id) WHERE forked_from_id IS NOT NULL;
