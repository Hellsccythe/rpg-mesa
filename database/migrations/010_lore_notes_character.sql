-- Migration 010: Adiciona character_id em lore_notes para notas específicas por personagem
-- NULL = nota global (visível a todos)
-- UUID = nota visível apenas ao personagem indicado
-- Aplique no Supabase SQL Editor (Dashboard > SQL Editor > New query)

BEGIN;

ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS character_id uuid
    REFERENCES public.characters(id)
    ON DELETE SET NULL;

-- Índice para busca por personagem
CREATE INDEX IF NOT EXISTS idx_lore_notes_character
  ON public.lore_notes (character_id)
  WHERE deleted_at IS NULL;

COMMIT;
