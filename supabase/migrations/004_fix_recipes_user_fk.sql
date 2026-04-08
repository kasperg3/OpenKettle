-- ============================================================
-- Fix recipes.user_id FK to reference user_profiles(id)
-- instead of auth.users(id).
--
-- PostgREST discovers joins through public-schema FK constraints.
-- The original FK pointed at auth.users (a non-public schema),
-- so PostgREST could not resolve the user_profiles(...) join
-- in the recipes select, causing 400 Bad Request errors.
--
-- The cascade chain is preserved:
--   auth.users → user_profiles (ON DELETE CASCADE)
--               → recipes      (ON DELETE CASCADE)
-- ============================================================

ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;

ALTER TABLE recipes
  ADD CONSTRAINT recipes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
