-- Migration 002: RLS Policies para todas as tabelas
-- Execute APÓS a migration 001.
-- Contexto: backend usa service_role (bypassa RLS). Policies protegem acesso direto ao banco.

BEGIN;

-- =========================
-- Habilita RLS nas novas tabelas
-- =========================
ALTER TABLE public.gods      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.titles    ENABLE ROW LEVEL SECURITY;

-- =========================
-- characters: jogador gerencia apenas seus próprios personagens
-- =========================
DROP POLICY IF EXISTS "characters_select_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_select_master" ON public.characters;
DROP POLICY IF EXISTS "characters_insert_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_update_own"    ON public.characters;
DROP POLICY IF EXISTS "characters_delete_own"    ON public.characters;

CREATE POLICY "characters_select_own"
  ON public.characters FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Mestre (email configurado via app.master_email) vê todos
CREATE POLICY "characters_select_master"
  ON public.characters FOR SELECT
  USING (
    deleted_at IS NULL
    AND auth.jwt() ->> 'email' = current_setting('app.master_email', true)
  );

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "characters_update_own"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "characters_delete_own"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- =========================
-- character_creation_whitelist: apenas leitura para autenticados
-- =========================
DROP POLICY IF EXISTS "whitelist_select_authenticated" ON public.character_creation_whitelist;

CREATE POLICY "whitelist_select_authenticated"
  ON public.character_creation_whitelist FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Escrita gerenciada exclusivamente pelo service_role (backend)

-- =========================
-- gods: leitura pública (anon + authenticated); escrita via service_role
-- =========================
DROP POLICY IF EXISTS "gods_select_public" ON public.gods;

CREATE POLICY "gods_select_public"
  ON public.gods FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- =========================
-- city_maps: leitura para autenticados; escrita via service_role
-- =========================
DROP POLICY IF EXISTS "city_maps_select_authenticated" ON public.city_maps;

CREATE POLICY "city_maps_select_authenticated"
  ON public.city_maps FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- =========================
-- classes: leitura pública (jogadores precisam ver classes disponíveis)
-- =========================
DROP POLICY IF EXISTS "classes_select_public" ON public.classes;

CREATE POLICY "classes_select_public"
  ON public.classes FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

-- =========================
-- titles: leitura pública (jogadores precisam ver títulos disponíveis)
-- =========================
DROP POLICY IF EXISTS "titles_select_public" ON public.titles;

CREATE POLICY "titles_select_public"
  ON public.titles FOR SELECT
  TO anon, authenticated
  USING (deleted_at IS NULL);

COMMIT;
