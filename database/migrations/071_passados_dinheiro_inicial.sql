-- 071 — dinheiro inicial do passado vira dado, e sai da descrição
--
-- O valor que cada passado concede estava escrito no fim da `descricao`, em
-- português corrido ("Dinheiro inicial: 1d100 moedas de prata e 1d4 de moedas
-- de ouro"). Como texto, ninguém consegue rolar aquilo: o onboarding não tem
-- como saber quantos dados são, de quantas faces, nem em que moeda.
--
-- Passa a ser `dinheiro_inicial JSONB`, uma LISTA de rolagens — porque um
-- passado pode conceder mais de um dado e em mais de uma moeda ao mesmo tempo,
-- que é o caso do Aventureiro:
--
--   [{"quantidade": 1, "faces": 100, "moeda": "prata"},
--    {"quantidade": 1, "faces": 4,   "moeda": "ouro"}]
--
-- Lista, e não um objeto por moeda, para caber "2d4 + 1d6 de ouro" sem
-- precisar mudar o formato de novo.
--
-- A linha de dinheiro é removida da descrição no mesmo movimento: mantê-la nos
-- dois lugares garantiria que um dia os dois discordassem.

ALTER TABLE passados
  ADD COLUMN IF NOT EXISTS dinheiro_inicial JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill pelo nome, e não pelo id: o id depende da ordem de inserção do seed.
UPDATE passados AS destino
   SET dinheiro_inicial = origem.dados
  FROM (VALUES
    ('Nobreza',     '[{"quantidade": 1, "faces": 20,  "moeda": "ouro"}]'::jsonb),
    ('Aventureiro', '[{"quantidade": 1, "faces": 100, "moeda": "prata"}, {"quantidade": 1, "faces": 4, "moeda": "ouro"}]'::jsonb),
    ('Andarilho',   '[{"quantidade": 2, "faces": 100, "moeda": "prata"}]'::jsonb),
    ('Guarda',      '[{"quantidade": 1, "faces": 6,   "moeda": "ouro"}]'::jsonb),
    ('Mercenário',  '[{"quantidade": 1, "faces": 10,  "moeda": "ouro"}]'::jsonb),
    ('Vítima',      '[{"quantidade": 1, "faces": 20,  "moeda": "prata"}]'::jsonb)
  ) AS origem(nome, dados)
 WHERE destino.nome = origem.nome
   AND destino.deleted_at IS NULL;

-- "Varejista" fica de fora de propósito: a descrição dele não traz nenhuma
-- linha de dinheiro. Não é esquecimento desta migration — é o dado de origem
-- que está assim, e inventar um valor aqui seria decidir regra de jogo dentro
-- de uma migration.

-- Remove a linha de dinheiro do fim da descrição. `$` casa o fim da string
-- (o Postgres só o torna sensível a linha com a flag `n`), e a classe
-- [^\r\n] impede que o `.*` engula parágrafos anteriores.
UPDATE passados
   SET descricao = regexp_replace(descricao, E'[\r\n]+[[:space:]]*Dinheiro[^\r\n]*$', '')
 WHERE descricao IS NOT NULL
   AND descricao ~ E'[\r\n][[:space:]]*Dinheiro';

DO $$
DECLARE
  sem_dinheiro INTEGER;
  resto        INTEGER;
BEGIN
  SELECT count(*) INTO sem_dinheiro
    FROM passados WHERE deleted_at IS NULL AND dinheiro_inicial = '[]'::jsonb;

  SELECT count(*) INTO resto
    FROM passados WHERE deleted_at IS NULL AND descricao ~ E'[[:space:]]*Dinheiro';

  RAISE NOTICE 'passados sem dinheiro inicial: %', sem_dinheiro;
  RAISE NOTICE 'descricoes que ainda mencionam dinheiro: %', resto;
END $$;
