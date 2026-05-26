-- Migration 022: Converter PKs UUID → INTEGER IDENTITY em todas as entity tables
-- ATENÇÃO: Esta migration DESTRÓI os UUIDs existentes nas linhas.
-- IDs antigos em localStorage (idPersonagemAtivo) e qualquer referência cached ficam inválidos.
-- Todos os usuários precisarão logar novamente após esta migration.
--
-- Tabelas afetadas: characters, gods, city_maps, classes, titles,
--                   skills, equipamentos, racas, character_creation_whitelist, lore_notes
--
-- NOTA: colunas deleted_by / created_by / updated_by / user_id que referenciam
--       auth.users(id) PERMANECEM como UUID — só o próprio PK muda.

BEGIN;

-- ─── Função auxiliar: converte PK UUID → INTEGER IDENTITY ──────────────────
-- Uso: SELECT convert_pk_to_serial('public', 'nome_tabela', 'nome_constraint_pkey');
-- Não existe como macro em PL/pgSQL sem dynamic SQL, então repetimos o padrão.

-- ═══════════════════════════════════════════════════════════════════════════
-- characters
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  -- Só executa se id ainda for UUID (idempotente)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'characters'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.characters DROP CONSTRAINT characters_pkey;
    ALTER TABLE public.characters ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.characters DROP COLUMN id;
    ALTER TABLE public.characters RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'characters: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'characters: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- character_creation_whitelist
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'character_creation_whitelist'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.character_creation_whitelist ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.character_creation_whitelist DROP CONSTRAINT character_creation_whitelist_pkey;
    ALTER TABLE public.character_creation_whitelist ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.character_creation_whitelist DROP COLUMN id;
    ALTER TABLE public.character_creation_whitelist RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'character_creation_whitelist: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'character_creation_whitelist: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- gods
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gods'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.gods ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.gods DROP CONSTRAINT gods_pkey;
    ALTER TABLE public.gods ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.gods DROP COLUMN id;
    ALTER TABLE public.gods RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'gods: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'gods: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- city_maps
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'city_maps'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.city_maps ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.city_maps DROP CONSTRAINT city_maps_pkey;
    ALTER TABLE public.city_maps ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.city_maps DROP COLUMN id;
    ALTER TABLE public.city_maps RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'city_maps: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'city_maps: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- classes
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'classes'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.classes ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.classes DROP CONSTRAINT classes_pkey;
    ALTER TABLE public.classes ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.classes DROP COLUMN id;
    ALTER TABLE public.classes RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'classes: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'classes: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- titles
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'titles'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.titles ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.titles DROP CONSTRAINT titles_pkey;
    ALTER TABLE public.titles ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.titles DROP COLUMN id;
    ALTER TABLE public.titles RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'titles: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'titles: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- skills
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'skills'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.skills ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.skills DROP CONSTRAINT skills_pkey;
    ALTER TABLE public.skills ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.skills DROP COLUMN id;
    ALTER TABLE public.skills RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'skills: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'skills: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- equipamentos
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_pkey_name TEXT;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'equipamentos'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    -- Descobre o nome real da constraint de PK (pode ser armas_pkey se a tabela foi renomeada)
    SELECT tc.constraint_name INTO v_pkey_name
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public' AND tc.table_name = 'equipamentos'
      AND tc.constraint_type = 'PRIMARY KEY';

    ALTER TABLE public.equipamentos ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    EXECUTE format('ALTER TABLE public.equipamentos DROP CONSTRAINT %I', v_pkey_name);
    ALTER TABLE public.equipamentos ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.equipamentos DROP COLUMN id;
    ALTER TABLE public.equipamentos RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'equipamentos: PK migrado para INTEGER (constraint antiga: %)', v_pkey_name;
  ELSE
    RAISE NOTICE 'equipamentos: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- racas
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'racas'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.racas ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
    ALTER TABLE public.racas DROP CONSTRAINT racas_pkey;
    ALTER TABLE public.racas ADD PRIMARY KEY (_new_id);
    ALTER TABLE public.racas DROP COLUMN id;
    ALTER TABLE public.racas RENAME COLUMN _new_id TO id;
    RAISE NOTICE 'racas: PK migrado para INTEGER';
  ELSE
    RAISE NOTICE 'racas: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- lore_notes (se existir)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lore_notes') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'lore_notes'
        AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
      ALTER TABLE public.lore_notes ADD COLUMN _new_id INTEGER GENERATED ALWAYS AS IDENTITY;
      ALTER TABLE public.lore_notes DROP CONSTRAINT lore_notes_pkey;
      ALTER TABLE public.lore_notes ADD PRIMARY KEY (_new_id);
      ALTER TABLE public.lore_notes DROP COLUMN id;
      ALTER TABLE public.lore_notes RENAME COLUMN _new_id TO id;
      RAISE NOTICE 'lore_notes: PK migrado para INTEGER';
    END IF;
  END IF;
END $$;

COMMIT;
