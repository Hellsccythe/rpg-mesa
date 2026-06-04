-- Migration 042: Classes secretas
-- is_secret = true → a classe não aparece para players normais
-- Só aparece quando o mestre revela explicitamente para um personagem específico

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS is_secret BOOLEAN NOT NULL DEFAULT FALSE;
