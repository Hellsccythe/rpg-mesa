-- Query diagnóstico — rode no SQL Editor do Supabase para entender o estado atual
-- NÃO faz alterações, apenas lê dados

SELECT
  u.id          AS usuario_id,
  u.real_email,
  u.auth_user_id,
  u.username    AS usuario_username,

  -- match via user_metadata.real_email (modo atual da migration 029)
  a1.id         AS auth_via_metadata,
  a1.email      AS auth_email_via_metadata,

  -- match via characters.user_id → auth.users
  c.id          AS char_id,
  c.username    AS char_username,
  a2.id         AS auth_via_character,
  a2.email      AS auth_email_via_character,
  a2.raw_user_meta_data->>'real_email' AS meta_real_email

FROM public.usuarios u

-- tentativa 1: metadata
LEFT JOIN auth.users a1
  ON (a1.raw_user_meta_data->>'real_email') = u.real_email

-- tentativa 2: characters → auth
LEFT JOIN public.characters c
  ON c.deleted_at IS NULL
LEFT JOIN auth.users a2
  ON a2.id = c.user_id
  AND (
    a2.raw_user_meta_data->>'real_email' = u.real_email
    OR a2.email = (split_part(u.real_email, '@', 1) || '@rpg.internal')
  )

WHERE u.auth_user_id IS NULL
  AND u.deleted_at   IS NULL

ORDER BY u.real_email;
