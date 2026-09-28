-- Migration: 011_add_interaction_tracking
-- Adds first_interaction_at and last_interaction_at to facebook_profiles for Meta 24h window tracking

ALTER TABLE facebook_profiles ADD COLUMN first_interaction_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE facebook_profiles ADD COLUMN last_interaction_at DATETIME DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_fb_profiles_last_interaction ON facebook_profiles(last_interaction_at);
