-- Migration 023: Converter colunas item INTEGER (manual MAX+1) → SERIAL automático
-- Cria sequence para cada lookup table e define como DEFAULT da coluna item.
-- Seguro re-executar: usa CREATE SEQUENCE IF NOT EXISTS.

BEGIN;

-- ─── Função auxiliar interna ────────────────────────────────────────────────
-- Para cada tabela: cria sequence, ajusta ao valor máximo existente, seta como default.

DO $$
DECLARE
  r RECORD;
  seq_name TEXT;
  max_val  INTEGER;
  tables   TEXT[] := ARRAY[
    'categoria_equipamento',
    'classe_equipamento',
    'tipo_equipamento',
    'propriedade_equipamento',
    'equipamento_tipo',
    'categoria_arma',
    'propriedade_arma',
    'classe_arma',
    'categoria_armadura',
    'propriedade_armadura',
    'classe_armadura',
    'categoria_variados',
    'propriedade_variados',
    'classe_variados',
    'skill_tipo',
    'skill_categoria',
    'skill_tipo_dano'
  ];
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    -- Verifica se a tabela existe
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      RAISE NOTICE 'Tabela % não existe, pulando', tbl;
      CONTINUE;
    END IF;

    -- Verifica se item já tem default de sequence
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl
        AND column_name = 'item'
        AND column_default LIKE 'nextval%'
    ) THEN
      RAISE NOTICE '% já tem sequence, pulando', tbl;
      CONTINUE;
    END IF;

    seq_name := 'public.' || tbl || '_item_seq';

    -- Cria sequence
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS %s', seq_name);

    -- Ajusta ao valor máximo existente + 1
    EXECUTE format(
      'SELECT COALESCE(MAX(item), 0) + 1 FROM public.%I',
      tbl
    ) INTO max_val;
    EXECUTE format('SELECT setval(%L, %s, false)', seq_name, max_val);

    -- Define como DEFAULT da coluna item
    EXECUTE format(
      'ALTER TABLE public.%I ALTER COLUMN item SET DEFAULT nextval(%L)',
      tbl, seq_name
    );

    -- Garante que a sequence pertence à coluna (drop cascade seguro)
    EXECUTE format(
      'ALTER SEQUENCE %s OWNED BY public.%I.item',
      seq_name, tbl
    );

    RAISE NOTICE '%: sequence criada e configurada (próximo = %)', tbl, max_val;
  END LOOP;
END $$;

COMMIT;
