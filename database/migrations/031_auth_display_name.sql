-- Migration 031: Preenche display_name nos auth users existentes com o username
-- Afeta apenas usuários que já têm username no user_metadata (players rpg.internal)

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'display_name', raw_user_meta_data->>'username'
)
WHERE raw_user_meta_data->>'username' IS NOT NULL
  AND raw_user_meta_data->>'username' != '';
