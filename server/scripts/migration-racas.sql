-- Migration: criar tabela racas
-- Data: 2026-04-30

CREATE TABLE IF NOT EXISTS public.racas (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT          NOT NULL,
  foto_url      TEXT,
  descricao     TEXT,
  lore          TEXT,
  habilidades   JSONB         NOT NULL DEFAULT '[]'::jsonb,
  atributos_bonus JSONB       NOT NULL DEFAULT '[]'::jsonb,
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID          REFERENCES auth.users(id)
);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION public.set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_racas_atualizado_em ON public.racas;
CREATE TRIGGER trg_racas_atualizado_em
  BEFORE UPDATE ON public.racas
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- Índice para soft delete (buscas de registros ativos)
CREATE INDEX IF NOT EXISTS idx_racas_deleted_at ON public.racas (deleted_at)
  WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.racas ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler raças não deletadas
CREATE POLICY "racas_select_authenticated"
  ON public.racas
  FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Apenas service_role (backend) pode inserir/atualizar/deletar
CREATE POLICY "racas_insert_service"
  ON public.racas
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "racas_update_service"
  ON public.racas
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "racas_delete_service"
  ON public.racas
  FOR DELETE
  TO service_role
  USING (true);

-- Comentários nas colunas JSONB para documentação
COMMENT ON COLUMN public.racas.habilidades IS
  'Array de objetos { nome: string, descricao: string }';

COMMENT ON COLUMN public.racas.atributos_bonus IS
  'Array de objetos { atributo: string, valor: string }';
