-- Adds trial-account tracking for the "try Tab Audio free" flow.
-- Run once against Neon (Neon SQL editor, or `psql "$DATABASE_URL" -f scripts/add-trial-column.sql`).

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_trial BOOLEAN NOT NULL DEFAULT false;
