-- 083 — o catálogo de poções vira dado
--
-- Gerado por docs/gerar_migration_pocoes.py a partir de docs/pocoes_dados.py,
-- o mesmo arquivo que gera docs/POCOES.pdf. **Não editar à mão**: mexer aqui
-- faz o banco divergir do documento. Para mudar um preço ou uma receita,
-- edite os dados e regere os dois.
--
-- Entram 27 consumíveis, 16 itens e 28 receitas — os que já existiam
-- (Poção de Cura Menor, Erva de Sangue, Água Pura) são atualizados, não
-- duplicados.
--
-- Todas as receitas foram validadas antes da geração: margem de crafting entre
-- 70 e 75%, tier da poção maior ou igual ao da condição tratada, nenhuma poção
-- mais rara que seu ingrediente mais raro, e nenhuma condição sem tratamento.

-- ── Vínculo poção → condição ──────────────────────────────────────────────
--
-- Muitos-para-muitos: uma poção pode tratar mais de uma condição (o Tônico do
-- Desperto cura Atordoado e Embriaguez) e uma condição pode ter mais de uma
-- resposta. Por isso tabela, e não coluna.
--
-- `acao` separa CURAR (remove o que já se sofreu) de PREVENIR (imuniza por um
-- tempo, bebe-se antes). Sem essa coluna, o Antídoto Comum e a Profilaxia da
-- Víbora seriam indistinguíveis — os dois "tratam Envenenado".
CREATE TABLE IF NOT EXISTS consumivel_condicao (
  id            INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  consumivel_id INTEGER     NOT NULL,
  condicao_id   INTEGER     NOT NULL,
  acao          VARCHAR(10) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT,
  CONSTRAINT consumivel_condicao_acao_check CHECK (acao IN ('cura', 'previne'))
);

-- Total, e não parcial: o vínculo é detalhe do consumível, editado como
-- conjunto, e não tem soft delete — logo não há linha apagada ocupando a chave.
CREATE UNIQUE INDEX IF NOT EXISTS idx_consumivel_condicao_unico
  ON consumivel_condicao (consumivel_id, condicao_id, acao);
CREATE INDEX IF NOT EXISTS idx_consumivel_condicao_consumivel
  ON consumivel_condicao (consumivel_id);
CREATE INDEX IF NOT EXISTS idx_consumivel_condicao_condicao
  ON consumivel_condicao (condicao_id);


-- ── Ingredientes ──────────────────────────────────────────────────────────
-- Todos entram como categoria Ingrediente e empilháveis: ninguém conta ervas
-- uma a uma. O ON CONFLICT não serve aqui porque não há UNIQUE em `nome` —
-- a checagem é por NOT EXISTS, o que também torna a migration reexecutável.

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Água Pura', 'Água de nascente, fervida e lacrada. Base de quase toda poção.', 0.10, 2.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Água Pura' AND deleted_at IS NULL);

UPDATE itens SET valor = 2.00, peso = 0.10, descricao = 'Água de nascente, fervida e lacrada. Base de quase toda poção.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Água Pura' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Sal Mineral', 'Raspado de veio de rocha. Conserva e estanca.', 0.10, 2.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Sal Mineral' AND deleted_at IS NULL);

UPDATE itens SET valor = 2.00, peso = 0.10, descricao = 'Raspado de veio de rocha. Conserva e estanca.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Sal Mineral' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Folha de Menta Selvagem', 'Cresce em beira de trilha. Acorda quem está entorpecido.', 0.10, 3.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Folha de Menta Selvagem' AND deleted_at IS NULL);

UPDATE itens SET valor = 3.00, peso = 0.10, descricao = 'Cresce em beira de trilha. Acorda quem está entorpecido.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Folha de Menta Selvagem' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Cinza de Carvalho', 'De árvore atingida por raio, dizem os alquimistas. Absorve.', 0.10, 4.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Cinza de Carvalho' AND deleted_at IS NULL);

UPDATE itens SET valor = 4.00, peso = 0.10, descricao = 'De árvore atingida por raio, dizem os alquimistas. Absorve.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Cinza de Carvalho' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Raiz de Vigor', 'Tubérculo amargo. Devolve o fôlego a quem já não tem.', 0.10, 5.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Raiz de Vigor' AND deleted_at IS NULL);

UPDATE itens SET valor = 5.00, peso = 0.10, descricao = 'Tubérculo amargo. Devolve o fôlego a quem já não tem.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Raiz de Vigor' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Mel Silvestre', 'De colmeia brava. Liga o que não liga e disfarça o gosto.', 0.10, 6.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Mel Silvestre' AND deleted_at IS NULL);

UPDATE itens SET valor = 6.00, peso = 0.10, descricao = 'De colmeia brava. Liga o que não liga e disfarça o gosto.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Mel Silvestre' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Erva de Sangue', 'Folha de nervuras vermelhas, comum em beira de rio.', 0.10, 7.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Erva de Sangue' AND deleted_at IS NULL);

UPDATE itens SET valor = 7.00, peso = 0.10, descricao = 'Folha de nervuras vermelhas, comum em beira de rio.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Erva de Sangue' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Lágrima de Resina', 'Seiva endurecida de pinheiro antigo. Clarifica a mistura.', 0.15, 20.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Lágrima de Resina' AND deleted_at IS NULL);

UPDATE itens SET valor = 20.00, peso = 0.15, descricao = 'Seiva endurecida de pinheiro antigo. Clarifica a mistura.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Lágrima de Resina' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Musgo Luminoso', 'Só cresce onde nunca bate sol. Brilha fraco no escuro.', 0.15, 25.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Musgo Luminoso' AND deleted_at IS NULL);

UPDATE itens SET valor = 25.00, peso = 0.15, descricao = 'Só cresce onde nunca bate sol. Brilha fraco no escuro.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Musgo Luminoso' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Cogumelo do Silêncio', 'Cresce em cripta. Não tem cheiro nenhum, e é isso que assusta.', 0.15, 28.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Cogumelo do Silêncio' AND deleted_at IS NULL);

UPDATE itens SET valor = 28.00, peso = 0.15, descricao = 'Cresce em cripta. Não tem cheiro nenhum, e é isso que assusta.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Cogumelo do Silêncio' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Flor da Meia-Noite', 'Abre por três horas, uma vez ao ano.', 0.15, 30.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Flor da Meia-Noite' AND deleted_at IS NULL);

UPDATE itens SET valor = 30.00, peso = 0.15, descricao = 'Abre por três horas, uma vez ao ano.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Flor da Meia-Noite' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Glândula de Víbora', 'Do próprio veneno se tira o antídoto.', 0.15, 35.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Glândula de Víbora' AND deleted_at IS NULL);

UPDATE itens SET valor = 35.00, peso = 0.15, descricao = 'Do próprio veneno se tira o antídoto.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Glândula de Víbora' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Escama de Salamandra', 'Fria ao toque, mesmo ao lado do fogo.', 0.15, 40.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Escama de Salamandra' AND deleted_at IS NULL);

UPDATE itens SET valor = 40.00, peso = 0.15, descricao = 'Fria ao toque, mesmo ao lado do fogo.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Escama de Salamandra' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Óleo Sacro', 'Consagrado em altar, e só serve se o foi de verdade.', 0.25, 150.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Óleo Sacro' AND deleted_at IS NULL);

UPDATE itens SET valor = 150.00, peso = 0.25, descricao = 'Consagrado em altar, e só serve se o foi de verdade.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Óleo Sacro' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Raiz de Carne', 'Cresce em campo de batalha antigo. Ninguém planta.', 0.25, 180.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Raiz de Carne' AND deleted_at IS NULL);

UPDATE itens SET valor = 180.00, peso = 0.25, descricao = 'Cresce em campo de batalha antigo. Ninguém planta.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Raiz de Carne' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Coração de Mandrágora', 'Colhido com o grito abafado, ou o colhedor enlouquece.', 0.25, 200.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Coração de Mandrágora' AND deleted_at IS NULL);

UPDATE itens SET valor = 200.00, peso = 0.25, descricao = 'Colhido com o grito abafado, ou o colhedor enlouquece.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Coração de Mandrágora' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Pó de Estrela Caída', 'O que sobra onde o céu tocou o chão.', 0.25, 250.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Pó de Estrela Caída' AND deleted_at IS NULL);

UPDATE itens SET valor = 250.00, peso = 0.25, descricao = 'O que sobra onde o céu tocou o chão.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Pó de Estrela Caída' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Sangue de Basilisco', 'Desfaz a pedra porque foi ele quem a fez.', 0.25, 300.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Sangue de Basilisco' AND deleted_at IS NULL);

UPDATE itens SET valor = 300.00, peso = 0.25, descricao = 'Desfaz a pedra porque foi ele quem a fez.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Sangue de Basilisco' AND deleted_at IS NULL;


-- ── Consumíveis ───────────────────────────────────────────────────────────

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Poção de Cura Menor', '', 'Recupera 1d4 + 20% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', 1, 'Instantâneo', 0.30, 25.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Recupera 1d4 + 20% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', valor = 25.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Chá de Estômago Calmo', '', 'Limpa a Saturação Alquímica e a Náusea. Uma vez por semana, e só.', 1, 'Instantâneo', 0.30, 11.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Limpa a Saturação Alquímica e a Náusea. Uma vez por semana, e só.', valor = 11.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Emplastro de Sangue Firme', '', 'Estanca o sangramento em um turno. Arde como o diabo.', 1, 'Instantâneo', 0.30, 15.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Estanca o sangramento em um turno. Arde como o diabo.', valor = 15.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Tônico do Desperto', '', 'Limpa a cabeça na hora. O gosto ajuda.', 1, 'Instantâneo', 0.30, 18.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Limpa a cabeça na hora. O gosto ajuda.', valor = 18.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Infusão Revigorante', '', 'Devolve o fôlego a quem andou demais.', 1, 'Instantâneo', 0.30, 20.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Devolve o fôlego a quem andou demais.', valor = 20.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Unguento Cicatrizante', '', 'Fecha o que não fechava. Volta a recuperar PV descansando.', 1, 'Instantâneo', 0.30, 25.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Fecha o que não fechava. Volta a recuperar PV descansando.', valor = 25.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Elixir do Alívio Simples', '', 'Limpa UMA condição Comum, qualquer que seja. A mais cara das comuns.', 1, 'Instantâneo', 0.30, 60.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Limpa UMA condição Comum, qualquer que seja. A mais cara das comuns.', valor = 60.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Licor da Coragem', '', 'O medo passa. O que causou o medo, não.', 1, 'Instantâneo', 0.30, 50.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'O medo passa. O que causou o medo, não.', valor = 50.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Bálsamo de Pele Fria', '', 'Apaga a queimadura e tira o dobro de dano de fogo.', 1, 'Instantâneo', 0.30, 55.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Apaga a queimadura e tira o dobro de dano de fogo.', valor = 55.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Tônico do Sangue Quente', '', 'Devolve o movimento a quem congelou.', 1, 'Instantâneo', 0.30, 46.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Devolve o movimento a quem congelou.', valor = 46.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Antídoto Comum', '', 'Do próprio veneno se tira o antídoto.', 1, 'Instantâneo', 0.30, 60.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Do próprio veneno se tira o antídoto.', valor = 60.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Essência do Ouvido Aberto', '', 'O mundo volta a fazer barulho.', 1, 'Instantâneo', 0.30, 69.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'O mundo volta a fazer barulho.', valor = 69.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Colírio de Visão Clara', '', 'Pinga-se no olho. Arde, e enxerga.', 1, 'Instantâneo', 0.30, 70.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Pinga-se no olho. Arde, e enxerga.', valor = 70.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Fôlego do Bravo', '', 'Imune a medo por 10 minutos. Bebe-se ANTES de abrir a porta.', 1, 'Instantâneo', 0.30, 74.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Imune a medo por 10 minutos. Bebe-se ANTES de abrir a porta.', valor = 74.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Óleo do Manto Ígneo', '', 'Passa-se na pele. Resiste a fogo por 10 minutos.', 1, 'Instantâneo', 0.30, 75.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Passa-se na pele. Resiste a fogo por 10 minutos.', valor = 75.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Xarope da Voz Livre', '', 'Quebra o silêncio imposto. Serve contra magia, não contra covardia.', 1, 'Instantâneo', 0.30, 86.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Quebra o silêncio imposto. Serve contra magia, não contra covardia.', valor = 86.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Profilaxia da Víbora', '', 'Imune a veneno por uma hora. O antídoto que se toma antes.', 1, 'Instantâneo', 0.30, 93.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Imune a veneno por uma hora. O antídoto que se toma antes.', valor = 93.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Poção de Cura Maior', '', 'Recupera 1d6 + 40% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', 1, 'Instantâneo', 0.30, 90.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Recupera 1d6 + 40% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', valor = 90.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Elixir do Alívio Comum', '', 'Limpa TODAS as condições Comuns de uma vez.', 1, 'Instantâneo', 0.30, 140.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Limpa TODAS as condições Comuns de uma vez.', valor = 140.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Poção de Cura Superior', '', 'Recupera 1d10 + 60% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', 1, 'Instantâneo', 0.30, 445.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Recupera 1d10 + 60% do PV máximo. Aplica 1 acúmulo de Saturação Alquímica.', valor = 445.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Soro do Corpo Livre', '', 'Devolve o movimento a quem estava travado.', 1, 'Instantâneo', 0.30, 350.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Devolve o movimento a quem estava travado.', valor = 350.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Panaceia da Peste', '', 'Corta a peste antes que ela dobre de novo.', 1, 'Instantâneo', 0.30, 445.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Corta a peste antes que ela dobre de novo.', valor = 445.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Selo da Vontade', '', 'Imune a controle mental e a medo por uma hora.', 1, 'Instantâneo', 0.30, 465.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Imune a controle mental e a medo por uma hora.', valor = 465.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Unguento de Carne Nova', '', 'A carne morta cai e a nova cresce. Dói os dois dias inteiros.', 1, 'Instantâneo', 0.30, 420.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'A carne morta cai e a nova cresce. Dói os dois dias inteiros.', valor = 420.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Água Benta Destilada', '', 'Quebra a maldição — mas só a maldição, não quem a lançou.', 1, 'Instantâneo', 0.30, 790.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Quebra a maldição — mas só a maldição, não quem a lançou.', valor = 790.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Elixir da Mente Própria', '', 'Devolve a vontade a quem obedecia outro.', 1, 'Instantâneo', 0.30, 740.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Devolve a vontade a quem obedecia outro.', valor = 740.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Solvente da Carne Viva', '', 'Desfaz a pedra porque foi o basilisco quem a fez.', 1, 'Instantâneo', 0.30, 665.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Desfaz a pedra porque foi o basilisco quem a fez.', valor = 665.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Panaceia Verdadeira', '', 'Limpa QUALQUER condição, até as Raras. O teto do que a alquimia alcança.', 1, 'Instantâneo', 0.30, 1250.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Poção' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = 'Limpa QUALQUER condição, até as Raras. O teto do que a alquimia alcança.', valor = 1250.00, peso = 0.30,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL;


-- ── Vínculos poção → condição ─────────────────────────────────────────────
-- As poções amplas (qualquer condição até o tier Raro, todas as condições Comuns, uma condição Comum à escolha...) descrevem o alvo
-- em texto e não geram vínculo: "qualquer condição até o tier Raro" não é uma
-- linha em `condicoes`. Elas continuam explicadas no campo `efeito`.

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Chá de Estômago Calmo' AND c.deleted_at IS NULL
   AND x.nome = 'Náusea' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Chá de Estômago Calmo' AND c.deleted_at IS NULL
   AND x.nome = 'Saturação Alquímica' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Emplastro de Sangue Firme' AND c.deleted_at IS NULL
   AND x.nome = 'Sangramento' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Tônico do Desperto' AND c.deleted_at IS NULL
   AND x.nome = 'Atordoado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Tônico do Desperto' AND c.deleted_at IS NULL
   AND x.nome = 'Embriaguez' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Infusão Revigorante' AND c.deleted_at IS NULL
   AND x.nome = 'Fadiga' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Unguento Cicatrizante' AND c.deleted_at IS NULL
   AND x.nome = 'Ferida Leve' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Licor da Coragem' AND c.deleted_at IS NULL
   AND x.nome = 'Amedrontado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Bálsamo de Pele Fria' AND c.deleted_at IS NULL
   AND x.nome = 'Queimadura' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Tônico do Sangue Quente' AND c.deleted_at IS NULL
   AND x.nome = 'Enregelado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Antídoto Comum' AND c.deleted_at IS NULL
   AND x.nome = 'Envenenado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Essência do Ouvido Aberto' AND c.deleted_at IS NULL
   AND x.nome = 'Surdez' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Colírio de Visão Clara' AND c.deleted_at IS NULL
   AND x.nome = 'Cegueira' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'previne'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Fôlego do Bravo' AND c.deleted_at IS NULL
   AND x.nome = 'Amedrontado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'previne'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Óleo do Manto Ígneo' AND c.deleted_at IS NULL
   AND x.nome = 'Queimadura' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Xarope da Voz Livre' AND c.deleted_at IS NULL
   AND x.nome = 'Silenciado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'previne'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Profilaxia da Víbora' AND c.deleted_at IS NULL
   AND x.nome = 'Envenenado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Soro do Corpo Livre' AND c.deleted_at IS NULL
   AND x.nome = 'Paralisia' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Panaceia da Peste' AND c.deleted_at IS NULL
   AND x.nome = 'Peste Negra' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'previne'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Selo da Vontade' AND c.deleted_at IS NULL
   AND x.nome = 'Enfeitiçado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'previne'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Selo da Vontade' AND c.deleted_at IS NULL
   AND x.nome = 'Amedrontado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Unguento de Carne Nova' AND c.deleted_at IS NULL
   AND x.nome = 'Necrose' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Água Benta Destilada' AND c.deleted_at IS NULL
   AND x.nome = 'Maldição' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Elixir da Mente Própria' AND c.deleted_at IS NULL
   AND x.nome = 'Enfeitiçado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'cura'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Solvente da Carne Viva' AND c.deleted_at IS NULL
   AND x.nome = 'Petrificação' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Receitas ──────────────────────────────────────────────────────────────
-- Todas exigem Alquimia, e a dificuldade sai da raridade do produto: a
-- `dificuldade_base` de `raridade` (10/15/20) já era a DC do teste. Isso também
-- preenche `receitas.pericia_id`, que estava nulo desde a migration 077.

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Poção de Cura Menor', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Poção de Cura Menor' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Menor' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Menor' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Chá de Estômago Calmo', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Chá de Estômago Calmo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Chá de Estômago Calmo' AND r.deleted_at IS NULL
   AND i.nome = 'Folha de Menta Selvagem' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Chá de Estômago Calmo' AND r.deleted_at IS NULL
   AND i.nome = 'Sal Mineral' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Emplastro de Sangue Firme', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Emplastro de Sangue Firme' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Emplastro de Sangue Firme' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Emplastro de Sangue Firme' AND r.deleted_at IS NULL
   AND i.nome = 'Sal Mineral' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Tônico do Desperto', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Tônico do Desperto' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Desperto' AND r.deleted_at IS NULL
   AND i.nome = 'Folha de Menta Selvagem' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Desperto' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Desperto' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Infusão Revigorante', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Infusão Revigorante' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Infusão Revigorante' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Infusão Revigorante' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Unguento Cicatrizante', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Unguento Cicatrizante' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Unguento Cicatrizante' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Unguento Cicatrizante' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Elixir do Alívio Simples', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Elixir do Alívio Simples' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Simples' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Simples' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Simples' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Licor da Coragem', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Licor da Coragem' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Licor da Coragem' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Licor da Coragem' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Licor da Coragem' AND r.deleted_at IS NULL
   AND i.nome = 'Lágrima de Resina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Bálsamo de Pele Fria', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Bálsamo de Pele Fria' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Bálsamo de Pele Fria' AND r.deleted_at IS NULL
   AND i.nome = 'Escama de Salamandra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Tônico do Sangue Quente', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Tônico do Sangue Quente' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Sangue Quente' AND r.deleted_at IS NULL
   AND i.nome = 'Cinza de Carvalho' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Sangue Quente' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Tônico do Sangue Quente' AND r.deleted_at IS NULL
   AND i.nome = 'Lágrima de Resina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Antídoto Comum', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Antídoto Comum' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Antídoto Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Glândula de Víbora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Antídoto Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Sal Mineral' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Antídoto Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Essência do Ouvido Aberto', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Essência do Ouvido Aberto' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Essência do Ouvido Aberto' AND r.deleted_at IS NULL
   AND i.nome = 'Lágrima de Resina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Essência do Ouvido Aberto' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Essência do Ouvido Aberto' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Colírio de Visão Clara', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Colírio de Visão Clara' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colírio de Visão Clara' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colírio de Visão Clara' AND r.deleted_at IS NULL
   AND i.nome = 'Lágrima de Resina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Colírio de Visão Clara' AND r.deleted_at IS NULL
   AND i.nome = 'Folha de Menta Selvagem' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Fôlego do Bravo', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Fôlego do Bravo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fôlego do Bravo' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fôlego do Bravo' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fôlego do Bravo' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Óleo do Manto Ígneo', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Óleo do Manto Ígneo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Óleo do Manto Ígneo' AND r.deleted_at IS NULL
   AND i.nome = 'Escama de Salamandra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Óleo do Manto Ígneo' AND r.deleted_at IS NULL
   AND i.nome = 'Cinza de Carvalho' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Óleo do Manto Ígneo' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Xarope da Voz Livre', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Xarope da Voz Livre' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Xarope da Voz Livre' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Xarope da Voz Livre' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Profilaxia da Víbora', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Profilaxia da Víbora' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Profilaxia da Víbora' AND r.deleted_at IS NULL
   AND i.nome = 'Glândula de Víbora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Profilaxia da Víbora' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Profilaxia da Víbora' AND r.deleted_at IS NULL
   AND i.nome = 'Sal Mineral' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Poção de Cura Maior', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Poção de Cura Maior' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 6, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Maior' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Maior' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Elixir do Alívio Comum', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Elixir do Alívio Comum' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Folha de Menta Selvagem' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 5, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir do Alívio Comum' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Poção de Cura Superior', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Poção de Cura Superior' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 10, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Superior' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Superior' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Poção de Cura Superior' AND r.deleted_at IS NULL
   AND i.nome = 'Coração de Mandrágora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Soro do Corpo Livre', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Soro do Corpo Livre' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Soro do Corpo Livre' AND r.deleted_at IS NULL
   AND i.nome = 'Coração de Mandrágora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Soro do Corpo Livre' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Vigor' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Soro do Corpo Livre' AND r.deleted_at IS NULL
   AND i.nome = 'Lágrima de Resina' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Panaceia da Peste', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Panaceia da Peste' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia da Peste' AND r.deleted_at IS NULL
   AND i.nome = 'Óleo Sacro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia da Peste' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia da Peste' AND r.deleted_at IS NULL
   AND i.nome = 'Musgo Luminoso' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Selo da Vontade', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Selo da Vontade' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Selo da Vontade' AND r.deleted_at IS NULL
   AND i.nome = 'Pó de Estrela Caída' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Selo da Vontade' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 4, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Selo da Vontade' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Unguento de Carne Nova', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Unguento de Carne Nova' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Unguento de Carne Nova' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Carne' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 12, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Unguento de Carne Nova' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 6, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Unguento de Carne Nova' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Água Benta Destilada', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Água Benta Destilada' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Água Benta Destilada' AND r.deleted_at IS NULL
   AND i.nome = 'Óleo Sacro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 10, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Água Benta Destilada' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Água Benta Destilada' AND r.deleted_at IS NULL
   AND i.nome = 'Pó de Estrela Caída' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Elixir da Mente Própria', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Elixir da Mente Própria' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir da Mente Própria' AND r.deleted_at IS NULL
   AND i.nome = 'Pó de Estrela Caída' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir da Mente Própria' AND r.deleted_at IS NULL
   AND i.nome = 'Coração de Mandrágora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 3, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Elixir da Mente Própria' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Solvente da Carne Viva', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Solvente da Carne Viva' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Solvente da Carne Viva' AND r.deleted_at IS NULL
   AND i.nome = 'Sangue de Basilisco' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Solvente da Carne Viva' AND r.deleted_at IS NULL
   AND i.nome = 'Óleo Sacro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 15, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Solvente da Carne Viva' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Panaceia Verdadeira', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Panaceia Verdadeira' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia Verdadeira' AND r.deleted_at IS NULL
   AND i.nome = 'Sangue de Basilisco' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia Verdadeira' AND r.deleted_at IS NULL
   AND i.nome = 'Pó de Estrela Caída' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia Verdadeira' AND r.deleted_at IS NULL
   AND i.nome = 'Coração de Mandrágora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Panaceia Verdadeira' AND r.deleted_at IS NULL
   AND i.nome = 'Óleo Sacro' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'consumiveis: %  itens: %  receitas: %  vinculos: %',
    (SELECT count(*) FROM consumiveis WHERE deleted_at IS NULL),
    (SELECT count(*) FROM itens WHERE deleted_at IS NULL),
    (SELECT count(*) FROM receitas WHERE deleted_at IS NULL),
    (SELECT count(*) FROM consumivel_condicao);

  -- A margem de 70-75% tem de continuar valendo depois de gravada, e não só
  -- no script que gerou o arquivo.
  FOR linha IN
    SELECT r.nome,
           round(sum(i.valor * ri.quantidade) / NULLIF(c.valor, 0) * 100) AS pct
      FROM receitas r
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.ingrediente_tabela = 'itens'
      JOIN itens i ON i.id = ri.ingrediente_id
      JOIN consumiveis c ON c.id = r.produto_id AND r.produto_tabela = 'consumiveis'
     WHERE r.deleted_at IS NULL
     GROUP BY r.nome, c.valor
  LOOP
    IF linha.pct < 70 OR linha.pct > 75 THEN
      fora := fora + 1;
      RAISE WARNING 'margem fora da faixa: % em %%%', linha.nome, linha.pct;
    END IF;
  END LOOP;

  IF fora = 0 THEN
    RAISE NOTICE 'todas as receitas entre 70%% e 75%% do preco de compra';
  END IF;

  RAISE NOTICE 'receitas sem pericia: %',
    (SELECT count(*) FROM receitas WHERE pericia_id IS NULL AND deleted_at IS NULL);
END $$;
