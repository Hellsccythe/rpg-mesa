-- 073 — tabela de raridade, escala única para todos os itens
--
-- A raridade vale para as três tabelas de item que vão existir (equipamentos,
-- consumíveis e itens), na mesma escala: uma poção Rara e uma espada Rara são
-- igualmente difíceis de achar. Escala única permite ao mestre e ao mercador
-- comparar entre categorias.
--
-- Raridade como etiqueta colorida não pagaria a coluna. Aqui ela DECIDE coisas:
--
--   multiplicador_valor  quanto o preço-base é multiplicado
--   dificuldade_base     a dificuldade do teste para fabricar
--   disponibilidade      onde o item é encontrado à venda
--
-- Assim uma única referência responde "o mercador tem isso?", "quanto custa?" e
-- "quão difícil é fabricar?".
--
-- Sobre `ordem`: existe separada da PK de propósito. `item` é chave técnica —
-- se um dia entrar uma raridade entre Raro e Épico, ela recebe o item 6 e
-- ordenar por ele colocaria a nova no fim. A ordem da escala é informação de
-- jogo e merece coluna própria.

CREATE TABLE IF NOT EXISTS raridade (
  item                INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  descricao           VARCHAR(100) NOT NULL,
  ordem               INTEGER      NOT NULL,
  multiplicador_valor NUMERIC(6,2) NOT NULL DEFAULT 1,
  -- Nulo em Lendário: não há dificuldade fixa, o mestre decide caso a caso.
  dificuldade_base    INTEGER,
  disponibilidade     TEXT         NOT NULL DEFAULT '',
  -- Guardada aqui para o frontend não precisar de um mapa de cores paralelo,
  -- que sairia de sincronia na primeira raridade nova.
  cor                 VARCHAR(20)  NOT NULL DEFAULT 'zinc',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by          TEXT,
  updated_by          TEXT,
  deleted_at          TIMESTAMPTZ,
  deleted_by          TEXT
);

-- Único entre as ativas: soft delete precisa liberar o nome de volta.
CREATE UNIQUE INDEX IF NOT EXISTS idx_raridade_descricao_ativa
  ON raridade (descricao) WHERE deleted_at IS NULL;

INSERT INTO raridade (descricao, ordem, multiplicador_valor, dificuldade_base, disponibilidade, cor)
SELECT * FROM (VALUES
  ('Comum',     1,  1.00,  10, 'Qualquer vilarejo',                    'zinc'),
  ('Incomum',   2,  3.00,  15, 'Cidade grande',                        'emerald'),
  ('Raro',      3, 10.00,  20, 'Capital ou mercador especializado',    'sky'),
  ('Épico',     4, 40.00,  25, 'Não se compra — se encontra',          'violet'),
  ('Lendário',  5,  0.00, NULL, 'Único no mundo',                      'amber')
) AS novas(descricao, ordem, multiplicador_valor, dificuldade_base, disponibilidade, cor)
WHERE NOT EXISTS (SELECT 1 FROM raridade WHERE deleted_at IS NULL);

-- ── Vínculo com as tabelas de item ────────────────────────────────────────
-- Hoje só `equipamentos` existe. `consumiveis` e `itens` nascem já com a
-- coluna, na migration que as criar.
ALTER TABLE equipamentos
  ADD COLUMN IF NOT EXISTS raridade_item INTEGER;

-- Todos os 14 equipamentos existentes viram Comum. É um padrão defensável e
-- verdadeiro para a maioria deles (espada longa, arco, adaga são comuns
-- mesmo), e deixa a coluna utilizável desde já em vez de exigir 14 edições
-- à mão antes de qualquer tela funcionar. Quais merecem subir é decisão de
-- jogo, e fica para o mestre na tela de equipamentos.
UPDATE equipamentos
   SET raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE raridade_item IS NULL;

CREATE INDEX IF NOT EXISTS idx_equipamentos_raridade
  ON equipamentos (raridade_item) WHERE deleted_at IS NULL;

DO $$
DECLARE
  quantas INTEGER;
  equipados INTEGER;
BEGIN
  SELECT count(*) INTO quantas   FROM raridade WHERE deleted_at IS NULL;
  SELECT count(*) INTO equipados FROM equipamentos WHERE raridade_item IS NOT NULL AND deleted_at IS NULL;
  RAISE NOTICE 'raridades: %  |  equipamentos com raridade: %', quantas, equipados;
END $$;
