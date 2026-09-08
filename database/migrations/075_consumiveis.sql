-- 075 — consumíveis: o que o jogador usa e some
--
-- Primeira das duas tabelas que tiram de `equipamentos` o que nunca foi
-- equipamento. O corte é por COMPORTAMENTO, não por tema:
--
--   equipamentos  equipa e FICA equipado      (armas, armaduras, escudos)
--   consumiveis   usa e SOME                  (poções, venenos, munição)
--   itens         só carrega, vende ou        (cosméticos, ferramentas,
--                 entrega numa receita         materiais, ingredientes)
--
-- "Some quando usa?" tem uma resposta. "É cosmético ou utilitário?" é opinião,
-- e critério que exige julgamento produz dado inconsistente.
--
-- Uma poção fica aqui; a erva que a produz fica em `itens`. As duas se ligam
-- pela tabela de receitas, que vem depois — receita é muitos-para-muitos e
-- cruza tabelas, então não cabe como coluna de nenhuma das duas.

-- ── Categoria do consumível ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categoria_consumivel (
  item        INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  descricao   VARCHAR(100) NOT NULL,
  icone       VARCHAR(100),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by  TEXT,
  updated_by  TEXT,
  deleted_at  TIMESTAMPTZ,
  deleted_by  TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categoria_consumivel_descricao_ativa
  ON categoria_consumivel (descricao) WHERE deleted_at IS NULL;

INSERT INTO categoria_consumivel (descricao)
SELECT * FROM (VALUES
  ('Poção'), ('Veneno'), ('Munição'), ('Alimento'), ('Pergaminho')
) AS novas(descricao)
WHERE NOT EXISTS (SELECT 1 FROM categoria_consumivel WHERE deleted_at IS NULL);

-- ── Consumíveis ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consumiveis (
  id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome        VARCHAR(255) NOT NULL,
  descricao   TEXT,
  -- O que acontece ao usar. NOT NULL com default '': o Postgres só aplica o
  -- default quando a coluna é OMITIDA do INSERT, então passar null explícito
  -- viola a constraint. É o bug que já apareceu em classes.starting_skills,
  -- equipamentos.dano e skills.description.
  efeito      TEXT         NOT NULL DEFAULT '',
  -- Quantas vezes antes de acabar. Uma poção tem 1; um kit de primeiros
  -- socorros, vários.
  usos        INTEGER      NOT NULL DEFAULT 1,
  -- "Instantâneo", "3 turnos", "1 hora". Texto livre de propósito: virar
  -- número exigiria decidir a unidade, e a mesa fala em turnos e em horas.
  duracao     VARCHAR(60),
  peso        NUMERIC(8,2),
  -- Preço final, na moeda de referência (prata). O multiplicador da raridade
  -- é referência para o mestre decidir este número, e NÃO é aplicado em cima
  -- dele — senão marcar um item como Raro multiplicaria por 10 um preço que
  -- já tinha sido pensado.
  valor       NUMERIC(12,2),
  raridade_item              INTEGER,
  categoria_consumivel_item  INTEGER,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by  TEXT,
  updated_by  TEXT,
  deleted_at  TIMESTAMPTZ,
  deleted_by  TEXT
);

CREATE INDEX IF NOT EXISTS idx_consumiveis_ativos     ON consumiveis (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consumiveis_raridade   ON consumiveis (raridade_item) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_consumiveis_categoria  ON consumiveis (categoria_consumivel_item) WHERE deleted_at IS NULL;

-- ── Primeira fatia: a cadeia da Poção de Cura Menor ───────────────────────
-- Um registro só, de propósito. A ideia é exercitar o sistema inteiro
-- (receita, tempo, teste de perícia, falha) com o mínimo de dado possível:
-- se as regras estiverem erradas, joga-se fora um item e não sessenta.
INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor, raridade_item, categoria_consumivel_item)
SELECT
  'Poção de Cura Menor',
  'Um frasco pequeno de líquido avermelhado, morno ao toque. Comum o bastante para se achar em qualquer vilarejo.',
  'Recupera 2d4 pontos de vida ao ser bebida.',
  1,
  'Instantâneo',
  0.30,
  25.00,
  (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
  (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL);

DO $$
DECLARE
  categorias INTEGER;
  quantos    INTEGER;
BEGIN
  SELECT count(*) INTO categorias FROM categoria_consumivel WHERE deleted_at IS NULL;
  SELECT count(*) INTO quantos    FROM consumiveis          WHERE deleted_at IS NULL;
  RAISE NOTICE 'categorias de consumivel: %  |  consumiveis: %', categorias, quantos;
END $$;
