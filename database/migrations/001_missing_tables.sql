-- Migration 001: Tabelas faltantes — gods, city_maps, classes, titles
-- Aplique no Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- É seguro re-executar: usa IF NOT EXISTS e ADD COLUMN IF NOT EXISTS

BEGIN;

-- Reutiliza a função de trigger já criada em SCHEMA_CURRENT.sql
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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

-- Adiciona colunas faltantes caso a tabela já exista com schema antigo
ALTER TABLE public.gods ADD COLUMN IF NOT EXISTS data       jsonb       NOT NULL DEFAULT '{}';
ALTER TABLE public.gods ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.gods ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;
ALTER TABLE public.gods ADD COLUMN IF NOT EXISTS deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

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

ALTER TABLE public.city_maps ADD COLUMN IF NOT EXISTS data       jsonb       NOT NULL DEFAULT '{}';
ALTER TABLE public.city_maps ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.city_maps ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;
ALTER TABLE public.city_maps ADD COLUMN IF NOT EXISTS deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

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

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

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

ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS deleted_at timestamptz NULL;
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS deleted_by uuid        NULL REFERENCES auth.users(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_titles_updated_at ON public.titles;
CREATE TRIGGER trg_titles_updated_at
  BEFORE UPDATE ON public.titles
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

COMMIT;
