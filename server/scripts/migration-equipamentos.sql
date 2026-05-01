-- ============================================================
-- Migration: criar tabela equipamentos
-- ============================================================
-- Se a tabela ainda não existe, crie-a com todos os campos.
-- Se já existe, execute apenas o bloco ALTER TABLE abaixo.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.equipamentos (
  id                    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  nome                  VARCHAR(255)    NOT NULL,
  tipo                  VARCHAR(100)    NOT NULL,

  -- Campos solicitados no alter table
  categoria_equipamento VARCHAR(100),
  descricao_equipamento VARCHAR(500),
  pre_requisitos        VARCHAR(300),

  -- Dados extras
  peso                  NUMERIC(8, 2),
  valor                 NUMERIC(12, 2),
  propriedades          VARCHAR(500),

  -- Soft-delete
  deleted_at            TIMESTAMPTZ,
  deleted_by            UUID,

  -- Auditoria
  created_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── ALTER TABLE (caso a tabela já exista sem as novas colunas) ────────────────
-- Execute apenas este bloco se a tabela equipamentos já estava criada:

ALTER TABLE public.equipamentos
  ADD COLUMN IF NOT EXISTS categoria_equipamento VARCHAR(100),
  ADD COLUMN IF NOT EXISTS descricao_equipamento VARCHAR(500),
  ADD COLUMN IF NOT EXISTS pre_requisitos        VARCHAR(300);

-- ── Índices ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS equipamentos_nome_idx       ON public.equipamentos (nome);
CREATE INDEX IF NOT EXISTS equipamentos_tipo_idx       ON public.equipamentos (tipo);
CREATE INDEX IF NOT EXISTS equipamentos_categoria_idx  ON public.equipamentos (categoria_equipamento);
CREATE INDEX IF NOT EXISTS equipamentos_deleted_at_idx ON public.equipamentos (deleted_at)
  WHERE deleted_at IS NULL;

-- ── Trigger updated_at ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS equipamentos_set_updated_at ON public.equipamentos;
CREATE TRIGGER equipamentos_set_updated_at
  BEFORE UPDATE ON public.equipamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon + authenticated) para equipamentos não deletados
CREATE POLICY "equipamentos_select_public"
  ON public.equipamentos
  FOR SELECT
  USING (deleted_at IS NULL);

-- Escrita apenas via service_role (backend usa admin client que ignora RLS)
