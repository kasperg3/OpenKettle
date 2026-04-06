-- ============================================================
-- Row Level Security Policies
-- Run AFTER 001_schema.sql
-- ============================================================

ALTER TABLE recipes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fermentables  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE yeasts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE miscs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brews         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RECIPES
-- ============================================================
CREATE POLICY "Public recipes are visible to all"
    ON recipes FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Users can see their own recipes"
    ON recipes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create recipes"
    ON recipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
    ON recipes FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
    ON recipes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================
-- INGREDIENTS (globally readable, service-role write)
-- ============================================================
CREATE POLICY "Anyone can read fermentables"
    ON fermentables FOR SELECT
    USING (is_global = TRUE OR created_by = auth.uid());

CREATE POLICY "Anyone can read hops"
    ON hops FOR SELECT
    USING (is_global = TRUE OR created_by = auth.uid());

CREATE POLICY "Anyone can read yeasts"
    ON yeasts FOR SELECT
    USING (is_global = TRUE OR created_by = auth.uid());

CREATE POLICY "Anyone can read miscs"
    ON miscs FOR SELECT
    USING (is_global = TRUE OR created_by = auth.uid());

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE POLICY "Public profiles visible to all"
    ON user_profiles FOR SELECT
    USING (TRUE);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================
-- BREWS
-- Brews on public recipes are readable by everyone.
-- Only the recipe owner can create, update, or delete brews.
-- ============================================================
CREATE POLICY "Brews follow recipe visibility"
    ON brews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_id AND (is_public = TRUE OR user_id = auth.uid())
        )
    );

CREATE POLICY "Owner can insert brews"
    ON brews FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
    );

CREATE POLICY "Owner can update brews"
    ON brews FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
    );

CREATE POLICY "Owner can delete brews"
    ON brews FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
    );
