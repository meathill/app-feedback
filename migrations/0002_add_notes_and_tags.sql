-- Migration number: 0002    2026-04-07
-- 添加备注和标签字段
ALTER TABLE feedbacks ADD COLUMN notes TEXT DEFAULT NULL;
ALTER TABLE feedbacks ADD COLUMN tags TEXT DEFAULT '[]';
