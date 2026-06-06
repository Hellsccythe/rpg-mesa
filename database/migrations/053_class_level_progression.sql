-- 053: Tabela de progressão de XP por nível de classe
-- Cada linha define o XP necessário para atingir `nivel` em uma classe específica.
-- UNIQUE(classe_id, nivel) garante uma única entrada por nível por classe.

CREATE TABLE IF NOT EXISTS class_level_progression (
  id             INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  classe_id      INTEGER NOT NULL,
  nivel          INTEGER NOT NULL CHECK (nivel >= 1 AND nivel <= 20),
  xp_necessario  INTEGER NOT NULL DEFAULT 0 CHECK (xp_necessario >= 0),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  created_by     TEXT,
  updated_by     TEXT,
  UNIQUE(classe_id, nivel)
);
