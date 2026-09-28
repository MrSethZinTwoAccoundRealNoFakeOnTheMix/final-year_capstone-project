-- Migration: 011_add_interaction_tracking
-- Adds first_interaction_at and last_interaction_at to facebook_profiles for Meta 24h window tracking

ALTER TABLE facebook_profiles ADD COLUMN first_interaction_at DATETIME DEFAULT NULL;
ALTER TABLE facebook_profiles ADD COLUMN last_interaction_at DATETIME DEFAULT NULL;

UPDATE facebook_profiles
SET first_interaction_at = COALESCE(updated_at, CURRENT_TIMESTAMP),
    last_interaction_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE first_interaction_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_fb_profiles_last_interaction ON facebook_profiles(last_interaction_at);
