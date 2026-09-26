-- Migration: 008_add_facebook_profiles_cache
-- Persistent cache for Facebook PSID profiles to prevent repeated Meta Graph API requests

CREATE TABLE IF NOT EXISTS facebook_profiles (
  psid TEXT PRIMARY KEY,
  name TEXT,
  status TEXT DEFAULT 'RESOLVED',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fb_profiles_psid ON facebook_profiles(psid);
