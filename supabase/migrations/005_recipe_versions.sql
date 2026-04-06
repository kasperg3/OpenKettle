-- Recipe versions: snapshots of a recipe at a point in time.
-- Each version stores the full ingredient/process draft + computed stats
-- so it is self-contained for comparison and historical reference.

CREATE TABLE IF NOT EXISTS recipe_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id        UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number   INT  NOT NULL,
  name             TEXT NOT NULL DEFAULT '',
  changes_summary  TEXT NOT NULL DEFAULT '',
  draft            JSONB NOT NULL DEFAULT '{}',
  stats            JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_recipe_versions_recipe ON recipe_versions(recipe_id);

-- Brew logs: one or more actual brewing sessions tied to a recipe version.
-- Captures what happened vs what was planned.

CREATE TABLE IF NOT EXISTS brew_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_version_id   UUID NOT NULL REFERENCES recipe_versions(id) ON DELETE CASCADE,
  brew_date           DATE,
  actual_og           FLOAT,
  actual_fg           FLOAT,
  rating              INT CHECK (rating BETWEEN 1 AND 5),
  notes               TEXT NOT NULL DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brew_logs_version ON brew_logs(recipe_version_id);

-- RLS ---------------------------------------------------------

ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE brew_logs       ENABLE ROW LEVEL SECURITY;

-- recipe_versions: readable if the parent recipe is public or owned
CREATE POLICY "Recipe versions follow recipe visibility" ON recipe_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE id = recipe_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Owner can insert recipe versions" ON recipe_versions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
  );

CREATE POLICY "Owner can delete recipe versions" ON recipe_versions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM recipes WHERE id = recipe_id AND user_id = auth.uid())
  );

-- brew_logs: readable if the parent recipe version is readable
CREATE POLICY "Brew logs follow recipe visibility" ON brew_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipe_versions rv
      JOIN recipes r ON r.id = rv.recipe_id
      WHERE rv.id = recipe_version_id
        AND (r.is_public = true OR r.user_id = auth.uid())
    )
  );

CREATE POLICY "Owner can manage brew logs" ON brew_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipe_versions rv
      JOIN recipes r ON r.id = rv.recipe_id
      WHERE rv.id = recipe_version_id AND r.user_id = auth.uid()
    )
  );
