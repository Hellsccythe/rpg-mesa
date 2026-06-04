-- Migration 044: Controle de revelação de classes secretas
-- Uma classe secreta pode ser revelada a APENAS UM personagem por vez (UNIQUE classe_id)
-- Quando o personagem morre, o registro é removido e a classe fica disponível novamente

CREATE TABLE public.classe_secreta_revelada (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  classe_id    INTEGER NOT NULL,
  character_id INTEGER NOT NULL,
  revealed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revealed_by  TEXT,
  UNIQUE (classe_id)
);

ALTER TABLE public.classe_secreta_revelada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "classe_secreta_select_auth"
  ON public.classe_secreta_revelada FOR SELECT
  TO authenticated
  USING (true);
