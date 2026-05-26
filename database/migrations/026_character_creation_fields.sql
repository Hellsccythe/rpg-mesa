-- Migration 026: Novos campos em characters + tabela character_creation_requests
-- Adiciona: aparencia_fisica, historia_texto, historia_doc_url
-- Cria: character_creation_requests (fila de aprovação pelo mestre)

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Campos extras em characters
-- ═══════════════════════════════════════════════════════════════════════════
-- aparencia_fisica: descrição da aparência (min 30 chars aplicado na app)
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS aparencia_fisica TEXT NULL;

-- historia_texto: campo rico (HTML do TipTap, min 100 chars aplicado na app)
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS historia_texto TEXT NULL;

-- historia_doc_url: URL do arquivo Word/PDF no storage (alternativa ao texto)
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS historia_doc_url TEXT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Tabela character_creation_requests
-- Registra pedidos de criação PENDENTES antes da aprovação do mestre.
-- Após aprovação, os dados são movidos para a tabela characters + auth.users.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.character_creation_requests (
  id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Dados de acesso (pré-criação de conta)
  email           TEXT         NOT NULL,
  username        TEXT         NOT NULL UNIQUE,
  password_hash   TEXT         NOT NULL,  -- bcrypt hash — NUNCA armazenar plain text

  -- Dados do personagem
  nome            TEXT         NOT NULL,
  avatar_url      TEXT         NULL,
  indole_id       INTEGER      NULL REFERENCES public.indole(id) ON DELETE SET NULL,
  genero_id       INTEGER      NULL REFERENCES public.genero(id) ON DELETE SET NULL,
  aparencia_fisica TEXT        NOT NULL,
  historia_texto  TEXT         NULL,
  historia_doc_url TEXT        NULL,

  -- Controle de fluxo
  status          VARCHAR(20)  NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  rejeitado_motivo TEXT        NULL,
  revisado_em     timestamptz  NULL,
  revisado_por    uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Auditoria
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now(),
  deleted_at      timestamptz  NULL,
  deleted_by      uuid         NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ccr_status     ON public.character_creation_requests (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ccr_email      ON public.character_creation_requests (email);
CREATE INDEX IF NOT EXISTS idx_ccr_username   ON public.character_creation_requests (username);
CREATE INDEX IF NOT EXISTS idx_ccr_created_at ON public.character_creation_requests (created_at DESC);

DROP TRIGGER IF EXISTS trg_ccr_updated_at ON public.character_creation_requests;
CREATE TRIGGER trg_ccr_updated_at
  BEFORE UPDATE ON public.character_creation_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

-- RLS: apenas mestre lê/escreve (via service_role no backend)
ALTER TABLE public.character_creation_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ccr_select_master" ON public.character_creation_requests;
CREATE POLICY "ccr_select_master"
  ON public.character_creation_requests FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL
    AND auth.jwt() ->> 'email' = current_setting('app.master_email', true)
  );

COMMIT;
