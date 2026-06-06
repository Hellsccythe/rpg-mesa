-- Migration 050: tabela skill_natureza (natureza/papel da skill: Ativa, Passiva, Assinatura...)
-- Padrão lookup: item INTEGER PK, descricao VARCHAR(100), soft delete + auditoria

CREATE TABLE IF NOT EXISTS skill_natureza (
  item        INTEGER PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  TEXT,
  updated_by  TEXT,
  deleted_at  TIMESTAMPTZ,
  deleted_by  TEXT
);

-- Seeds fixos
INSERT INTO skill_natureza (item, descricao) VALUES
  (1, 'Ativa'),
  (2, 'Passiva'),
  (3, 'Assinatura')
ON CONFLICT (item) DO NOTHING;

-- Coluna na tabela skills
ALTER TABLE skills ADD COLUMN IF NOT EXISTS skill_natureza_item INTEGER;
