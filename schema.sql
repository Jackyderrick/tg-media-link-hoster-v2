-- 创建媒体记录表格（替代原项目的records表）
CREATE TABLE IF NOT EXISTS media_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  access_code TEXT UNIQUE NOT NULL, -- 访问码（替代原代码的短链接）
  media_id TEXT NOT NULL, -- Telegram媒体文件ID
  chat_id INTEGER NOT NULL, -- 发送者/群组ID
  created_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP -- 过期时间（可选，用于一次性链接）
);

-- 索引优化查询
CREATE INDEX IF NOT EXISTS idx_access_code ON media_records(access_code);
CREATE INDEX IF NOT EXISTS idx_chat_id ON media_records(chat_id);
    