-- 074 — raridade dos equipamentos que fogem do Comum
--
-- A migration 073 marcou os 14 equipamentos como Comum: padrão defensável e
-- verdadeiro para a maioria (espada longa, arco e adaga são comuns mesmo),
-- que deixou a coluna utilizável sem exigir 14 edições à mão.
--
-- Quatro não são comuns, e isso é decisão de jogo — tomada pelo mestre, não
-- aqui. Esta migration só grava o que ele decidiu.

UPDATE equipamentos AS destino
   SET raridade_item = origem.item
  FROM (
    SELECT nome_do_equipamento, raridade.item
      FROM (VALUES
        -- 10 de defesa física, o dobro da segunda melhor armadura, e ~7 meses
        -- de salário de um trabalhador comum.
        ('Armadura Completa',    'Raro'),
        ('Armadura de Espinhos', 'Incomum'),
        ('Armadura da guarda',   'Incomum'),
        -- Arma de especialista, feita sob encomenda.
        ('Zweihander',           'Incomum')
      ) AS decisao(nome_do_equipamento, nome_da_raridade)
      JOIN raridade ON raridade.descricao = decisao.nome_da_raridade
                   AND raridade.deleted_at IS NULL
  ) AS origem
 WHERE destino.nome = origem.nome_do_equipamento
   AND destino.deleted_at IS NULL;

DO $$
DECLARE
  linha RECORD;
BEGIN
  FOR linha IN
    SELECT raridade.descricao AS raridade, count(*) AS quantos
      FROM equipamentos
      JOIN raridade ON raridade.item = equipamentos.raridade_item
     WHERE equipamentos.deleted_at IS NULL
     GROUP BY raridade.descricao, raridade.ordem
     ORDER BY raridade.ordem
  LOOP
    RAISE NOTICE '% : % equipamento(s)', linha.raridade, linha.quantos;
  END LOOP;
END $$;
