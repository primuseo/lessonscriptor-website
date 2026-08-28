-- Welcome email now carries a one-click unsubscribe link. Track opt-outs on the
-- users table so any future recurring send (e.g. the planned Phase 2 delayed
-- follow-up) can skip them.
-- Run once against Neon (Neon SQL editor, or `psql "$DATABASE_URL" -f scripts/add-unsubscribed-column.sql`).

ALTER TABLE users ADD COLUMN IF NOT EXISTS unsubscribed BOOLEAN NOT NULL DEFAULT false;
