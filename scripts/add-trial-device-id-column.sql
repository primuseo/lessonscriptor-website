-- Ties each free trial grant to the requesting browser/device so the same
-- device cannot re-claim a fresh 30-minute trial by calling
-- POST /api/trial/start again (previously gated only by a 3-req/24h IP
-- rate limit, which reset daily and didn't stop repeat trials from the
-- same browser).
-- Run once against Neon (Neon SQL editor, or `psql "$DATABASE_URL" -f scripts/add-trial-device-id-column.sql`).

ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_device_id TEXT;

-- Partial unique index: only trial rows carry a device id, so this enforces
-- "one trial per device" without constraining non-trial users (device id is
-- NULL for them) or older trial rows created before this column existed.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_trial_device_id
  ON users (trial_device_id)
  WHERE trial_device_id IS NOT NULL;
