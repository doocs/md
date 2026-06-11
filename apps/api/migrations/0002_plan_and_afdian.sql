-- 用户套餐（Pro 云同步）
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN plan_expires_at INTEGER;

-- 爱发电订单幂等记录
CREATE TABLE IF NOT EXISTS afdian_orders (
  out_trade_no   TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL,
  github_login   TEXT NOT NULL,
  months         INTEGER NOT NULL,
  processed_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_afdian_orders_user
  ON afdian_orders (user_id);

-- 同步频率计数（按 UTC 小时桶）
CREATE TABLE IF NOT EXISTS sync_rate_limits (
  user_id   TEXT NOT NULL,
  hour_key  TEXT NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, hour_key)
);
