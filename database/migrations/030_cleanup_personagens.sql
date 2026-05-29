-- Migration 030: Limpeza de personagens — manter apenas Kantral (id=9)
-- e vincular ao usuário gustakingx999x@gmail.com
--
-- ATENÇÃO: Execute no SQL Editor do Supabase.
-- Após executar, delete manualmente as imagens no Storage (ver instruções abaixo).

BEGIN;

-- 1. Soft-delete personagens a remover (ids 5, 6, 7, 8)
UPDATE public.characters
SET
  deleted_at = NOW(),
  deleted_by = 'cleanup-manual'
WHERE id IN (5, 6, 7, 8)
  AND deleted_at IS NULL;

-- 2. Soft-delete registros em usuarios vinculados a esses personagens (se existirem)
UPDATE public.usuarios
SET
  deleted_at = NOW(),
  deleted_by = 'cleanup-manual'
WHERE auth_user_id IN (
  'fcc78fe6-d2c0-4dc9-9a9b-088b5571c27a',  -- Loomie / hellsccythe
  '77d3ed5d-9d0f-4a7b-83b4-b61acd2aab7e',  -- inari teste / inari123
  'd64898ae-f0c7-422d-8e1f-cbc296a93f93',   -- Kira / jamile
  '0dd9e8d1-0eb7-41b1-beab-4ff4eb6b7645'   -- Aelin Sorrengail / mariana
)
AND deleted_at IS NULL;

-- 3. Vincular slot pré-registro de gustakingx999x ao auth account do Kantral
UPDATE public.usuarios
SET
  auth_user_id = 'b2c5f76e-4714-40f2-b84e-cda1a0a7d312',
  username     = 'jejide',
  updated_at   = NOW()
WHERE real_email  = 'gustakingx999x@gmail.com'
  AND auth_user_id IS NULL
  AND deleted_at   IS NULL;

COMMIT;

-- ──────────────────────────────────────────────────────────────────────────────
-- APÓS EXECUTAR O SQL:
--
-- 1. Delete os Auth Users no painel Supabase → Authentication → Users:
--    - fcc78fe6-d2c0-4dc9-9a9b-088b5571c27a  (hellsccythe / Loomie)
--    - 77d3ed5d-9d0f-4a7b-83b4-b61acd2aab7e  (inari123 / inari teste)
--    - d64898ae-f0c7-422d-8e1f-cbc296a93f93   (jamile / Kira)
--    - 0dd9e8d1-0eb7-41b1-beab-4ff4eb6b7645   (mariana / Aelin Sorrengail)
--
-- 2. Delete as imagens no painel Supabase → Storage → character-avatars:
--    - fcc78fe6-d2c0-4dc9-9a9b-088b5571c27a/avatars/1776735525267-22-42-56-Feh1eaZaYAA6qB0.jpg
--    - 77d3ed5d-9d0f-4a7b-83b4-b61acd2aab7e/avatars/1776731943049-inari.png
--    - d64898ae-f0c7-422d-8e1f-cbc296a93f93/avatars/1776875457493-161117.jpg
--    - 0dd9e8d1-0eb7-41b1-beab-4ff4eb6b7645/avatars/1777070116337-1000039656.jpg
--    (ou delete as pastas inteiras pelos user_ids acima)
-- ──────────────────────────────────────────────────────────────────────────────
