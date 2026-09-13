-- 100 — cada campanha tem um número de mundo
--
-- O site vai mestrar mais de um mundo e o mestre quer se referir a eles
-- pelo número — "Mundo 2 — Elyra". O número é lore, não chave: o id do
-- banco continua sendo o que as outras tabelas apontam, e o número é o
-- que aparece no seletor de mundo e na tela de campanhas. Por isso é uma
-- coluna própria, editável, e não o id.
--
-- A campanha atual (caminho-sem-volta, Elyra) recebe o 2 a pedido do
-- mestre: pela lore, outro mundo vai ser o 1. Qualquer outra campanha
-- que exista recebe o próximo número livre, na ordem de criação.
--
-- Único entre as campanhas vivas: dois mundos com o mesmo número seriam
-- indistinguíveis no seletor. Parcial, porque o UNIQUE de slug já ensinou
-- que uma linha soft-deletada não pode segurar o número para sempre.

BEGIN;

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS numero INTEGER;

UPDATE campaigns SET numero = 2 WHERE slug = 'caminho-sem-volta' AND numero IS NULL;

WITH sem_numero AS (
  SELECT id, row_number() OVER (ORDER BY created_at, id) AS posicao
  FROM campaigns
  WHERE numero IS NULL
)
UPDATE campaigns
SET numero = (SELECT COALESCE(MAX(numero), 0) FROM campaigns) + sem_numero.posicao
FROM sem_numero
WHERE campaigns.id = sem_numero.id;

ALTER TABLE campaigns ALTER COLUMN numero SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_campaigns_numero_ativo
  ON campaigns (numero) WHERE deleted_at IS NULL;

COMMIT;
