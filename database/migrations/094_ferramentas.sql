-- 094 — as ferramentas, e o que cada receita passa a exigir
--
-- Gerado por docs/gerar_migration_ferramentas.py a partir de
-- docs/ferramentas_dados.py, o mesmo arquivo que gera docs/FERRAMENTAS.pdf.
-- **Não editar à mão.**
--
-- `receita_ingredientes.consumido = false` existe desde a migration 077 para
-- a ferramenta: o item que a receita exige mas não gasta. Até aqui não havia
-- UMA cadastrada — nenhuma das 44 receitas de Alquimia exigia alambique, e
-- qualquer um com uma erva na mão destilava poção.
--
-- Todas Comuns, preço fixo, sem raridade: ferramenta não é achado, é compra.
-- Uma bigorna é cara porque pesa 45 kg de ferro, não porque é rara. O peso é
-- a regra que faltava — acima da carga de um personagem forte (força 5 →
-- 12 kg) a ferramenta é FIXA e fabricar exige ir até ela. Não há coluna
-- "fixa": o peso já diz.
--
-- Entram 19 ferramentas em 6 ofícios, e as exigências nas 56 receitas
-- existentes (44 de Alquimia, 12 de Cozinha).

-- ── As ferramentas ────────────────────────────────────────────────────────
-- `empilhavel = FALSE`: ninguém tem "3 bigornas" no inventário como tem
-- "3 ervas". Cada uma é uma.

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Alambique', 'Vidro e cobre. Destila, condensa e separa — sem ele não há poção nem veneno.', 4.00, 60.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Alambique' AND deleted_at IS NULL);

UPDATE itens SET valor = 60.00, peso = 4.00, descricao = 'Vidro e cobre. Destila, condensa e separa — sem ele não há poção nem veneno.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Alambique' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Almofariz e Pilão', 'Pedra fundo, pedra em cima. Mói o que a receita manda moer.', 1.50, 8.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Almofariz e Pilão' AND deleted_at IS NULL);

UPDATE itens SET valor = 8.00, peso = 1.50, descricao = 'Pedra fundo, pedra em cima. Mói o que a receita manda moer.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Almofariz e Pilão' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Balança de Precisão', 'Dois pratos e um jogo de pesos. Um grão a mais estraga o Raro.', 1.00, 25.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Balança de Precisão' AND deleted_at IS NULL);

UPDATE itens SET valor = 25.00, peso = 1.00, descricao = 'Dois pratos e um jogo de pesos. Um grão a mais estraga o Raro.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Balança de Precisão' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Panela de Ferro', 'Pesada e eterna. Caldo, ensopado, torta e o que mais couber.', 3.00, 12.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Panela de Ferro' AND deleted_at IS NULL);

UPDATE itens SET valor = 12.00, peso = 3.00, descricao = 'Pesada e eterna. Caldo, ensopado, torta e o que mais couber.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Panela de Ferro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Espeto e Grelha', 'Para o que vai ao fogo direto: assado, grelhado, brasa.', 2.00, 10.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Espeto e Grelha' AND deleted_at IS NULL);

UPDATE itens SET valor = 10.00, peso = 2.00, descricao = 'Para o que vai ao fogo direto: assado, grelhado, brasa.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Espeto e Grelha' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Faca de Cozinha', 'Afiada de um lado só. Não é arma, e quem tentar vai descobrir.', 0.40, 6.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Faca de Cozinha' AND deleted_at IS NULL);

UPDATE itens SET valor = 6.00, peso = 0.40, descricao = 'Afiada de um lado só. Não é arma, e quem tentar vai descobrir.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Faca de Cozinha' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Bigorna', 'Quarenta e cinco quilos de ferro. Não se carrega: se instala.', 45.00, 120.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Bigorna' AND deleted_at IS NULL);

UPDATE itens SET valor = 120.00, peso = 45.00, descricao = 'Quarenta e cinco quilos de ferro. Não se carrega: se instala.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Bigorna' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Martelo de Forja', 'Cabeça curta, cabo comprido. Bate o dia inteiro sem cansar a mão.', 2.00, 18.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Martelo de Forja' AND deleted_at IS NULL);

UPDATE itens SET valor = 18.00, peso = 2.00, descricao = 'Cabeça curta, cabo comprido. Bate o dia inteiro sem cansar a mão.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Martelo de Forja' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Tenaz', 'Segura o que está em brasa. A alternativa é a própria mão.', 1.00, 10.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Tenaz' AND deleted_at IS NULL);

UPDATE itens SET valor = 10.00, peso = 1.00, descricao = 'Segura o que está em brasa. A alternativa é a própria mão.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Tenaz' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Fole', 'Couro e madeira. Sem ele o carvão não passa do vermelho.', 5.00, 35.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Fole' AND deleted_at IS NULL);

UPDATE itens SET valor = 35.00, peso = 5.00, descricao = 'Couro e madeira. Sem ele o carvão não passa do vermelho.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Fole' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Serra de Mão', 'Dentes para madeira verde e para seca. Não se usa em osso.', 1.50, 15.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Serra de Mão' AND deleted_at IS NULL);

UPDATE itens SET valor = 15.00, peso = 1.50, descricao = 'Dentes para madeira verde e para seca. Não se usa em osso.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Serra de Mão' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Plaina', 'Tira a lasca fina. O que sai dela cabe na mão sem farpa.', 1.20, 12.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Plaina' AND deleted_at IS NULL);

UPDATE itens SET valor = 12.00, peso = 1.20, descricao = 'Tira a lasca fina. O que sai dela cabe na mão sem farpa.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Plaina' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Formão e Maço', 'Entalha, encaixa, abre furo quadrado. O maço é de madeira para não amassar o cabo.', 1.00, 9.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Formão e Maço' AND deleted_at IS NULL);

UPDATE itens SET valor = 9.00, peso = 1.00, descricao = 'Entalha, encaixa, abre furo quadrado. O maço é de madeira para não amassar o cabo.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Formão e Maço' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Agulhas e Dedal', 'Seis agulhas de tamanhos diferentes e um dedal de latão. Cabe no bolso.', 0.10, 3.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Agulhas e Dedal' AND deleted_at IS NULL);

UPDATE itens SET valor = 3.00, peso = 0.10, descricao = 'Seis agulhas de tamanhos diferentes e um dedal de latão. Cabe no bolso.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Agulhas e Dedal' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Tesoura de Alfaiate', 'Lâmina longa, corte reto. Nunca se empresta.', 0.30, 14.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Tesoura de Alfaiate' AND deleted_at IS NULL);

UPDATE itens SET valor = 14.00, peso = 0.30, descricao = 'Lâmina longa, corte reto. Nunca se empresta.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Tesoura de Alfaiate' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Tear de Mesa', 'Tece o tecido a partir do fio. Fixo: ocupa uma mesa inteira.', 8.00, 45.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Tear de Mesa' AND deleted_at IS NULL);

UPDATE itens SET valor = 45.00, peso = 8.00, descricao = 'Tece o tecido a partir do fio. Fixo: ocupa uma mesa inteira.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Tear de Mesa' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Lupa de Joalheiro', 'Lente de aumento numa armação de latão. Vê o defeito antes do comprador.', 0.20, 30.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Lupa de Joalheiro' AND deleted_at IS NULL);

UPDATE itens SET valor = 30.00, peso = 0.20, descricao = 'Lente de aumento numa armação de latão. Vê o defeito antes do comprador.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Lupa de Joalheiro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Pinça e Lima Finas', 'Para o que é pequeno demais para os dedos.', 0.20, 9.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Pinça e Lima Finas' AND deleted_at IS NULL);

UPDATE itens SET valor = 9.00, peso = 0.20, descricao = 'Para o que é pequeno demais para os dedos.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Pinça e Lima Finas' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Maçarico de Boca', 'Sopra chama fina o bastante para soldar um elo sem derreter o anel.', 0.60, 22.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Maçarico de Boca' AND deleted_at IS NULL);

UPDATE itens SET valor = 22.00, peso = 0.60, descricao = 'Sopra chama fina o bastante para soldar um elo sem derreter o anel.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = 'Maçarico de Boca' AND deleted_at IS NULL;


-- ── O que cada receita passa a exigir ─────────────────────────────────────
-- Por ofício, lendo `receitas.pericia_id`, e não receita a receita: 44
-- receitas de Alquimia exigem o mesmo alambique, e listar uma a uma seria 44
-- chances de esquecer uma. `consumido = FALSE` é o que faz a ferramenta não
-- entrar no custo nem sumir ao fabricar.
--
-- O índice único de receita_ingredientes é (receita, tabela, id): o ON
-- CONFLICT torna isto reexecutável.

INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = 'Alquimia'
  JOIN itens i ON i.nome = 'Alambique' AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;

INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = 'Alquimia'
  JOIN itens i ON i.nome = 'Almofariz e Pilão' AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;

INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = 'Cozinha'
  JOIN itens i ON i.nome = 'Panela de Ferro' AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL
   AND r.nome NOT ILIKE '%%Assado%%' AND r.nome NOT ILIKE '%%Grelhado%%' AND r.nome NOT ILIKE '%%Brasa%%'
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;

-- Cozinha no fogo direto: assado, grelhado, brasa.
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = 'Cozinha'
  JOIN itens i ON i.nome = 'Espeto e Grelha' AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL AND (r.nome ILIKE '%%Assado%%' OR r.nome ILIKE '%%Grelhado%%' OR r.nome ILIKE '%%Brasa%%')
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;


-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('ferramenta.raridade', 'sempre_comum',
   'Ferramenta não tem raridade: é compra, não achado. Preço fixo, sem multiplicador.'),
  ('ferramenta.fixa_pelo_peso', '12',
   'Ferramenta acima deste peso em kg é fixa: fica onde foi instalada, e fabricar exige ir até ela. É o peso que decide, não uma coluna.'),
  ('ferramenta.na_receita', 'consumido_false',
   'A ferramenta entra na receita com consumido = false: é exigida, não gasta, e não entra no custo de fabricação.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  ferramentas INTEGER;
  sem_ferramenta INTEGER;
BEGIN
  SELECT count(*) INTO ferramentas FROM itens i
    JOIN categoria_item c ON c.item = i.categoria_item
   WHERE c.descricao = 'Ferramenta' AND i.deleted_at IS NULL;
  IF ferramentas <> 19 THEN
    RAISE EXCEPTION 'ABORTADO: esperava 19 ferramentas, encontrei %', ferramentas;
  END IF;

  -- Nenhuma receita de Alquimia ou Cozinha pode ter ficado sem ferramenta.
  SELECT count(*) INTO sem_ferramenta
    FROM receitas r JOIN pericias p ON p.id = r.pericia_id
   WHERE r.deleted_at IS NULL AND p.nome IN ('Alquimia', 'Cozinha')
     AND NOT EXISTS (SELECT 1 FROM receita_ingredientes ri
                      WHERE ri.receita_id = r.id AND ri.consumido = FALSE);
  IF sem_ferramenta > 0 THEN
    RAISE EXCEPTION 'ABORTADO: % receita(s) ficaram sem ferramenta', sem_ferramenta;
  END IF;

  RAISE NOTICE 'ferramentas: %  |  receitas com ferramenta por oficio:', ferramentas;
  FOR linha IN
    SELECT p.nome AS oficio, count(DISTINCT r.id) AS receitas,
           string_agg(DISTINCT i.nome, ', ' ORDER BY i.nome) AS exigem
      FROM receitas r
      JOIN pericias p ON p.id = r.pericia_id
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.consumido = FALSE
      JOIN itens i ON i.id = ri.ingrediente_id
     WHERE r.deleted_at IS NULL
     GROUP BY p.nome ORDER BY p.nome
  LOOP
    RAISE NOTICE '  %: % receitas — %', linha.oficio, linha.receitas, linha.exigem;
  END LOOP;

  -- A margem de 70-75% não pode ter mudado: ferramenta não entra no custo.
  FOR linha IN
    SELECT r.nome, round(sum(i.valor * ri.quantidade) / NULLIF(c.valor, 0) * 100) AS pct
      FROM receitas r
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.ingrediente_tabela = 'itens' AND ri.consumido = TRUE
      JOIN itens i ON i.id = ri.ingrediente_id
      JOIN consumiveis c ON c.id = r.produto_id AND r.produto_tabela = 'consumiveis'
     WHERE r.deleted_at IS NULL
     GROUP BY r.nome, c.valor
    HAVING round(sum(i.valor * ri.quantidade) / NULLIF(c.valor, 0) * 100) NOT BETWEEN 70 AND 75
  LOOP
    RAISE WARNING 'margem fora da faixa: % em %%%', linha.nome, linha.pct;
  END LOOP;
END $$;
