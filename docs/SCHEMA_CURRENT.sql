-- Schema completo do banco RPG de Mesa
-- Gerado em: 2026-04-19
-- Para aplicar do zero: execute este arquivo no Supabase SQL Editor.
-- Para atualizar um banco existente: execute as migrations em database/migrations/ em ordem.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================
-- Função de trigger para updated_at
-- =========================
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================
-- characters
-- =========================
CREATE TABLE IF NOT EXISTS public.characters (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid        NULL,
  name        text        NOT NULL,
  level       integer     NOT NULL DEFAULT 1 CHECK (level >= 1),
  data        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  avatar_url  text        NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL,
  deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_characters_user_id        ON public.characters (user_id);
CREATE INDEX IF NOT EXISTS idx_characters_campaign_id    ON public.characters (campaign_id);
CREATE INDEX IF NOT EXISTS idx_characters_deleted_at     ON public.characters (deleted_at);
CREATE INDEX IF NOT EXISTS idx_characters_created_at_desc ON public.characters (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_characters_name_trgm      ON public.characters USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_characters_level          ON public.characters (level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_characters_data_gin       ON public.characters USING gin (data);
CREATE INDEX IF NOT EXISTS idx_characters_pending_request
  ON public.characters ((data ? 'pendingChangeRequest'))
  WHERE deleted_at IS NULL AND data ? 'pendingChangeRequest';

DROP TRIGGER IF EXISTS trg_characters_updated_at ON public.characters;
CREATE TRIGGER trg_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- character_creation_whitelist
-- =========================
CREATE TABLE IF NOT EXISTS public.character_creation_whitelist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz NULL,
  deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT character_creation_whitelist_email_not_empty CHECK (length(trim(email)) > 3)
);

CREATE INDEX IF NOT EXISTS idx_character_creation_whitelist_deleted_at
  ON public.character_creation_whitelist (deleted_at);
CREATE INDEX IF NOT EXISTS idx_character_creation_whitelist_created_at_desc
  ON public.character_creation_whitelist (created_at DESC);

DROP TRIGGER IF EXISTS trg_character_creation_whitelist_updated_at ON public.character_creation_whitelist;
CREATE TRIGGER trg_character_creation_whitelist_updated_at
  BEFORE UPDATE ON public.character_creation_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- gods
-- =========================
CREATE TABLE IF NOT EXISTS public.gods (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text        NOT NULL DEFAULT '',
  data        jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL,
  deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gods_created_at_desc ON public.gods (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_gods_name            ON public.gods (name) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS trg_gods_updated_at ON public.gods;
CREATE TRIGGER trg_gods_updated_at
  BEFORE UPDATE ON public.gods
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- city_maps
-- =========================
CREATE TABLE IF NOT EXISTS public.city_maps (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  map_reference text        NOT NULL,
  description   text        NOT NULL DEFAULT '',
  data          jsonb       NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz NULL,
  deleted_by    uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_city_maps_created_at_desc ON public.city_maps (created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_city_maps_deleted_at      ON public.city_maps (deleted_at) WHERE deleted_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_city_maps_updated_at ON public.city_maps;
CREATE TRIGGER trg_city_maps_updated_at
  BEFORE UPDATE ON public.city_maps
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- classes
-- =========================
CREATE TABLE IF NOT EXISTS public.classes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  tier        text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  max_level   integer     NOT NULL DEFAULT 20 CHECK (max_level >= 1),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL,
  deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_classes_name       ON public.classes (name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_classes_deleted_at ON public.classes (deleted_at) WHERE deleted_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_classes_updated_at ON public.classes;
CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- titles
-- =========================
CREATE TABLE IF NOT EXISTS public.titles (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  tier        text        NOT NULL DEFAULT '',
  description text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz NULL,
  deleted_by  uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_titles_name       ON public.titles (name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_titles_deleted_at ON public.titles (deleted_at) WHERE deleted_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_titles_updated_at ON public.titles;
CREATE TRIGGER trg_titles_updated_at
  BEFORE UPDATE ON public.titles
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- =========================
-- RLS
-- =========================
ALTER TABLE public.characters                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_creation_whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gods                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_maps                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles                      ENABLE ROW LEVEL SECURITY;

-- characters
DROP POLICY IF EXISTS "characters_select_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_select_master" ON public.characters;
DROP POLICY IF EXISTS "characters_insert_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_update_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_delete_own"    ON public.characters;

CREATE POLICY "characters_select_own"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "characters_select_master"
  ON public.characters FOR SELECT
  USING (
    deleted_at IS NULL
    AND auth.jwt() ->> 'email' = current_setting('app.master_email', true)
  );

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_update_own"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "characters_delete_own"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- character_creation_whitelist
DROP POLICY IF EXISTS "whitelist_select_authenticated" ON public.character_creation_whitelist;
CREATE POLICY "whitelist_select_authenticated"
  ON public.character_creation_whitelist FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- gods
DROP POLICY IF EXISTS "gods_select_public" ON public.gods;
CREATE POLICY "gods_select_public"
  ON public.gods FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- city_maps
DROP POLICY IF EXISTS "city_maps_select_authenticated" ON public.city_maps;
CREATE POLICY "city_maps_select_authenticated"
  ON public.city_maps FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- classes
DROP POLICY IF EXISTS "classes_select_public" ON public.classes;
CREATE POLICY "classes_select_public"
  ON public.classes FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- titles
DROP POLICY IF EXISTS "titles_select_public" ON public.titles;
CREATE POLICY "titles_select_public"
  ON public.titles FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

COMMIT;
