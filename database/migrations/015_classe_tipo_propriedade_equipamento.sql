-- Migration 015: Estrutura de classe/tipo/propriedade para equipamentos
-- Cria as tabelas de lookup (classe_equipamento, tipo_equipamento, propriedade_equipamento)
-- Adiciona classe_item em categoria_equipamento
-- Adiciona classe_equipamento_item, tipo_equipamento_item, propriedade_equipamento_item em equipamentos

BEGIN;

-- ── 1. classe_equipamento ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classe_equipamento (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_classe_equipamento_updated_at ON public.classe_equipamento;
CREATE TRIGGER trg_classe_equipamento_updated_at
  BEFORE UPDATE ON public.classe_equipamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.classe_equipamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "classe_equipamento_select_public" ON public.classe_equipamento;
CREATE POLICY "classe_equipamento_select_public"
  ON public.classe_equipamento FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 2. tipo_equipamento (filho de classe) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tipo_equipamento (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  classe_item INTEGER      NOT NULL REFERENCES public.classe_equipamento(item),
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tipo_equipamento_classe
  ON public.tipo_equipamento (classe_item)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_tipo_equipamento_updated_at ON public.tipo_equipamento;
CREATE TRIGGER trg_tipo_equipamento_updated_at
  BEFORE UPDATE ON public.tipo_equipamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.tipo_equipamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tipo_equipamento_select_public" ON public.tipo_equipamento;
CREATE POLICY "tipo_equipamento_select_public"
  ON public.tipo_equipamento FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 3. propriedade_equipamento (filho de classe) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.propriedade_equipamento (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  classe_item INTEGER      NOT NULL REFERENCES public.classe_equipamento(item),
  created_at  timestamptz  NOT NULL DEFAULT now(),
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by  uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_propriedade_equipamento_classe
  ON public.propriedade_equipamento (classe_item)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_propriedade_equipamento_updated_at ON public.propriedade_equipamento;
CREATE TRIGGER trg_propriedade_equipamento_updated_at
  BEFORE UPDATE ON public.propriedade_equipamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.propriedade_equipamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propriedade_equipamento_select_public" ON public.propriedade_equipamento;
CREATE POLICY "propriedade_equipamento_select_public"
  ON public.propriedade_equipamento FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 4. Adicionar classe_item em categoria_equipamento (nullable, dados existentes sem classe) ──
ALTER TABLE public.categoria_equipamento
  ADD COLUMN IF NOT EXISTS classe_item INTEGER NULL REFERENCES public.classe_equipamento(item);

CREATE INDEX IF NOT EXISTS idx_categoria_equipamento_classe
  ON public.categoria_equipamento (classe_item)
  WHERE classe_item IS NOT NULL AND deleted_at IS NULL;

-- ── 5. Novas colunas em equipamentos ──────────────────────────────────────────
ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS classe_equipamento_item     INTEGER   NULL REFERENCES public.classe_equipamento(item),
  ADD COLUMN IF NOT EXISTS tipo_equipamento_item       INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS propriedade_equipamento_item INTEGER[] NOT NULL DEFAULT '{}';

-- tipo passa a ter default vazio (novos registros criados via novo form não precisam do campo legado)
ALTER TABLE public.equipamentos
  ALTER COLUMN tipo SET DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_equipamentos_classe
  ON public.equipamentos (classe_equipamento_item)
  WHERE classe_equipamento_item IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_equipamentos_tipo_item
  ON public.equipamentos USING GIN (tipo_equipamento_item);

CREATE INDEX IF NOT EXISTS idx_equipamentos_propriedade_item
  ON public.equipamentos USING GIN (propriedade_equipamento_item);

COMMIT;
