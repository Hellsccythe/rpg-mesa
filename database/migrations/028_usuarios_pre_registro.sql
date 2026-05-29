-- Migration 028: auth_user_id opcional em usuarios, migrar whitelist, seed GMs
--
-- 1. Torna auth_user_id nullable — pré-registros ainda não têm conta no Auth
-- 2. Migra emails ativos da character_creation_whitelist → usuarios (tipo=player)
-- 3. Insere contas GM existentes em auth.users (por email) em usuarios

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. auth_user_id opcional
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.usuarios ALTER COLUMN auth_user_id DROP NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. Migrar emails da whitelist que ainda não estão em usuarios
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.usuarios (real_email, tipo, ativo, created_at, updated_at)
SELECT DISTINCT w.email, 'player', TRUE, NOW(), NOW()
FROM public.character_creation_whitelist w
WHERE w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.real_email = w.email
      AND u.deleted_at IS NULL
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. Inserir GMs a partir de auth.users (apenas os que ainda não existem)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO public.usuarios (auth_user_id, real_email, tipo, ativo, created_at, updated_at)
SELECT au.id, au.email, 'gm', TRUE, NOW(), NOW()
FROM auth.users au
WHERE au.email IN ('gustakingx666x@gmail.com', 'yuuidevil@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.real_email = au.email
      AND u.deleted_at IS NULL
  );

COMMIT;
