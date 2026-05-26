-- Migration 021: Campos extras de skill + remoção das colunas legadas type/category

BEGIN;

ALTER TABLE public.skills
  -- Remove colunas legadas substituídas pelas lookup tables
  DROP COLUMN IF EXISTS type,
  DROP COLUMN IF EXISTS category,
  -- Novos campos
  ADD COLUMN IF NOT EXISTS damage_display      VARCHAR(60)    NULL,
  ADD COLUMN IF NOT EXISTS damage_base         NUMERIC(10,2)  NULL,
  ADD COLUMN IF NOT EXISTS effect_description  VARCHAR(500)   NULL,
  ADD COLUMN IF NOT EXISTS effect_value        NUMERIC(10,2)  NULL,
  ADD COLUMN IF NOT EXISTS custo               INTEGER        NULL,
  ADD COLUMN IF NOT EXISTS cooldown            INTEGER        NULL,
  ADD COLUMN IF NOT EXISTS range               VARCHAR(60)    NULL,
  ADD COLUMN IF NOT EXISTS required_class      VARCHAR(100)   NULL;

COMMIT;
