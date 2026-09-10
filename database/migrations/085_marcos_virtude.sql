-- 085 — marcos de Virtude por classe, e a segunda bolsa de pontos
--
-- Fecha o desenho aprovado: os pontos de Virtude vêm de MARCOS de nível de
-- classe (5, 10, 15 e 20), com o valor de cada marco variando por classe.
--
-- A propriedade que sustenta isso: **100 níveis dão 20 marcos, não importa
-- como sejam divididos** — cinco classes até 20, dez até 10, vinte até 5. O
-- orçamento parou de multiplicar com o número de classes, que era o defeito da
-- proposta por nível.
--
-- Melhor cenário (as 5 classes mais generosas): 50 pontos, o teto pedido.
-- Pior cenário: 40. Maximizar as cinco perícias custaria 75, então **nunca
-- satura** — o nível 100 ainda acrescenta.

-- A abordagem por nível fica aposentada. A coluna sai para ninguém tentar usar
-- as duas ao mesmo tempo.
ALTER TABLE classes DROP COLUMN IF EXISTS pontos_virtude_por_nivel;

CREATE TABLE IF NOT EXISTS classe_marco_virtude (
  id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  classe_id  INTEGER     NOT NULL,
  -- Nível DA CLASSE que concede. Sempre 5, 10, 15 ou 20.
  nivel      INTEGER     NOT NULL,
  pontos     INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT,
  updated_by TEXT,
  CONSTRAINT classe_marco_virtude_nivel_check CHECK (nivel IN (5, 10, 15, 20)),
  CONSTRAINT classe_marco_virtude_pontos_check CHECK (pontos BETWEEN 0 AND 10)
);

-- Total, e não parcial: os marcos são detalhe da classe, editados como
-- conjunto, e não têm soft delete — logo não existe linha apagada ocupando a
-- chave.
CREATE UNIQUE INDEX IF NOT EXISTS idx_classe_marco_virtude_unico
  ON classe_marco_virtude (classe_id, nivel);

-- ── Os valores das 29 classes ─────────────────────────────────────────────
--
-- Perfis: combate puro [2,2,3,3]=10, misto [1,2,2,3]=8, e os intermediários
-- 9 [2,2,2,3] e 7 [1,2,2,2] que aparecem nas híbridas.
--
-- A distribuição é crescente de propósito: os marcos 15 e 20 valem mais que o
-- 5 e o 10, o que premia levar a classe até o fim em vez de colecionar
-- começos. Níveis abaixo do próximo marco não contam para nada.
INSERT INTO classe_marco_virtude (classe_id, nivel, pontos)
SELECT c.id, m.nivel, m.pontos
  FROM (VALUES
    -- Base: combate puro
    ('Guerreiro', 10), ('Atirador', 10), ('Monge', 10), ('Protetor', 10),
    -- Base: misto (o Mago foi igualado ao Sacerdote — os dois conjuram, os dois valem 8)
    ('Ladrão', 8), ('Sacerdote', 8), ('Bruxo', 8), ('Mago', 8),
    -- Híbridas: média dos totais das duas raízes
    ('Skirmisher', 10), ('Monge do Vento', 10),
    ('Arcanista de Guerra', 9), ('Arqueiro Arcano', 9), ('Atirador Fantasma', 9),
    ('Caçador das Trevas', 9), ('Flagelo Sangrento', 9), ('Guardião Templário', 9),
    ('Guerreiro das Sombras', 9), ('Guerreiro Espiritual', 9), ('Monge das Sombras', 9),
    ('Punho do Vazio', 9), ('Sentinela Divina', 9),
    ('Assassino Arcano', 8), ('Clérigo das Sombras', 8), ('Inquisidor das Trevas', 8),
    ('Ladrão Divino', 8), ('Mago das Sombras', 8), ('Mago do Éter', 8),
    ('Senhor dos Pactos', 8), ('Teurgo Divino', 8)
  ) AS total(nome, pontos_totais)
  JOIN classes c ON c.name = total.nome AND c.deleted_at IS NULL
  CROSS JOIN LATERAL (
    SELECT * FROM (VALUES
      (5,  CASE total.pontos_totais WHEN 10 THEN 2 WHEN 9 THEN 2 WHEN 8 THEN 1 ELSE 1 END),
      (10, CASE total.pontos_totais WHEN 10 THEN 2 WHEN 9 THEN 2 WHEN 8 THEN 2 ELSE 2 END),
      (15, CASE total.pontos_totais WHEN 10 THEN 3 WHEN 9 THEN 2 WHEN 8 THEN 2 ELSE 2 END),
      (20, CASE total.pontos_totais WHEN 10 THEN 3 WHEN 9 THEN 3 WHEN 8 THEN 3 ELSE 2 END)
    ) AS x(nivel, pontos)
  ) AS m(nivel, pontos)
ON CONFLICT (classe_id, nivel) DO UPDATE SET pontos = EXCLUDED.pontos, updated_at = now();

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('virtude.marcos', '5,10,15,20',
   'Níveis DE CLASSE que concedem ponto de Virtude. 100 níveis dão 20 marcos, dividido como for.'),
  ('virtude.orcamento_maximo', '50',
   'O máximo que dá para juntar em 100 níveis, escolhendo as classes mais generosas.'),
  ('virtude.bolsa_separada', 'true',
   'Perícias de Virtude gastam data.periciaPointsVirtude; as mundanas gastam data.periciaPoints. Sem isso o guerreiro pagaria duas vezes por combate, com o mesmo dinheiro que o alquimista usa no ofício.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

DO $$
DECLARE
  linha    RECORD;
  melhor   INTEGER;
  pior     INTEGER;
  sem      INTEGER;
BEGIN
  SELECT count(*) INTO sem
    FROM classes c WHERE c.deleted_at IS NULL
     AND NOT EXISTS (SELECT 1 FROM classe_marco_virtude m WHERE m.classe_id = c.id);
  IF sem > 0 THEN
    RAISE WARNING '% classe(s) sem marcos de Virtude', sem;
  END IF;

  -- Melhor e pior cenário: as 5 classes mais e menos generosas, já que 100
  -- níveis cabem em 5 classes de 20.
  SELECT sum(total) INTO melhor FROM (
    SELECT sum(pontos) AS total FROM classe_marco_virtude GROUP BY classe_id
    ORDER BY 1 DESC LIMIT 5) AS x;
  SELECT sum(total) INTO pior FROM (
    SELECT sum(pontos) AS total FROM classe_marco_virtude GROUP BY classe_id
    ORDER BY 1 ASC LIMIT 5) AS x;

  RAISE NOTICE 'orcamento: melhor % | pior % | teto para maximizar as 5 pericias: 75', melhor, pior;
  IF melhor > 50 THEN RAISE WARNING 'melhor cenario passou dos 50 pedidos'; END IF;
  IF melhor >= 75 THEN RAISE WARNING 'SATURA: o orcamento alcanca o teto'; END IF;

  -- Agrupa pelo total JÁ CALCULADO na subconsulta: `GROUP BY 1` sobre um
  -- `sum()` do próprio SELECT é inválido no Postgres.
  FOR linha IN
    SELECT t.total, count(*) AS quantas
      FROM (SELECT classe_id, sum(pontos) AS total FROM classe_marco_virtude GROUP BY classe_id) AS t
     GROUP BY t.total ORDER BY t.total DESC
  LOOP
    RAISE NOTICE '  % pontos por classe: % classe(s)', linha.total, linha.quantas;
  END LOOP;
END $$;
