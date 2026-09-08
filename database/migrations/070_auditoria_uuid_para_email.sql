-- 070 — troca os UUIDs legados de created_by / updated_by / deleted_by por e-mail
--
-- A migration 027 converteu essas três colunas de UUID para TEXT e passou a
-- gravar o e-mail de quem fez a ação. O que ela NÃO fez foi converter o que já
-- estava gravado: as linhas escritas antes dela seguiram com o UUID do
-- `auth.users` do Supabase, agora um número sem significado nenhum — a coluna
-- diz "quem", e ninguém consegue ler quem é.
--
-- Nada novo escreve UUID aqui: a escrita mais recente com esse formato é de
-- 2026-07-29, e desde a migração para o Nest os hooks do Sequelize pegam o
-- e-mail do usuário autenticado. Isto é limpeza de dado antigo, não correção
-- de bug em código vivo.
--
-- O de-para não pode ser derivado do banco: `usuarios.auth_user_id` foi
-- removido na migration 061. Os pares abaixo saíram do dump
-- `rpg_mesa_2026-09-04.dump`, tirado antes daquela remoção.
--
-- Fica de fora, de propósito, `7b2a22dd-7597-4b34-a242-5007b5fab348` (em
-- characters.deleted_by, do personagem apagado em 2026-04-19): esse UUID nunca
-- teve linha em `usuarios`, então não há e-mail para colocar no lugar. Apagar
-- seria trocar uma informação ilegível por informação nenhuma.

DO $$
DECLARE
  coluna_auditoria RECORD;
  linhas_trocadas  INTEGER;
  total_trocado    INTEGER := 0;
BEGIN
  FOR coluna_auditoria IN
    SELECT colunas.table_name AS nome_tabela, colunas.column_name AS nome_coluna
    FROM information_schema.columns colunas
    JOIN information_schema.tables tabelas
      ON tabelas.table_schema = colunas.table_schema
     AND tabelas.table_name = colunas.table_name
    WHERE colunas.table_schema = 'public'
      AND tabelas.table_type = 'BASE TABLE'
      AND colunas.column_name IN ('created_by', 'updated_by', 'deleted_by')
      AND colunas.data_type IN ('text', 'character varying')
    ORDER BY colunas.table_name, colunas.column_name
  LOOP
    EXECUTE format(
      'UPDATE %I SET %I = de_para.email
         FROM (VALUES
           (''6584fff0-028a-4d1d-b25c-0ebaeda85605'', ''gustakingx666x@gmail.com''),
           (''5ca3af07-161e-4a2f-878d-88f4531bef66'', ''yuuidevil@gmail.com''),
           (''b2c5f76e-4714-40f2-b84e-cda1a0a7d312'', ''gustakingx999x@gmail.com''),
           (''d1d48fdb-ad8f-46a8-99c3-0709adffde4b'', ''hellsrag2@gmail.com'')
         ) AS de_para(uuid_antigo, email)
        WHERE %I = de_para.uuid_antigo',
      coluna_auditoria.nome_tabela,
      coluna_auditoria.nome_coluna,
      coluna_auditoria.nome_coluna
    );

    GET DIAGNOSTICS linhas_trocadas = ROW_COUNT;

    IF linhas_trocadas > 0 THEN
      total_trocado := total_trocado + linhas_trocadas;
      RAISE NOTICE '%.% : % linha(s) com e-mail no lugar do UUID',
        coluna_auditoria.nome_tabela, coluna_auditoria.nome_coluna, linhas_trocadas;
    END IF;
  END LOOP;

  RAISE NOTICE 'total: % linha(s) convertidas', total_trocado;
END $$;
