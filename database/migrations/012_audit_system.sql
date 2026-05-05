-- Migration 012: Sistema de auditoria
-- Garante que todas as tabelas têm created_at, updated_at e trigger automático.
-- Seguro re-executar (usa IF NOT EXISTS e ADD COLUMN IF NOT EXISTS).

BEGIN;

-- ── Função universal de updated_at ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── characters ───────────────────────────────────────────────────────────────
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_characters_updated_at ON public.characters;
CREATE TRIGGER trg_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── gods ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.gods
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_gods_updated_at ON public.gods;
CREATE TRIGGER trg_gods_updated_at
  BEFORE UPDATE ON public.gods
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── city_maps ─────────────────────────────────────────────────────────────────
ALTER TABLE public.city_maps
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_city_maps_updated_at ON public.city_maps;
CREATE TRIGGER trg_city_maps_updated_at
  BEFORE UPDATE ON public.city_maps
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── classes ───────────────────────────────────────────────────────────────────
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_classes_updated_at ON public.classes;
CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── titles ────────────────────────────────────────────────────────────────────
ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_titles_updated_at ON public.titles;
CREATE TRIGGER trg_titles_updated_at
  BEFORE UPDATE ON public.titles
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── skills ────────────────────────────────────────────────────────────────────
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── racas ─────────────────────────────────────────────────────────────────────
-- Nota: colunas já renomeadas de criado_em/atualizado_em em migration anterior.
ALTER TABLE public.racas
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_racas_updated_at ON public.racas;
CREATE TRIGGER trg_racas_updated_at
  BEFORE UPDATE ON public.racas
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── equipamentos ──────────────────────────────────────────────────────────────
ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_equipamentos_updated_at ON public.equipamentos;
CREATE TRIGGER trg_equipamentos_updated_at
  BEFORE UPDATE ON public.equipamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── lore_notes ────────────────────────────────────────────────────────────────
ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_lore_notes_updated_at ON public.lore_notes;
CREATE TRIGGER trg_lore_notes_updated_at
  BEFORE UPDATE ON public.lore_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── character_creation_whitelist ──────────────────────────────────────────────
ALTER TABLE public.character_creation_whitelist
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_whitelist_updated_at ON public.character_creation_whitelist;
CREATE TRIGGER trg_whitelist_updated_at
  BEFORE UPDATE ON public.character_creation_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

COMMIT;
