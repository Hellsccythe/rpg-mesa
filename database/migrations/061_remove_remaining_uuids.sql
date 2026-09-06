-- Migration 061: Remover UUIDs remanescentes (pós-migração Supabase -> Postgres puro)
-- Fecha o trabalho iniciado nas migrations 022-023 (UUID -> INTEGER IDENTITY),
-- que na época não cobriu campaigns (criada depois, migration 056) nem os
-- vínculos com auth.users do Supabase (schema que deixou de existir no projeto).
--
-- Tabelas afetadas: campaigns (PK), campaign_gms, character_creation_requests,
--                   characters (campaign_id e user_id), usuarios (auth_user_id)
--
-- PRÉ-REQUISITO: characters.user_id só pode conter UUIDs que também existam em
-- usuarios.auth_user_id. Personagens órfãos (sem usuário correspondente) devem
-- ser resolvidos manualmente ANTES de rodar esta migration — o passo 2 aborta
-- com EXCEPTION se encontrar algum, para não perder dado silenciosamente.

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1) campaigns.id UUID -> INTEGER IDENTITY (com atualização das referências)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'campaigns'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.campaigns ADD COLUMN new_id INTEGER GENERATED ALWAYS AS IDENTITY;

    ALTER TABLE public.campaign_gms ADD COLUMN new_campaign_id INTEGER;
    UPDATE public.campaign_gms cg
      SET new_campaign_id = c.new_id
      FROM public.campaigns c
      WHERE cg.campaign_id = c.id;

    ALTER TABLE public.character_creation_requests ADD COLUMN new_campaign_id INTEGER;
    UPDATE public.character_creation_requests ccr
      SET new_campaign_id = c.new_id
      FROM public.campaigns c
      WHERE ccr.campaign_id = c.id;

    ALTER TABLE public.characters ADD COLUMN new_campaign_id INTEGER;
    UPDATE public.characters ch
      SET new_campaign_id = c.new_id
      FROM public.campaigns c
      WHERE ch.campaign_id = c.id;

    ALTER TABLE public.campaigns DROP CONSTRAINT campaigns_pkey;
    ALTER TABLE public.campaigns ADD PRIMARY KEY (new_id);
    ALTER TABLE public.campaigns DROP COLUMN id;
    ALTER TABLE public.campaigns RENAME COLUMN new_id TO id;

    ALTER TABLE public.campaign_gms DROP COLUMN campaign_id;
    ALTER TABLE public.campaign_gms RENAME COLUMN new_campaign_id TO campaign_id;
    ALTER TABLE public.campaign_gms ALTER COLUMN campaign_id SET NOT NULL;

    ALTER TABLE public.character_creation_requests DROP COLUMN campaign_id;
    ALTER TABLE public.character_creation_requests RENAME COLUMN new_campaign_id TO campaign_id;

    ALTER TABLE public.characters DROP COLUMN campaign_id;
    ALTER TABLE public.characters RENAME COLUMN new_campaign_id TO campaign_id;

    RAISE NOTICE 'campaigns: PK migrado para INTEGER, referências atualizadas';
  ELSE
    RAISE NOTICE 'campaigns: PK já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2) Remove policies de RLS em characters que dependem de user_id (do Supabase
--    Auth, baseadas em auth.uid() — não fazem mais sentido em Postgres puro,
--    já estavam previstas para remoção na limpeza pós-migração; sem isso o
--    ALTER TABLE ... DROP COLUMN user_id do passo 3 nem consegue rodar)
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'characters'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.characters', pol.policyname);
  END LOOP;
  ALTER TABLE public.characters DISABLE ROW LEVEL SECURITY;
  RAISE NOTICE 'characters: policies de RLS removidas, RLS desabilitado';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3) characters.user_id: UUID (auth.users do Supabase, extinto) -> INTEGER
--    referenciando usuarios.id, usando usuarios.auth_user_id como ponte
-- ═══════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'characters'
      AND column_name = 'user_id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.characters ADD COLUMN new_user_id INTEGER;

    UPDATE public.characters ch
      SET new_user_id = u.id
      FROM public.usuarios u
      WHERE u.auth_user_id = ch.user_id;

    IF EXISTS (SELECT 1 FROM public.characters WHERE new_user_id IS NULL) THEN
      RAISE EXCEPTION 'Existem characters.user_id sem usuarios.auth_user_id correspondente — resolva manualmente antes de continuar';
    END IF;

    ALTER TABLE public.characters ALTER COLUMN new_user_id SET NOT NULL;
    ALTER TABLE public.characters DROP COLUMN user_id;
    ALTER TABLE public.characters RENAME COLUMN new_user_id TO user_id;

    RAISE NOTICE 'characters.user_id: migrado de UUID (auth.users) para INTEGER (usuarios.id)';
  ELSE
    RAISE NOTICE 'characters.user_id: já é INTEGER, pulando';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4) usuarios.auth_user_id: dropar (referência morta ao auth.users do Supabase)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS auth_user_id;

COMMIT;
