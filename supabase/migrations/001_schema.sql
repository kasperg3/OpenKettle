-- ============================================================
-- OpenKettle Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- GLOBAL INGREDIENT REFERENCE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS fermentables (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK (type IN ('grain','adjunct','sugar','extract','dry_extract','fruit','other')),
    color_ebc       NUMERIC(6,2) NOT NULL DEFAULT 0,
    ppg             NUMERIC(5,2) NOT NULL DEFAULT 0,
    max_in_batch    NUMERIC(5,2),
    fermentability  NUMERIC(5,2) NOT NULL DEFAULT 75,
    protein         NUMERIC(5,2),
    diastatic_power NUMERIC(6,2),
    moisture        NUMERIC(5,2),
    notes           TEXT,
    origin          TEXT,
    supplier        TEXT,
    is_global       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hops (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    origin          TEXT,
    alpha_acid      NUMERIC(5,2) NOT NULL DEFAULT 5.0,
    beta_acid       NUMERIC(5,2),
    cohumulone      NUMERIC(5,2),
    myrcene         NUMERIC(5,2),
    humulene        NUMERIC(5,2),
    caryophyllene   NUMERIC(5,2),
    farnesene       NUMERIC(5,2),
    notes           TEXT,
    aroma_profile   TEXT[],
    is_global       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS yeasts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    lab             TEXT NOT NULL,
    code            TEXT,
    type            TEXT NOT NULL CHECK (type IN ('ale','lager','wine','champagne','other')),
    form            TEXT NOT NULL CHECK (form IN ('liquid','dry','slant','culture')),
    min_attenuation NUMERIC(5,2),
    max_attenuation NUMERIC(5,2),
    avg_attenuation NUMERIC(5,2),
    min_temp_c      NUMERIC(5,2),
    max_temp_c      NUMERIC(5,2),
    flocculation    TEXT CHECK (flocculation IN ('low','medium','medium-high','high','very_high')),
    alcohol_tolerance TEXT,
    notes           TEXT,
    is_global       BOOLEAN NOT NULL DEFAULT TRUE,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS miscs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('spice','fining','water_agent','herb','flavor','other')),
    use_for     TEXT,
    notes       TEXT,
    is_global   BOOLEAN NOT NULL DEFAULT TRUE,
    created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER PROFILE
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username     TEXT UNIQUE,
    display_name TEXT,
    bio          TEXT,
    location     TEXT,
    website      TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RECIPES
-- ============================================================

CREATE TABLE IF NOT EXISTS recipes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identity
    name        TEXT NOT NULL,
    slug        TEXT,
    description TEXT,
    style_id    TEXT,
    style_name  TEXT,

    -- Cached computed metrics for list views / filtering
    og          NUMERIC(6,4),
    fg          NUMERIC(6,4),
    abv         NUMERIC(5,2),
    ibu         NUMERIC(7,2),
    srm         NUMERIC(7,2),
    ebc         NUMERIC(7,2),
    batch_size_l NUMERIC(8,3),

    -- Visibility
    is_public   BOOLEAN NOT NULL DEFAULT TRUE,
    tags        TEXT[],
    version     INTEGER NOT NULL DEFAULT 1,

    -- Ingredient snapshots (JSONB — self-contained at save time)
    fermentables JSONB NOT NULL DEFAULT '[]',
    hops         JSONB NOT NULL DEFAULT '[]',
    yeasts       JSONB NOT NULL DEFAULT '[]',
    miscs        JSONB NOT NULL DEFAULT '[]',

    -- Profile snapshots
    mash_profile         JSONB,
    fermentation_profile JSONB,
    water_profile        JSONB,
    equipment_profile    JSONB,

    -- Notes
    recipe_notes TEXT,
    batch_notes  TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for list views
CREATE INDEX IF NOT EXISTS idx_recipes_public   ON recipes (is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_user     ON recipes (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_style    ON recipes (style_id) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipes_slug     ON recipes (slug);

-- Full-text search
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(style_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_recipes_fts ON recipes USING GIN (fts_vector);

-- ============================================================
-- updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recipes_upd        BEFORE UPDATE ON recipes        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_fermentables_upd   BEFORE UPDATE ON fermentables   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_hops_upd           BEFORE UPDATE ON hops           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_yeasts_upd         BEFORE UPDATE ON yeasts         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_miscs_upd          BEFORE UPDATE ON miscs          FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_profiles_upd  BEFORE UPDATE ON user_profiles  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AUTO-CREATE user_profile ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
