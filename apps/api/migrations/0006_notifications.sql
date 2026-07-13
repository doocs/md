-- In-app system notifications (marketplace review, etc.)
CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  type        TEXT NOT NULL,
  payload     TEXT NOT NULL DEFAULT '{}',
  read_at     INTEGER,
  created_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at, created_at DESC);
