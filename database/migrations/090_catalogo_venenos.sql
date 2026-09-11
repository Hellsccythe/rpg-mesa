-- 090 — o catálogo de venenos vira dado
--
-- Gerado por docs/gerar_migrations_venenos_alimentos.py a partir de
-- docs/venenos_dados.py, o mesmo arquivo que gera docs/VENENOS.pdf. **Não
-- editar à mão**: para mudar um preço ou uma receita, edite os dados e regere.
--
-- O veneno é a poção com o sinal trocado. A mesma `consumivel_condicao` que
-- diz "esta poção CURA Cegueira" passa a dizer "este veneno INFLIGE Cegueira".
-- Isso faz o antídoto que já existe valer contra qualquer veneno que aplique a
-- mesma condição, sem ninguém escrever essa ligação.
--
-- Entram 16 venenos, 4 condições, 5 ingredientes e 16 receitas.
-- Validados antes da geração por verificar_venenos.py: margem 70–75%, veneno
-- alcança a gravidade do que aplica, e nenhum veneno mais barato que o antídoto
-- que o anula.

-- ── A terceira ação do vínculo ────────────────────────────────────────────
-- O CHECK só aceitava 'cura' e 'previne'. Postgres não altera CHECK no lugar:
-- é remover e recriar, com o mesmo nome para a 083 continuar descritiva.
ALTER TABLE consumivel_condicao DROP CONSTRAINT IF EXISTS consumivel_condicao_acao_check;
ALTER TABLE consumivel_condicao ADD CONSTRAINT consumivel_condicao_acao_check
  CHECK (acao IN ('cura', 'previne', 'inflige'));

-- ── Via de aplicação ──────────────────────────────────────────────────────
-- Como o veneno chega num alvo QUE NÃO QUER — lâmina, ingestão ou contato. É
-- conceito de veneno: poção é bebida por vontade própria e não tem via. Fica
-- NULL para tudo que não é veneno, e é isso que a tela usa para saber quando
-- mostrar o campo.
ALTER TABLE consumiveis ADD COLUMN IF NOT EXISTS via VARCHAR(20);
ALTER TABLE consumiveis DROP CONSTRAINT IF EXISTS consumiveis_via_check;
ALTER TABLE consumiveis ADD CONSTRAINT consumiveis_via_check
  CHECK (via IS NULL OR via IN ('lamina', 'ingestao', 'contato'));
COMMENT ON COLUMN consumiveis.via IS
  'Só para veneno: lamina (dura os golpes em `usos`), ingestao (comida ou bebida) ou contato (pó, óleo, pano).';


-- ── Condições novas (todas da classe farsante) ────────────────────────────
-- O efeito de um farsante não é o dano, é o que as outras pessoas acreditam
-- ao olhar. Nenhuma das 20 condições existentes dizia isso. Todas passam
-- sozinhas e nenhuma tira PV — é o que separa um farsante de um mortífero mal
-- calibrado.

INSERT INTO condicoes (nome, descricao, efeito, categoria, raridade_item, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT 'Febre Fingida', '', 'Suor, tremor e testa quente, sem doença nenhuma por trás. Sofre −2 em tudo. Medicina DC 15 revela a farsa.', 'Alquímica',
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       '1d6 horas', NULL, NULL, FALSE
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE nome = 'Febre Fingida' AND deleted_at IS NULL);

INSERT INTO condicoes (nome, descricao, efeito, categoria, raridade_item, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT 'Desmaio Breve', '', 'Cai inconsciente. Não age nem percebe. Acorda sozinho, sem sequela. Sacudir ou molhar não adianta.', 'Física',
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       '1d10 minutos', NULL, NULL, FALSE
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE nome = 'Desmaio Breve' AND deleted_at IS NULL);

INSERT INTO condicoes (nome, descricao, efeito, categoria, raridade_item, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT 'Estigma Falso', '', 'A pele racha em manchas escuras iguais às da peste. Quem vê foge, guarda fecha e cidade expulsa. Medicina DC 20 revela a farsa.', 'Alquímica',
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       '1d4 dias', NULL, NULL, FALSE
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE nome = 'Estigma Falso' AND deleted_at IS NULL);

INSERT INTO condicoes (nome, descricao, efeito, categoria, raridade_item, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT 'Morte Aparente', '', 'Pulso imperceptível, respiração que não embaça espelho, corpo frio. Não age nem percebe, e continua consciente do que se fala ao redor. Medicina DC 25 revela a farsa — abaixo disso, o coveiro faz o trabalho dele.', 'Alquímica',
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       '1d4 horas', NULL, NULL, FALSE
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE nome = 'Morte Aparente' AND deleted_at IS NULL);


-- ── Ingredientes novos ────────────────────────────────────────────────────
-- Veneno não se faz com as ervas da poção de cura. Os outros são reaproveitados.

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Baba de Sapo-Pedra', 'Raspada do dorso do bicho, que não morre por isso. Irrita tudo que toca.', 0.10, 6.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Baba de Sapo-Pedra' AND deleted_at IS NULL);

UPDATE itens SET valor = 6.00, peso = 0.10, descricao = 'Raspada do dorso do bicho, que não morre por isso. Irrita tudo que toca.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Baba de Sapo-Pedra' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Semente de Cicuta', 'Cresce em beira de charco. Toda criança do campo aprende a não colher.', 0.10, 8.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Semente de Cicuta' AND deleted_at IS NULL);

UPDATE itens SET valor = 8.00, peso = 0.10, descricao = 'Cresce em beira de charco. Toda criança do campo aprende a não colher.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Semente de Cicuta' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Espinho de Arraia', 'Do rabo do bicho de rio. Guarda a peçonha por meses depois de seco.', 0.15, 26.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Espinho de Arraia' AND deleted_at IS NULL);

UPDATE itens SET valor = 26.00, peso = 0.15, descricao = 'Do rabo do bicho de rio. Guarda a peçonha por meses depois de seco.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Espinho de Arraia' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Fungo do Afogado', 'Brota em corpo que ficou na água. Cheira a nada, e é esse o problema.', 0.15, 32.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Fungo do Afogado' AND deleted_at IS NULL);

UPDATE itens SET valor = 32.00, peso = 0.15, descricao = 'Brota em corpo que ficou na água. Cheira a nada, e é esse o problema.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Fungo do Afogado' AND deleted_at IS NULL;

INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT 'Olho de Corvo Cego', 'De ave que comeu de cadáver pestilento e sobreviveu cega.', 0.25, 190.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = 'Olho de Corvo Cego' AND deleted_at IS NULL);

UPDATE itens SET valor = 190.00, peso = 0.25, descricao = 'De ave que comeu de cadáver pestilento e sobreviveu cega.',
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Olho de Corvo Cego' AND deleted_at IS NULL;


-- ── Os venenos ────────────────────────────────────────────────────────────

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Corte que Não Fecha', 'Mortíferos · Lâmina · Fortitude DC 10 para resistir.', 'A ferida para de coagular. O alvo perde 1d4 PV por turno até ser tratado.', 3, '3 golpes ou 1 minuto', 'lamina',
       0.10, 31.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Mortíferos · Lâmina · Fortitude DC 10 para resistir.', efeito = 'A ferida para de coagular. O alvo perde 1d4 PV por turno até ser tratado.', usos = 3,
       duracao = '3 golpes ou 1 minuto', via = 'lamina', valor = 31.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Fel de Víbora', 'Mortíferos · Lâmina · Fortitude DC 15 para resistir.', 'Peçonha concentrada de três glândulas numa. Perde 1d6 PV por turno e sofre −2 em tudo.', 3, '3 golpes ou 1 minuto', 'lamina',
       0.10, 108.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Mortíferos · Lâmina · Fortitude DC 15 para resistir.', efeito = 'Peçonha concentrada de três glândulas numa. Perde 1d6 PV por turno e sofre −2 em tudo.', usos = 3,
       duracao = '3 golpes ou 1 minuto', via = 'lamina', valor = 108.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Toque da Serpente-Pedra', 'Mortíferos · Lâmina · Fortitude DC 20 para resistir.', 'Uma gota na lâmina. O alvo trava onde está, e quem o alcançar acerta em cheio.', 1, '1 golpes ou 1 minuto', 'lamina',
       0.10, 453.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Mortíferos · Lâmina · Fortitude DC 20 para resistir.', efeito = 'Uma gota na lâmina. O alvo trava onde está, e quem o alcançar acerta em cheio.', usos = 1,
       duracao = '1 golpes ou 1 minuto', via = 'lamina', valor = 453.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Sopro da Vala', 'Mortíferos · Ingestão · Fortitude DC 20 para resistir.', 'Não é veneno, é doença engarrafada. Mata devagar e não fica só no alvo.', 1, 'Uma dose', 'ingestao',
       0.10, 642.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Mortíferos · Ingestão · Fortitude DC 20 para resistir.', efeito = 'Não é veneno, é doença engarrafada. Mata devagar e não fica só no alvo.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 642.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Beijo da Necrose', 'Mortíferos · Contato · Fortitude DC 20 para resistir.', 'Passado na maçaneta, na taça, na mão estendida. A carne que tocar apodrece.', 1, 'Uma dose', 'contato',
       0.10, 558.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Mortíferos · Contato · Fortitude DC 20 para resistir.', efeito = 'Passado na maçaneta, na taça, na mão estendida. A carne que tocar apodrece.', usos = 1,
       duracao = 'Uma dose', via = 'contato', valor = 558.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Água Torta', 'Sensoriais · Ingestão · Fortitude DC 10 para resistir.', 'Some no vinho e aparece no estômago. O alvo não consegue usar consumível nenhum.', 1, 'Uma dose', 'ingestao',
       0.10, 19.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Água Torta' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Sensoriais · Ingestão · Fortitude DC 10 para resistir.', efeito = 'Some no vinho e aparece no estômago. O alvo não consegue usar consumível nenhum.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 19.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Água Torta' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Vinho do Bobo', 'Sensoriais · Ingestão · Fortitude DC 10 para resistir.', 'Bêbado sem ter bebido. Serve para desacreditar tanto quanto para atrapalhar.', 1, 'Uma dose', 'ingestao',
       0.10, 22.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Sensoriais · Ingestão · Fortitude DC 10 para resistir.', efeito = 'Bêbado sem ter bebido. Serve para desacreditar tanto quanto para atrapalhar.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 22.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Silêncio de Cripta', 'Sensoriais · Ingestão · Fortitude DC 15 para resistir.', 'O mundo cala. Ordem gritada não chega, e emboscada não se anuncia.', 1, 'Uma dose', 'ingestao',
       0.10, 80.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Sensoriais · Ingestão · Fortitude DC 15 para resistir.', efeito = 'O mundo cala. Ordem gritada não chega, e emboscada não se anuncia.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 80.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Cinza nos Olhos', 'Sensoriais · Contato · Fortitude DC 15 para resistir.', 'Um punhado no rosto. Ataque à distância do alvo falha automaticamente.', 1, 'Uma dose', 'contato',
       0.10, 86.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Sensoriais · Contato · Fortitude DC 15 para resistir.', efeito = 'Um punhado no rosto. Ataque à distância do alvo falha automaticamente.', usos = 1,
       duracao = 'Uma dose', via = 'contato', valor = 86.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Fardo de Chumbo', 'Debilitantes · Ingestão · Fortitude DC 10 para resistir.', 'Os braços pesam. Sofre −2 em testes de Força e de Resistência até descansar.', 1, 'Uma dose', 'ingestao',
       0.10, 22.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Debilitantes · Ingestão · Fortitude DC 10 para resistir.', efeito = 'Os braços pesam. Sofre −2 em testes de Força e de Resistência até descansar.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 22.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Peçonha do Torpor', 'Debilitantes · Lâmina · Fortitude DC 15 para resistir.', 'Esfria o sangue de dentro. Move-se pela metade e sofre −3 em Destreza.', 3, '3 golpes ou 1 minuto', 'lamina',
       0.10, 100.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Debilitantes · Lâmina · Fortitude DC 15 para resistir.', efeito = 'Esfria o sangue de dentro. Move-se pela metade e sofre −3 em Destreza.', usos = 3,
       duracao = '3 golpes ou 1 minuto', via = 'lamina', valor = 100.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Trava-Língua', 'Debilitantes · Ingestão · Fortitude DC 15 para resistir.', 'A garganta fecha. Nenhuma skill que exija palavra falada sai — o alvo é um conjurador mudo.', 1, 'Uma dose', 'ingestao',
       0.10, 114.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Trava-Língua' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Debilitantes · Ingestão · Fortitude DC 15 para resistir.', efeito = 'A garganta fecha. Nenhuma skill que exija palavra falada sai — o alvo é um conjurador mudo.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 114.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Trava-Língua' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Máscara Febril', 'Farsantes · Ingestão · Fortitude DC 10 para resistir.', 'Febre de verdade sem doença nenhuma. Dispensa da guarda, entra na enfermaria, esvazia a mesa de jantar.', 1, 'Uma dose', 'ingestao',
       0.10, 29.00,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Máscara Febril' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Farsantes · Ingestão · Fortitude DC 10 para resistir.', efeito = 'Febre de verdade sem doença nenhuma. Dispensa da guarda, entra na enfermaria, esvazia a mesa de jantar.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 29.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL)
 WHERE nome = 'Máscara Febril' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Sopro Curto', 'Farsantes · Contato · Fortitude DC 15 para resistir.', 'Um lenço no rosto e a sentinela dorme. Acorda sem entender e sem sequela — o que também significa que vai poder contar.', 1, 'Uma dose', 'contato',
       0.10, 89.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sopro Curto' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Farsantes · Contato · Fortitude DC 15 para resistir.', efeito = 'Um lenço no rosto e a sentinela dorme. Acorda sem entender e sem sequela — o que também significa que vai poder contar.', usos = 1,
       duracao = 'Uma dose', via = 'contato', valor = 89.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Sopro Curto' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Pústula de Mentira', 'Farsantes · Contato · Fortitude DC 15 para resistir.', 'As manchas da peste sem a peste. Serve para esvaziar uma rua, fechar um porto, ou fazer com que ninguém encoste em quem carrega.', 1, 'Uma dose', 'contato',
       0.10, 62.00,
       (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Farsantes · Contato · Fortitude DC 15 para resistir.', efeito = 'As manchas da peste sem a peste. Serve para esvaziar uma rua, fechar um porto, ou fazer com que ninguém encoste em quem carrega.', usos = 1,
       duracao = 'Uma dose', via = 'contato', valor = 62.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL)
 WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL;

INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT 'Sono do Coveiro', 'Farsantes · Ingestão · Fortitude DC 20 para resistir.', 'Morre por algumas horas e volta. Escapa de execução, de cerco e de casamento — desde que alguém saiba onde vão enterrar o corpo.', 1, 'Uma dose', 'ingestao',
       0.10, 583.00,
       (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = 'Farsantes · Ingestão · Fortitude DC 20 para resistir.', efeito = 'Morre por algumas horas e volta. Escapa de execução, de cerco e de casamento — desde que alguém saiba onde vão enterrar o corpo.', usos = 1,
       duracao = 'Uma dose', via = 'ingestao', valor = 583.00, peso = 0.10,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL)
 WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL;


-- ── Vínculos veneno → condição (inflige) ──────────────────────────────────

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Corte que Não Fecha' AND c.deleted_at IS NULL
   AND x.nome = 'Sangramento' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Fel de Víbora' AND c.deleted_at IS NULL
   AND x.nome = 'Envenenado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Toque da Serpente-Pedra' AND c.deleted_at IS NULL
   AND x.nome = 'Paralisia' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Sopro da Vala' AND c.deleted_at IS NULL
   AND x.nome = 'Peste Negra' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Beijo da Necrose' AND c.deleted_at IS NULL
   AND x.nome = 'Necrose' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Água Torta' AND c.deleted_at IS NULL
   AND x.nome = 'Náusea' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Vinho do Bobo' AND c.deleted_at IS NULL
   AND x.nome = 'Embriaguez' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Silêncio de Cripta' AND c.deleted_at IS NULL
   AND x.nome = 'Surdez' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Cinza nos Olhos' AND c.deleted_at IS NULL
   AND x.nome = 'Cegueira' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Fardo de Chumbo' AND c.deleted_at IS NULL
   AND x.nome = 'Fadiga' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Peçonha do Torpor' AND c.deleted_at IS NULL
   AND x.nome = 'Enregelado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Trava-Língua' AND c.deleted_at IS NULL
   AND x.nome = 'Silenciado' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Máscara Febril' AND c.deleted_at IS NULL
   AND x.nome = 'Febre Fingida' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Sopro Curto' AND c.deleted_at IS NULL
   AND x.nome = 'Desmaio Breve' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Pústula de Mentira' AND c.deleted_at IS NULL
   AND x.nome = 'Estigma Falso' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = 'Sono do Coveiro' AND c.deleted_at IS NULL
   AND x.nome = 'Morte Aparente' AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Receitas (Alquimia) ───────────────────────────────────────────────────

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Corte que Não Fecha', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Corte que Não Fecha' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Corte que Não Fecha' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Corte que Não Fecha' AND r.deleted_at IS NULL
   AND i.nome = 'Semente de Cicuta' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Fel de Víbora', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Fel de Víbora' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fel de Víbora' AND r.deleted_at IS NULL
   AND i.nome = 'Glândula de Víbora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fel de Víbora' AND r.deleted_at IS NULL
   AND i.nome = 'Semente de Cicuta' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Toque da Serpente-Pedra', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 480
 WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Toque da Serpente-Pedra' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Toque da Serpente-Pedra' AND r.deleted_at IS NULL
   AND i.nome = 'Sangue de Basilisco' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Toque da Serpente-Pedra' AND r.deleted_at IS NULL
   AND i.nome = 'Espinho de Arraia' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Sopro da Vala', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 480
 WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Sopro da Vala' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro da Vala' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Carne' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro da Vala' AND r.deleted_at IS NULL
   AND i.nome = 'Olho de Corvo Cego' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro da Vala' AND r.deleted_at IS NULL
   AND i.nome = 'Fungo do Afogado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro da Vala' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Beijo da Necrose', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 480
 WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Beijo da Necrose' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Beijo da Necrose' AND r.deleted_at IS NULL
   AND i.nome = 'Raiz de Carne' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Beijo da Necrose' AND r.deleted_at IS NULL
   AND i.nome = 'Olho de Corvo Cego' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Beijo da Necrose' AND r.deleted_at IS NULL
   AND i.nome = 'Fungo do Afogado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Água Torta', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Água Torta' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Água Torta' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Água Torta' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Água Torta' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Água Torta' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Água Torta' AND r.deleted_at IS NULL
   AND i.nome = 'Baba de Sapo-Pedra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Água Torta' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Vinho do Bobo', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Vinho do Bobo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vinho do Bobo' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vinho do Bobo' AND r.deleted_at IS NULL
   AND i.nome = 'Semente de Cicuta' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Vinho do Bobo' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Silêncio de Cripta', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Silêncio de Cripta' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Silêncio de Cripta' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Silêncio de Cripta' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Cinza nos Olhos', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Cinza nos Olhos' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cinza nos Olhos' AND r.deleted_at IS NULL
   AND i.nome = 'Espinho de Arraia' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cinza nos Olhos' AND r.deleted_at IS NULL
   AND i.nome = 'Fungo do Afogado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Cinza nos Olhos' AND r.deleted_at IS NULL
   AND i.nome = 'Cinza de Carvalho' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Fardo de Chumbo', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Fardo de Chumbo' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fardo de Chumbo' AND r.deleted_at IS NULL
   AND i.nome = 'Cinza de Carvalho' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fardo de Chumbo' AND r.deleted_at IS NULL
   AND i.nome = 'Baba de Sapo-Pedra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Fardo de Chumbo' AND r.deleted_at IS NULL
   AND i.nome = 'Sal Mineral' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Peçonha do Torpor', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Peçonha do Torpor' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Peçonha do Torpor' AND r.deleted_at IS NULL
   AND i.nome = 'Escama de Salamandra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Peçonha do Torpor' AND r.deleted_at IS NULL
   AND i.nome = 'Fungo do Afogado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Trava-Língua', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Trava-Língua' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Trava-Língua' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Trava-Língua' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Trava-Língua' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Trava-Língua' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Trava-Língua' AND r.deleted_at IS NULL
   AND i.nome = 'Cogumelo do Silêncio' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Trava-Língua' AND r.deleted_at IS NULL
   AND i.nome = 'Espinho de Arraia' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Máscara Febril', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Máscara Febril' AND deleted_at IS NULL),
       1, 60,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Máscara Febril' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Máscara Febril' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       tempo_minutos = 60
 WHERE nome = 'Máscara Febril' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Máscara Febril' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Máscara Febril' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Máscara Febril' AND r.deleted_at IS NULL
   AND i.nome = 'Semente de Cicuta' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Máscara Febril' AND r.deleted_at IS NULL
   AND i.nome = 'Mel Silvestre' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Sopro Curto', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Sopro Curto' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Sopro Curto' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sopro Curto' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Sopro Curto' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Sopro Curto' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro Curto' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro Curto' AND r.deleted_at IS NULL
   AND i.nome = 'Fungo do Afogado' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sopro Curto' AND r.deleted_at IS NULL
   AND i.nome = 'Água Pura' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Pústula de Mentira', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL),
       1, 180,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Incomum' AND deleted_at IS NULL),
       tempo_minutos = 180
 WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Pústula de Mentira' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Pústula de Mentira' AND r.deleted_at IS NULL
   AND i.nome = 'Espinho de Arraia' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Pústula de Mentira' AND r.deleted_at IS NULL
   AND i.nome = 'Erva de Sangue' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 2, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Pústula de Mentira' AND r.deleted_at IS NULL
   AND i.nome = 'Baba de Sapo-Pedra' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;

INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT 'Sono do Coveiro', '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL),
       1, 480,
       (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = 'Raro' AND deleted_at IS NULL),
       tempo_minutos = 480
 WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = 'Sono do Coveiro' AND deleted_at IS NULL);
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sono do Coveiro' AND r.deleted_at IS NULL
   AND i.nome = 'Coração de Mandrágora' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sono do Coveiro' AND r.deleted_at IS NULL
   AND i.nome = 'Flor da Meia-Noite' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, TRUE
  FROM receitas r, itens i
 WHERE r.nome = 'Sono do Coveiro' AND r.deleted_at IS NULL
   AND i.nome = 'Olho de Corvo Cego' AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;


-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('veneno.resistencia', 'Fortitude', 'Para resistir a um veneno, teste de Fortitude contra a DC do tier (raridade.dificuldade_base). Passou, nada acontece.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('veneno.lamina', 'usos_ou_1_minuto', 'Veneno de lâmina vale pelos golpes em `usos` ou por 1 minuto, o que acabar antes. É a única via que serve em combate.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('veneno.farsante', 'sem_antidoto', 'Farsante não tem antídoto: passa sozinho. A defesa é Medicina, com a DC gravada na condição.')
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();


-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'venenos: %  (esperado 16)  vinculos inflige: %  condicoes: %',
    (SELECT count(*) FROM consumiveis c JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
      WHERE k.descricao = 'Veneno' AND c.deleted_at IS NULL),
    (SELECT count(*) FROM consumivel_condicao WHERE acao = 'inflige'),
    (SELECT count(*) FROM condicoes WHERE deleted_at IS NULL);

  -- Nenhum veneno pode ter ficado sem vínculo: seria um frasco que não faz nada.
  FOR linha IN
    SELECT c.nome FROM consumiveis c
      JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
     WHERE k.descricao = 'Veneno' AND c.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM consumivel_condicao v WHERE v.consumivel_id = c.id AND v.acao = 'inflige')
  LOOP
    RAISE WARNING 'veneno sem condicao: %', linha.nome;
  END LOOP;

  -- E nenhum sem via.
  IF EXISTS (SELECT 1 FROM consumiveis c JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
              WHERE k.descricao = 'Veneno' AND c.deleted_at IS NULL AND c.via IS NULL) THEN
    RAISE WARNING 'ha veneno sem via';
  END IF;

  -- A margem continua valendo depois de gravada.
  FOR linha IN
    SELECT r.nome, round(sum(i.valor * ri.quantidade) / NULLIF(c.valor, 0) * 100) AS pct
      FROM receitas r
      JOIN receita_ingredientes ri ON ri.receita_id = r.id AND ri.ingrediente_tabela = 'itens'
      JOIN itens i ON i.id = ri.ingrediente_id
      JOIN consumiveis c ON c.id = r.produto_id AND r.produto_tabela = 'consumiveis'
      JOIN categoria_consumivel k ON k.item = c.categoria_consumivel_item
     WHERE r.deleted_at IS NULL AND k.descricao = 'Veneno'
     GROUP BY r.nome, c.valor
  LOOP
    IF linha.pct < 70 OR linha.pct > 75 THEN
      fora := fora + 1;
      RAISE WARNING 'margem fora da faixa: % em %%%', linha.nome, linha.pct;
    END IF;
  END LOOP;
  IF fora = 0 THEN RAISE NOTICE 'todas as receitas de veneno entre 70%% e 75%%'; END IF;
END $$;
