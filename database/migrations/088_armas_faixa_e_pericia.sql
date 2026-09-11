-- 088 — a arma diz qual perícia usa, e a que distância ela rende
--
-- Fecha o ciclo com o grupo Virtude (migrations 081–085). Sem `pericia_id`,
-- nada liga uma espada a Luta nem um arco a Pontaria: o grupo inteiro fica
-- solto do equipamento, e "some +3 por rank em Luta" não sabe a que ataque
-- somar. E sem a faixa, a capacidade de rank 5 de Pontaria não tem penalidade
-- nenhuma para ignorar.

ALTER TABLE equipamentos
  -- Referência a `pericias.id`, sempre uma do grupo Virtude.
  ADD COLUMN IF NOT EXISTS pericia_id      INTEGER,

  -- A "faixa ideal" em DOIS números, porque são dois limites com efeitos
  -- diferentes: até `alcance_ideal` o dado sai cheio; entre ele e
  -- `alcance_maximo` o dado desce um passo; além disso não há tiro.
  -- Um campo só não conseguiria dizer as duas coisas — que é o defeito que a
  -- migration 087 acabou de corrigir na coluna `dano`.
  ADD COLUMN IF NOT EXISTS alcance_ideal   INTEGER,
  ADD COLUMN IF NOT EXISTS alcance_maximo  INTEGER;

COMMENT ON COLUMN equipamentos.alcance_ideal IS
  'Metros até onde o dado sai cheio. Em arma de corpo a corpo, é o alcance do golpe.';
COMMENT ON COLUMN equipamentos.alcance_maximo IS
  'Metros até onde ainda dá para atacar, com o dado um passo abaixo. Igual ao ideal = sem faixa estendida.';

-- ── Corpo a corpo → Luta ──────────────────────────────────────────────────
-- Ideal e máximo iguais: numa arma de corpo a corpo não existe "longe demais
-- com penalidade", existe alcançar ou não alcançar.

UPDATE equipamentos SET pericia_id = 23, alcance_ideal = 2, alcance_maximo = 2
 WHERE nome IN ('Bastão de Batalha', 'Espada Longa', 'Machado de Batalha') AND deleted_at IS NULL;

-- As duas de cabo longo alcançam um pouco mais.
UPDATE equipamentos SET pericia_id = 23, alcance_ideal = 3, alcance_maximo = 3
 WHERE nome IN ('Machado Grande de Batalha', 'Zweihander') AND deleted_at IS NULL;

-- ── Longo alcance → Pontaria ──────────────────────────────────────────────
-- A faixa estendida é sempre o dobro da ideal: uma regra só, fácil de lembrar
-- na mesa, e que não precisa de tabela para consultar.

UPDATE equipamentos SET pericia_id = 24, alcance_ideal =  6, alcance_maximo = 12 WHERE nome = 'Adaga de Arremesso' AND deleted_at IS NULL;
UPDATE equipamentos SET pericia_id = 24, alcance_ideal = 30, alcance_maximo = 60 WHERE nome = 'Arco Comum'         AND deleted_at IS NULL;
UPDATE equipamentos SET pericia_id = 24, alcance_ideal = 45, alcance_maximo = 90 WHERE nome = 'Arco Longo'         AND deleted_at IS NULL;

-- ── O Cajado → Magia ──────────────────────────────────────────────────────
-- Está cadastrado como "Longo alcance" e causa dano Arcano: não é uma vara de
-- bater, é um foco que projeta. Vai para Magia, não para Pontaria — quem
-- treinou pontaria não conjura melhor.

UPDATE equipamentos SET pericia_id = 25, alcance_ideal = 20, alcance_maximo = 40
 WHERE nome = 'Cajado Simples' AND deleted_at IS NULL;

-- ── A regra do dado que desce um passo ────────────────────────────────────
-- Fica gravada em `regras_do_sistema` para a mesa poder consultar, e vive em
-- código como função pura (`desceUmPasso`), espelhada no cliente e no
-- servidor — mesmo arranjo do teste de perícia.
--
-- A escada é 1d4 → 1d6 → 1d8 → 1d10 → 1d12. Descer do 1d4 não vai a lugar
-- nenhum: 1d4 é o piso, e abaixo dele o ataque simplesmente não vale a pena.

INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('arma.escada_de_dados', '1d4,1d6,1d8,1d10,1d12',
   'A escada usada para subir ou descer um passo no dado de dano. 1d4 é o piso.'),
  ('arma.fora_da_faixa', 'desce_um_passo',
   'Entre alcance_ideal e alcance_maximo o dado desce um passo na escada. Além do máximo não há ataque.'),
  ('arma.faixa_estendida', '2x',
   'O alcance máximo é o dobro do ideal em toda arma de longo alcance. Regra única para não virar tabela de consulta.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

-- ── Verificação ───────────────────────────────────────────────────────────

DO $$
DECLARE
  linha        RECORD;
  sem_pericia  INTEGER;
  incoerente   INTEGER;
  fora_virtude INTEGER;
BEGIN
  SELECT count(*) INTO sem_pericia
    FROM equipamentos e JOIN categoria_equipamento c ON c.item = e.categoria_equipamento_item
   WHERE e.deleted_at IS NULL AND c.descricao = 'Armas'
     AND (e.pericia_id IS NULL OR e.alcance_ideal IS NULL);
  IF sem_pericia > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % arma(s) sem pericia ou sem alcance', sem_pericia;
  END IF;

  -- Máximo menor que o ideal seria uma faixa impossível.
  SELECT count(*) INTO incoerente FROM equipamentos
   WHERE deleted_at IS NULL AND alcance_maximo < alcance_ideal;
  IF incoerente > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % arma(s) com alcance_maximo menor que o ideal', incoerente;
  END IF;

  -- A perícia da arma tem de ser de Virtude: apontar para Alquimia passaria
  -- sem erro no banco, já que não há FOREIGN KEY.
  SELECT count(*) INTO fora_virtude
    FROM equipamentos e JOIN pericias p ON p.id = e.pericia_id
   WHERE e.deleted_at IS NULL AND p.bolsa <> 'virtude';
  IF fora_virtude > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % arma(s) apontam para pericia fora do grupo Virtude', fora_virtude;
  END IF;

  FOR linha IN
    SELECT e.nome, p.nome AS pericia, e.dano, e.alcance_ideal, e.alcance_maximo
      FROM equipamentos e
      JOIN categoria_equipamento c ON c.item = e.categoria_equipamento_item
      LEFT JOIN pericias p ON p.id = e.pericia_id
     WHERE e.deleted_at IS NULL AND c.descricao = 'Armas'
     ORDER BY p.nome, e.alcance_ideal
  LOOP
    -- RAISE NOTICE nao e printf: so entende `%` simples, sem largura.
    RAISE NOTICE '  % (%): % — %m ideal / %m max',
      linha.nome, linha.pericia, linha.dano, linha.alcance_ideal, linha.alcance_maximo;
  END LOOP;
END $$;
