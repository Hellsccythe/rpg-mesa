-- Migration 062: Sistema de autenticação própria em usuarios
-- O Supabase Auth não existe mais neste projeto — a senha passa a ser
-- gerenciada inteiramente pelo próprio backend (bcrypt + JWT).
--
-- Senha inicial para as contas já existentes: "12345" (mesmo valor usado
-- pelo botão "Reset Padrão" em /master/usuarios), com troca obrigatória
-- no próximo login via requires_password_change — reaproveita um fluxo
-- que a tela master já implementa hoje.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.usuarios
SET password_hash = crypt('12345', gen_salt('bf')),
    requires_password_change = TRUE
WHERE password_hash IS NULL;

ALTER TABLE public.usuarios
  ALTER COLUMN password_hash SET NOT NULL;

COMMIT;
