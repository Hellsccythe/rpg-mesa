-- 079 — adota a economia proposta em docs/ECONOMIA.pdf
--
-- A partir daqui aquele documento é a base: moeda em 1:10:100 (bronze, prata,
-- ouro), preço em prata, e os números abaixo. Preço novo que entrar depois
-- deve ser ancorado nas mesmas referências — 2 prata é um dia de trabalho sem
-- qualificação, 60 prata é um mês.
--
-- Três blocos, e o terceiro é uma mudança de REGRA, não de preço.

-- ── 1. Dinheiro inicial dos passados ──────────────────────────────────────
--
-- Os valores antigos tinham amplitude de 10 para 1 entre o passado mais rico
-- e o mais pobre — o que decidia o poder do personagem antes da primeira
-- sessão. Pior: o Andarilho ("vagabundo sem utilidade", 2d100 de prata)
-- empatava com a Nobreza, contradizendo a descrição dos dois.
--
-- A proposta fecha a amplitude em 2,6 para 1, e troca dados grandes por vários
-- pequenos: 4d10 e 1d40 têm quase a mesma média, mas o primeiro concentra os
-- resultados no meio. Azar catastrófico num valor que vale a campanha inteira
-- dói muito mais do que numa jogada de combate.
UPDATE passados AS destino
   SET dinheiro_inicial = origem.dados
  FROM (VALUES
    -- média 57 prata, o mais rico
    ('Nobreza',     '[{"quantidade": 1, "faces": 6,  "moeda": "ouro"},  {"quantidade": 4, "faces": 10, "moeda": "prata"}]'::jsonb),
    -- média 53, bem pago pelo risco
    ('Mercenário',  '[{"quantidade": 1, "faces": 4,  "moeda": "ouro"},  {"quantidade": 5, "faces": 10, "moeda": "prata"}]'::jsonb),
    -- média 46, variável como a vida dele
    ('Aventureiro', '[{"quantidade": 1, "faces": 4,  "moeda": "ouro"},  {"quantidade": 2, "faces": 20, "moeda": "prata"}]'::jsonb),
    -- média 42, salário estável e poupança modesta
    ('Guarda',      '[{"quantidade": 1, "faces": 4,  "moeda": "ouro"},  {"quantidade": 3, "faces": 10, "moeda": "prata"}]'::jsonb),
    -- média 36, tinha negócio, não tinha fortuna (já aplicado na 078)
    ('Varejista',   '[{"quantidade": 1, "faces": 4,  "moeda": "ouro"},  {"quantidade": 2, "faces": 10, "moeda": "prata"}]'::jsonb),
    -- média 33, junta trocado e nunca ouro
    ('Andarilho',   '[{"quantidade": 6, "faces": 10, "moeda": "prata"}]'::jsonb),
    -- média 22, o mais pobre, mas funcional: compra espada curta e gibão
    ('Vítima',      '[{"quantidade": 4, "faces": 10, "moeda": "prata"}]'::jsonb)
  ) AS origem(nome, dados)
 WHERE destino.nome = origem.nome
   AND destino.deleted_at IS NULL;

-- ── 2. Preço dos 14 equipamentos ──────────────────────────────────────────
--
-- Todos estavam com `valor` nulo. Em prata; a Armadura Completa sai por 400
-- prata (40 ouro) de propósito — quase sete meses de salário de um trabalhador
-- comum, e muito acima de qualquer dinheiro inicial. Ela tem o dobro da defesa
-- da segunda melhor armadura e deve ser conquista de campanha, não compra da
-- primeira sessão.
UPDATE equipamentos AS destino
   SET valor = origem.valor
  FROM (VALUES
    ('Adaga de Arremesso',          2.00),
    ('Cajado Simples',              8.00),
    ('Arco Comum',                 10.00),
    ('Bastão de Batalha',          10.00),
    ('Machado de Batalha',         12.00),
    ('Espada Longa',               18.00),
    ('Arco Longo',                 25.00),
    ('Machado Grande de Batalha',  30.00),
    ('Zweihander',                 45.00),
    ('Armadura de Couro',          15.00),
    ('Manto Reforçado',            30.00),
    ('Armadura da guarda',         60.00),
    ('Armadura de Espinhos',       90.00),
    ('Armadura Completa',         400.00)
  ) AS origem(nome, valor)
 WHERE destino.nome = origem.nome
   AND destino.deleted_at IS NULL;

-- ── 3. Peso das armaduras — MUDANÇA DE REGRA ──────────────────────────────
--
-- Este bloco não é preço, é regra de jogo, e vale ler antes de aceitar.
--
-- A capacidade de carga é `2 + força × 2` kg. Com 10 pontos de atributo no
-- onboarding, um personagem de distribuição equilibrada tem força 2 e carrega
-- 6 kg. As armaduras pesavam de 10 a 30 kg. Resultado: NENHUM personagem novo
-- conseguia vestir armadura, e a Armadura Completa (30 kg) era impossível até
-- para quem pusesse os 10 pontos em força (22 kg de capacidade).
--
-- Metade do catálogo existia para personagens que não podiam carregá-lo, e
-- preço de armadura não significava nada.
--
-- Os pesos abaixo são os reais: couro fica em 8 kg (era 20), malha em 12
-- (era 15), placas em 25 (era 30). A fórmula de carga não muda — armadura
-- pesada continua exigindo força alta, que é o correto.
UPDATE equipamentos AS destino
   SET peso = origem.peso
  FROM (VALUES
    ('Armadura de Couro',     8.00),
    ('Manto Reforçado',       5.00),
    ('Armadura da guarda',   12.00),
    ('Armadura de Espinhos', 14.00),
    ('Armadura Completa',    25.00)
  ) AS origem(nome, peso)
 WHERE destino.nome = origem.nome
   AND destino.deleted_at IS NULL;

DO $$
DECLARE
  linha    RECORD;
  sem_preco INTEGER;
BEGIN
  RAISE NOTICE '--- dinheiro inicial (media em prata, 1 ouro = 10 prata) ---';
  FOR linha IN
    SELECT p.nome,
           sum((d->>'quantidade')::numeric * ((d->>'faces')::numeric + 1) / 2
               * CASE d->>'moeda' WHEN 'ouro' THEN 10 WHEN 'bronze' THEN 0.1 ELSE 1 END) AS media
      FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
     WHERE p.deleted_at IS NULL
     GROUP BY p.nome ORDER BY media DESC
  LOOP
    RAISE NOTICE '  % : % pr', rpad(linha.nome, 12), round(linha.media, 1);
  END LOOP;

  SELECT count(*) INTO sem_preco FROM equipamentos WHERE valor IS NULL AND deleted_at IS NULL;
  RAISE NOTICE '--- equipamentos ainda sem preco: % ---', sem_preco;

  RAISE NOTICE '--- capacidade de carga: quem veste o que agora ---';
  FOR linha IN
    SELECT nome, peso, ceil((peso - 2) / 2) AS forca_necessaria
      FROM equipamentos
     WHERE categoria_equipamento_item = 1 AND deleted_at IS NULL
     ORDER BY peso
  LOOP
    RAISE NOTICE '  % : % kg -> exige forca %', rpad(linha.nome, 22), linha.peso, linha.forca_necessaria;
  END LOOP;
END $$;
