-- 069 — o UNIQUE de username em character_creation_requests vira parcial
--
-- A regra do backend sempre foi: um username está ocupado se houver
-- solicitação PENDENTE ou APROVADA com ele. Uma solicitação rejeitada não
-- deveria bloquear nada — o jogador corrige o que o mestre apontou e envia de
-- novo, com o mesmo username.
--
-- Só que o índice era total: `UNIQUE (username)`. Na prática, quem fosse
-- rejeitado nunca conseguia reenviar com o mesmo nome. A checagem do service
-- deixava passar e o INSERT estourava com "duplicate key value violates unique
-- constraint" — um 500 sem explicação nenhuma na tela.
--
-- O índice parcial abaixo diz exatamente o que a regra sempre quis dizer.

BEGIN;

ALTER TABLE public.character_creation_requests
  DROP CONSTRAINT IF EXISTS character_creation_requests_username_key;

DROP INDEX IF EXISTS public.idx_ccr_username_ativo;

CREATE UNIQUE INDEX idx_ccr_username_ativo
  ON public.character_creation_requests (username)
  WHERE deleted_at IS NULL
    AND status IN ('pendente', 'aprovado');

COMMENT ON INDEX public.idx_ccr_username_ativo IS
  'Username só é exclusivo entre solicitações pendentes ou aprovadas; rejeitadas liberam o nome para reenvio.';

COMMIT;
