-- Migration 016
-- 1. Remove colunas legadas 'tipo' e 'propriedades' de equipamentos
--    (substituídas por tipo_equipamento_item[] e propriedade_equipamento_item[])
-- 2. Adiciona coluna 'icone' em classe_equipamento para identificação visual

BEGIN;

-- ── 1. Remover colunas legadas de equipamentos ────────────────────────────────
ALTER TABLE public.equipamentos
  DROP COLUMN IF EXISTS tipo,
  DROP COLUMN IF EXISTS propriedades;

-- ── 2. Adicionar ícone emoji em classe_equipamento ───────────────────────────
ALTER TABLE public.classe_equipamento
  ADD COLUMN IF NOT EXISTS icone VARCHAR(10) NULL;

COMMIT;
