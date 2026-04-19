-- Migration 004: adiciona coluna deleted_by na tabela characters
-- Execute no Supabase SQL Editor se a coluna ainda não existir.

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS deleted_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;
