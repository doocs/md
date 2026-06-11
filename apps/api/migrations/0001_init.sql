-- 用户表：通过 GitHub OAuth 创建
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY,           -- 内部用户 id（uuid）
  github_id    INTEGER NOT NULL UNIQUE,    -- GitHub 数字 id
  login        TEXT NOT NULL,              -- GitHub 用户名
  name         TEXT,
  avatar       TEXT,
  created_at   INTEGER NOT NULL            -- epoch ms
);

-- 文档表：与前端 Post 一一对应
CREATE TABLE IF NOT EXISTS documents (
  user_id           TEXT NOT NULL,
  id                TEXT NOT NULL,         -- = 前端 post.id
  title             TEXT NOT NULL DEFAULT '',
  content           TEXT NOT NULL DEFAULT '',
  parent_id         TEXT,
  history           TEXT NOT NULL DEFAULT '[]', -- JSON 数组
  create_datetime   INTEGER NOT NULL,      -- epoch ms
  update_datetime   INTEGER NOT NULL,      -- epoch ms，LWW 依据
  deleted           INTEGER NOT NULL DEFAULT 0, -- 软删除
  server_updated_at INTEGER NOT NULL,      -- epoch ms，增量同步游标
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_documents_cursor
  ON documents (user_id, server_updated_at);

-- 设置表：同步白名单内的偏好项（不含图床密钥）
CREATE TABLE IF NOT EXISTS settings (
  user_id           TEXT NOT NULL,
  key               TEXT NOT NULL,
  value             TEXT NOT NULL,         -- JSON 字符串
  updated_at        INTEGER NOT NULL,      -- epoch ms，LWW 依据
  server_updated_at INTEGER NOT NULL,      -- epoch ms，增量同步游标
  PRIMARY KEY (user_id, key)
);

CREATE INDEX IF NOT EXISTS idx_settings_cursor
  ON settings (user_id, server_updated_at);
