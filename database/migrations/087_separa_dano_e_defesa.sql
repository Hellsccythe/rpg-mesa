-- 087 — separa a coluna `dano`, que guardava cinco coisas diferentes
--
-- É o mesmo defeito já corrigido três vezes neste projeto, agora no meio das
-- armas. `equipamentos.dano` guardava, em texto livre:
--
--   '1d8'                  quanto a arma causa
--   '1d10/x3'              quanto causa, E o multiplicador de crítico
--   '1d8/1d6'              dois modos de uso
--   '1d6 Mágico'           quanto causa, E de que tipo
--   '10 Físico'            quanto a ARMADURA absorve — nem dano é
--   '1 Físico / 2 Mágico'  absorve dois tipos diferentes
--
-- Nada disso é somável, comparável ou consultável. E já quebrava uma regra
-- escrita: a capacidade de rank 5 de Luta, "Golpe que Atravessa", diz que o
-- ataque ignora a resistência física do alvo — que é o `10` dentro da string
-- `'10 Físico'`. A regra existia no papel sem ter como ser calculada.
--
-- Depois desta migration: `dano` guarda só a notação do dado, e cada uma das
-- outras coisas tem coluna própria com tipo próprio.

ALTER TABLE equipamentos
  -- O segundo dado do Machado de Batalha (1d8/1d6) e do Machado Grande
  -- (1d12/1d6). O valor é preservado; o que ele SIGNIFICA (duas mãos? mão
  -- única? arremesso?) não está registrado em lugar nenhum do projeto e
  -- precisa ser nomeado pelo mestre — ver o aviso no fim desta migration.
  ADD COLUMN IF NOT EXISTS dano_alternativo       VARCHAR(20),

  -- MULTIPLICADOR, não margem. O dado guardado é o `x3` de '1d10/x3', ou
  -- seja quanto o dano é multiplicado no crítico — e não a faixa de rolagem
  -- que ameaça crítico (19-20). Chamar de `margem_critico` repetiria
  -- exatamente o defeito que esta migration corrige: nome que mente sobre o
  -- conteúdo. NULL em armadura, que não critica.
  ADD COLUMN IF NOT EXISTS multiplicador_critico  INTEGER,

  -- Referência a `skill_tipo_dano.item`. A tabela é compartilhada com as
  -- skills de propósito: uma espada flamejante e uma magia de fogo devem
  -- bater na mesma resistência. Criar um lookup paralelo só para equipamento
  -- garantiria que os dois saíssem de sincronia.
  ADD COLUMN IF NOT EXISTS tipo_dano_item         INTEGER,

  -- O que a armadura absorve. INTEGER porque agora precisa ser subtraível.
  ADD COLUMN IF NOT EXISTS defesa_fisica          INTEGER,
  ADD COLUMN IF NOT EXISTS defesa_magica          INTEGER;

COMMENT ON COLUMN equipamentos.dano IS
  'Só a notação do dado, ex: 1d8. Vazio em item que não é arma.';
COMMENT ON COLUMN equipamentos.multiplicador_critico IS
  'Quanto o dano é multiplicado no crítico (3 = x3). NULL usa o padrão do sistema.';
COMMENT ON COLUMN equipamentos.defesa_fisica IS
  'Quanto a armadura absorve de dano físico. É o alvo de "Golpe que Atravessa".';

-- ── Armas ─────────────────────────────────────────────────────────────────
-- Cada UPDATE é escrito por nome, e não por um parser genérico da string: são
-- 14 linhas, e um regex que errasse silenciosamente num formato inesperado
-- seria pior que a coluna original.

UPDATE equipamentos SET dano = '1d6',  multiplicador_critico = 3, tipo_dano_item = 6 WHERE nome = 'Adaga de Arremesso'        AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d8',  multiplicador_critico = 3, tipo_dano_item = 6 WHERE nome = 'Arco Comum'                AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d10', multiplicador_critico = 3, tipo_dano_item = 6 WHERE nome = 'Arco Longo'                AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d8',  multiplicador_critico = 2, tipo_dano_item = 6 WHERE nome = 'Bastão de Batalha'         AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d8',  multiplicador_critico = 2, tipo_dano_item = 6 WHERE nome = 'Espada Longa'              AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d10', multiplicador_critico = 2, tipo_dano_item = 6 WHERE nome = 'Zweihander'                AND deleted_at IS NULL;

UPDATE equipamentos SET dano = '1d8',  dano_alternativo = '1d6', multiplicador_critico = 2, tipo_dano_item = 6
 WHERE nome = 'Machado de Batalha' AND deleted_at IS NULL;
UPDATE equipamentos SET dano = '1d12', dano_alternativo = '1d6', multiplicador_critico = 2, tipo_dano_item = 6
 WHERE nome = 'Machado Grande de Batalha' AND deleted_at IS NULL;

-- O Cajado era o único '1d6 Mágico'. Vai como Arcano, que é o mais próximo no
-- lookup — não existe "Mágico" genérico lá, e inventar um duplicaria a escala.
UPDATE equipamentos SET dano = '1d6',  multiplicador_critico = 2, tipo_dano_item = 4 WHERE nome = 'Cajado Simples' AND deleted_at IS NULL;

-- ── Armaduras ─────────────────────────────────────────────────────────────
-- `dano` vira string vazia, nunca NULL: a coluna é NOT NULL, e o projeto já
-- usa '' para "não se aplica" em `efeito` de consumíveis e condições.

UPDATE equipamentos SET defesa_fisica =  3, dano = '' WHERE nome = 'Armadura de Couro'    AND deleted_at IS NULL;
UPDATE equipamentos SET defesa_fisica =  5, dano = '' WHERE nome = 'Armadura da guarda'   AND deleted_at IS NULL;
UPDATE equipamentos SET defesa_fisica =  5, dano = '' WHERE nome = 'Armadura de Espinhos' AND deleted_at IS NULL;
UPDATE equipamentos SET defesa_fisica = 10, dano = '' WHERE nome = 'Armadura Completa'    AND deleted_at IS NULL;
UPDATE equipamentos SET defesa_fisica =  1, defesa_magica = 2, dano = '' WHERE nome = 'Manto Reforçado' AND deleted_at IS NULL;

-- ── As seis categorias sobrando ───────────────────────────────────────────
-- "Cura", "Cosmético", "Exploração" e "Utilitário" faziam sentido quando
-- `equipamentos` guardava tudo; desde as migrations 075 e 076 esses itens
-- moram em `consumiveis` e `itens`. "Arma" e "Versátil" são duplicatas de
-- "Armas" — e "Versátil" nunca foi categoria: é a propriedade 18.
--
-- Soft delete, e não DELETE: se algum registro antigo apagado ainda apontar
-- para elas, o histórico continua legível. As seis estão comprovadamente sem
-- uso — o bloco de verificação abaixo recusa a migration se não estiverem.

DO $$
DECLARE
  em_uso INTEGER;
BEGIN
  SELECT count(*) INTO em_uso
    FROM equipamentos
   WHERE deleted_at IS NULL
     AND categoria_equipamento_item IN (
       SELECT item FROM categoria_equipamento
        WHERE descricao IN ('Exploração', 'Cura', 'Cosmético', 'Utilitário', 'Versátil', 'Arma')
          AND deleted_at IS NULL);

  IF em_uso > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % equipamento(s) ativo(s) ainda usam as categorias que esta migration apaga', em_uso;
  END IF;
END $$;

UPDATE categoria_equipamento
   SET deleted_at = now(), deleted_by = 'migration 087'
 WHERE descricao IN ('Exploração', 'Cura', 'Cosmético', 'Utilitário', 'Versátil', 'Arma')
   AND deleted_at IS NULL;

-- ── Verificação ───────────────────────────────────────────────────────────

DO $$
DECLARE
  sujo        INTEGER;
  arma_sem    INTEGER;
  armadura_sem INTEGER;
  categorias  INTEGER;
  alternativo INTEGER;
BEGIN
  -- Nenhum `dano` pode ter sobrado com barra, espaço ou palavra dentro.
  SELECT count(*) INTO sujo FROM equipamentos
   WHERE deleted_at IS NULL AND dano <> '' AND dano !~ '^[0-9]+d[0-9]+$';
  IF sujo > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % linha(s) com `dano` fora do formato NdN', sujo;
  END IF;

  SELECT count(*) INTO arma_sem FROM equipamentos e
    JOIN categoria_equipamento c ON c.item = e.categoria_equipamento_item
   WHERE e.deleted_at IS NULL AND c.descricao = 'Armas' AND (e.dano = '' OR e.tipo_dano_item IS NULL);
  IF arma_sem > 0 THEN
    RAISE WARNING '% arma(s) sem dano ou sem tipo de dano', arma_sem;
  END IF;

  SELECT count(*) INTO armadura_sem FROM equipamentos e
    JOIN categoria_equipamento c ON c.item = e.categoria_equipamento_item
   WHERE e.deleted_at IS NULL AND c.descricao = 'Armadura' AND e.defesa_fisica IS NULL;
  IF armadura_sem > 0 THEN
    RAISE WARNING '% armadura(s) sem defesa_fisica', armadura_sem;
  END IF;

  SELECT count(*) INTO categorias FROM categoria_equipamento WHERE deleted_at IS NULL;
  SELECT count(*) INTO alternativo FROM equipamentos WHERE deleted_at IS NULL AND dano_alternativo IS NOT NULL;

  RAISE NOTICE 'categorias ativas: % (esperado 2: Armadura e Armas)', categorias;
  RAISE NOTICE 'linhas com dano_alternativo a nomear: %', alternativo;
  RAISE NOTICE 'PENDENTE: decidir o que o segundo dado significa (duas maos? arremesso?) nos dois machados';
END $$;
