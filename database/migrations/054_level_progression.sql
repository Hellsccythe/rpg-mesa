-- Migration 054: tabela level_progression (XP de personagem, independente de classe)
-- Cada linha define o XP necessário para o personagem atingir um determinado nível geral.
-- Semelhante a class_level_progression, mas sem classe_id.

CREATE TABLE IF NOT EXISTS level_progression (
  id             INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nivel          INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 20),
  xp_necessario  INTEGER NOT NULL DEFAULT 0 CHECK (xp_necessario >= 0),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  created_by     TEXT,
  updated_by     TEXT,
  UNIQUE(nivel)
);

-- RLS: leitura pública, escrita via service_role
ALTER TABLE level_progression ENABLE ROW LEVEL SECURITY;

CREATE POLICY "level_progression_select_public"
  ON level_progression FOR SELECT
  USING (true);
