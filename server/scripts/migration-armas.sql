-- ============================================================
-- Migration: criar tabela armas
-- ============================================================

CREATE TABLE IF NOT EXISTS public.armas (
  id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  nome          VARCHAR(255)    NOT NULL,
  tipo          VARCHAR(100)    NOT NULL,

  -- Dados de combate — aceita notação de dados: 1d8, 2d20+3, 1d6+1d4, etc.
  dano          VARCHAR(60)     NOT NULL,

  -- Peso em kg — até 2 casas decimais (ex: 1.50, 0.75, 12.00)
  peso          NUMERIC(8, 2),

  -- Propriedades (lista de tags: Versátil, Acuidade, etc.)
  propriedades  VARCHAR(500),

  -- Valor em moedas — decimal até 2 casas (ex: 15.00, 0.50, 1500.00)
  valor         NUMERIC(12, 2),

  -- Soft-delete
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID,

  -- Auditoria
  created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ── Índices ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS armas_nome_idx       ON public.armas (nome);
CREATE INDEX IF NOT EXISTS armas_tipo_idx       ON public.armas (tipo);
CREATE INDEX IF NOT EXISTS armas_deleted_at_idx ON public.armas (deleted_at)
  WHERE deleted_at IS NULL;   -- índice parcial: só registros ativos

-- ── Trigger updated_at ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS armas_set_updated_at ON public.armas;
CREATE TRIGGER armas_set_updated_at
  BEFORE UPDATE ON public.armas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE public.armas ENABLE ROW LEVEL SECURITY;

-- Leitura pública (anon + authenticated) para armas não deletadas
CREATE POLICY "armas_select_public"
  ON public.armas
  FOR SELECT
  USING (deleted_at IS NULL);

-- Escrita apenas via service_role (backend usa admin client que ignora RLS)
-- Nenhuma policy de INSERT/UPDATE/DELETE para roles de usuário final.
