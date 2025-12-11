-- Migration number: 0001 	 2025-03-01T00:00:00.000Z
DROP TABLE IF EXISTS feedbacks;
CREATE TABLE feedbacks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  version TEXT,
  content TEXT NOT NULL,
  contact TEXT,
  device_info TEXT, -- JSON string
  location TEXT, -- JSON string
  status TEXT DEFAULT 'pending',
  created_at INTEGER DEFAULT (unixepoch())
);
