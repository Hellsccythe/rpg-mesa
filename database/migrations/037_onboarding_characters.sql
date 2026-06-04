-- Migration 037: Campos de onboarding no characters
-- classe_id, deus_id e flag de conclusão do onboarding

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS classe_id          INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deus_id            INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completo BOOLEAN NOT NULL DEFAULT FALSE;
