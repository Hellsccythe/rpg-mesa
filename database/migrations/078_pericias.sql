-- 078 — perícias mundanas
--
-- A terceira trilha de progressão, ao lado do nível de personagem e do nível
-- de classe. Existe porque as outras duas não servem: ninguém fica melhor em
-- cozinhar matando goblins, e se o ponto de perícia saísse da mesma fonte do
-- nível as duas seriam a mesma progressão com nomes diferentes.
--
--   nível de personagem  →  status (atributos)
--   nível de classe      →  pontos de classe → skills
--   perícia              →  ranks, e o teste de d20 que os usa
--
-- De onde vêm os pontos, em ordem de importância:
--   1. Passado — o rank inicial, gravado aqui em `passados.pericias_iniciais`
--   2. Downtime — o mestre concede por tempo narrado (rota admin)
--   3. Marco de nível — 1 ponto por marco, a única parte automática
--
-- O item 3 é a primeira coisa que subir de nível concede sozinho neste
-- projeto: até agora `atribuirXpAoPersonagem` só gravava o número do nível.

-- ── Catálogo de perícias ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pericias (
  id            INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome          VARCHAR(100) NOT NULL,
  descricao     TEXT         NOT NULL DEFAULT '',

  -- Qual atributo entra no teste. CHECK e não tabela de lookup: os cinco
  -- atributos são estruturais do sistema, não algo que o mestre cadastra.
  atributo_base VARCHAR(20)  NOT NULL,

  -- Agrupamento só para a tela. Mesma razão para ser CHECK: são quatro
  -- rótulos fixos que não carregam dado nenhum.
  categoria     VARCHAR(20)  NOT NULL,

  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by    TEXT,
  updated_by    TEXT,
  deleted_at    TIMESTAMPTZ,
  deleted_by    TEXT,

  CONSTRAINT pericias_atributo_check
    CHECK (atributo_base IN ('aura', 'forca', 'destreza', 'resistencia', 'inteligencia')),
  CONSTRAINT pericias_categoria_check
    CHECK (categoria IN ('Ofício', 'Social', 'Corpo', 'Saber'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pericias_nome_ativa
  ON pericias (nome) WHERE deleted_at IS NULL;

-- Crafting não é UMA perícia: um alquimista não é um ferreiro. Cada receita
-- aponta para a sua, e é isso que faz a especialização significar algo.
INSERT INTO pericias (nome, descricao, atributo_base, categoria)
SELECT * FROM (VALUES
  -- Ofício
  ('Alquimia',      'Extrair, macerar e destilar. Base das poções e dos venenos.',            'inteligencia', 'Ofício'),
  ('Ferraria',      'Trabalhar metal quente: lâminas, armaduras e o que se conserta delas.',  'forca',        'Ofício'),
  ('Carpintaria',   'Madeira, do arco à roda de carroça.',                                    'forca',        'Ofício'),
  ('Joalheria',     'Lapidar pedra e engastar metal precioso. Trabalho de dedos firmes.',     'destreza',     'Ofício'),
  ('Costura',       'Tecido e couro, do remendo ao traje de corte.',                          'destreza',     'Ofício'),
  ('Cozinha',       'Alimentar bem — e reconhecer o que não se deve comer.',                  'inteligencia', 'Ofício'),
  -- Social
  ('Diplomacia',    'Conduzir uma conversa difícil sem que ela vire briga.',                  'aura',         'Social'),
  ('Negociação',    'Comprar barato, vender caro e saber quando o outro está mentindo.',      'aura',         'Social'),
  ('Atuação',       'Sustentar um personagem que não é o seu diante de quem duvida.',         'aura',         'Social'),
  ('Lábia',         'Fazer soar razoável o que não é.',                                       'aura',         'Social'),
  ('Intimidação',   'Deixar claro o que acontece se a conversa não terminar bem.',            'forca',        'Social'),
  -- Corpo
  ('Dança',         'Mover-se no ritmo — e ler o corpo de quem se move junto.',               'destreza',     'Corpo'),
  ('Instrumentos',  'Tocar de forma que alguém queira ouvir de novo.',                        'aura',         'Corpo'),
  ('Acrobacia',     'Cair sem quebrar, passar por onde não caberia.',                         'destreza',     'Corpo'),
  ('Furtividade',   'Não ser visto, não ser ouvido, não ser lembrado.',                       'destreza',     'Corpo'),
  ('Atletismo',     'Escalar, nadar, carregar, aguentar.',                                    'forca',        'Corpo'),
  ('Cavalgar',      'Montar, e fazer o animal obedecer sob pressão.',                          'destreza',     'Corpo'),
  -- Saber
  ('Medicina',      'Estancar, imobilizar, reconhecer a febre certa.',                        'inteligencia', 'Saber'),
  ('Sobrevivência', 'Achar água, abrigo e rumo onde não há estrada.',                         'resistencia',  'Saber'),
  ('Percepção',     'Notar o que estava ali o tempo todo.',                                   'inteligencia', 'Saber'),
  ('História',      'Saber de quem era o brasão, e por que aquilo importa hoje.',             'inteligencia', 'Saber')
) AS novas(nome, descricao, atributo_base, categoria)
WHERE NOT EXISTS (SELECT 1 FROM pericias WHERE deleted_at IS NULL);

-- ── Perícias iniciais do passado ──────────────────────────────────────────
--
-- Lista de {periciaId, rank}, no mesmo formato de `dinheiro_inicial`. São
-- ranks de graça: não custam pontos ao jogador. Cada passado recebe por volta
-- de 3 a 4 pontos de valor, para nenhum sair na frente.
ALTER TABLE passados
  ADD COLUMN IF NOT EXISTS pericias_iniciais JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE passados AS destino
   SET pericias_iniciais = origem.lista
  FROM (
    SELECT
      decisao.nome_do_passado,
      jsonb_agg(jsonb_build_object('periciaId', pericias.id, 'rank', decisao.rank)) AS lista
    FROM (VALUES
      ('Nobreza',     'Diplomacia',    2),
      ('Nobreza',     'História',      1),
      ('Aventureiro', 'Sobrevivência', 1),
      ('Aventureiro', 'Atletismo',     1),
      ('Aventureiro', 'Percepção',     1),
      ('Andarilho',   'Sobrevivência', 2),
      ('Andarilho',   'Percepção',     1),
      ('Guarda',      'Percepção',     2),
      ('Guarda',      'Intimidação',   1),
      ('Mercenário',  'Intimidação',   1),
      ('Mercenário',  'Furtividade',   1),
      ('Mercenário',  'Atletismo',     1),
      ('Varejista',   'Negociação',    2),
      ('Varejista',   'Lábia',         1),
      ('Vítima',      'Furtividade',   1),
      ('Vítima',      'Percepção',     1),
      ('Vítima',      'Lábia',         1)
    ) AS decisao(nome_do_passado, nome_da_pericia, rank)
    JOIN pericias ON pericias.nome = decisao.nome_da_pericia AND pericias.deleted_at IS NULL
    GROUP BY decisao.nome_do_passado
  ) AS origem
 WHERE destino.nome = origem.nome_do_passado
   AND destino.deleted_at IS NULL;

-- ── Dinheiro inicial do Varejista ─────────────────────────────────────────
-- Era o único passado sem dinheiro nenhum — um comerciante começando sem um
-- tostão. Valor conforme a proposta de economia: 1d4 de ouro + 2d10 de prata,
-- média de 36 prata.
UPDATE passados
   SET dinheiro_inicial = '[{"quantidade": 1, "faces": 4, "moeda": "ouro"},
                            {"quantidade": 2, "faces": 10, "moeda": "prata"}]'::jsonb
 WHERE nome = 'Varejista' AND deleted_at IS NULL
   AND dinheiro_inicial = '[]'::jsonb;

DO $$
DECLARE
  quantas INTEGER;
  linha   RECORD;
BEGIN
  SELECT count(*) INTO quantas FROM pericias WHERE deleted_at IS NULL;
  RAISE NOTICE 'pericias cadastradas: %', quantas;

  FOR linha IN
    SELECT nome, jsonb_array_length(pericias_iniciais) AS quantas_pericias
      FROM passados WHERE deleted_at IS NULL ORDER BY id
  LOOP
    RAISE NOTICE '  % : % pericia(s) inicial(is)', linha.nome, linha.quantas_pericias;
  END LOOP;
END $$;
