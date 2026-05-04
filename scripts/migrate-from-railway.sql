-- Migration script: Railway Postgres → Neon
-- Run this against your Neon database after creating the project

-- 1. Create schema
CREATE TABLE IF NOT EXISTS users (
  email                      TEXT PRIMARY KEY,
  credits_seconds_remaining  NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_seconds_purchased    NUMERIC(12,2) NOT NULL DEFAULT 0,
  active_sessions            INTEGER NOT NULL DEFAULT 0,
  last_active_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credits_last_updated       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  license_key                TEXT UNIQUE,
  is_unlimited               BOOLEAN NOT NULL DEFAULT false,
  total_seconds_transcribed  NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id           SERIAL PRIMARY KEY,
  user_email   TEXT NOT NULL,
  type         TEXT NOT NULL,
  seconds      NUMERIC(12,2) NOT NULL,
  reference_id TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_email_idx
  ON credit_transactions(user_email);

CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_reference_id_idx
  ON credit_transactions(reference_id)
  WHERE reference_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_license_key_idx
  ON users(license_key)
  WHERE license_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS feedback (
  id                SERIAL PRIMARY KEY,
  text              TEXT NOT NULL,
  extension_version TEXT,
  lang              TEXT,
  source            TEXT DEFAULT 'unknown',
  ip                TEXT,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert users
INSERT INTO users (email, credits_seconds_remaining, total_seconds_purchased, active_sessions, last_active_at, credits_last_updated, is_unlimited, license_key, total_seconds_transcribed) VALUES
  ('nvictoriamortensen8@gmail.com', 0.00, 0.00, 0, '2026-04-21T20:12:32.278Z', '2026-04-21T20:12:32.278Z', true, NULL, 0.00),
  ('gouelenn@gmail.com', 0.00, 0.00, 0, '2026-04-21T20:12:32.278Z', '2026-04-21T20:12:32.278Z', true, NULL, 0.00),
  ('marketing@primuseo.com', 143260.63, 144000.00, 0, '2026-05-04T16:00:19.476Z', '2026-05-04T16:00:19.811Z', false, 'E12D3BE1-DF67-4155-8B0F-F4ACACD50AE8', 739.37),
  ('sales@primuseo.com', 54000.00, 54000.00, 0, '2026-05-04T14:49:48.685Z', '2026-05-04T14:49:48.685Z', false, '20118B1D-F0DC-4325-B0D1-98D53FC2AADE', 0.00),
  ('pierre.girardot@canva.com', -45.35, 0.00, 0, '2026-04-29T17:32:45.063Z', '2026-04-21T21:15:40.932Z', true, 'ADMIN-UNLTD-PIER-2026', 0.00)
ON CONFLICT (email) DO NOTHING;

-- 3. Insert credit transactions
INSERT INTO credit_transactions (id, user_email, type, seconds, reference_id, created_at) VALUES
  (1, 'pierre.girardot@canva.com', 'deduction', -10.20, NULL, '2026-04-21T21:10:37.550Z'),
  (2, 'pierre.girardot@canva.com', 'deduction', -10.00, NULL, '2026-04-21T21:11:23.209Z'),
  (3, 'pierre.girardot@canva.com', 'deduction', -5.28, NULL, '2026-04-21T21:15:08.755Z'),
  (4, 'pierre.girardot@canva.com', 'deduction', -8.43, NULL, '2026-04-21T21:15:22.532Z'),
  (5, 'pierre.girardot@canva.com', 'deduction', -11.44, NULL, '2026-04-21T21:15:40.935Z'),
  (6, 'marketing@primuseo.com', 'purchase', 18000.00, '8247308', '2026-05-04T10:44:04.579Z'),
  (7, 'marketing@primuseo.com', 'purchase', 18000.00, '8247584', '2026-05-04T11:08:50.458Z'),
  (8, 'sales@primuseo.com', 'purchase', 54000.00, '8249342', '2026-05-04T14:49:48.691Z'),
  (9, 'marketing@primuseo.com', 'purchase', 54000.00, '8249432', '2026-05-04T14:59:25.171Z'),
  (10, 'marketing@primuseo.com', 'purchase', 54000.00, '8249468', '2026-05-04T15:04:36.121Z'),
  (11, 'marketing@primuseo.com', 'deduction', -10.21, NULL, '2026-05-04T15:06:19.444Z'),
  (12, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:06:50.471Z'),
  (13, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:07:00.741Z'),
  (14, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:07:21.188Z'),
  (15, 'marketing@primuseo.com', 'deduction', -10.00, NULL, '2026-05-04T15:07:31.130Z'),
  (16, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:07:41.346Z'),
  (17, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:07:51.466Z'),
  (18, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:08:22.250Z'),
  (19, 'marketing@primuseo.com', 'deduction', -10.19, NULL, '2026-05-04T15:08:42.699Z'),
  (20, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:08:52.728Z'),
  (21, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:02.863Z'),
  (22, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:13.150Z'),
  (23, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:23.450Z'),
  (24, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:33.587Z'),
  (25, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:43.828Z'),
  (26, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:09:53.942Z'),
  (27, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:10:04.129Z'),
  (28, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:10:14.432Z'),
  (29, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:10:24.646Z'),
  (30, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:10:34.906Z'),
  (31, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:10:55.182Z'),
  (32, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:05.274Z'),
  (33, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:15.644Z'),
  (34, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:25.718Z'),
  (35, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:35.933Z'),
  (36, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:46.156Z'),
  (37, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:11:56.305Z'),
  (38, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:12:06.654Z'),
  (39, 'marketing@primuseo.com', 'deduction', -10.00, NULL, '2026-05-04T15:12:16.572Z'),
  (40, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:12:27.019Z'),
  (41, 'marketing@primuseo.com', 'deduction', -10.01, NULL, '2026-05-04T15:13:21.544Z'),
  (42, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:13:31.758Z'),
  (43, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:13:42.121Z'),
  (44, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:13:52.125Z'),
  (45, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:02.333Z'),
  (46, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:12.431Z'),
  (47, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:22.772Z'),
  (48, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:32.990Z'),
  (49, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:43.110Z'),
  (50, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:14:53.543Z'),
  (51, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:03.538Z'),
  (52, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:13.700Z'),
  (53, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:24.113Z'),
  (54, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:34.467Z'),
  (55, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:44.500Z'),
  (56, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:15:54.656Z'),
  (57, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:04.659Z'),
  (58, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:14.873Z'),
  (59, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:25.087Z'),
  (60, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:35.364Z'),
  (61, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:45.385Z'),
  (62, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:16:55.869Z'),
  (63, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:06.001Z'),
  (64, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:16.340Z'),
  (65, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:26.360Z'),
  (66, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:36.511Z'),
  (67, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:46.766Z'),
  (68, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:17:56.947Z'),
  (69, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:07.260Z'),
  (70, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:17.282Z'),
  (71, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:27.491Z'),
  (72, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:37.772Z'),
  (73, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:47.943Z'),
  (74, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:18:58.312Z'),
  (75, 'marketing@primuseo.com', 'deduction', -6.38, NULL, '2026-05-04T15:19:04.366Z'),
  (76, 'marketing@primuseo.com', 'deduction', -10.02, NULL, '2026-05-04T15:58:59.007Z'),
  (77, 'marketing@primuseo.com', 'deduction', -10.21, NULL, '2026-05-04T15:59:09.175Z'),
  (78, 'marketing@primuseo.com', 'deduction', -10.19, NULL, '2026-05-04T15:59:19.479Z'),
  (79, 'marketing@primuseo.com', 'deduction', -10.02, NULL, '2026-05-04T15:59:29.423Z'),
  (80, 'marketing@primuseo.com', 'deduction', -10.18, NULL, '2026-05-04T15:59:39.762Z'),
  (81, 'marketing@primuseo.com', 'deduction', -10.20, NULL, '2026-05-04T15:59:49.805Z'),
  (82, 'marketing@primuseo.com', 'deduction', -10.21, NULL, '2026-05-04T16:00:00.017Z'),
  (83, 'marketing@primuseo.com', 'deduction', -9.75, NULL, '2026-05-04T16:00:19.814Z')
ON CONFLICT DO NOTHING;

-- Reset the sequence to continue after the last ID
SELECT setval('credit_transactions_id_seq', (SELECT MAX(id) FROM credit_transactions));

-- 4. Insert feedback
INSERT INTO feedback (id, text, extension_version, lang, source, ip, created_at) VALUES
  (1, 'test feedback from deploy', '1.0.0', 'en', 'deploy-test', '::ffff:100.64.0.3', '2026-04-25T17:43:40.383Z'),
  (2, 'tesr', '1.0.0', 'fr', 'extension-prompt', '::ffff:100.64.0.21', '2026-04-25T22:16:55.352Z')
ON CONFLICT DO NOTHING;

SELECT setval('feedback_id_seq', (SELECT MAX(id) FROM feedback));

-- 5. Verify
SELECT 'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'credit_transactions', COUNT(*) FROM credit_transactions
UNION ALL SELECT 'feedback', COUNT(*) FROM feedback;
