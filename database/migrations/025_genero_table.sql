-- Migration 025: Tabela genero + FK em characters

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Tabela genero
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.genero (
  id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  codigo      VARCHAR(20)  NOT NULL UNIQUE,
  descricao   VARCHAR(50)  NOT NULL,
  pronome     VARCHAR(10)  NOT NULL DEFAULT '',  -- 'Ela', 'Ele', etc.
  created_at  timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE public.genero ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "genero_select_public" ON public.genero;
CREATE POLICY "genero_select_public"
  ON public.genero FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.genero (codigo, descricao, pronome) VALUES
  ('feminino',  'Feminino',  'Ela'),
  ('masculino', 'Masculino', 'Ele'),
  ('outro',     'Outro',     '')
ON CONFLICT (codigo) DO UPDATE
  SET descricao = EXCLUDED.descricao, pronome = EXCLUDED.pronome;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. FK em characters
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS genero_id INTEGER REFERENCES public.genero(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_characters_genero_id ON public.characters (genero_id);

COMMIT;
