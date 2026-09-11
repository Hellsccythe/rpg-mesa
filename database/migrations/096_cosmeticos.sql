-- 096 — cosméticos: o tecido decide quem a roupa impressiona, a qualidade decide quanto
--
-- Gerado por docs/gerar_migration_cosmeticos.py a partir de
-- docs/cosmeticos_dados.py, o mesmo arquivo que gera docs/COSMETICOS.pdf.
-- **Não editar à mão.**
--
-- Entram 8 tecidos, 6 materiais, 10 roupas e 6 acessórios, com as
-- primeiras receitas de Costura e de Joalheria — que já nascem exigindo as
-- ferramentas da 094.

-- ── Duas colunas em `itens` ───────────────────────────────────────────────
-- `publico`: quem a peça impressiona — plebe, qualquer, nobreza. Vem do tecido
-- (ou do material), e a roupa herda. `bonus_social`: quanto, quando BEM FEITA
-- — a qualidade da fabricação (`data.inventario[].qualidade`) é que decide se
-- o bônus sai (bem feita), sai zero (mal feita) ou sai +1 (obra-prima).
--
-- Ficam em `itens`, e não numa tabela à parte, porque valem só para item que
-- se veste, e item que se veste é `itens` (não some ao usar).
ALTER TABLE itens
  ADD COLUMN IF NOT EXISTS publico      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS bonus_social INTEGER;
ALTER TABLE itens DROP CONSTRAINT IF EXISTS itens_publico_check;
ALTER TABLE itens ADD CONSTRAINT itens_publico_check
  CHECK (publico IS NULL OR publico IN ('plebe', 'qualquer', 'nobreza'));
ALTER TABLE itens DROP CONSTRAINT IF EXISTS itens_bonus_social_check;
ALTER TABLE itens ADD CONSTRAINT itens_bonus_social_check
  CHECK (bonus_social IS NULL OR bonus_social BETWEEN 0 AND 5);

COMMENT ON COLUMN itens.publico IS
  'Quem a peça impressiona: plebe, qualquer ou nobreza. Só em tecido, material e cosmético.';
COMMENT ON COLUMN itens.bonus_social IS
  'Bônus em Encanto, Diplomacia e Negociação diante do público certo, quando a peça é BEM FEITA. Mal feita dá 0; obra-prima dá +1.';

-- ── Categoria Tecido ──────────────────────────────────────────────────────
-- Tecido não é "Ingrediente" (isso é erva e carne) nem "Material Precioso"
-- (linho não é precioso). É o que o mestre vai procurar, então tem nome.
INSERT INTO categoria_item (descricao)
SELECT 'Tecido' WHERE NOT EXISTS (SELECT 1 FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL);


-- ── Tecidos (vendidos por metro) ──────────────────────────────────────────

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Linho Cru', 'Cor de palha, áspero no primeiro dia e macio no décimo. A roupa de todo mundo.', 0.40, 4.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Linho Cru' AND deleted_at IS NULL);

UPDATE itens SET valor = 4.00, peso = 0.40, descricao = 'Cor de palha, áspero no primeiro dia e macio no décimo. A roupa de todo mundo.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Linho Cru' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Lã Rústica', 'Fiada em casa, tingida com casca de nogueira. Esquenta e cheira a ovelha.', 0.40, 5.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Lã Rústica' AND deleted_at IS NULL);

UPDATE itens SET valor = 5.00, peso = 0.40, descricao = 'Fiada em casa, tingida com casca de nogueira. Esquenta e cheira a ovelha.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Lã Rústica' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Couro Curtido', 'Curtido em tanino. Casaco, avental, bota. Dura mais que o dono.', 0.40, 8.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Couro Curtido' AND deleted_at IS NULL);

UPDATE itens SET valor = 8.00, peso = 0.40, descricao = 'Curtido em tanino. Casaco, avental, bota. Dura mais que o dono.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Couro Curtido' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Algodão Tingido', 'Liso, leve, cor firme. Nem rico nem pobre: limpo.', 0.40, 18.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'qualquer', 2
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Algodão Tingido' AND deleted_at IS NULL);

UPDATE itens SET valor = 18.00, peso = 0.40, descricao = 'Liso, leve, cor firme. Nem rico nem pobre: limpo.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = 2
 WHERE nome = 'Algodão Tingido' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Lã Fina', 'De carneiro de altitude, fiada apertada. O primeiro degrau da elegância.', 0.40, 24.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'nobreza', 2
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Lã Fina' AND deleted_at IS NULL);

UPDATE itens SET valor = 24.00, peso = 0.40, descricao = 'De carneiro de altitude, fiada apertada. O primeiro degrau da elegância.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 2
 WHERE nome = 'Lã Fina' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Veludo', 'Pelo curto que muda de cor com a luz. Não se usa de dia, e é essa a mensagem.', 0.40, 90.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Veludo' AND deleted_at IS NULL);

UPDATE itens SET valor = 90.00, peso = 0.40, descricao = 'Pelo curto que muda de cor com a luz. Não se usa de dia, e é essa a mensagem.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Veludo' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Seda', 'Chega de longe e custa o que custa por isso. Frio ao toque, quente ao olhar.', 0.40, 120.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Seda' AND deleted_at IS NULL);

UPDATE itens SET valor = 120.00, peso = 0.40, descricao = 'Chega de longe e custa o que custa por isso. Frio ao toque, quente ao olhar.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Seda' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Brocado', 'Seda com fio de ouro tecido no desenho. Uma roupa de brocado é um anúncio.', 0.40, 150.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Brocado' AND deleted_at IS NULL);

UPDATE itens SET valor = 150.00, peso = 0.40, descricao = 'Seda com fio de ouro tecido no desenho. Uma roupa de brocado é um anúncio.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Tecido' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Brocado' AND deleted_at IS NULL;


-- ── Materiais de joalheria ────────────────────────────────────────────────

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Fio de Cobre', 'Verde-escuro com o tempo. O metal de quem quer um anel e não quer perguntas.', 0.10, 3.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'qualquer', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Fio de Cobre' AND deleted_at IS NULL);

UPDATE itens SET valor = 3.00, peso = 0.10, descricao = 'Verde-escuro com o tempo. O metal de quem quer um anel e não quer perguntas.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = NULL
 WHERE nome = 'Fio de Cobre' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Pedra Polida', 'Ágata, quartzo, o que o rio deu. Bonita se alguém a lapidou.', 0.10, 6.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'qualquer', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Pedra Polida' AND deleted_at IS NULL);

UPDATE itens SET valor = 6.00, peso = 0.10, descricao = 'Ágata, quartzo, o que o rio deu. Bonita se alguém a lapidou.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = NULL
 WHERE nome = 'Pedra Polida' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Prata em Barra', 'Escurece, e é polida de novo. Metal de quem tem posses e não precisa mostrar.', 0.50, 40.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'nobreza', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Prata em Barra' AND deleted_at IS NULL);

UPDATE itens SET valor = 40.00, peso = 0.50, descricao = 'Escurece, e é polida de novo. Metal de quem tem posses e não precisa mostrar.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = NULL
 WHERE nome = 'Prata em Barra' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Ametista', 'Roxa, translúcida. A pedra mais cara que um artesão compra sem fiador.', 0.05, 60.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'nobreza', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Ametista' AND deleted_at IS NULL);

UPDATE itens SET valor = 60.00, peso = 0.05, descricao = 'Roxa, translúcida. A pedra mais cara que um artesão compra sem fiador.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = NULL
 WHERE nome = 'Ametista' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Ouro em Barra', 'Três moedas de ouro fundidas numa. Vale mais como joia do que como dinheiro.', 0.50, 300.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'nobreza', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Ouro em Barra' AND deleted_at IS NULL);

UPDATE itens SET valor = 300.00, peso = 0.50, descricao = 'Três moedas de ouro fundidas numa. Vale mais como joia do que como dinheiro.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = NULL
 WHERE nome = 'Ouro em Barra' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Rubi', 'Vermelho até o fundo. Quem usa um no dedo não precisa se apresentar.', 0.02, 200.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       'nobreza', NULL
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Rubi' AND deleted_at IS NULL);

UPDATE itens SET valor = 200.00, peso = 0.02, descricao = 'Vermelho até o fundo. Quem usa um no dedo não precisa se apresentar.', empilhavel = TRUE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Material Precioso' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = NULL
 WHERE nome = 'Rubi' AND deleted_at IS NULL;


-- ── Roupas ────────────────────────────────────────────────────────────────
-- Tier, público e bônus vêm do tecido — calculados pelo gerador, não digitados.

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Túnica de Linho', 'Um retângulo com buraco para a cabeça e um cinto. Não chama atenção, e é isso que faz.', 0.80, 11.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL);

UPDATE itens SET valor = 11.00, peso = 0.80, descricao = 'Um retângulo com buraco para a cabeça e um cinto. Não chama atenção, e é isso que faz.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Casaco de Lã Rústica', 'Grosso, comprido, cor de terra. O inverno passa por fora.', 1.60, 21.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL);

UPDATE itens SET valor = 21.00, peso = 1.60, descricao = 'Grosso, comprido, cor de terra. O inverno passa por fora.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Colete de Couro', 'Sem manga, com bolsos. Roupa de quem carrega ferramenta.', 0.90, 22.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Colete de Couro' AND deleted_at IS NULL);

UPDATE itens SET valor = 22.00, peso = 0.90, descricao = 'Sem manga, com bolsos. Roupa de quem carrega ferramenta.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Colete de Couro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Vestido de Linho', 'Solto, prático, com bainha para subir escada. De domingo e de segunda.', 1.20, 17.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'plebe', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL);

UPDATE itens SET valor = 17.00, peso = 1.20, descricao = 'Solto, prático, com bainha para subir escada. De domingo e de segunda.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'plebe', bonus_social = 1
 WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Camisa de Algodão', 'Branca, azul ou cinza. Serve na guarda, na loja e na igreja.', 0.60, 50.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'qualquer', 2
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL);

UPDATE itens SET valor = 50.00, peso = 0.60, descricao = 'Branca, azul ou cinza. Serve na guarda, na loja e na igreja.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = 2
 WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Vestido de Algodão', 'Cor firme, corte simples. Bonito sem ser motivo de conversa.', 1.20, 75.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'qualquer', 2
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL);

UPDATE itens SET valor = 75.00, peso = 1.20, descricao = 'Cor firme, corte simples. Bonito sem ser motivo de conversa.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = 2
 WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Casaco de Lã Fina', 'Ombro estruturado, botão de osso. A primeira roupa que um nobre nota.', 1.60, 100.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 2
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL);

UPDATE itens SET valor = 100.00, peso = 1.60, descricao = 'Ombro estruturado, botão de osso. A primeira roupa que um nobre nota.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 2
 WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Traje de Veludo', 'Casaco e calça no mesmo pano. Reflete a luz das velas, e é para isso que existe.', 2.00, 500.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL);

UPDATE itens SET valor = 500.00, peso = 2.00, descricao = 'Casaco e calça no mesmo pano. Reflete a luz das velas, e é para isso que existe.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Vestido de Seda', 'Cai como água. Quem o veste entra numa sala em silêncio.', 1.20, 500.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL);

UPDATE itens SET valor = 500.00, peso = 1.20, descricao = 'Cai como água. Quem o veste entra numa sala em silêncio.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Traje de Brocado', 'Fio de ouro no desenho. Não há como usá-lo por engano.', 2.00, 833.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 3
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL);

UPDATE itens SET valor = 833.00, peso = 2.00, descricao = 'Fio de ouro no desenho. Não há como usá-lo por engano.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 3
 WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL;


-- ── Acessórios ────────────────────────────────────────────────────────────

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Anel de Cobre', 'Um aro simples. Diz que alguém deu, e é o bastante.', 0.05, 4.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'qualquer', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL);

UPDATE itens SET valor = 4.00, peso = 0.05, descricao = 'Um aro simples. Diz que alguém deu, e é o bastante.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = 1
 WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Pingente de Pedra Polida', 'Ágata num cordão de couro. Bonito o suficiente para ser lembrado.', 0.05, 12.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'qualquer', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL);

UPDATE itens SET valor = 12.00, peso = 0.05, descricao = 'Ágata num cordão de couro. Bonito o suficiente para ser lembrado.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'qualquer', bonus_social = 1
 WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Broche de Prata', 'Prende a capa e diz de onde vem quem a veste.', 0.05, 60.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Broche de Prata' AND deleted_at IS NULL);

UPDATE itens SET valor = 60.00, peso = 0.05, descricao = 'Prende a capa e diz de onde vem quem a veste.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 1
 WHERE nome = 'Broche de Prata' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Anel de Ametista', 'Roxo num aro de prata. Discreto de longe, inconfundível de perto.', 0.05, 84.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL);

UPDATE itens SET valor = 84.00, peso = 0.05, descricao = 'Roxo num aro de prata. Discreto de longe, inconfundível de perto.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 1
 WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Colar de Ouro', 'Elos grossos. Pesa no pescoço e no julgamento de quem olha.', 0.05, 420.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL);

UPDATE itens SET valor = 420.00, peso = 0.05, descricao = 'Elos grossos. Pesa no pescoço e no julgamento de quem olha.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 1
 WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT 'Anel de Rubi', 'Uma pedra, um aro. Quem o usa não se apresenta — é apresentado.', 0.05, 280.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       'nobreza', 1
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL);

UPDATE itens SET valor = 280.00, peso = 0.05, descricao = 'Uma pedra, um aro. Quem o usa não se apresenta — é apresentado.', empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Cosmético' AND deleted_at IS NULL),
       publico = 'nobreza', bonus_social = 1
 WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL;


-- ── Receitas de Costura ───────────────────────────────────────────────────

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Túnica de Linho', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Túnica de Linho' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Túnica de Linho' AND r.deleted_at IS NULL AND i.nome = 'Linho Cru' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Túnica de Linho' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Túnica de Linho' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Casaco de Lã Rústica', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Casaco de Lã Rústica' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Rústica' AND r.deleted_at IS NULL AND i.nome = 'Lã Rústica' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Rústica' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Rústica' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Colete de Couro', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Colete de Couro' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Colete de Couro' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Colete de Couro' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Colete de Couro' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colete de Couro' AND r.deleted_at IS NULL AND i.nome = 'Couro Curtido' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Colete de Couro' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Colete de Couro' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Vestido de Linho', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL),
       1, 120,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Vestido de Linho' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Linho' AND r.deleted_at IS NULL AND i.nome = 'Linho Cru' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Linho' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Linho' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Camisa de Algodão', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL),
       1, 240,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Camisa de Algodão' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Camisa de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Algodão Tingido' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Camisa de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Camisa de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Vestido de Algodão', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL),
       1, 240,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Vestido de Algodão' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Algodão Tingido' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Algodão' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Casaco de Lã Fina', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL),
       1, 240,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Casaco de Lã Fina' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Fina' AND r.deleted_at IS NULL AND i.nome = 'Lã Fina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Fina' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Casaco de Lã Fina' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Traje de Veludo', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Traje de Veludo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Veludo' AND r.deleted_at IS NULL AND i.nome = 'Veludo' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Veludo' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Veludo' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Vestido de Seda', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Vestido de Seda' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Seda' AND r.deleted_at IS NULL AND i.nome = 'Seda' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Seda' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Vestido de Seda' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Traje de Brocado', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Costura' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Traje de Brocado' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Brocado' AND r.deleted_at IS NULL AND i.nome = 'Brocado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Brocado' AND r.deleted_at IS NULL AND i.nome = 'Agulhas e Dedal' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Traje de Brocado' AND r.deleted_at IS NULL AND i.nome = 'Tesoura de Alfaiate' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Receitas de Joalheria ─────────────────────────────────────────────────

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Anel de Cobre', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Anel de Cobre' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Cobre' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Cobre' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Cobre' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Pingente de Pedra Polida', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Pingente de Pedra Polida' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Pingente de Pedra Polida' AND r.deleted_at IS NULL AND i.nome = 'Pedra Polida' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Pingente de Pedra Polida' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Pingente de Pedra Polida' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Pingente de Pedra Polida' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Broche de Prata', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Broche de Prata' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Broche de Prata' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Broche de Prata' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Broche de Prata' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Broche de Prata' AND r.deleted_at IS NULL AND i.nome = 'Prata em Barra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Broche de Prata' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Broche de Prata' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Broche de Prata' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Anel de Ametista', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Anel de Ametista' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Ametista' AND r.deleted_at IS NULL AND i.nome = 'Ametista' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Ametista' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Ametista' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Ametista' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Colar de Ouro', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL),
       1, 360,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Colar de Ouro' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colar de Ouro' AND r.deleted_at IS NULL AND i.nome = 'Ouro em Barra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colar de Ouro' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Colar de Ouro' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Colar de Ouro' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Anel de Rubi', '', 'itens',
       (SELECT id FROM itens WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL),
       1, 360,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Joalheria' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Anel de Rubi' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Rubi' AND r.deleted_at IS NULL AND i.nome = 'Rubi' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Rubi' AND r.deleted_at IS NULL AND i.nome = 'Fio de Cobre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Rubi' AND r.deleted_at IS NULL AND i.nome = 'Pinça e Lima Finas' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = 'Anel de Rubi' AND r.deleted_at IS NULL AND i.nome = 'Lupa de Joalheiro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('cosmetico.publico_errado', '-1',
   'Roupa de nobreza diante da plebe, ou de plebe diante da nobreza: este modificador. Roupa "qualquer" não sofre.'),
  ('cosmetico.pericias', 'Encanto, Diplomacia, Negociação',
   'Em que perícias o bônus social entra. Soma com o bônus da comida — são fontes diferentes.'),
  ('cosmetico.acessorio', 'um_so_conta',
   'Acessório dá +1 e só UM conta por vez. A roupa é o argumento; o acessório é a vírgula.'),
  ('cosmetico.le_de', 'inventario.equipado',
   'O bônus é lido do item com equipado = true em data.inventario, com a qualidade da entrada.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();

-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'tecidos: %  materiais: %  cosmeticos: %  receitas Costura: %  Joalheria: %',
    (SELECT count(*) FROM itens i JOIN categoria_item k ON k.item = i.categoria_item WHERE k.descricao = 'Tecido' AND i.deleted_at IS NULL),
    (SELECT count(*) FROM itens i JOIN categoria_item k ON k.item = i.categoria_item WHERE k.descricao = 'Material Precioso' AND i.deleted_at IS NULL),
    (SELECT count(*) FROM itens i JOIN categoria_item k ON k.item = i.categoria_item WHERE k.descricao = 'Cosmético' AND i.deleted_at IS NULL),
    (SELECT count(*) FROM receitas r JOIN pericias p ON p.id = r.pericia_id WHERE p.nome = 'Costura' AND r.deleted_at IS NULL),
    (SELECT count(*) FROM receitas r JOIN pericias p ON p.id = r.pericia_id WHERE p.nome = 'Joalheria' AND r.deleted_at IS NULL);

  -- Todo cosmético precisa de público e bônus: é a razão das colunas.
  FOR linha IN
    SELECT i.nome FROM itens i JOIN categoria_item k ON k.item = i.categoria_item
     WHERE k.descricao = 'Cosmético' AND i.deleted_at IS NULL AND (i.publico IS NULL OR i.bonus_social IS NULL)
  LOOP
    RAISE WARNING 'cosmetico sem publico ou bonus: %', linha.nome;
  END LOOP;

  -- A margem, contra o preço do próprio item (produto em `itens`, não em consumíveis).
  FOR linha IN
    SELECT r.nome, round(sum(i.valor * ri.quantidade) / NULLIF(prod.valor, 0) * 100) AS pct
      FROM receitas r
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.ingrediente_tabela = 'itens' AND ri.consumido = TRUE
      JOIN itens i ON i.id = ri.ingrediente_id
      JOIN itens prod ON prod.id = r.produto_id AND r.produto_tabela = 'itens'
      JOIN pericias p ON p.id = r.pericia_id
     WHERE r.deleted_at IS NULL AND p.nome IN ('Costura', 'Joalheria')
     GROUP BY r.nome, prod.valor
  LOOP
    IF linha.pct < 70 OR linha.pct > 75 THEN
      fora := fora + 1;
      RAISE WARNING 'margem fora da faixa: % em %%%', linha.nome, linha.pct;
    END IF;
  END LOOP;
  IF fora = 0 THEN RAISE NOTICE 'todas as receitas de Costura e Joalheria entre 70%% e 75%%'; END IF;
END $$;
