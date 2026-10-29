-- Trial rows use a random `trial-…@trial.lessonscriptor.internal` email and Stripe
-- purchases credit a separate row keyed by the buyer's real email, so nothing tied a
-- purchase back to the trial that preceded it ("trial users who converted" was always 0).
-- The extension now sends its previous (trial) key when a paid key is activated, and
-- POST /api/license/activate records the trial row's email here, on the paid row.
-- The trial's email is stored rather than its license key, which is still a credential.
-- Run once: `psql "$LS_DATABASE_URL" -f scripts/add-converted-from-trial-columns.sql`.

ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_from_trial_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS converted_from_trial_at TIMESTAMPTZ;
