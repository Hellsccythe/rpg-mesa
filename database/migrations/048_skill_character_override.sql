-- Migration 048: overrides de skill por personagem (buff de escalamento individual)
CREATE TABLE skill_character_override (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  skill_name TEXT NOT NULL,
  character_id INTEGER NOT NULL,
  damage_base_override TEXT,
  multiplicador_override VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE(skill_name, character_id)
);
