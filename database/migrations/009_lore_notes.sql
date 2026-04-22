-- Migration 009: Tabela lore_notes — documentos de lore criados pelo mestre
-- Aplique no Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- É seguro re-executar: usa IF NOT EXISTS

BEGIN;

CREATE TABLE IF NOT EXISTS public.lore_notes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  subtitle    text,
  content     text        NOT NULL DEFAULT '',
  ordem       integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- Trigger para atualizar updated_at automaticamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'set_lore_notes_updated_at'
      AND event_object_table = 'lore_notes'
  ) THEN
    CREATE TRIGGER set_lore_notes_updated_at
      BEFORE UPDATE ON public.lore_notes
      FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();
  END IF;
END $$;

-- Índice de listagem
CREATE INDEX IF NOT EXISTS idx_lore_notes_active
  ON public.lore_notes (ordem, created_at)
  WHERE deleted_at IS NULL;

COMMIT;
