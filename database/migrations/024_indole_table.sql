-- Migration 024: Tabela indole — lookup unificado para characters e gods
-- Valores unificam IndoleEnum (characters) e INDOLE_OPTIONS (gods) num único conjunto.
-- gods.data.indole (string livre) → gods.indole_id (FK INTEGER)
-- characters.data.indole (string enum) → characters.indole_id (FK INTEGER)

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Tabela indole
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.indole (
  id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo      VARCHAR(20)  NOT NULL UNIQUE,   -- chave programática para filtros
  descricao   VARCHAR(100) NOT NULL,           -- label nos dropdowns
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- RLS: leitura pública
ALTER TABLE public.indole ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "indole_select_public" ON public.indole;
CREATE POLICY "indole_select_public"
  ON public.indole FOR SELECT
  TO anon, authenticated
  USING (true);

-- Seed (idempotente via ON CONFLICT)
INSERT INTO public.indole (codigo, descricao) VALUES
  ('bom',         'Bom/Boa'),
  ('neutro-bom',  'Neutro Bom'),
  ('neutro',      'Neutro'),
  ('neutro-ruim', 'Neutro Maligno'),
  ('ruim',        'Maligno/Maligna')
ON CONFLICT (codigo) DO UPDATE SET descricao = EXCLUDED.descricao;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. FK em characters
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS indole_id INTEGER REFERENCES public.indole(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_characters_indole_id ON public.characters (indole_id);

-- Migrar dados de data->>'indole' para indole_id
UPDATE public.characters c
SET indole_id = i.id
FROM public.indole i
WHERE c.indole_id IS NULL
  AND c.data->>'indole' IS NOT NULL
  AND i.codigo = c.data->>'indole';

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FK em gods
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.gods
  ADD COLUMN IF NOT EXISTS indole_id INTEGER REFERENCES public.indole(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_gods_indole_id ON public.gods (indole_id);

-- Migrar gods.data->indole (strings display como 'Bom/Boa', 'Neutro', etc.)
-- Mapeamento dos valores históricos de INDOLE_OPTIONS → codigo
UPDATE public.gods g
SET indole_id = i.id
FROM public.indole i
WHERE g.indole_id IS NULL
  AND (
    (g.data->>'indole' ILIKE '%bom%' AND g.data->>'indole' NOT ILIKE '%neutro%' AND i.codigo = 'bom')
    OR (g.data->>'indole' ILIKE 'neutro bom%' AND i.codigo = 'neutro-bom')
    OR (g.data->>'indole' ILIKE 'neutro%' AND g.data->>'indole' NOT ILIKE '%bom%' AND g.data->>'indole' NOT ILIKE '%maligno%' AND i.codigo = 'neutro')
    OR (g.data->>'indole' ILIKE 'neutro%maligno%' AND i.codigo = 'neutro-ruim')
    OR (g.data->>'indole' ILIKE 'maligno%' AND g.data->>'indole' NOT ILIKE '%neutro%' AND i.codigo = 'ruim')
  );

COMMIT;
