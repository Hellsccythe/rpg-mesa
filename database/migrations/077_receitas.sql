-- 077 — receitas: o que produz o quê, com o quê
--
-- Fecha a fatia vertical começada na 075. A receita não cabe como coluna de
-- nenhuma das tabelas de item por dois motivos: é MUITOS-PARA-MUITOS (uma
-- poção usa três ingredientes; um ingrediente serve a cinco poções) e CRUZA
-- TABELAS (uma espada élfica precisaria de mithril, que é `itens`, e produz
-- um `equipamentos`).
--
-- Daí o par `<coisa>_tabela` + `<coisa>_id` nos dois lados. A alternativa
-- seriam três colunas nulas com a regra "exatamente uma preenchida" — mais
-- explícita, mas cresce a cada tabela nova e obriga a mexer no esquema para
-- acrescentar um tipo de produto.
--
-- O CHECK nos nomes de tabela é o que impede o par de virar lixo: sem ele,
-- 'consumivel' no singular passaria e o JOIN silenciosamente não acharia nada.

-- ── Preço dos ingredientes ────────────────────────────────────────────────
--
-- Fabricar deve custar 70–75% do preço de compra: economiza, mas não o
-- bastante para ninguém mais comprar nada. A Poção de Cura Menor custa 25
-- prata, então a receita dela precisa somar por volta de 18.
--
-- Antes: 1 Erva (3) + 1 Água (1) = 4 prata, ou 16% do preço de compra. Fabricar
-- seria 6× mais barato, e a poção sairia das lojas para sempre.
--
-- Agora: 2 Ervas (7 cada) + 2 Águas (2 cada) = 18 prata = 72% do preço.
--
-- Isso é o custo de COMPRAR os ingredientes. Quem colhe a erva na beira do rio
-- paga zero em moeda e paga em tempo — que é a terceira via da economia, e a
-- razão de um personagem coletor valer a pena.
UPDATE itens SET valor = 7.00 WHERE nome = 'Erva de Sangue' AND deleted_at IS NULL;
UPDATE itens SET valor = 2.00 WHERE nome = 'Água Pura'      AND deleted_at IS NULL;

-- ── Receitas ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receitas (
  id                   INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome                 VARCHAR(255) NOT NULL,
  descricao            TEXT,

  produto_tabela       VARCHAR(20)  NOT NULL,
  produto_id           INTEGER      NOT NULL,
  quantidade_produzida INTEGER      NOT NULL DEFAULT 1,

  -- Em minutos para caber tanto "20 minutos" quanto "dois dias" sem trocar a
  -- unidade depois.
  tempo_minutos        INTEGER      NOT NULL DEFAULT 60,

  -- Dificuldade do teste, solta por enquanto: o vínculo com a perícia entra
  -- quando o sistema de habilidades mundanas existir. `pericia_id` já fica
  -- reservada para não precisar de outra migration só para isso.
  dificuldade          INTEGER      NOT NULL DEFAULT 10,
  pericia_id           INTEGER,

  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by           TEXT,
  updated_by           TEXT,
  deleted_at           TIMESTAMPTZ,
  deleted_by           TEXT,

  CONSTRAINT receitas_produto_tabela_check
    CHECK (produto_tabela IN ('consumiveis', 'itens', 'equipamentos'))
);

-- Sem UNIQUE em (produto_tabela, produto_id) de propósito: caminhos
-- alternativos para o mesmo produto são desejáveis — uma poção feita com erva
-- comum e outra com um substituto raro e mais rápido.
CREATE INDEX IF NOT EXISTS idx_receitas_produto
  ON receitas (produto_tabela, produto_id) WHERE deleted_at IS NULL;

-- ── Ingredientes de cada receita ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receita_ingredientes (
  id                  INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  receita_id          INTEGER     NOT NULL,

  ingrediente_tabela  VARCHAR(20) NOT NULL,
  ingrediente_id      INTEGER     NOT NULL,
  quantidade          INTEGER     NOT NULL DEFAULT 1,

  -- Falso para ferramenta: o alambique é exigido pela receita mas não some ao
  -- ser usado. Sem esta coluna, ferramenta e insumo seriam indistinguíveis e
  -- o jogador perderia o alambique a cada poção.
  consumido           BOOLEAN     NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by          TEXT,
  updated_by          TEXT,

  CONSTRAINT receita_ingredientes_tabela_check
    CHECK (ingrediente_tabela IN ('consumiveis', 'itens', 'equipamentos'))
);

-- Total, e não parcial: os ingredientes são detalhe da receita, editados como
-- conjunto (apaga tudo e reinsere), então não há soft delete aqui — daí não
-- existir linha apagada ocupando a chave.
CREATE UNIQUE INDEX IF NOT EXISTS idx_receita_ingrediente_unico
  ON receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id);

CREATE INDEX IF NOT EXISTS idx_receita_ingredientes_receita
  ON receita_ingredientes (receita_id);

-- ── A primeira receita ────────────────────────────────────────────────────
INSERT INTO receitas (nome, descricao, produto_tabela, produto_id, quantidade_produzida, tempo_minutos, dificuldade)
SELECT
  'Poção de Cura Menor',
  'Macera-se a erva ainda fresca, ferve-se em água pura e coa-se duas vezes. Errar o ponto queima a mistura e perde tudo.',
  'consumiveis',
  (SELECT id FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL),
  1,
  60,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM receitas WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL
)
AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL);

INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT
  (SELECT id FROM receitas WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL),
  'itens',
  itens.id,
  insumo.quantidade,
  TRUE
FROM (VALUES ('Erva de Sangue', 2), ('Água Pura', 2)) AS insumo(nome, quantidade)
JOIN itens ON itens.nome = insumo.nome AND itens.deleted_at IS NULL
WHERE EXISTS (SELECT 1 FROM receitas WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  custo   NUMERIC;
  preco   NUMERIC;
BEGIN
  SELECT COALESCE(sum(itens.valor * ingrediente.quantidade), 0) INTO custo
    FROM receitas
    JOIN receita_ingredientes AS ingrediente ON ingrediente.receita_id = receitas.id
    JOIN itens ON itens.id = ingrediente.ingrediente_id AND ingrediente.ingrediente_tabela = 'itens'
   WHERE receitas.nome = 'Poção de Cura Menor' AND receitas.deleted_at IS NULL;

  SELECT valor INTO preco FROM consumiveis
   WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL;

  -- O sinal de porcentagem vai dentro do próprio argumento: no RAISE, `%%`
  -- casa antes de `%`, então "%%%" imprimiria "%72" em vez de "72%".
  RAISE NOTICE 'Pocao de Cura Menor: ingredientes % pr, compra % pr (% do preco)',
    custo, preco, round(custo / NULLIF(preco, 0) * 100) || '%';
END $$;
