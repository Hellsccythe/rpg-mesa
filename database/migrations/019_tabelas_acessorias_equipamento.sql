-- Migration 019: Tabelas acessórias de equipamento
-- Hierarquia: equipamento_tipo → categoria_{tipo} → propriedade_{tipo} + classe_{tipo}
-- Sem FK constraints — referências por convenção de inteiro (campo *_item)

BEGIN;

-- ── 1. equipamento_tipo ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipamento_tipo (
  item        INTEGER      PRIMARY KEY,
  descricao   VARCHAR(100) NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now(),
  created_by  uuid         NULL,
  updated_at  timestamptz  NOT NULL DEFAULT now(),
  updated_by  uuid         NULL,
  deleted_at  timestamptz  NULL,
  deleted_by  uuid         NULL
);

DROP TRIGGER IF EXISTS trg_equipamento_tipo_updated_at ON public.equipamento_tipo;
CREATE TRIGGER trg_equipamento_tipo_updated_at
  BEFORE UPDATE ON public.equipamento_tipo
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.equipamento_tipo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipamento_tipo_select_public" ON public.equipamento_tipo;
CREATE POLICY "equipamento_tipo_select_public"
  ON public.equipamento_tipo FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

INSERT INTO public.equipamento_tipo (item, descricao) VALUES
  (1, 'Arma'),
  (2, 'Armadura'),
  (3, 'Variados')
ON CONFLICT (item) DO NOTHING;

-- ── 2. categoria_arma ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categoria_arma (
  item                  INTEGER      PRIMARY KEY,
  descricao             VARCHAR(100) NOT NULL,
  equipamento_tipo_item INTEGER      NULL,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  created_by            uuid         NULL,
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  updated_by            uuid         NULL,
  deleted_at            timestamptz  NULL,
  deleted_by            uuid         NULL
);

DROP TRIGGER IF EXISTS trg_categoria_arma_updated_at ON public.categoria_arma;
CREATE TRIGGER trg_categoria_arma_updated_at
  BEFORE UPDATE ON public.categoria_arma
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.categoria_arma ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categoria_arma_select_public" ON public.categoria_arma;
CREATE POLICY "categoria_arma_select_public"
  ON public.categoria_arma FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 3. categoria_armadura ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categoria_armadura (
  item                  INTEGER      PRIMARY KEY,
  descricao             VARCHAR(100) NOT NULL,
  equipamento_tipo_item INTEGER      NULL,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  created_by            uuid         NULL,
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  updated_by            uuid         NULL,
  deleted_at            timestamptz  NULL,
  deleted_by            uuid         NULL
);

DROP TRIGGER IF EXISTS trg_categoria_armadura_updated_at ON public.categoria_armadura;
CREATE TRIGGER trg_categoria_armadura_updated_at
  BEFORE UPDATE ON public.categoria_armadura
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.categoria_armadura ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categoria_armadura_select_public" ON public.categoria_armadura;
CREATE POLICY "categoria_armadura_select_public"
  ON public.categoria_armadura FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 4. categoria_variados ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categoria_variados (
  item                  INTEGER      PRIMARY KEY,
  descricao             VARCHAR(100) NOT NULL,
  equipamento_tipo_item INTEGER      NULL,
  created_at            timestamptz  NOT NULL DEFAULT now(),
  created_by            uuid         NULL,
  updated_at            timestamptz  NOT NULL DEFAULT now(),
  updated_by            uuid         NULL,
  deleted_at            timestamptz  NULL,
  deleted_by            uuid         NULL
);

DROP TRIGGER IF EXISTS trg_categoria_variados_updated_at ON public.categoria_variados;
CREATE TRIGGER trg_categoria_variados_updated_at
  BEFORE UPDATE ON public.categoria_variados
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.categoria_variados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categoria_variados_select_public" ON public.categoria_variados;
CREATE POLICY "categoria_variados_select_public"
  ON public.categoria_variados FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 5. propriedade_arma ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.propriedade_arma (
  item               INTEGER      PRIMARY KEY,
  descricao          VARCHAR(100) NOT NULL,
  categoria_arma_item INTEGER     NULL,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  created_by         uuid         NULL,
  updated_at         timestamptz  NOT NULL DEFAULT now(),
  updated_by         uuid         NULL,
  deleted_at         timestamptz  NULL,
  deleted_by         uuid         NULL
);

DROP TRIGGER IF EXISTS trg_propriedade_arma_updated_at ON public.propriedade_arma;
CREATE TRIGGER trg_propriedade_arma_updated_at
  BEFORE UPDATE ON public.propriedade_arma
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.propriedade_arma ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propriedade_arma_select_public" ON public.propriedade_arma;
CREATE POLICY "propriedade_arma_select_public"
  ON public.propriedade_arma FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 6. classe_arma ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classe_arma (
  item               INTEGER      PRIMARY KEY,
  descricao          VARCHAR(100) NOT NULL,
  categoria_arma_item INTEGER     NULL,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  created_by         uuid         NULL,
  updated_at         timestamptz  NOT NULL DEFAULT now(),
  updated_by         uuid         NULL,
  deleted_at         timestamptz  NULL,
  deleted_by         uuid         NULL
);

DROP TRIGGER IF EXISTS trg_classe_arma_updated_at ON public.classe_arma;
CREATE TRIGGER trg_classe_arma_updated_at
  BEFORE UPDATE ON public.classe_arma
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.classe_arma ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "classe_arma_select_public" ON public.classe_arma;
CREATE POLICY "classe_arma_select_public"
  ON public.classe_arma FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 7. propriedade_armadura ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.propriedade_armadura (
  item                    INTEGER      PRIMARY KEY,
  descricao               VARCHAR(100) NOT NULL,
  categoria_armadura_item INTEGER      NULL,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  created_by              uuid         NULL,
  updated_at              timestamptz  NOT NULL DEFAULT now(),
  updated_by              uuid         NULL,
  deleted_at              timestamptz  NULL,
  deleted_by              uuid         NULL
);

DROP TRIGGER IF EXISTS trg_propriedade_armadura_updated_at ON public.propriedade_armadura;
CREATE TRIGGER trg_propriedade_armadura_updated_at
  BEFORE UPDATE ON public.propriedade_armadura
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.propriedade_armadura ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propriedade_armadura_select_public" ON public.propriedade_armadura;
CREATE POLICY "propriedade_armadura_select_public"
  ON public.propriedade_armadura FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 8. classe_armadura ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classe_armadura (
  item                    INTEGER      PRIMARY KEY,
  descricao               VARCHAR(100) NOT NULL,
  categoria_armadura_item INTEGER      NULL,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  created_by              uuid         NULL,
  updated_at              timestamptz  NOT NULL DEFAULT now(),
  updated_by              uuid         NULL,
  deleted_at              timestamptz  NULL,
  deleted_by              uuid         NULL
);

DROP TRIGGER IF EXISTS trg_classe_armadura_updated_at ON public.classe_armadura;
CREATE TRIGGER trg_classe_armadura_updated_at
  BEFORE UPDATE ON public.classe_armadura
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.classe_armadura ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "classe_armadura_select_public" ON public.classe_armadura;
CREATE POLICY "classe_armadura_select_public"
  ON public.classe_armadura FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 9. propriedade_variados ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.propriedade_variados (
  item                    INTEGER      PRIMARY KEY,
  descricao               VARCHAR(100) NOT NULL,
  categoria_variados_item INTEGER      NULL,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  created_by              uuid         NULL,
  updated_at              timestamptz  NOT NULL DEFAULT now(),
  updated_by              uuid         NULL,
  deleted_at              timestamptz  NULL,
  deleted_by              uuid         NULL
);

DROP TRIGGER IF EXISTS trg_propriedade_variados_updated_at ON public.propriedade_variados;
CREATE TRIGGER trg_propriedade_variados_updated_at
  BEFORE UPDATE ON public.propriedade_variados
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.propriedade_variados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propriedade_variados_select_public" ON public.propriedade_variados;
CREATE POLICY "propriedade_variados_select_public"
  ON public.propriedade_variados FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ── 10. classe_variados ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classe_variados (
  item                    INTEGER      PRIMARY KEY,
  descricao               VARCHAR(100) NOT NULL,
  categoria_variados_item INTEGER      NULL,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  created_by              uuid         NULL,
  updated_at              timestamptz  NOT NULL DEFAULT now(),
  updated_by              uuid         NULL,
  deleted_at              timestamptz  NULL,
  deleted_by              uuid         NULL
);

DROP TRIGGER IF EXISTS trg_classe_variados_updated_at ON public.classe_variados;
CREATE TRIGGER trg_classe_variados_updated_at
  BEFORE UPDATE ON public.classe_variados
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

ALTER TABLE public.classe_variados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "classe_variados_select_public" ON public.classe_variados;
CREATE POLICY "classe_variados_select_public"
  ON public.classe_variados FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

COMMIT;
