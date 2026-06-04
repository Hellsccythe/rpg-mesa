-- Migration 040: Skills concedidas pelos títulos
-- Títulos podem conceder skills ao player que os receber

ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS skill_ids INTEGER[] NOT NULL DEFAULT '{}';
