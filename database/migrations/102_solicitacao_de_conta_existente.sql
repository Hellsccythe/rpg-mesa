-- 102 — a mesma conta pede um personagem em outro mundo
--
-- Com um personagem por mundo por conta (migration 101), o jogador que já
-- tem conta precisa poder pedir um personagem novo sem pré-registro e sem
-- criar outra conta: ele se identifica com o login e a senha que já tem.
--
--   usuario_id   a conta dona da solicitação, quando ela é de conta
--                existente. Nulo na solicitação de conta nova (o fluxo de
--                sempre: e-mail pré-registrado, username e senha novos)
--
-- O índice de username das solicitações era global e cobria pendentes e
-- aprovadas: a segunda solicitação de um mesmo jogador, com o username
-- dele, estourava. Passa a valer só entre as PENDENTES e por mundo — a
-- unicidade do username como login continua sendo a de usuarios, e a do
-- personagem no mundo é a de characters (101).

BEGIN;

ALTER TABLE character_creation_requests ADD COLUMN IF NOT EXISTS usuario_id INTEGER;

DROP INDEX IF EXISTS idx_ccr_username_ativo;
CREATE UNIQUE INDEX IF NOT EXISTS idx_ccr_username_pendente_por_mundo
  ON character_creation_requests (username, campaign_id)
  WHERE deleted_at IS NULL AND status = 'pendente';

COMMIT;
