-- 082 — repara perícia duplicada em passados.pericias_iniciais
--
-- A primeira versão da 081 usava `jsonb_agg(DISTINCT ...)` ao fundir Lábia em
-- Negociação. DISTINCT compara o OBJETO inteiro, então um passado que já tinha
-- Negociação 2 e ganhou a Lábia 1 convertida ficou com duas entradas
-- distintas — `{"periciaId": 9, "rank": 2}` e `{"periciaId": 9, "rank": 1}` —
-- em vez de uma só com o maior rank. Aconteceu com o Varejista.
--
-- A 081 já foi corrigida para bancos novos; esta migration limpa quem rodou a
-- versão com defeito. É genérica e idempotente: agrupa qualquer perícia
-- repetida por `periciaId` mantendo o maior rank, então serve para qualquer
-- duplicata futura pela mesma causa.

UPDATE passados
   SET pericias_iniciais = (
     SELECT COALESCE(jsonb_agg(jsonb_build_object('periciaId', pericia_id, 'rank', maior_rank)
                               ORDER BY pericia_id), '[]'::jsonb)
     FROM (
       SELECT (e.valor->>'periciaId')::int AS pericia_id,
              max((e.valor->>'rank')::int) AS maior_rank
       FROM jsonb_array_elements(passados.pericias_iniciais) AS e(valor)
       GROUP BY 1
     ) AS sem_duplicata)
 WHERE deleted_at IS NULL
   AND jsonb_array_length(pericias_iniciais) > (
     SELECT count(DISTINCT (e.valor->>'periciaId'))
     FROM jsonb_array_elements(pericias_iniciais) AS e(valor));

-- Mesma limpeza em `characters.data.pericias`, por segurança: a fusão também
-- mexeu nas fichas, e uma duplicata ali significaria rank exibido errado.
UPDATE characters AS c
   SET data = jsonb_set(c.data, '{pericias}', (
     SELECT COALESCE(jsonb_agg(jsonb_build_object(
              'periciaId', pericia_id, 'nome', nome, 'rank', maior_rank) ORDER BY nome), '[]'::jsonb)
     FROM (
       SELECT (e.valor->>'periciaId')::int AS pericia_id,
              min(e.valor->>'nome')        AS nome,
              max((e.valor->>'rank')::int) AS maior_rank
       FROM jsonb_array_elements(c.data->'pericias') AS e(valor)
       GROUP BY 1
     ) AS sem_duplicata))
 WHERE c.deleted_at IS NULL
   AND c.data ? 'pericias'
   AND jsonb_array_length(c.data->'pericias') > (
     SELECT count(DISTINCT (e.valor->>'periciaId'))
     FROM jsonb_array_elements(c.data->'pericias') AS e(valor));

DO $$
DECLARE
  passados_ruins   INTEGER;
  personagens_ruins INTEGER;
BEGIN
  SELECT count(*) INTO passados_ruins FROM passados
   WHERE deleted_at IS NULL
     AND jsonb_array_length(pericias_iniciais) > (
       SELECT count(DISTINCT (e.valor->>'periciaId'))
       FROM jsonb_array_elements(pericias_iniciais) AS e(valor));

  SELECT count(*) INTO personagens_ruins FROM characters
   WHERE deleted_at IS NULL AND data ? 'pericias'
     AND jsonb_array_length(data->'pericias') > (
       SELECT count(DISTINCT (e.valor->>'periciaId'))
       FROM jsonb_array_elements(data->'pericias') AS e(valor));

  RAISE NOTICE 'duplicatas restantes -> passados: %, personagens: %',
    passados_ruins, personagens_ruins;
END $$;
