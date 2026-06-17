-- Migration 057: GMs por campanha
-- Vincula emails de GM a campanhas específicas.
-- MASTER_EMAILS continua como super-admin global (acesso a tudo).
-- GMs de mundo são emails registrados aqui, com acesso restrito à campanha.

CREATE TABLE IF NOT EXISTS campaign_gms (
  id          SERIAL PRIMARY KEY,
  campaign_id UUID NOT NULL,   -- referência a campaigns.id por convenção
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  TEXT,
  UNIQUE(campaign_id, email)
);

-- Sem RLS de SELECT público — acesso via service_role (admin client)
ALTER TABLE campaign_gms ENABLE ROW LEVEL SECURITY;
