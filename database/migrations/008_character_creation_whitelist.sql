-- Migration 008: Tabela character_creation_whitelist
-- Substitui a env var CHARACTER_CREATION_ALLOWED_EMAILS por controle dinâmico via banco.
-- Aplique no Supabase: Dashboard > SQL Editor > New query

BEGIN;

CREATE TABLE IF NOT EXISTS public.character_creation_whitelist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT character_creation_whitelist_email_unique UNIQUE (email)
);

ALTER TABLE public.character_creation_whitelist
  ADD COLUMN IF NOT EXISTS deleted_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.character_creation_whitelist
  ADD COLUMN IF NOT EXISTS updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL;

-- Apenas o service role pode ler/escrever (chamado pelo backend)
ALTER TABLE public.character_creation_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access"
  ON public.character_creation_whitelist
  USING (auth.role() = 'service_role');

COMMIT;
