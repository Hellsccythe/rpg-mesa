-- Migration 014: Auditoria completa — created_by, updated_by em todas as tabelas
-- Também adiciona colunas faltantes (deleted_at/deleted_by em skills/lore_notes/whitelist)
-- e RLS de leitura pública para categoria_equipamento.
-- Seguro re-executar (ADD COLUMN IF NOT EXISTS).

BEGIN;

-- ── Colunas de auditoria em characters ──────────────────────────────────────
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Colunas de auditoria em gods ────────────────────────────────────────────
ALTER TABLE public.gods
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Colunas de auditoria em city_maps ───────────────────────────────────────
ALTER TABLE public.city_maps
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Colunas de auditoria em classes ─────────────────────────────────────────
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── Colunas de auditoria em titles ──────────────────────────────────────────
ALTER TABLE public.titles
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── skills: faltava deleted_at/deleted_by + created_by/updated_by ───────────
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── racas ────────────────────────────────────────────────────────────────────
ALTER TABLE public.racas
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── equipamentos ─────────────────────────────────────────────────────────────
ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── lore_notes: faltava deleted_by + created_by/updated_by ──────────────────
ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS deleted_by  uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by  uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── character_creation_whitelist ─────────────────────────────────────────────
ALTER TABLE public.character_creation_whitelist
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── categoria_equipamento: audit completo ────────────────────────────────────
ALTER TABLE public.categoria_equipamento
  ADD COLUMN IF NOT EXISTS created_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz NULL,
  ADD COLUMN IF NOT EXISTS deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS created_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_categoria_equipamento_updated_at ON public.categoria_equipamento;
CREATE TRIGGER trg_categoria_equipamento_updated_at
  BEFORE UPDATE ON public.categoria_equipamento
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- ── RLS: categoria_equipamento — leitura pública ─────────────────────────────
ALTER TABLE public.categoria_equipamento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categoria_equipamento_select_public" ON public.categoria_equipamento;
CREATE POLICY "categoria_equipamento_select_public"
  ON public.categoria_equipamento FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

COMMIT;
