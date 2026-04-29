-- Migration 011: Adiciona pdf_url à tabela lore_notes
-- Aplique no Supabase SQL Editor (Dashboard > SQL Editor > New query)

BEGIN;

ALTER TABLE public.lore_notes
  ADD COLUMN IF NOT EXISTS pdf_url text;

COMMIT;
