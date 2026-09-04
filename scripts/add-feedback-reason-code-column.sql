-- The uninstall form's "didn't work" reason now expands into 4 specific bug
-- categories (mic not picking up video sound, wrong language, inaccurate,
-- missing words) so we can tell a mic/hardware issue apart from a
-- transcription-quality issue without parsing the free-text feedback.
-- Run once against Neon (Neon SQL editor, or `psql "$DATABASE_URL" -f scripts/add-feedback-reason-code-column.sql`).

ALTER TABLE feedback ADD COLUMN IF NOT EXISTS reason_code TEXT;
