-- Migration 032: Tabela de Passados
-- Passados são origens/históricos do personagem que podem conceder skills e títulos

CREATE TABLE public.passados (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome        VARCHAR(100)  NOT NULL,
  descricao   TEXT,
  foto_url    TEXT,
  skill_ids   INTEGER[]     NOT NULL DEFAULT '{}',
  titulo_ids  INTEGER[]     NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_by  TEXT,
  updated_by  TEXT,
  deleted_at  TIMESTAMPTZ,
  deleted_by  TEXT
);

ALTER TABLE public.passados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passados_select_public"
  ON public.passados FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);
