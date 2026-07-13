-- Theme / component marketplace listings
CREATE TABLE IF NOT EXISTS marketplace_items (
  id             TEXT PRIMARY KEY,
  type           TEXT NOT NULL,
  author_id      TEXT NOT NULL,
  slug           TEXT NOT NULL,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  version        TEXT NOT NULL DEFAULT '1.0.0',
  cover_url      TEXT,
  primary_color  TEXT,
  payload        TEXT NOT NULL,
  status         TEXT NOT NULL,
  reject_reason  TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  published_at   INTEGER,
  UNIQUE(author_id, type, slug)
);

CREATE INDEX IF NOT EXISTS idx_mp_type_status ON marketplace_items(type, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mp_author ON marketplace_items(author_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS marketplace_rate_limits (
  scope_key TEXT NOT NULL,
  day_key   TEXT NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope_key, day_key)
);
