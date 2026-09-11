-- 091 — o catálogo de alimentos vira dado, e a cura vira número
--
-- Gerado por docs/gerar_migrations_venenos_alimentos.py a partir de
-- docs/alimentos_dados.py, o mesmo arquivo que gera docs/ALIMENTOS.pdf. **Não
-- editar à mão**.
--
-- O alimento é a resposta à Saturação Alquímica: duas poções de cura travam a
-- terceira por uma semana, e até aqui o personagem saturado ficava sem cura.
-- Comida cura sem saturar. É por isso que ela existe.
--
-- Entram 12 pratos, 18 ingredientes e 12 receitas de Cozinha.

-- ── A cura vira número ────────────────────────────────────────────────────
-- "Recupera 1d4 + 20% do PV máximo" vivia dentro de `efeito`, em texto, e
-- não era calculável — o mesmo defeito da coluna `dano` corrigido na 087. As
-- duas colunas abaixo valem para poção E para prato: é a mesma pergunta,
-- "quanto isto cura?", e uma tabela só responde.
--
-- Para prato, é a cura de BEM FEITO. A de mal feito é constante para o
-- catálogo inteiro (1d4) e por isso é regra do sistema, não coluna.
ALTER TABLE consumiveis
  ADD COLUMN IF NOT EXISTS cura_dado        VARCHAR(20),
  ADD COLUMN IF NOT EXISTS cura_percentual  INTEGER,
  -- O que MAIS acontece quando o prato sai bem — hoje, o bônus social. Texto
  -- porque não há motor de teste social para aplicá-lo; quando houver, vira
  -- referência a `pericias`.
  ADD COLUMN IF NOT EXISTS efeito_bemfeito  TEXT;

ALTER TABLE consumiveis DROP CONSTRAINT IF EXISTS consumiveis_cura_percentual_check;
ALTER TABLE consumiveis ADD CONSTRAINT consumiveis_cura_percentual_check
  CHECK (cura_percentual IS NULL OR cura_percentual BETWEEN 0 AND 100);

COMMENT ON COLUMN consumiveis.cura_dado IS
  'Dado de cura, ex: 1d6. Em prato, é a cura de BEM FEITO; mal feito é a regra alimento.cura_malfeito.';
COMMENT ON COLUMN consumiveis.cura_percentual IS
  'Percentual do PV máximo somado ao dado. 20 significa +20%.';

-- As três poções de cura passam a ter a cura em número. O texto de `efeito`
-- continua, porque é o que a mesa lê.
UPDATE consumiveis SET cura_dado = '1d4',  cura_percentual = 20 WHERE nome = 'Poção de Cura Menor'    AND deleted_at IS NULL;
UPDATE consumiveis SET cura_dado = '1d6',  cura_percentual = 40 WHERE nome = 'Poção de Cura Maior'    AND deleted_at IS NULL;
UPDATE consumiveis SET cura_dado = '1d10', cura_percentual = 60 WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL;


-- ── Ingredientes: vegetais e plantas ──────────────────────────────────────

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Nabo do Campo', 'Cresce em qualquer terra remexida. Enche, e é o que se pede dele.', 0.30, 1.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Nabo do Campo' AND deleted_at IS NULL);

UPDATE itens SET valor = 1.00, peso = 0.30, descricao = 'Cresce em qualquer terra remexida. Enche, e é o que se pede dele.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Nabo do Campo' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Cevada Rústica', 'O grão de todo dia. Engrossa o caldo e dura o inverno.', 0.30, 2.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Cevada Rústica' AND deleted_at IS NULL);

UPDATE itens SET valor = 2.00, peso = 0.30, descricao = 'O grão de todo dia. Engrossa o caldo e dura o inverno.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Cevada Rústica' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Repolho de Inverno', 'Colhido depois da primeira geada, quando adoça.', 0.30, 2.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Repolho de Inverno' AND deleted_at IS NULL);

UPDATE itens SET valor = 2.00, peso = 0.30, descricao = 'Colhido depois da primeira geada, quando adoça.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Repolho de Inverno' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Pimenta das Brasas', 'Vermelha até o talo. Um dedo tempera a panela, dois arruínam.', 0.30, 14.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Pimenta das Brasas' AND deleted_at IS NULL);

UPDATE itens SET valor = 14.00, peso = 0.30, descricao = 'Vermelha até o talo. Um dedo tempera a panela, dois arruínam.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Pimenta das Brasas' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Cogumelo Real', 'Só brota sob carvalho velho, e só quem sabe olhar encontra.', 0.30, 18.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Cogumelo Real' AND deleted_at IS NULL);

UPDATE itens SET valor = 18.00, peso = 0.30, descricao = 'Só brota sob carvalho velho, e só quem sabe olhar encontra.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Cogumelo Real' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Trufa de Raiz Negra', 'Farejada por porco treinado. Vale mais que o porco.', 0.30, 24.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Trufa de Raiz Negra' AND deleted_at IS NULL);

UPDATE itens SET valor = 24.00, peso = 0.30, descricao = 'Farejada por porco treinado. Vale mais que o porco.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Trufa de Raiz Negra' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Arroz da Colheita Única', 'Um alqueire por ano, de um vale só. O resto do mundo paga o que pedirem.', 0.30, 70.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Arroz da Colheita Única' AND deleted_at IS NULL);

UPDATE itens SET valor = 70.00, peso = 0.30, descricao = 'Um alqueire por ano, de um vale só. O resto do mundo paga o que pedirem.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Arroz da Colheita Única' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Açafrão de Altar', 'Três fios por flor, colhidos antes do sol. Tinge o prato de ouro.', 0.30, 95.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Açafrão de Altar' AND deleted_at IS NULL);

UPDATE itens SET valor = 95.00, peso = 0.30, descricao = 'Três fios por flor, colhidos antes do sol. Tinge o prato de ouro.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Açafrão de Altar' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Fruto da Árvore Velha', 'Dá uma vez a cada sete anos. Quem come lembra do gosto até morrer.', 0.30, 120.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Fruto da Árvore Velha' AND deleted_at IS NULL);

UPDATE itens SET valor = 120.00, peso = 0.30, descricao = 'Dá uma vez a cada sete anos. Quem come lembra do gosto até morrer.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Fruto da Árvore Velha' AND deleted_at IS NULL;


-- ── Ingredientes: carnes ──────────────────────────────────────────────────

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Carne de Coelho', 'Magra e rápida de assar. A caça de quem tem pressa.', 0.80, 3.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Carne de Coelho' AND deleted_at IS NULL);

UPDATE itens SET valor = 3.00, peso = 0.80, descricao = 'Magra e rápida de assar. A caça de quem tem pressa.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Carne de Coelho' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Peixe de Rio', 'Fresco pela manhã, duvidoso à tarde.', 0.80, 4.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Peixe de Rio' AND deleted_at IS NULL);

UPDATE itens SET valor = 4.00, peso = 0.80, descricao = 'Fresco pela manhã, duvidoso à tarde.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Peixe de Rio' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Galinha de Terreiro', 'Dura de mastigar e generosa de caldo.', 0.80, 5.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Galinha de Terreiro' AND deleted_at IS NULL);

UPDATE itens SET valor = 5.00, peso = 0.80, descricao = 'Dura de mastigar e generosa de caldo.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Galinha de Terreiro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Lombo de Javali', 'Escuro e forte. O bicho cobra caro para ser abatido.', 0.80, 22.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Lombo de Javali' AND deleted_at IS NULL);

UPDATE itens SET valor = 22.00, peso = 0.80, descricao = 'Escuro e forte. O bicho cobra caro para ser abatido.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Lombo de Javali' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Enguia do Fundo', 'Gordurosa, difícil de limpar, inesquecível quando defumada.', 0.80, 26.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Enguia do Fundo' AND deleted_at IS NULL);

UPDATE itens SET valor = 26.00, peso = 0.80, descricao = 'Gordurosa, difícil de limpar, inesquecível quando defumada.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Enguia do Fundo' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Cervo das Brumas', 'Pasta onde a névoa não levanta. A carne guarda o cheiro.', 0.80, 30.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Cervo das Brumas' AND deleted_at IS NULL);

UPDATE itens SET valor = 30.00, peso = 0.80, descricao = 'Pasta onde a névoa não levanta. A carne guarda o cheiro.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Cervo das Brumas' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Carne de Grifo', 'Metade ave, metade felino, e o sabor não decide qual.', 0.80, 150.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Carne de Grifo' AND deleted_at IS NULL);

UPDATE itens SET valor = 150.00, peso = 0.80, descricao = 'Metade ave, metade felino, e o sabor não decide qual.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Carne de Grifo' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Costela de Wyvern', 'Precisa de fogo alto e de coragem para chegar até ela.', 0.80, 180.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Costela de Wyvern' AND deleted_at IS NULL);

UPDATE itens SET valor = 180.00, peso = 0.80, descricao = 'Precisa de fogo alto e de coragem para chegar até ela.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Costela de Wyvern' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Peito de Fênix Menor', 'Morna ao toque horas depois de abatida. Ninguém explica.', 0.80, 240.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Peito de Fênix Menor' AND deleted_at IS NULL);

UPDATE itens SET valor = 240.00, peso = 0.80, descricao = 'Morna ao toque horas depois de abatida. Ninguém explica.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Peito de Fênix Menor' AND deleted_at IS NULL;


-- ── Os pratos ─────────────────────────────────────────────────────────────
-- `usos` é porções: 1 para todos, 6 para o Banquete. `duracao` guarda o tempo
-- de refeição — é o que mantém comida fora de combate, e a tela precisa dizer.

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Caldo de Nabo e Cevada', 'O que se serve quando não há mais nada. Quente, e isso já é alguma coisa.', 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 10 min',
       0.50, 10.00, '1d6', 20, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'O que se serve quando não há mais nada. Quente, e isso já é alguma coisa.', efeito = 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 10 min', valor = 10.00, peso = 0.50,
       cura_dado = '1d6', cura_percentual = 20, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Coelho Assado', 'Espeto, fogo e paciência. Erra-se pelo excesso, nunca pela falta.', 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 10 min',
       0.50, 11.00, '1d6', 20, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Coelho Assado' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Espeto, fogo e paciência. Erra-se pelo excesso, nunca pela falta.', efeito = 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 10 min', valor = 11.00, peso = 0.50,
       cura_dado = '1d6', cura_percentual = 20, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Coelho Assado' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Peixe Grelhado com Ervas', 'Simples de fazer e fácil de estragar: um minuto a mais e vira couro.', 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 10 min',
       0.50, 15.00, '1d6', 20, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Simples de fazer e fácil de estragar: um minuto a mais e vira couro.', efeito = 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 10 min', valor = 15.00, peso = 0.50,
       cura_dado = '1d6', cura_percentual = 20, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Ensopado de Galinha', 'Cozinha a tarde inteira e junta gente na cozinha antes de ficar pronto.', 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 10 min',
       0.50, 19.00, '1d6', 20, '+2 em Encanto. Vale para quem partilhou a refeição, pela próxima cena social.',
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Cozinha a tarde inteira e junta gente na cozinha antes de ficar pronto.', efeito = 'Bem feito: recupera 1d6 + 20% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 10 min', valor = 19.00, peso = 0.50,
       cura_dado = '1d6', cura_percentual = 20, efeito_bemfeito = '+2 em Encanto. Vale para quem partilhou a refeição, pela próxima cena social.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Torta de Cogumelo Real', 'Massa fina, recheio escuro. Aguenta viagem de dois dias sem estragar.', 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 15 min',
       0.50, 36.00, '1d8', 35, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Massa fina, recheio escuro. Aguenta viagem de dois dias sem estragar.', efeito = 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 15 min', valor = 36.00, peso = 0.50,
       cura_dado = '1d8', cura_percentual = 35, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Enguia Defumada', 'Três dias na fumaça fria. Quem tem pressa não faz, quem faz não tem pressa.', 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 15 min',
       0.50, 56.00, '1d8', 35, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Três dias na fumaça fria. Quem tem pressa não faz, quem faz não tem pressa.', efeito = 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 15 min', valor = 56.00, peso = 0.50,
       cura_dado = '1d8', cura_percentual = 35, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Cervo Assado às Brasas', 'Selado por fora, vermelho por dentro. O ponto é tudo, e o ponto é curto.', 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 15 min',
       0.50, 67.00, '1d8', 35, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Selado por fora, vermelho por dentro. O ponto é tudo, e o ponto é curto.', efeito = 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 15 min', valor = 67.00, peso = 0.50,
       cura_dado = '1d8', cura_percentual = 35, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Ensopado de Javali com Trufa', 'O prato que se põe na mesa quando há um acordo para fechar.', 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 15 min',
       0.50, 68.00, '1d8', 35, '+2 em Negociação. Vale para quem partilhou a refeição, pela próxima cena social.',
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'O prato que se põe na mesa quando há um acordo para fechar.', efeito = 'Bem feito: recupera 1d8 + 35% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 15 min', valor = 68.00, peso = 0.50,
       cura_dado = '1d8', cura_percentual = 35, efeito_bemfeito = '+2 em Negociação. Vale para quem partilhou a refeição, pela próxima cena social.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Costela de Wyvern na Brasa', 'Fogo alto por quatro horas. A carne cede antes do osso, e só então.', 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 30 min',
       0.50, 297.00, '1d10', 55, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Fogo alto por quatro horas. A carne cede antes do osso, e só então.', efeito = 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 30 min', valor = 297.00, peso = 0.50,
       cura_dado = '1d10', cura_percentual = 55, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Caldo de Fênix', 'Continua quente na tigela depois de fria a noite. Recompõe o que a magia gastou.', 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 30 min',
       0.50, 385.00, '1d10', 55, NULL,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Continua quente na tigela depois de fria a noite. Recompõe o que a magia gastou.', efeito = 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 30 min', valor = 385.00, peso = 0.50,
       cura_dado = '1d10', cura_percentual = 55, efeito_bemfeito = NULL,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Grifo ao Açafrão de Altar', 'Dourado, caro e servido devagar. Ninguém discute de barriga cheia disto.', 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 1, 'Refeição de 30 min',
       0.50, 438.00, '1d10', 55, '+3 em Diplomacia. Vale para quem partilhou a refeição, pela próxima cena social.',
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Dourado, caro e servido devagar. Ninguém discute de barriga cheia disto.', efeito = 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 1,
       duracao = 'Refeição de 30 min', valor = 438.00, peso = 0.50,
       cura_dado = '1d10', cura_percentual = 55, efeito_bemfeito = '+3 em Diplomacia. Vale para quem partilhou a refeição, pela próxima cena social.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT 'Banquete da Casa Antiga', 'Não é um prato, é uma mesa. Serve seis, e o que se decide nela costuma valer.', 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', 6, 'Refeição de 30 min',
       0.50, 553.00, '1d10', 55, '+3 em Encanto, Diplomacia e Negociação. Serve seis. Vale para todos que se sentaram, pela próxima cena social. É o efeito mais forte do catálogo, e custa o que custa.',
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Não é um prato, é uma mesa. Serve seis, e o que se decide nela costuma valer.', efeito = 'Bem feito: recupera 1d10 + 55% do PV máximo. Mal feito: 1d4. Não aplica Saturação Alquímica.', usos = 6,
       duracao = 'Refeição de 30 min', valor = 553.00, peso = 0.50,
       cura_dado = '1d10', cura_percentual = 55, efeito_bemfeito = '+3 em Encanto, Diplomacia e Negociação. Serve seis. Vale para todos que se sentaram, pela próxima cena social. É o efeito mais forte do catálogo, e custa o que custa.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL;


-- ── Receitas (Cozinha) ────────────────────────────────────────────────────
-- Primeiras receitas do projeto que NÃO são de Alquimia. `tempo_minutos` é o
-- preparo; a refeição está em `consumiveis.duracao`.

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Caldo de Nabo e Cevada', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL),
       1, 30,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 30
 WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Caldo de Nabo e Cevada' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Caldo de Nabo e Cevada' AND r.deleted_at IS NULL
   AND i.nome = 'Nabo do Campo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Caldo de Nabo e Cevada' AND r.deleted_at IS NULL
   AND i.nome = 'Cevada Rústica' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Coelho Assado', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Coelho Assado' AND deleted_at IS NULL),
       1, 30,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Coelho Assado' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Coelho Assado' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 30
 WHERE nome = 'Coelho Assado' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Coelho Assado' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Coelho Assado' AND r.deleted_at IS NULL
   AND i.nome = 'Carne de Coelho' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Coelho Assado' AND r.deleted_at IS NULL
   AND i.nome = 'Repolho de Inverno' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Peixe Grelhado com Ervas', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL),
       1, 30,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 30
 WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Peixe Grelhado com Ervas' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Peixe Grelhado com Ervas' AND r.deleted_at IS NULL
   AND i.nome = 'Peixe de Rio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Peixe Grelhado com Ervas' AND r.deleted_at IS NULL
   AND i.nome = 'Nabo do Campo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Peixe Grelhado com Ervas' AND r.deleted_at IS NULL
   AND i.nome = 'Repolho de Inverno' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Ensopado de Galinha', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL),
       1, 30,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 30
 WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Ensopado de Galinha' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Galinha' AND r.deleted_at IS NULL
   AND i.nome = 'Galinha de Terreiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Galinha' AND r.deleted_at IS NULL
   AND i.nome = 'Cevada Rústica' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Galinha' AND r.deleted_at IS NULL
   AND i.nome = 'Nabo do Campo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Torta de Cogumelo Real', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Torta de Cogumelo Real' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Torta de Cogumelo Real' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo Real' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Torta de Cogumelo Real' AND r.deleted_at IS NULL
   AND i.nome = 'Cevada Rústica' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Torta de Cogumelo Real' AND r.deleted_at IS NULL
   AND i.nome = 'Repolho de Inverno' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Enguia Defumada', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Enguia Defumada' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Enguia Defumada' AND r.deleted_at IS NULL
   AND i.nome = 'Enguia do Fundo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Enguia Defumada' AND r.deleted_at IS NULL
   AND i.nome = 'Pimenta das Brasas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Cervo Assado às Brasas', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Cervo Assado às Brasas' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cervo Assado às Brasas' AND r.deleted_at IS NULL
   AND i.nome = 'Cervo das Brumas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cervo Assado às Brasas' AND r.deleted_at IS NULL
   AND i.nome = 'Pimenta das Brasas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cervo Assado às Brasas' AND r.deleted_at IS NULL
   AND i.nome = 'Repolho de Inverno' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Ensopado de Javali com Trufa', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Ensopado de Javali com Trufa' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Javali com Trufa' AND r.deleted_at IS NULL
   AND i.nome = 'Lombo de Javali' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Javali com Trufa' AND r.deleted_at IS NULL
   AND i.nome = 'Trufa de Raiz Negra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Ensopado de Javali com Trufa' AND r.deleted_at IS NULL
   AND i.nome = 'Nabo do Campo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Costela de Wyvern na Brasa', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 120
 WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Costela de Wyvern na Brasa' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Costela de Wyvern na Brasa' AND r.deleted_at IS NULL
   AND i.nome = 'Costela de Wyvern' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Costela de Wyvern na Brasa' AND r.deleted_at IS NULL
   AND i.nome = 'Pimenta das Brasas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Costela de Wyvern na Brasa' AND r.deleted_at IS NULL
   AND i.nome = 'Nabo do Campo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Caldo de Fênix', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 120
 WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Caldo de Fênix' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Caldo de Fênix' AND r.deleted_at IS NULL
   AND i.nome = 'Peito de Fênix Menor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Caldo de Fênix' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo Real' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Grifo ao Açafrão de Altar', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 120
 WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Grifo ao Açafrão de Altar' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Grifo ao Açafrão de Altar' AND r.deleted_at IS NULL
   AND i.nome = 'Carne de Grifo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Grifo ao Açafrão de Altar' AND r.deleted_at IS NULL
   AND i.nome = 'Açafrão de Altar' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Grifo ao Açafrão de Altar' AND r.deleted_at IS NULL
   AND i.nome = 'Arroz da Colheita Única' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Banquete da Casa Antiga', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Cozinha' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 120
 WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Banquete da Casa Antiga' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Banquete da Casa Antiga' AND r.deleted_at IS NULL
   AND i.nome = 'Carne de Grifo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Banquete da Casa Antiga' AND r.deleted_at IS NULL
   AND i.nome = 'Arroz da Colheita Única' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Banquete da Casa Antiga' AND r.deleted_at IS NULL
   AND i.nome = 'Fruto da Árvore Velha' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Banquete da Casa Antiga' AND r.deleted_at IS NULL
   AND i.nome = 'Trufa de Raiz Negra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Banquete da Casa Antiga' AND r.deleted_at IS NULL
   AND i.nome = 'Galinha de Terreiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.fora_de_combate', 'sim', 'Comida nunca é usada em combate. A refeição leva de 10 a 30 minutos, mais que qualquer luta.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.sem_saturacao', 'sim', 'Alimento NÃO aplica Saturação Alquímica. É a única cura que continua funcionando depois da segunda poção.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.pericia', 'Cozinha', 'O preparo é um teste de Cozinha contra a DC do tier do prato.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.cura_malfeito', '1d4', 'Prato malfeito cura isto e nada mais, independente da raridade do que foi usado.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.tier_do_prato', 'ingrediente_mais_raro', 'O tier do prato é o do ingrediente mais raro da receita. É ele que decide a nutrição e a DC.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('alimento.efeito_social', 'so_bem_feito_e_para_quem_partilhou', 'O efeito social de um prato só sai em prato bem feito, e vale para quem partilhou a refeição — nunca para quem só cozinhou.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();


-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'pratos: % (esperado 12)  receitas de Cozinha: %  consumiveis com cura em numero: %',
    (SELECT count(*) FROM consumiveis c JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
      WHERE k.descricao = 'Alimento' AND c.deleted_at IS NULL),
    (SELECT count(*) FROM receitas r JOIN pericias p ON p.id = r.pericia_id
      WHERE p.nome = 'Cozinha' AND r.deleted_at IS NULL),
    (SELECT count(*) FROM consumiveis WHERE cura_dado IS NOT NULL AND deleted_at IS NULL);

  -- Todo prato precisa de cura em número — é a razão das colunas.
  FOR linha IN
    SELECT c.nome FROM consumiveis c
      JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
     WHERE k.descricao = 'Alimento' AND c.deleted_at IS NULL AND (c.cura_dado IS NULL OR c.cura_percentual IS NULL)
  LOOP
    RAISE WARNING 'prato sem cura em numero: %', linha.nome;
  END LOOP;

  FOR linha IN
    SELECT r.nome, round(sum(i.valor * ri.quantidade) / NULLIF(c.valor, 0) * 100) AS pct
      FROM receitas r
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.ingrediente_tabela = 'itens'
      JOIN itens i ON i.id = ri.ingrediente_id
      JOIN consumiveis c ON c.id = r.produto_id AND r.produto_tabela = 'consumiveis'
      JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
     WHERE r.deleted_at IS NULL AND k.descricao = 'Alimento'
     GROUP BY r.nome, c.valor
  LOOP
    IF linha.pct < 70 OR linha.pct > 75 THEN
      fora := fora + 1;
      RAISE WARNING 'margem fora da faixa: % em %%%', linha.nome, linha.pct;
    END IF;
  END LOOP;
  IF fora = 0 THEN RAISE NOTICE 'todas as receitas de cozinha entre 70%% e 75%%'; END IF;
END $$;
