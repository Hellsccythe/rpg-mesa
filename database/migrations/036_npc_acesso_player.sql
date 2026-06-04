-- Migration 036: Controle de acesso por player a NPCs específicos
-- npc_id referencia npcs.id; character_id referencia characters.id — ambos por convenção

CREATE TABLE public.npc_acesso_player (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  npc_id       INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by   TEXT,
  UNIQUE (npc_id, character_id)
);

ALTER TABLE public.npc_acesso_player ENABLE ROW LEVEL SECURITY;

CREATE POLICY "npc_acesso_select_auth"
  ON public.npc_acesso_player FOR SELECT
  TO authenticated
  USING (true);
