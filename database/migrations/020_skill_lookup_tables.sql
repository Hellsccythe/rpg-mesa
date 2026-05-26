-- Migration 020: Tabelas de lookup para skills
-- skill_tipo, skill_categoria, skill_tipo_dano
-- Sem FK constraints — referências por convenção de inteiro

BEGIN;

-- ── 1. skill_tipo ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_tipo (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  created_by  uuid         NULL,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  updated_by  uuid         NULL,
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL
);

DROP TRIGGER IF EXISTS trg_skill_tipo_updated_at ON public.skill_tipo;
CREATE TRIGGER trg_skill_tipo_updated_at
  BEFORE UPDATE ON public.skill_tipo
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.skill_tipo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skill_tipo_select_public" ON public.skill_tipo;
CREATE POLICY "skill_tipo_select_public"
  ON public.skill_tipo FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 2. skill_categoria ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_categoria (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  created_by  uuid         NULL,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  updated_by  uuid         NULL,
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL
);

DROP TRIGGER IF EXISTS trg_skill_categoria_updated_at ON public.skill_categoria;
CREATE TRIGGER trg_skill_categoria_updated_at
  BEFORE UPDATE ON public.skill_categoria
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.skill_categoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skill_categoria_select_public" ON public.skill_categoria;
CREATE POLICY "skill_categoria_select_public"
  ON public.skill_categoria FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 3. skill_tipo_dano ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.skill_tipo_dano (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  created_by  uuid         NULL,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  updated_by  uuid         NULL,
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL
);

DROP TRIGGER IF EXISTS trg_skill_tipo_dano_updated_at ON public.skill_tipo_dano;
CREATE TRIGGER trg_skill_tipo_dano_updated_at
  BEFORE UPDATE ON public.skill_tipo_dano
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.skill_tipo_dano ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skill_tipo_dano_select_public" ON public.skill_tipo_dano;
CREATE POLICY "skill_tipo_dano_select_public"
  ON public.skill_tipo_dano FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 4. Novas colunas em skills ────────────────────────────────────────────────
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS skill_tipo_item     INTEGER NULL,
  ADD COLUMN IF NOT EXISTS skill_categoria_item INTEGER NULL,
  ADD COLUMN IF NOT EXISTS skill_tipo_dano_item INTEGER NULL;

COMMIT;
