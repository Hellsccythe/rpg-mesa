-- 092 — o ouro vira moeda de nobre
--
-- A razão entre as moedas era 1:10:100 (bronze, prata, ouro). Passa a ser
-- 1:10:1000 — UM OURO VALE CEM PRATA. Bronze e prata não mudam; preço
-- continua se pensando em prata; e os dados de dinheiro inicial dos passados
-- continuam os mesmos.
--
-- O objetivo é deixar a moeda de ouro fora do alcance de quem não é nobre:
-- uma peça de ouro passa a ser quase dois meses de salário de um artesão, e
-- vê-la numa mesa de taverna vira acontecimento.
--
-- Nenhum código converte entre moedas — o dinheiro é guardado por moeda
-- (`{prata: 73, ouro: 2}`) — então a razão vive só aqui, no CLAUDE.md e no
-- ECONOMIA.pdf. Esta migration grava a regra para a mesa poder consultar.
--
-- ATENÇÃO, que não é cosmético: cinco passados rolam ouro no dinheiro inicial
-- (Nobreza 1d6, Mercenário/Aventureiro/Guarda/Varejista 1d4). A 100 prata por
-- ouro, esses dados valem dez vezes mais que antes. Esta migration NÃO mexe
-- neles — a decisão é do mestre e está registrada como pendente abaixo.

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('moeda.bronze_por_prata', '10', 'Dez moedas de bronze valem uma de prata.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('moeda.prata_por_ouro', '100', 'CEM moedas de prata valem uma de ouro (era 10 até a migration 092). O ouro é moeda de nobre e de realeza; quase dois meses de salário de artesão numa peça.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('moeda.referencia', 'prata', 'Todo preço do catálogo está em prata. É nela que convém pensar.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

DO $$
DECLARE
  linha RECORD;
BEGIN
  RAISE NOTICE 'razao das moedas: 1 bronze : 10 prata : 1000 ouro (1 ouro = 100 prata)';
  RAISE NOTICE 'PENDENTE — passados que rolam ouro no dinheiro inicial, e quanto isso vale agora:';
  FOR linha IN
    SELECT p.nome, d->>'quantidade' AS qtd, d->>'faces' AS faces
      FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
     WHERE p.deleted_at IS NULL AND d->>'moeda' = 'ouro'
     ORDER BY p.nome
  LOOP
    RAISE NOTICE '  %: %d% ouro  =  % a % prata (era % a %)',
      linha.nome, linha.qtd, linha.faces,
      linha.qtd::int * 100, linha.qtd::int * linha.faces::int * 100,
      linha.qtd::int * 10,  linha.qtd::int * linha.faces::int * 10;
  END LOOP;
END $$;
