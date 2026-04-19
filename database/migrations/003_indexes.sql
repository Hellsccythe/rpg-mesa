-- Migration 003: Índices de performance
-- Execute APÓS as migrations 001 e 002.

BEGIN;

-- Extensão necessária para buscas ilike eficientes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =========================
-- characters
-- =========================

-- Busca por nome com ilike (ex: listarMeusPersonagens com filtro.nome)
CREATE INDEX IF NOT EXISTS idx_characters_name_trgm
  ON public.characters USING gin (name gin_trgm_ops);

-- Filtro por range de nível
CREATE INDEX IF NOT EXISTS idx_characters_level
  ON public.characters (level)
  WHERE deleted_at IS NULL;

-- GIN geral no JSONB para queries em data->>'classes', data->>'skills', etc.
CREATE INDEX IF NOT EXISTS idx_characters_data_gin
  ON public.characters USING gin (data);

-- Índice parcial para listarSolicitacoesPendentes (filtra no banco ao invés de em memória)
CREATE INDEX IF NOT EXISTS idx_characters_pending_request
  ON public.characters ((data ? 'pendingChangeRequest'))
  WHERE deleted_at IS NULL AND data ? 'pendingChangeRequest';

-- =========================
-- gods
-- =========================
CREATE INDEX IF NOT EXISTS idx_gods_created_at_desc
  ON public.gods (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_gods_name
  ON public.gods (name)
  WHERE deleted_at IS NULL;

-- =========================
-- city_maps
-- =========================
CREATE INDEX IF NOT EXISTS idx_city_maps_created_at_desc
  ON public.city_maps (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_city_maps_deleted_at
  ON public.city_maps (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- =========================
-- classes
-- =========================
CREATE INDEX IF NOT EXISTS idx_classes_name
  ON public.classes (name)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_classes_deleted_at
  ON public.classes (deleted_at)
  WHERE deleted_at IS NOT NULL;

-- =========================
-- titles
-- =========================
CREATE INDEX IF NOT EXISTS idx_titles_name
  ON public.titles (name)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_titles_deleted_at
  ON public.titles (deleted_at)
  WHERE deleted_at IS NOT NULL;

COMMIT;
