-- Adds telemetry columns to the existing `feedback` table so the extension's
-- review-prompt A/B test can log {shown, yes, no, rate_clicked} events through
-- the same endpoint used for user-submitted feedback text, without requiring
-- a `text` value for pure telemetry rows.
--
-- Run manually against the Neon database (e.g. via the Neon SQL editor or psql).

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS variant TEXT;

-- text was NOT NULL; event-only rows (event_type set, no user text) need it nullable.
ALTER TABLE feedback ALTER COLUMN text DROP NOT NULL;
