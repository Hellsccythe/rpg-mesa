-- 080 — condições: o que dá errado com um personagem
--
-- Primeira camada do sistema de alquimia, e a que precisa vir antes: uma poção
-- que cura Cegueira não significa nada até "Cegueira" existir com regra
-- própria. Construir na ordem inversa produziria condições inventadas para
-- justificar poções já batizadas.
--
-- **Condição não é alvo de poção.** Quem inflige é skill, veneno, armadilha e
-- monstro; a poção é só uma das respostas, ao lado da perícia Medicina e do
-- tempo. Se esta tabela nascesse como "a lista do que as poções curam", ela
-- serviria poção e mais nada — e o combate acabaria com a própria lista, e as
-- duas divergiriam. É o mesmo erro que `categoria_arma` cometeu neste projeto.
--
-- A prova de que é estrutural: `categoria_consumivel` já tem Veneno. Veneno é
-- o espelho da poção — um inflige, o outro cura. Os dois apontam para cá.
--
-- A gravidade da condição É a raridade da cura: `raridade_item` referencia a
-- mesma escala dos itens, e a `dificuldade_base` dela (10/15/20/25) já era a
-- DC do teste de Alquimia. As duas tabelas conversaram sem coluna nova.

CREATE TABLE IF NOT EXISTS condicoes (
  id             INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome           VARCHAR(100) NOT NULL,
  descricao      TEXT         NOT NULL DEFAULT '',

  -- O que a condição faz na prática, em texto de mesa.
  efeito         TEXT         NOT NULL DEFAULT '',

  -- Física, Mental, Mágica, Doença, Alquímica. CHECK e não lookup: são
  -- rótulos de agrupamento que não carregam dado nenhum.
  categoria      VARCHAR(20)  NOT NULL,

  -- Gravidade. Referencia `raridade.item` — a mesma escala dos itens.
  raridade_item  INTEGER,

  -- Quanto tempo dura se ninguém fizer nada.
  duracao        VARCHAR(60)  NOT NULL DEFAULT '',

  -- Por quanto tempo a CURA ainda funciona. Nulo = sem prazo.
  --
  -- Existe por causa de cegueira e surdez: depois de cicatrizadas, nenhuma
  -- poção alcança. Isso cria prazo narrativo — há uma janela para agir, e
  -- passada a janela a perda é real, e não uma ida à loja.
  janela_de_cura VARCHAR(60),

  -- O que sobra quando a janela fecha. Texto livre porque a resposta é
  -- narrativa: "cegueira permanente", "o membro é perdido".
  se_nao_tratada TEXT,

  -- Empilha? Sangramento de duas fontes soma; Cegueira não.
  acumulativa    BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_by     TEXT,
  updated_by     TEXT,
  deleted_at     TIMESTAMPTZ,
  deleted_by     TEXT,

  CONSTRAINT condicoes_categoria_check
    CHECK (categoria IN ('Física', 'Mental', 'Mágica', 'Doença', 'Alquímica'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_condicoes_nome_ativa
  ON condicoes (nome) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_condicoes_raridade
  ON condicoes (raridade_item) WHERE deleted_at IS NULL;

INSERT INTO condicoes (nome, categoria, raridade_item, efeito, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT
  novo.nome, novo.categoria,
  (SELECT item FROM raridade WHERE descricao = novo.tier AND deleted_at IS NULL),
  novo.efeito, novo.duracao, novo.janela, novo.se_nao_tratada, novo.acumulativa
FROM (VALUES
  -- ── Comum: atrapalham, mas passam ────────────────────────────────────
  ('Sangramento',  'Física', 'Comum',   'Perde 1d4 PV no início de cada turno.',
   'Até ser tratada', NULL, NULL, TRUE),
  ('Atordoado',    'Física', 'Comum',   'Perde a ação bônus e age por último na ordem.',
   '1 turno', NULL, NULL, FALSE),
  ('Fadiga',       'Física', 'Comum',   'Sofre −2 em testes de Força e de Resistência.',
   'Até descansar', NULL, NULL, TRUE),
  ('Náusea',       'Física', 'Comum',   'Não consegue usar consumível. Sofre −2 em ataques.',
   '1d4 turnos', NULL, NULL, FALSE),
  ('Embriaguez',   'Mental', 'Comum',   'Sofre −3 em Destreza e Inteligência, e ganha +2 contra medo.',
   '1 hora', NULL, NULL, FALSE),
  ('Ferida Leve',  'Física', 'Comum',   'Não recupera PV descansando enquanto durar.',
   'Até ser tratada', NULL, NULL, FALSE),

  -- ── Incomum: exigem intervenção ──────────────────────────────────────
  --
  -- Cegueira e Surdez são o motivo de `janela_de_cura` existir. A poção age
  -- sobre o dano ainda fresco; depois que o corpo cicatriza, acabou.
  ('Cegueira',     'Física', 'Incomum', 'Não enxerga. Ataque à distância falha automaticamente.',
   'Até ser tratada', '3 dias', 'A cegueira se torna permanente e nenhuma poção a alcança.', FALSE),
  ('Surdez',       'Física', 'Incomum', 'Não ouve. Falha em Percepção auditiva e em ordem dita em voz.',
   'Até ser tratada', '3 dias', 'A surdez se torna permanente e nenhuma poção a alcança.', FALSE),
  ('Envenenado',   'Física', 'Incomum', 'Perde 1d6 PV por turno e sofre −2 em tudo.',
   'Até ser tratada', NULL, NULL, TRUE),
  ('Queimadura',   'Física', 'Incomum', 'Perde 1d6 PV por turno. Dano de fogo conta em dobro.',
   '3 turnos ou até tratada', NULL, NULL, TRUE),
  ('Enregelado',   'Física', 'Incomum', 'Move-se pela metade e sofre −3 em Destreza.',
   'Até ser tratada', NULL, NULL, FALSE),
  ('Silenciado',   'Mágica', 'Incomum', 'Não usa skill que exija palavra falada.',
   'Até ser tratada', NULL, NULL, FALSE),
  ('Amedrontado',  'Mental', 'Incomum', 'Não pode se aproximar da fonte. Desvantagem contra ela.',
   '1 minuto', NULL, NULL, FALSE),

  -- ── Raro: mudam a campanha ───────────────────────────────────────────
  ('Paralisia',    'Física', 'Raro',    'Não age nem se move. Ataque corpo a corpo contra ele é crítico.',
   'Até ser tratada', NULL, NULL, FALSE),
  ('Petrificação', 'Mágica', 'Raro',    'Vira pedra. Não age, não percebe, não envelhece.',
   'Permanente', NULL, NULL, FALSE),
  ('Maldição',     'Mágica', 'Raro',    'Sofre −4 permanente num atributo escolhido pelo mestre.',
   'Permanente', NULL, NULL, TRUE),
  ('Enfeitiçado',  'Mental', 'Raro',    'Obedece a quem o enfeitiçou. Trata aliados como inimigos.',
   'Até ser quebrada', NULL, NULL, FALSE),
  ('Peste Negra',  'Doença', 'Raro',    'Perde 1d8 PV por hora, dobrando a cada dia sem tratamento.',
   'Até ser tratada', '7 dias', 'O personagem morre.', FALSE),
  ('Necrose',      'Doença', 'Raro',    'Um membro apodrece e perde o uso. Espalha em 1d4 dias.',
   'Até ser tratada', '1d4 dias', 'O membro é perdido em definitivo.', FALSE),

  -- ── Alquímica: o custo de abusar de poção ────────────────────────────
  --
  -- Substitui "no máximo 2 poções de cura por semana" anotado num caderno.
  -- Como condição, fica visível na ficha, usa o sistema que já existe, e dá
  -- ao Chá do Estômago Calmo um papel de verdade.
  ('Saturação Alquímica', 'Alquímica', 'Comum',
   'Cada poção de cura bebida aplica 1 acúmulo. Com 2, poção de cura não faz mais efeito.',
   '1 semana', NULL, NULL, TRUE)
) AS novo(nome, categoria, tier, efeito, duracao, janela, se_nao_tratada, acumulativa)
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE deleted_at IS NULL);

DO $$
DECLARE linha RECORD;
BEGIN
  FOR linha IN
    SELECT COALESCE(r.descricao, '—') AS tier, count(*) AS quantas,
           count(c.janela_de_cura)    AS com_janela
      FROM condicoes c
      LEFT JOIN raridade r ON r.item = c.raridade_item
     WHERE c.deleted_at IS NULL
     GROUP BY r.descricao, r.ordem ORDER BY r.ordem
  LOOP
    RAISE NOTICE '% : % condicao(oes), % com janela de cura',
      rpad(linha.tier, 9), linha.quantas, linha.com_janela;
  END LOOP;
END $$;
