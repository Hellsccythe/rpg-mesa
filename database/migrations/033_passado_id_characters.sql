-- Migration 033: Adiciona passado_id à tabela characters
-- Referência por convenção de inteiro (sem FK constraint)

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS passado_id INTEGER DEFAULT NULL;
