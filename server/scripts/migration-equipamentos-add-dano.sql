-- Migration: adicionar coluna dano na tabela equipamentos
-- O serviço referencia essa coluna mas ela nao estava na migration original.

ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS dano VARCHAR(60);

COMMENT ON COLUMN public.equipamentos.dano IS
  'Notacao de dados (ex: 1d8, 2d6+3). Apenas para armas/itens que causam dano.';
