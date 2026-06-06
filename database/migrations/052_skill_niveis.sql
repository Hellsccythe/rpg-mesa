-- Sprint 4: níveis de skill (2 e 3) com multiplicador e overrides
CREATE TABLE IF NOT EXISTS skill_niveis (
  id                           INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  skill_id                     INTEGER NOT NULL,
  nivel                        INTEGER NOT NULL CHECK (nivel IN (2, 3)),

  -- Nível 2: apenas multiplicador de dano (% sobre dano base, ex: 150 = 150%)
  damage_multiplier_pct        INTEGER,

  -- Nível 3: overrides completos da skill
  nome_override                VARCHAR(100),
  damage_base_override         TEXT,
  multiplicador_override       VARCHAR(60),
  effect_description_override  VARCHAR(500),

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  TEXT,
  updated_by  TEXT,

  UNIQUE(skill_id, nivel)
);
