-- Migration 029: Link pre-registration slots to existing Auth accounts
--
-- Contexto: jogadores aprovados antes da migration 028 têm conta Auth + characters,
-- mas a tabela usuarios só recebeu slots de pré-registro (auth_user_id = NULL) para
-- seus emails. Esta migration faz o link via user_metadata.real_email.

BEGIN;

UPDATE public.usuarios u
SET
  auth_user_id = a.id,
  username     = COALESCE(a.raw_user_meta_data->>'username', u.username),
  updated_at   = NOW()
FROM auth.users a
WHERE u.auth_user_id IS NULL
  AND u.deleted_at   IS NULL
  AND (a.raw_user_meta_data->>'real_email') = u.real_email
  AND NOT EXISTS (
    SELECT 1
    FROM public.usuarios u2
    WHERE u2.auth_user_id = a.id
      AND u2.deleted_at IS NULL
  );

COMMIT;
