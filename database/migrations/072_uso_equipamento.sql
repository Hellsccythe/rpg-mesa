-- 072 — equipamento_tipo vira uso_equipamento
--
-- Existiam duas tabelas com o mesmo par de palavras trocadas de lugar:
--
--   tipo_equipamento  → Corpo a corpo, Longo alcance, Leve, Média, Pesada
--   equipamento_tipo  → Arma, Armadura, Variados
--
-- Nenhum nome dizia qual era qual, e a diferença entre elas é real: a primeira
-- é o tipo DENTRO de uma categoria, a segunda é para que serve o equipamento.
-- Qualquer um lendo o código tinha que ir olhar os dados para descobrir.
--
-- `uso_equipamento` diz o que a tabela guarda: o uso do equipamento.
--
-- ALTER TABLE ... RENAME preserva dados, índices, constraints e a sequence
-- ligada à coluna — não é preciso recriar nada. O nome da sequence em si fica
-- para trás (segue `equipamento_tipo_item_seq`), o que é só cosmético: quem a
-- usa é o DEFAULT da coluna, que o rename manteve apontando certo.

ALTER TABLE IF EXISTS equipamento_tipo RENAME TO uso_equipamento;

ALTER TABLE categoria_arma      RENAME COLUMN equipamento_tipo_item TO uso_equipamento_item;
ALTER TABLE categoria_armadura  RENAME COLUMN equipamento_tipo_item TO uso_equipamento_item;
ALTER TABLE categoria_variados  RENAME COLUMN equipamento_tipo_item TO uso_equipamento_item;

DO $$
DECLARE
  linhas INTEGER;
BEGIN
  SELECT count(*) INTO linhas FROM uso_equipamento WHERE deleted_at IS NULL;
  RAISE NOTICE 'uso_equipamento: % linha(s) ativas', linhas;
END $$;
