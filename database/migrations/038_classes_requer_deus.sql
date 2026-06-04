-- Migration 038: Campo requer_deus na tabela classes
-- Quando true, o player obrigatoriamente deve escolher um deus no onboarding

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS requer_deus BOOLEAN NOT NULL DEFAULT FALSE;
