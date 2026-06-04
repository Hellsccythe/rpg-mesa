-- Migration 039: Bônus de atributos nos passados
-- Estrutura: {"aura": 0, "forca": 2, "destreza": -1, "resistencia": 0, "inteligencia": 1}
-- null = passado sem bônus de atributo

ALTER TABLE public.passados
  ADD COLUMN IF NOT EXISTS atributo_bonus JSONB DEFAULT NULL;
