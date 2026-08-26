-- users had no signup timestamp at all, so "new users/trials this week" was
-- unanswerable. Existing rows backfill to the migration run time (not their
-- real signup date) since that history was never recorded; every row created
-- from here on gets an accurate timestamp.
-- Run once against Neon (Neon SQL editor, or `psql "$DATABASE_URL" -f scripts/add-users-created-at-column.sql`).

ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
