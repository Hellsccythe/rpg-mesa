-- Migration 045: Vínculo entre título secreto e classe secreta
-- Se classe_secreta_id é preenchido, o título fica oculto para players que não têm essa classe revelada

ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS classe_secreta_id INTEGER DEFAULT NULL;
