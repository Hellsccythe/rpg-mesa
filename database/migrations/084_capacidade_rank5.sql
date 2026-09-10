-- 084 — a capacidade de rank 5 de cada perícia de Virtude
--
-- O rank 5 passa a destravar uma CAPACIDADE, e não um bônus maior.
--
-- A razão é matemática. Medindo as opções de buff numérico contra a vantagem
-- de espalhar pontos:
--
--   subir 4 -> 5 (5 pontos)                    = +3 de bônus
--   os mesmos 5 pontos em perícias novas       = +15 espalhado
--
-- E no rank 5 quase não sobra espaço para melhorar a rolagem: contra
-- dificuldade Raro (DC 20) já se passa em 100%, e contra Épico (DC 25) em 90%.
-- "Sucesso automático contra DC 10" vale zero — já era 100%. Rerrolagem vale
-- +2 contra DC 25 e nada contra DC 20. Nem "trata a dificuldade um tier
-- abaixo", a melhor das numéricas, cobre a diferença: leva o degrau a +8
-- contra os +15 de espalhar.
--
-- Logo, o prêmio do rank 5 tem de ser algo que o dado NÃO MEDE — uma coisa
-- que no rank 4 é simplesmente impossível.
--
-- Isso não obriga o jogador a especializar: quem contar só bônus continua
-- espalhando. O que muda é que agora existe motivo para quem quer FAZER a
-- coisa. Forçar pela matemática exigiria teto de rank por classe, que é uma
-- decisão separada.

ALTER TABLE pericias
  ADD COLUMN IF NOT EXISTS capacidade_rank5_nome  VARCHAR(60),
  ADD COLUMN IF NOT EXISTS capacidade_rank5       TEXT;

UPDATE pericias AS destino
   SET capacidade_rank5_nome = origem.titulo,
       capacidade_rank5      = origem.efeito
  FROM (VALUES
    -- Armadura guarda a resistência na coluna `dano`, em texto: "3 Físico",
    -- "10 Físico". Ignorá-la é o que separa quem treinou a vida inteira de
    -- quem só bate forte — contra a Armadura Completa são 10 pontos que
    -- simplesmente deixam de existir.
    ('Luta', 'Golpe que Atravessa',
     'Seus ataques ignoram a resistência física do alvo. A armadura dele não reduz o seu dano.'),

    -- Conversa direto com o desenho das armas de fogo: fora da faixa ideal o
    -- dado desce um passo. No rank 5 isso deixa de acontecer.
    ('Pontaria', 'A Distância Não Importa',
     'Ignora a penalidade de faixa. Seu dado de dano não desce por atirar longe demais ou perto demais.'),

    ('Magia', 'Conjuração Inquebrável',
     'Dano recebido não interrompe a sua conjuração. Você termina o que começou.'),

    ('Reflexo', 'Sai Inteiro',
     'Ao passar num teste contra efeito de área, você sofre zero em vez de metade.'),

    -- Encaixa no catálogo de condições: quem tem Fortitude 5 precisa de menos
    -- antídoto, o que tem valor econômico real e não só de combate.
    ('Fortitude', 'O Corpo Expulsa',
     'Condição que duraria "até ser tratada" ganha prazo no seu corpo: sai sozinha em 1 dia.')
  ) AS origem(pericia, titulo, efeito)
 WHERE destino.nome = origem.pericia
   AND destino.deleted_at IS NULL;

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('pericia.rank5_capacidade', 'true',
   'Rank 5 destrava uma capacidade própria da perícia, e não um bônus maior — no rank 5 a rolagem já está perto do teto e um número a mais não mudaria nada.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

DO $$
DECLARE linha RECORD; faltando INTEGER;
BEGIN
  FOR linha IN
    SELECT nome, capacidade_rank5_nome FROM pericias
     WHERE categoria = 'Virtude' AND deleted_at IS NULL ORDER BY nome
  LOOP
    RAISE NOTICE '% : %', rpad(linha.nome, 10), COALESCE(linha.capacidade_rank5_nome, '(SEM CAPACIDADE)');
  END LOOP;

  SELECT count(*) INTO faltando FROM pericias
   WHERE categoria = 'Virtude' AND deleted_at IS NULL AND capacidade_rank5 IS NULL;
  IF faltando > 0 THEN
    RAISE WARNING '% pericia(s) de Virtude sem capacidade de rank 5', faltando;
  END IF;
END $$;
