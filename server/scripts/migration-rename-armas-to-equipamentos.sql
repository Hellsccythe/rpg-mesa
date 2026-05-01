-- ============================================================
-- Migration: renomear tabela armas → equipamentos
--            + adicionar colunas categoria, descricao, pre_requisitos
-- ============================================================
-- Execute este arquivo inteiro no Supabase SQL Editor.
-- É seguro re-executar: usa IF EXISTS / IF NOT EXISTS em tudo.
-- ============================================================

BEGIN;

-- ── 1. Remove tabela equipamentos criada erroneamente (se existir) ────────────
--    (pode ter sido criada por migration anterior com o nome errado)
DROP TABLE IF EXISTS public.equipamentos CASCADE;

-- ── 2. Renomeia armas → equipamentos ─────────────────────────────────────────
ALTER TABLE public.armas RENAME TO equipamentos;

-- ── 3. Renomeia índices existentes ────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'armas_nome_idx') THEN
    ALTER INDEX public.armas_nome_idx RENAME TO equipamentos_nome_idx;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'armas_tipo_idx') THEN
    ALTER INDEX public.armas_tipo_idx RENAME TO equipamentos_tipo_idx;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'armas_deleted_at_idx') THEN
    ALTER INDEX public.armas_deleted_at_idx RENAME TO equipamentos_deleted_at_idx;
  END IF;
END $$;

-- ── 4. Adiciona as novas colunas ──────────────────────────────────────────────
ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS categoria_equipamento VARCHAR(100),
  ADD COLUMN IF NOT EXISTS descricao_equipamento VARCHAR(500),
  ADD COLUMN IF NOT EXISTS pre_requisitos        VARCHAR(300);

-- ── 5. Índice para a nova coluna categoria ────────────────────────────────────
CREATE INDEX IF NOT EXISTS equipamentos_categoria_idx
  ON public.equipamentos (categoria_equipamento);

-- ── 6. Recria o trigger updated_at com o nome correto ────────────────────────
DROP TRIGGER IF EXISTS armas_set_updated_at       ON public.equipamentos;
DROP TRIGGER IF EXISTS equipamentos_set_updated_at ON public.equipamentos;

CREATE TRIGGER equipamentos_set_updated_at
  BEFORE UPDATE ON public.equipamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 7. Atualiza as policies RLS ───────────────────────────────────────────────
-- A policy "armas_select_public" migra junto com a tabela renomeada,
-- mas vamos recriar com o nome correto para manter consistência.
DROP POLICY IF EXISTS "armas_select_public"        ON public.equipamentos;
DROP POLICY IF EXISTS "equipamentos_select_public"  ON public.equipamentos;

CREATE POLICY "equipamentos_select_public"
  ON public.equipamentos
  FOR SELECT
  USING (deleted_at IS NULL);

COMMIT;
