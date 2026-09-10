-- 081 — perícias: grupo Virtude, duas bolsas de pontos, e a trava de atributo
--
-- Quatro mudanças, e a terceira é a que muda o desenho de verdade.
--
-- ── 1. Negociação absorve Lábia, e entra Encanto ─────────────────────────
-- Usa-se lábia dentro da negociação; separá-las cobrava duas vezes pelo mesmo
-- músculo social. O custo dessa fusão é que o mercador honesto e o vigarista
-- passam a ser mecanicamente a mesma pessoa — decisão consciente do mestre.
--
-- ── 2. Cavalgar e Instrumentos vão de Corpo para Saber ───────────────────
-- Corpo fica sendo uso bruto do corpo (Dança, Acrobacia, Furtividade,
-- Atletismo); Saber vira "o que você estudou". A categoria só organiza a tela.
--
-- ── 3. Grupo Virtude, com DUAS BOLSAS de ponto ───────────────────────────
-- Luta, Magia, Pontaria, Reflexo e Fortitude entram como perícias — mas com
-- orçamento SEPARADO, e isso não é detalhe.
--
-- O jogador já paga por competência de combate: pontos de classe → pontos de
-- skill → skills com dano. Se Luta saísse da mesma bolsa das perícias
-- mundanas, o Guerreiro pagaria duas vezes pela mesma coisa, e pior: com o
-- mesmo dinheiro que o Alquimista usa para Alquimia. O resultado seria um
-- Guerreiro sem Sobrevivência e um Alquimista ruim de briga por falta de
-- orçamento, não por escolha.
--
-- Com duas bolsas, o Guerreiro é bom de Luta porque é Guerreiro, e o
-- Alquimista tem Reflexo decente sem abrir mão do ofício. As trilhas param de
-- competir. `classes.pontos_pericia_virtude_por_nivel` é o ritmo de cada uma.
--
-- Luta/Magia/Pontaria são ATAQUE e Reflexo/Fortitude são RESISTÊNCIA — duas
-- mecânicas com a mesma fórmula, no mesmo grupo por conveniência de tela.
--
-- ── 4. Trava do atributo ─────────────────────────────────────────────────
-- Ver a coluna `bonus_atributo_limitado` mais abaixo.

-- ── Categoria nova ────────────────────────────────────────────────────────
ALTER TABLE pericias DROP CONSTRAINT IF EXISTS pericias_categoria_check;
ALTER TABLE pericias ADD  CONSTRAINT pericias_categoria_check
  CHECK (categoria IN ('Ofício', 'Social', 'Corpo', 'Saber', 'Virtude'));

-- Qual bolsa paga o rank desta perícia.
ALTER TABLE pericias
  ADD COLUMN IF NOT EXISTS bolsa VARCHAR(10) NOT NULL DEFAULT 'mundana';
ALTER TABLE pericias DROP CONSTRAINT IF EXISTS pericias_bolsa_check;
ALTER TABLE pericias ADD  CONSTRAINT pericias_bolsa_check
  CHECK (bolsa IN ('mundana', 'virtude'));

-- ── 1. Fusão de Lábia em Negociação ───────────────────────────────────────
UPDATE pericias
   SET descricao = 'Comprar barato, vender caro, e fazer soar razoável o que não é. Absorveu Lábia.'
 WHERE nome = 'Negociação' AND deleted_at IS NULL;

-- Os personagens que tinham rank em Lábia mantêm o rank, transferido para
-- Negociação. Fica o MAIOR dos dois: ninguém perde treino numa reorganização
-- de tabela.
UPDATE characters AS c
   SET data = jsonb_set(
     c.data, '{pericias}',
     (
       SELECT COALESCE(jsonb_agg(entrada ORDER BY ordem), '[]'::jsonb)
       FROM (
         SELECT
           CASE
             WHEN (p.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Lábia' AND deleted_at IS NULL)
               THEN jsonb_build_object(
                      'periciaId', (SELECT id FROM pericias WHERE nome = 'Negociação' AND deleted_at IS NULL),
                      'nome', 'Negociação',
                      'rank', GREATEST(
                        (p.valor->>'rank')::int,
                        COALESCE((
                          SELECT (q.valor->>'rank')::int
                          FROM jsonb_array_elements(c.data->'pericias') AS q(valor)
                          WHERE (q.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Negociação' AND deleted_at IS NULL)
                        ), 0))
                    )
             ELSE p.valor
           END AS entrada,
           p.ordem
         FROM jsonb_array_elements(c.data->'pericias') WITH ORDINALITY AS p(valor, ordem)
         -- Descarta a entrada original de Negociação: a de Lábia já traz o maior rank.
         WHERE NOT (
           (p.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Negociação' AND deleted_at IS NULL)
           AND EXISTS (
             SELECT 1 FROM jsonb_array_elements(c.data->'pericias') AS r(valor)
             WHERE (r.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Lábia' AND deleted_at IS NULL)
           )
         )
       ) AS reescrito
     ))
 WHERE c.deleted_at IS NULL
   AND c.data ? 'pericias'
   AND EXISTS (
     SELECT 1 FROM jsonb_array_elements(c.data->'pericias') AS p(valor)
     WHERE (p.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Lábia' AND deleted_at IS NULL)
   );

-- Os passados que concediam Lábia passam a conceder Negociação.
--
-- Agrupa por periciaId ficando com o MAIOR rank. `jsonb_agg(DISTINCT ...)`
-- não serviria: um passado com Negociação 2 e Lábia 1 vira dois objetos
-- distintos (rank 2 e rank 1) e a perícia apareceria duplicada — foi o que
-- aconteceu com o Varejista na primeira versão desta migration.
UPDATE passados
   SET pericias_iniciais = (
     SELECT COALESCE(jsonb_agg(jsonb_build_object('periciaId', id_final, 'rank', maior_rank)
                               ORDER BY id_final), '[]'::jsonb)
     FROM (
       SELECT
         CASE WHEN (e.valor->>'periciaId')::int = (SELECT id FROM pericias WHERE nome = 'Lábia')
              THEN (SELECT id FROM pericias WHERE nome = 'Negociação' AND deleted_at IS NULL)
              ELSE (e.valor->>'periciaId')::int END AS id_final,
         max((e.valor->>'rank')::int) AS maior_rank
       FROM jsonb_array_elements(passados.pericias_iniciais) AS e(valor)
       GROUP BY 1
     ) AS fundido)
 WHERE deleted_at IS NULL
   AND pericias_iniciais @> jsonb_build_array(jsonb_build_object(
         'periciaId', (SELECT id FROM pericias WHERE nome = 'Lábia')));

UPDATE pericias SET deleted_at = now(), deleted_by = 'migration-081'
 WHERE nome = 'Lábia' AND deleted_at IS NULL;

INSERT INTO pericias (nome, descricao, atributo_base, categoria, bolsa)
SELECT 'Encanto', 'Fazer com que gostem de você, e usar isso.', 'aura', 'Social', 'mundana'
WHERE NOT EXISTS (SELECT 1 FROM pericias WHERE nome = 'Encanto' AND deleted_at IS NULL);

-- ── 2. Cavalgar e Instrumentos passam para Saber ──────────────────────────
UPDATE pericias SET categoria = 'Saber'
 WHERE nome IN ('Cavalgar', 'Instrumentos') AND deleted_at IS NULL;

-- ── 3. Grupo Virtude ──────────────────────────────────────────────────────
INSERT INTO pericias (nome, descricao, atributo_base, categoria, bolsa)
SELECT * FROM (VALUES
  ('Luta',      'Acertar e aparar a curta distância, com lâmina ou sem ela.', 'forca',        'Virtude', 'virtude'),
  ('Pontaria',  'Acertar o que está longe, com arco, besta ou pólvora.',      'destreza',     'Virtude', 'virtude'),
  ('Magia',     'Moldar o que não é matéria, e não perder o controle disso.', 'aura',         'Virtude', 'virtude'),
  ('Reflexo',   'Sair do caminho antes de o caminho chegar.',                 'destreza',     'Virtude', 'virtude'),
  ('Fortitude', 'Aguentar veneno, doença e o que mais quiser derrubar você.', 'resistencia',  'Virtude', 'virtude')
) AS novas(nome, descricao, atributo_base, categoria, bolsa)
WHERE NOT EXISTS (SELECT 1 FROM pericias WHERE categoria = 'Virtude' AND deleted_at IS NULL);

-- Ritmo de ponto de Virtude por nível de classe. Default 1: quem não for
-- ajustado pelo mestre ganha o padrão em vez de ficar sem nada.
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS pontos_virtude_por_nivel INTEGER NOT NULL DEFAULT 1;

-- ── 4. Trava do atributo ──────────────────────────────────────────────────
--
-- O teste era `d20 + rank × 3 + ⌊atributo ÷ 2⌋`. Com os atributos crescendo ao
-- longo da campanha, um personagem de rank 1 e Inteligência 20 chegava a +13 e
-- passava 70% dos testes Raros — treino mínimo vencendo por talento bruto.
--
-- Agora o atributo nunca contribui mais que o DOBRO DO RANK:
--
--     d20 + rank × 3 + min(⌊atributo ÷ 2⌋, rank × 2)
--
-- O mesmo rank 1 com Inteligência 20 cai para 30% no DC 20; o profissional
-- (rank 3) e o mestre (rank 5) não perdem nada. Talento deixa de substituir
-- treino sem deixar de importar.
--
-- Fica gravado no banco em vez de só no código porque é regra de jogo, e o
-- mestre precisa poder consultá-la sem abrir o fonte.
CREATE TABLE IF NOT EXISTS regras_do_sistema (
  chave       VARCHAR(60) PRIMARY KEY,
  valor       TEXT        NOT NULL,
  descricao   TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT
);

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('pericia.formula_do_teste',
   'd20 + rank * 3 + min(floor(atributo / 2), rank * 2)',
   'Teste de perícia. O atributo entra pela metade e nunca contribui mais que o dobro do rank.'),
  ('pericia.rank_maximo', '5',
   'Rank máximo. Com custo crescente (rank N custa N pontos), chegar lá custa 15.'),
  ('pericia.rank_zero_nao_tenta', 'true',
   'Rank 0 é não treinado e não pode tentar o que exige treino.'),
  ('pv.dado_por_nivel', '1d4',
   'Cada nível de personagem concede 1d4 de PV. Passivas de classe podem aumentar o dado.'),
  ('pocao.limite_por_semana', '2',
   'Poção de cura aplica Saturação Alquímica; com 2 acúmulos não faz mais efeito.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

DO $$
DECLARE linha RECORD;
BEGIN
  FOR linha IN
    SELECT categoria, bolsa, count(*) AS quantas
      FROM pericias WHERE deleted_at IS NULL
     GROUP BY categoria, bolsa ORDER BY bolsa DESC, categoria
  LOOP
    RAISE NOTICE '% (%) : % pericia(s)', rpad(linha.categoria, 8), linha.bolsa, linha.quantas;
  END LOOP;
END $$;
