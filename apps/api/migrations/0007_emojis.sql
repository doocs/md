-- Unified system and user emoji packs
CREATE TABLE IF NOT EXISTS emoji_packs (
  id             TEXT PRIMARY KEY,
  owner_user_id  TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  kind           TEXT NOT NULL CHECK (kind IN ('system', 'user')),
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  source_url     TEXT,
  source_commit  TEXT,
  license_spdx   TEXT,
  license_url    TEXT,
  attribution    TEXT,
  description    TEXT,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  CHECK (
    (kind = 'system' AND owner_user_id IS NULL)
    OR (kind = 'user' AND owner_user_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS emoji_items (
  id          TEXT PRIMARY KEY,
  pack_id     TEXT NOT NULL REFERENCES emoji_packs(id) ON DELETE CASCADE,
  object_key  TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  mime        TEXT NOT NULL,
  size        INTEGER NOT NULL CHECK (size > 0),
  width       INTEGER,
  height      INTEGER,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emoji_items_pack_sort
  ON emoji_items (pack_id, sort_order, id);

INSERT INTO emoji_packs (
  id, owner_user_id, kind, slug, name, created_at, updated_at
) VALUES (
  'system-default', NULL, 'system', 'default', 'Built-in',
  1785547610000, 1785547610000
) ON CONFLICT(id) DO NOTHING;
