-- Migration 034: Tabela de NPCs
-- NPCs têm nome, raça (referência a racas), descrição e imagem

CREATE TABLE public.npcs (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome        VARCHAR(100)  NOT NULL,
  raca_id     INTEGER,
  descricao   TEXT,
  foto_url    TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by  TEXT,
  updated_by  TEXT,
  deleted_at  TIMESTAMPTZ,
  deleted_by  TEXT
);

ALTER TABLE public.npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "npcs_select_master"
  ON public.npcs FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);
