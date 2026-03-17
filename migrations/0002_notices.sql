-- Migration: Create notices table
CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT DEFAULT '' NOT NULL,
  thumbnail_url TEXT DEFAULT '' NOT NULL,
  category TEXT DEFAULT 'notice' NOT NULL, -- 'notice' or 'event'
  is_active INTEGER DEFAULT 1 NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notices_active_date ON notices(is_active, created_at DESC);
