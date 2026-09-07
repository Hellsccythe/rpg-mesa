-- 067 — ressincroniza todas as sequences com o maior valor já gravado
--
-- Vários módulos do backend Express escolhiam a chave na mão (`MAX(item)+1`
-- numa consulta separada) e mandavam o valor explícito no INSERT. A sequence
-- da coluna nunca era chamada e ficou parada no início, enquanto os dados
-- avançavam.
--
-- Enquanto todo mundo escolhia a chave na mão isso não aparecia. Ao migrar os
-- módulos para o Sequelize, que deixa o banco gerar a chave, a primeira
-- inserção estoura com "duplicate key value violates unique constraint" —
-- foi o que aconteceu em skill_tipo_dano, cuja sequence estava em 1 com
-- registros até o item 8.
--
-- Esta migration percorre toda sequence ligada a uma coluna e a adianta para
-- o maior valor presente na tabela. É idempotente e não mexe nas que já estão
-- à frente.

-- Atenção ao is_called: uma sequence nunca usada devolve o próprio
-- last_value no primeiro nextval, e não last_value + 1. Comparar só o
-- last_value com o máximo deixa passar justamente esse caso.

DO $$
DECLARE
  vinculo RECORD;
  maior_gravado BIGINT;
  valor_atual BIGINT;
  ja_chamada BOOLEAN;
  proximo_valor BIGINT;
BEGIN
  FOR vinculo IN
    SELECT
      sequencia.oid::regclass::text AS nome_sequencia,
      tabela.relname               AS nome_tabela,
      coluna.attname               AS nome_coluna
    FROM pg_class sequencia
    JOIN pg_depend dependencia
      ON dependencia.objid = sequencia.oid
     AND dependencia.classid = 'pg_class'::regclass
     AND dependencia.deptype IN ('a', 'i')
    JOIN pg_class tabela ON tabela.oid = dependencia.refobjid
    JOIN pg_attribute coluna
      ON coluna.attrelid = tabela.oid
     AND coluna.attnum = dependencia.refobjsubid
    WHERE sequencia.relkind = 'S'
      AND tabela.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', vinculo.nome_coluna, vinculo.nome_tabela)
      INTO maior_gravado;

    -- Tabela vazia: a sequence pode continuar onde está.
    CONTINUE WHEN maior_gravado = 0;

    EXECUTE format('SELECT last_value, is_called FROM %s', vinculo.nome_sequencia)
      INTO valor_atual, ja_chamada;

    proximo_valor := CASE WHEN ja_chamada THEN valor_atual + 1 ELSE valor_atual END;

    IF proximo_valor <= maior_gravado THEN
      -- is_called = true faz o próximo nextval devolver maior_gravado + 1.
      EXECUTE format('SELECT setval(%L, %s, true)', vinculo.nome_sequencia, maior_gravado);
      RAISE NOTICE '% : proximo seria % com % ja gravado -> reposicionada (tabela %, coluna %)',
        vinculo.nome_sequencia, proximo_valor, maior_gravado, vinculo.nome_tabela, vinculo.nome_coluna;
    END IF;
  END LOOP;
END $$;
