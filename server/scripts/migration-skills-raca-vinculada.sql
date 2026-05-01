-- Migration: adicionar coluna raca_vinculada na tabela skills
-- Data: 2026-05-01

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS raca_vinculada TEXT;

COMMENT ON COLUMN public.skills.raca_vinculada IS
  'Nome da raça à qual esta skill está vinculada (usada para skills da categoria Racial)';
