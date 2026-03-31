-- Improve query performance for watched history lookups
CREATE INDEX IF NOT EXISTS idx_watched_user_watched_at
  ON watched(user_id, watched_at DESC);
