-- Schema alinhado ao uso atual do backend.
-- Tabelas: public.characters e public.character_creation_whitelist

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- characters
-- =========================
CREATE TABLE IF NOT EXISTS public.characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NULL,
  name text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  avatar_url text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  deleted_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters (user_id);
CREATE INDEX IF NOT EXISTS idx_characters_campaign_id ON public.characters (campaign_id);
CREATE INDEX IF NOT EXISTS idx_characters_deleted_at ON public.characters (deleted_at);
CREATE INDEX IF NOT EXISTS idx_characters_created_at_desc ON public.characters (created_at DESC);

-- =========================
-- character_creation_whitelist
-- =========================
CREATE TABLE IF NOT EXISTS public.character_creation_whitelist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz NULL,
  deleted_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT character_creation_whitelist_email_not_empty CHECK (length(trim(email)) > 3)
);

CREATE INDEX IF NOT EXISTS idx_character_creation_whitelist_deleted_at
  ON public.character_creation_whitelist (deleted_at);

CREATE INDEX IF NOT EXISTS idx_character_creation_whitelist_created_at_desc
  ON public.character_creation_whitelist (created_at DESC);

-- =========================
-- Trigger updated_at
-- =========================
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_characters_updated_at ON public.characters;
CREATE TRIGGER trg_characters_updated_at
BEFORE UPDATE ON public.characters
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_character_creation_whitelist_updated_at
  ON public.character_creation_whitelist;
CREATE TRIGGER trg_character_creation_whitelist_updated_at
BEFORE UPDATE ON public.character_creation_whitelist
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();

-- RLS habilitado; service role bypassa RLS no backend.
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_creation_whitelist ENABLE ROW LEVEL SECURITY;

COMMIT;
