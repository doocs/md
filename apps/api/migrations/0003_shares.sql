-- 公开分享：浏览器预览快照（完整 HTML 页面）
CREATE TABLE IF NOT EXISTS shares (
  id             TEXT PRIMARY KEY,
  post_id        TEXT NOT NULL,
  user_id        TEXT NOT NULL,
  title          TEXT NOT NULL DEFAULT '',
  html           TEXT NOT NULL,
  password_hash  TEXT,
  created_at     INTEGER NOT NULL,
  expires_at     INTEGER,
  view_count     INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shares_user_post ON shares (user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_shares_expires ON shares (expires_at);

-- 分享频率限制（按登录用户 / 解锁失败）
CREATE TABLE IF NOT EXISTS share_rate_limits (
  scope_key  TEXT NOT NULL,
  hour_key   TEXT NOT NULL,
  count      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope_key, hour_key)
);
