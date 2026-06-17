-- Migration 056: Tabela de campanhas (mundos)
-- Cada campanha é um "mundo" independente com seus próprios personagens.
-- campaign_id em characters (UUID) referencia campaigns.id por convenção.

CREATE TABLE IF NOT EXISTS campaigns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(60)  UNIQUE NOT NULL,
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  cover_image_url TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      TEXT,
  updated_by      TEXT,
  deleted_at      TIMESTAMPTZ,
  deleted_by      TEXT
);

-- SELECT público: campanhas ativas e não deletadas
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campanhas_select_public" ON campaigns
  FOR SELECT USING (deleted_at IS NULL AND is_active = TRUE);
