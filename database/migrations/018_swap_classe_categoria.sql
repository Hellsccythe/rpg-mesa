-- Migration 018: Trocar papéis de classe e categoria
-- categoria_equipamento passa a ser o seletor primário (single inteiro)
-- classe_equipamento passa a ser o multi-select secundário (INTEGER[])
-- tipo e propriedade passam a ser filhos de categoria (nova coluna categoria_item)
-- Sem FK constraints — referências livres por convenção de inteiro

BEGIN;

-- ── 1. Adicionar icone em categoria_equipamento ───────────────────────────────
ALTER TABLE public.categoria_equipamento
  ADD COLUMN IF NOT EXISTS icone VARCHAR(60);

-- ── 2. Trocar categoria_equipamento_item: INTEGER[] → INTEGER (single) ────────
ALTER TABLE public.equipamentos
  DROP COLUMN IF EXISTS categoria_equipamento_item;

ALTER TABLE public.equipamentos
  ADD COLUMN categoria_equipamento_item INTEGER NULL;

-- ── 3. Trocar classe_equipamento_item: INTEGER (tinha FK) → INTEGER[] ─────────
DROP INDEX IF EXISTS idx_equipamentos_classe;

-- Remove a constraint FK se existir
ALTER TABLE public.equipamentos
  DROP CONSTRAINT IF EXISTS equipamentos_classe_equipamento_item_fkey;

ALTER TABLE public.equipamentos
  DROP COLUMN IF EXISTS classe_equipamento_item;

ALTER TABLE public.equipamentos
  ADD COLUMN classe_equipamento_item INTEGER[] NOT NULL DEFAULT '{}';

-- ── 4. tipo_equipamento: classe_item vira nullable + adicionar categoria_item ──
ALTER TABLE public.tipo_equipamento
  ALTER COLUMN classe_item DROP NOT NULL;

-- Remove FK de classe_item se existir
ALTER TABLE public.tipo_equipamento
  DROP CONSTRAINT IF EXISTS tipo_equipamento_classe_item_fkey;

ALTER TABLE public.tipo_equipamento
  ADD COLUMN IF NOT EXISTS categoria_item INTEGER NULL;

DROP INDEX IF EXISTS idx_tipo_equipamento_classe;

CREATE INDEX IF NOT EXISTS idx_tipo_equipamento_categoria
  ON public.tipo_equipamento (categoria_item)
  WHERE deleted_at IS NULL;

-- ── 5. propriedade_equipamento: mesmo padrão ──────────────────────────────────
ALTER TABLE public.propriedade_equipamento
  ALTER COLUMN classe_item DROP NOT NULL;

ALTER TABLE public.propriedade_equipamento
  DROP CONSTRAINT IF EXISTS propriedade_equipamento_classe_item_fkey;

ALTER TABLE public.propriedade_equipamento
  ADD COLUMN IF NOT EXISTS categoria_item INTEGER NULL;

DROP INDEX IF EXISTS idx_propriedade_equipamento_classe;

CREATE INDEX IF NOT EXISTS idx_propriedade_equipamento_categoria
  ON public.propriedade_equipamento (categoria_item)
  WHERE deleted_at IS NULL;

-- ── 6. Novos índices ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_equipamentos_categoria_single
  ON public.equipamentos (categoria_equipamento_item)
  WHERE categoria_equipamento_item IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_equipamentos_classe_array
  ON public.equipamentos USING GIN (classe_equipamento_item);

COMMIT;
