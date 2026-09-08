-- 076 — itens: o que só se carrega, vende ou entrega numa receita
--
-- Fecha o corte por comportamento começado na 075:
--
--   equipamentos  equipa e FICA equipado
--   consumiveis   usa e SOME
--   itens         só carrega, vende ou entrega numa receita   ← esta
--
-- Aqui moram cosméticos, ferramentas, equipamento de exploração, materiais
-- preciosos e ingredientes. Todos se comportam igual: você carrega, vende ou
-- entrega. Um batom e uma barra de mithril não precisam de tabelas separadas —
-- separá-los compraria duas telas de admin e nada mais.
--
-- Uma erva de alquimia é ITEM, não consumível: ela não some ao ser usada, ela
-- vira outra coisa. Quem some é a poção que ela produz.

-- ── Categoria do item ─────────────────────────────────────────────────────
--
-- Nota de nomenclatura: as outras tabelas seguem `<lookup>_item` na coluna que
-- referencia (categoria_consumivel → categoria_consumivel_item). Aqui isso
-- daria `categoria_item_item`. Como o nome do lookup já termina em `_item`, a
-- coluna fica `itens.categoria_item` — igualmente sem ambiguidade e legível.
CREATE TABLE IF NOT EXISTS categoria_item (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_categoria_item_descricao_ativa
  ON categoria_item (descricao) WHERE deleted_at IS NULL;

INSERT INTO categoria_item (descricao)
SELECT * FROM (VALUES
  ('Ingrediente'), ('Material Precioso'), ('Ferramenta'), ('Exploração'), ('Cosmético')
) AS novas(descricao)
WHERE NOT EXISTS (SELECT 1 FROM categoria_item WHERE deleted_at IS NULL);

-- ── Itens ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS itens (
  id             INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome           VARCHAR(255) NOT NULL,
  descricao      TEXT,
  peso           NUMERIC(8,2),
  -- Preço final em prata, mesma regra dos consumíveis: o multiplicador da
  -- raridade é referência para decidir este número, não é aplicado em cima.
  valor          NUMERIC(12,2),
  -- Itens empilháveis (ervas, minérios, flechas soltas) contra únicos (uma
  -- gazua, um vestido). Muda como o inventário mostra e soma.
  empilhavel     BOOLEAN      NOT NULL DEFAULT TRUE,
  raridade_item  INTEGER,
  categoria_item INTEGER,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by     TEXT,
  updated_by     TEXT,
  deleted_at     TIMESTAMPTZ,
  deleted_by     TEXT
);

CREATE INDEX IF NOT EXISTS idx_itens_ativos    ON itens (deleted_at)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_raridade  ON itens (raridade_item)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_itens_categoria ON itens (categoria_item) WHERE deleted_at IS NULL;

-- ── Os dois ingredientes da Poção de Cura Menor ───────────────────────────
-- Continuam a fatia vertical da 075: com eles a cadeia tem produto e insumos,
-- e só falta a receita para ligá-los.
INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT
  novo.nome, novo.descricao, novo.peso, novo.valor, TRUE,
  (SELECT item FROM raridade      WHERE descricao = 'Comum'       AND deleted_at IS NULL),
  (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
FROM (VALUES
  ('Erva de Sangue',
   'Folha estreita de nervuras vermelhas, comum em beiras de rio. Amarga, e mancha os dedos de quem a colhe.',
   0.10, 3.00),
  ('Água Pura',
   'Água de nascente, fervida e guardada em frasco lacrado. Base de quase toda poção — barata, mas ninguém trabalha sem ela.',
   0.20, 1.00)
) AS novo(nome, descricao, peso, valor)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = novo.nome AND deleted_at IS NULL);

DO $$
DECLARE
  categorias INTEGER;
  quantos    INTEGER;
BEGIN
  SELECT count(*) INTO categorias FROM categoria_item WHERE deleted_at IS NULL;
  SELECT count(*) INTO quantos    FROM itens          WHERE deleted_at IS NULL;
  RAISE NOTICE 'categorias de item: %  |  itens: %', categorias, quantos;
END $$;
