-- 089 — as cinco armas de fogo
--
-- O catálogo não tinha uma única. Só é possível cadastrá-las agora porque a
-- 087 separou `dano` (uma pistola precisa de dado, tipo e multiplicador em
-- colunas distintas) e a 088 criou a faixa de alcance, que é justamente o que
-- diferencia uma arma de fogo de um arco.
--
-- Três decisões de regra que valem para todas elas:
--
-- 1. ATIRAM TODO TURNO. Sem mecânica de recarga. Historicamente errado e
--    deliberado: recarga a cada 2-3 turnos tiraria o personagem da luta na
--    maior parte dos turnos, e a mesa passaria mais tempo contando rodadas de
--    pólvora do que jogando. O custo de usar arma de fogo está no preço e na
--    raridade, não no tédio.
--
-- 2. FAIXA IDEAL CURTA E PENALIDADE FORA DELA. É o que as separa dos arcos:
--    um mosquete bate mais forte que o arco longo dentro da faixa, e perde o
--    passo de dado antes dele. Cano longo alcança mais; pistola, quase nada.
--
-- 3. EM CORPO A CORPO CAEM PARA 1d4 SEM MULTIPLICADOR. Isso NÃO virou coluna:
--    vale para toda arma de longo alcance, arco e besta inclusive — bater em
--    alguém com a coronha rende o mesmo que bater com o arco. Regra do
--    sistema, uma linha, em vez de um campo repetido em cada registro.

-- ── A regra do corpo a corpo, que é geral ─────────────────────────────────

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('arma.longo_alcance_em_corpo_a_corpo', '1d4',
   'Arma de longo alcance usada com o alvo colado causa 1d4 e ignora o multiplicador de crítico. Vale para arco, besta e arma de fogo — por isso é regra, não coluna.'),
  ('arma.fogo_recarga', 'nenhuma',
   'Armas de fogo atiram todo turno. Recarga foi deliberadamente deixada de fora: tiraria o personagem da luta na maior parte dos turnos.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

-- ── As cinco ──────────────────────────────────────────────────────────────
--
-- Todas: categoria Armas (6), classe Exótica (4), tipo Longo alcance (7),
-- perícia Pontaria (24), dano Físico (6).
--
-- Exótica de propósito — arma de fogo não entra no treinamento de armas
-- simples nem marciais. Quem quiser usar paga a proficiência à parte.
--
-- Preços ancorados na ECONOMIA.pdf: 2 prata é um dia de trabalho sem
-- qualificação, 60 prata é um mês. A pistola mais barata custa dois meses de
-- salário — arma de fogo é objeto de gente com posses, e é isso que a mantém
-- fora das mãos de todo bandido de estrada sem precisar de regra proibindo.
-- Comparar com o catálogo existente: Espada Longa 18, Arco Longo 25,
-- Zweihander 45.

INSERT INTO equipamentos (
  nome, dano, multiplicador_critico, tipo_dano_item, peso, valor,
  alcance_ideal, alcance_maximo, pericia_id, raridade_item,
  categoria_equipamento_item, classe_equipamento_item, tipo_equipamento_item,
  propriedade_equipamento_item, pre_requisitos, descricao_equipamento, created_by
)
SELECT v.nome, v.dano, v.critico, 6, v.peso, v.valor,
       v.ideal, v.maximo, 24,
       (SELECT item FROM raridade WHERE descricao = v.raridade AND deleted_at IS NULL),
       6, ARRAY[4], ARRAY[7], v.props,
       'Proficiência com armas exóticas', v.descricao, 'migration 089'
  FROM (VALUES
    -- Curta, uma mão, discreta. A porta de entrada.
    ('Pistola de Pederneira', '1d8', 3, 1.50, 120.00, 10, 20, 'Incomum',
     ARRAY[10],
     'Cano curto, fecho de pederneira. Cabe sob o casaco e resolve uma discussão a dez passos.'),

    -- Duas, casadas, feitas para serem vistas. Ágil e Sofisticada.
    ('Par de Pistolas de Duelo', '1d8', 3, 3.00, 320.00, 12, 24, 'Raro',
     ARRAY[10, 15],
     'Vendidas aos pares, em estojo forrado. Balanceadas para a mão e para a plateia.'),

    -- O cano longo barato: alcance de arco por preço de arma de fogo.
    ('Arcabuz', '1d10', 3, 3.50, 180.00, 20, 40, 'Incomum',
     ARRAY[19],
     'Pesado e desajeitado, mas fura placas a vinte passos. O primeiro cano longo que um soldado consegue pagar.'),

    -- O maior alcance do catálogo inteiro, e o maior dado.
    ('Mosquete', '1d12', 3, 4.50, 260.00, 40, 80, 'Raro',
     ARRAY[15, 19],
     'Cano longo raiado. Derruba um cavaleiro antes que ele feche a distância — se o tiro sair.'),

    -- Espalha: dado menor e sem multiplicador, mas pega mais de um.
    ('Bacamarte', '1d10', 2, 3.50, 200.00, 6, 12, 'Incomum',
     ARRAY[11, 15],
     'Boca de sino, carregado com o que houver. De perto não erra; de longe não acerta.')
  ) AS v(nome, dano, critico, peso, valor, ideal, maximo, raridade, props, descricao)
 WHERE NOT EXISTS (
   SELECT 1 FROM equipamentos e WHERE e.nome = v.nome AND e.deleted_at IS NULL
 );

-- ── Verificação ───────────────────────────────────────────────────────────

DO $$
DECLARE
  linha    RECORD;
  criadas  INTEGER;
  sem_rar  INTEGER;
  sujo     INTEGER;
BEGIN
  SELECT count(*) INTO criadas FROM equipamentos
   WHERE deleted_at IS NULL
     AND nome IN ('Pistola de Pederneira', 'Par de Pistolas de Duelo', 'Arcabuz', 'Mosquete', 'Bacamarte');
  IF criadas <> 5 THEN
    RAISE EXCEPTION 'ABORTADO: esperava 5 armas de fogo, encontrei %', criadas;
  END IF;

  -- A subconsulta de raridade devolve NULL silenciosamente se a descrição não
  -- casar — e sem FOREIGN KEY nada reclamaria depois.
  SELECT count(*) INTO sem_rar FROM equipamentos
   WHERE deleted_at IS NULL AND created_by = 'migration 089' AND raridade_item IS NULL;
  IF sem_rar > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % arma(s) de fogo ficaram sem raridade', sem_rar;
  END IF;

  -- Mesma checagem de formato da 087, agora contra as linhas novas.
  SELECT count(*) INTO sujo FROM equipamentos
   WHERE deleted_at IS NULL AND dano <> '' AND dano !~ '^[0-9]+d[0-9]+$';
  IF sujo > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % linha(s) com `dano` fora do formato NdN', sujo;
  END IF;

  RAISE NOTICE 'O catalogo de longo alcance, por alcance ideal:';
  FOR linha IN
    SELECT e.nome, e.dano, e.multiplicador_critico AS crit, e.alcance_ideal AS ideal,
           e.alcance_maximo AS maximo, e.valor, r.descricao AS raridade
      FROM equipamentos e
      LEFT JOIN raridade r ON r.item = e.raridade_item
     WHERE e.deleted_at IS NULL AND 7 = ANY(e.tipo_equipamento_item)
     ORDER BY e.alcance_ideal
  LOOP
    RAISE NOTICE '  % — % x% · %m/%m · % pr · %',
      linha.nome, linha.dano, linha.crit, linha.ideal, linha.maximo, linha.valor, linha.raridade;
  END LOOP;
END $$;
