-- 协作文档：正文 + 文档级样式包
CREATE TABLE IF NOT EXISTS collab_documents (
  id                  TEXT PRIMARY KEY,
  owner_user_id       TEXT NOT NULL,
  source_post_id      TEXT,
  title               TEXT NOT NULL DEFAULT '',
  content             TEXT NOT NULL DEFAULT '',
  style               TEXT NOT NULL DEFAULT '{}',
  content_updated_at  INTEGER NOT NULL,
  style_updated_at    INTEGER NOT NULL,
  history             TEXT NOT NULL DEFAULT '[]',
  created_at          INTEGER NOT NULL,
  server_updated_at   INTEGER NOT NULL,
  deleted             INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_collab_documents_owner
  ON collab_documents (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_collab_documents_cursor
  ON collab_documents (server_updated_at);

-- 协作成员
CREATE TABLE IF NOT EXISTS collab_members (
  document_id  TEXT NOT NULL,
  user_id      TEXT NOT NULL,
  role         TEXT NOT NULL,
  joined_at    INTEGER NOT NULL,
  PRIMARY KEY (document_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_members_user
  ON collab_members (user_id);

-- 邀请链接
CREATE TABLE IF NOT EXISTS collab_invites (
  token        TEXT PRIMARY KEY,
  document_id  TEXT NOT NULL,
  role         TEXT NOT NULL,
  created_by   TEXT NOT NULL,
  expires_at   INTEGER,
  max_uses     INTEGER,
  use_count    INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_collab_invites_document
  ON collab_invites (document_id);
