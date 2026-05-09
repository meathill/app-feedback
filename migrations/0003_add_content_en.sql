-- Migration number: 0003    2026-05-09
-- 添加英文翻译字段，由 Gemini 按需翻译后填充
ALTER TABLE feedbacks ADD COLUMN content_en TEXT DEFAULT NULL;
