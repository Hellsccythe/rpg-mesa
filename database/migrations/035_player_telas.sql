-- Migration 035: Controle de acesso por player às telas do menu
-- character_id referencia characters.id por convenção de inteiro (sem FK)

CREATE TABLE public.player_telas (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  character_id INTEGER NOT NULL,
  tela         TEXT    NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   TEXT,
  UNIQUE (character_id, tela)
);

ALTER TABLE public.player_telas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_telas_select_auth"
  ON public.player_telas FOR SELECT
  TO authenticated
  USING (true);
