-- Migration 065: Restaura a distinção entre conta ativa e pré-registro
--
-- O sistema permite ao mestre liberar um email antes da conta existir: o
-- registro entra em usuarios sem credencial, e só vira conta de verdade
-- quando o jogador cria o personagem. Antes isso era representado por
-- auth_user_id IS NULL, apontando para o Supabase Auth.
--
-- A migration 061 removeu auth_user_id (o Supabase Auth não existe mais) e a
-- 062 deu senha padrão a TODOS os registros — inclusive aos pré-registros,
-- que passaram a ter uma senha utilizável sem nunca terem virado conta.
--
-- Aqui password_hash volta a aceitar nulo, e NULO passa a ser o sinal de
-- pré-registro. Os pré-registros são identificados por serem do tipo player,
-- sem username e sem personagem vinculado — GMs entram pelo email real e
-- sempre têm conta.

BEGIN;

ALTER TABLE public.usuarios
  ALTER COLUMN password_hash DROP NOT NULL;

UPDATE public.usuarios
SET password_hash = NULL,
    requires_password_change = FALSE
WHERE deleted_at IS NULL
  AND tipo = 'player'
  AND COALESCE(username, '') = ''
  AND NOT EXISTS (
    SELECT 1 FROM public.characters
    WHERE characters.user_id = usuarios.id
      AND characters.deleted_at IS NULL
  );

COMMIT;
