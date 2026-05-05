-- Migration: corrigir nomes de colunas na tabela racas
-- Renomeia criado_em → created_at e atualizado_em → updated_at
-- para ficar consistente com o restante do projeto e com o serviço.

ALTER TABLE public.racas
  RENAME COLUMN criado_em     TO created_at;

ALTER TABLE public.racas
  RENAME COLUMN atualizado_em TO updated_at;

-- Recria o trigger apontando para a coluna renomeada
DROP TRIGGER IF EXISTS trg_racas_atualizado_em ON public.racas;

CREATE OR REPLACE FUNCTION public.set_racas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_racas_updated_at
  BEFORE UPDATE ON public.racas
  FOR EACH ROW EXECUTE FUNCTION public.set_racas_updated_at();
