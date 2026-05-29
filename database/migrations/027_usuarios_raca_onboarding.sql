-- Migration 027: Tabela usuarios, raca_id em characters, auditoria com email
--
-- 1. Converte created_by / updated_by / deleted_by de UUID → TEXT em todas as tabelas
--    (agora armazena email em vez de UUID, ex: "gm@exemplo.com")
-- 2. Converte revisado_por de UUID → TEXT em character_creation_requests
-- 3. Cria tabela `usuarios` para gerenciamento de contas (GM e player)
-- 4. Adiciona coluna raca_id INTEGER em characters para o onboarding

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1a. Remover FK constraints que referenciam auth.users em created_by /
--     updated_by / deleted_by (impedem a conversão UUID → TEXT)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tc.table_schema, tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON  tc.constraint_name = kcu.constraint_name
      AND tc.table_schema    = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      AND kcu.column_name   IN ('created_by', 'updated_by', 'deleted_by')
    ORDER BY tc.table_name, tc.constraint_name
  ) LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I',
      r.table_schema, r.table_name, r.constraint_name);
    RAISE NOTICE 'FK removida: %.% → %', r.table_schema, r.table_name, r.constraint_name;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1b. Converter created_by / updated_by / deleted_by UUID → TEXT
--     Varredura automática em todas as tabelas do schema public
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name IN ('created_by', 'updated_by', 'deleted_by')
      AND data_type = 'uuid'
    ORDER BY table_name, column_name
  ) LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ALTER COLUMN %I TYPE TEXT USING %I::TEXT',
      r.table_schema, r.table_name, r.column_name, r.column_name
    );
    RAISE NOTICE 'Convertido: %.% | % uuid → text', r.table_name, r.column_name, r.table_schema;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Converter revisado_por UUID → TEXT em character_creation_requests
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Remover FK constraints em revisado_por antes de converter o tipo
  FOR r IN (
    SELECT tc.table_schema, tc.table_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON  tc.constraint_name = kcu.constraint_name
      AND tc.table_schema    = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema    = 'public'
      AND tc.table_name      = 'character_creation_requests'
      AND kcu.column_name    = 'revisado_por'
  ) LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I',
      r.table_schema, r.table_name, r.constraint_name);
    RAISE NOTICE 'FK removida: %.% → %', r.table_schema, r.table_name, r.constraint_name;
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'character_creation_requests'
      AND column_name = 'revisado_por' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.character_creation_requests
      ALTER COLUMN revisado_por TYPE TEXT USING revisado_por::TEXT;
    RAISE NOTICE 'character_creation_requests.revisado_por: uuid → text';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Tabela usuarios
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.usuarios (
  id              INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_user_id    UUID         NOT NULL,
  real_email      TEXT         NOT NULL,
  username        TEXT,
  tipo            TEXT         NOT NULL DEFAULT 'player'
                                 CHECK (tipo IN ('gm', 'player')),
  ativo           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  deleted_by      TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_auth_user_id_uidx
  ON public.usuarios (auth_user_id)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE public.usuarios IS
  'Contas de acesso ao sistema. tipo: gm = mestre, player = jogador. '
  'auth_user_id referencia auth.users(id) por convenção (sem FK).';

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. raca_id em characters
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'characters'
      AND column_name = 'raca_id'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN raca_id INTEGER;
    RAISE NOTICE 'characters.raca_id adicionado';
  ELSE
    RAISE NOTICE 'characters.raca_id já existe, pulando';
  END IF;
END $$;

COMMIT;
