# -*- coding: utf-8 -*-
"""Gera as migrations 090 (venenos), 091 (alimentos) e 092 (moeda de ouro).

Os mesmos arquivos que geram os PDFs geram o SQL — venenos_dados.py e
alimentos_dados.py —, então o banco não tem como divergir dos documentos.
Para mudar um preço ou uma receita, edite os dados e regere os dois.
"""
import io
import sys

sys.path.insert(0, ".")
import venenos_dados as v
import alimentos_dados as a

PASTA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/.claude/worktrees/"
         "postgres-db-access-951e7e/database/migrations/")

# Mesmos pesos da 083 para insumo de alquimia; comida pesa o que pesa.
PESO_INGREDIENTE_ALQUIMIA = {"Comum": "0.10", "Incomum": "0.15", "Raro": "0.25"}
PESO_FRASCO_VENENO = "0.10"
PESO_VEGETAL = "0.30"
PESO_CARNE = "0.80"
PESO_PRATO = "0.50"

# Tempo de preparo em minutos, por tier. Veneno segue o das poções (083).
TEMPO_VENENO = {"Comum": 60, "Incomum": 180, "Raro": 480}


def aspas(t):
    return "'" + str(t).replace("'", "''") + "'"


def sql_item(nome, descricao, peso, preco, tier):
    return f"""
INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT {aspas(nome)}, {aspas(descricao)}, {peso}, {preco}.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE itens SET valor = {preco}.00, peso = {peso}, descricao = {aspas(descricao)},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;"""


def sql_receita(nome, tier, pericia, tempo, receita):
    partes = [f"""
INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT {aspas(nome)}, '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL),
       1, {tempo},
       (SELECT dificuldade_base FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = {aspas(pericia)} AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = {aspas(pericia)} AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       tempo_minutos = {tempo}
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL);"""]
    for ingrediente, quantidade in receita:
        partes.append(f"""INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, {quantidade}, TRUE
  FROM receitas r, itens i
 WHERE r.nome = {aspas(nome)} AND r.deleted_at IS NULL
   AND i.nome = {aspas(ingrediente)} AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")
    return "\n".join(partes)


def sql_regra(chave, valor, descricao):
    return f"""INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ({aspas(chave)}, {aspas(valor)}, {aspas(descricao)})
ON CONFLICT (chave) DO UPDATE
  SET valor = EXCLUDED.valor, descricao = EXCLUDED.descricao, updated_at = now();"""


# ═══════════════════════════════════════════════════════════════════════════
# 090 — VENENOS
# ═══════════════════════════════════════════════════════════════════════════
p = []
p.append(f"""-- 090 — o catálogo de venenos vira dado
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
-- Entram {len(v.VENENOS)} venenos, {len(v.CONDICOES_NOVAS)} condições, {len(v.INGREDIENTES_NOVOS)} ingredientes e {len(v.VENENOS)} receitas.
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
""")

p.append("\n-- ── Condições novas (todas da classe farsante) ────────────────────────────")
p.append("""-- O efeito de um farsante não é o dano, é o que as outras pessoas acreditam
-- ao olhar. Nenhuma das 20 condições existentes dizia isso. Todas passam
-- sozinhas e nenhuma tira PV — é o que separa um farsante de um mortífero mal
-- calibrado.""")
for nome, tier, categoria, efeito, duracao, janela, se_nao in v.CONDICOES_NOVAS:
    p.append(f"""
INSERT INTO condicoes (nome, descricao, efeito, categoria, raridade_item, duracao, janela_de_cura, se_nao_tratada, acumulativa)
SELECT {aspas(nome)}, '', {aspas(efeito)}, {aspas(categoria)},
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       {aspas(duracao)}, {aspas(janela) if janela else 'NULL'}, {aspas(se_nao) if se_nao else 'NULL'}, FALSE
WHERE NOT EXISTS (SELECT 1 FROM condicoes WHERE nome = {aspas(nome)} AND deleted_at IS NULL);""")

p.append("\n\n-- ── Ingredientes novos ────────────────────────────────────────────────────")
p.append("-- Veneno não se faz com as ervas da poção de cura. Os outros são reaproveitados.")
for nome, tier, preco, descricao in v.INGREDIENTES_NOVOS:
    p.append(sql_item(nome, descricao, PESO_INGREDIENTE_ALQUIMIA[tier], preco, tier))

p.append("\n\n-- ── Os venenos ────────────────────────────────────────────────────────────")
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in v.VENENOS:
    rotulo_classe = v.CLASSES[classe][0]
    rotulo_via = v.VIAS[via][0]
    duracao = f"{usos} golpes ou 1 minuto" if via == "lamina" else "Uma dose"
    descricao = f"{rotulo_classe} · {rotulo_via} · Fortitude DC {v.DIFICULDADE_POR_TIER[tier]} para resistir."
    p.append(f"""
INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, via, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT {aspas(nome)}, {aspas(descricao)}, {aspas(efeito)}, {usos}, {aspas(duracao)}, {aspas(via)},
       {PESO_FRASCO_VENENO}, {preco}.00,
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Veneno' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = {aspas(descricao)}, efeito = {aspas(efeito)}, usos = {usos},
       duracao = {aspas(duracao)}, via = {aspas(via)}, valor = {preco}.00, peso = {PESO_FRASCO_VENENO},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;""")

p.append("\n\n-- ── Vínculos veneno → condição (inflige) ──────────────────────────────────")
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in v.VENENOS:
    p.append(f"""
INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, 'inflige'
  FROM consumiveis c, condicoes x
 WHERE c.nome = {aspas(nome)} AND c.deleted_at IS NULL
   AND x.nome = {aspas(condicao)} AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")

p.append("\n\n-- ── Receitas (Alquimia) ───────────────────────────────────────────────────")
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in v.VENENOS:
    p.append(sql_receita(nome, tier, "Alquimia", TEMPO_VENENO[tier], receita))

p.append("\n\n-- ── Regras ────────────────────────────────────────────────────────────────")
p.append(sql_regra("veneno.resistencia", "Fortitude",
                   "Para resistir a um veneno, teste de Fortitude contra a DC do tier (raridade.dificuldade_base). Passou, nada acontece."))
p.append(sql_regra("veneno.lamina", "usos_ou_1_minuto",
                   "Veneno de lâmina vale pelos golpes em `usos` ou por 1 minuto, o que acabar antes. É a única via que serve em combate."))
p.append(sql_regra("veneno.farsante", "sem_antidoto",
                   "Farsante não tem antídoto: passa sozinho. A defesa é Medicina, com a DC gravada na condição."))

p.append(f"""

-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'venenos: %  (esperado {len(v.VENENOS)})  vinculos inflige: %  condicoes: %',
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
""")

io.open(PASTA + "090_catalogo_venenos.sql", "w", encoding="utf-8", newline="\n").write("\n".join(p))
print("escrito: 090_catalogo_venenos.sql")


# ═══════════════════════════════════════════════════════════════════════════
# 091 — ALIMENTOS
# ═══════════════════════════════════════════════════════════════════════════
p = []
p.append(f"""-- 091 — o catálogo de alimentos vira dado, e a cura vira número
--
-- Gerado por docs/gerar_migrations_venenos_alimentos.py a partir de
-- docs/alimentos_dados.py, o mesmo arquivo que gera docs/ALIMENTOS.pdf. **Não
-- editar à mão**.
--
-- O alimento é a resposta à Saturação Alquímica: duas poções de cura travam a
-- terceira por uma semana, e até aqui o personagem saturado ficava sem cura.
-- Comida cura sem saturar. É por isso que ela existe.
--
-- Entram {len(a.PRATOS)} pratos, {len(a.INGREDIENTES)} ingredientes e {len(a.PRATOS)} receitas de Cozinha.

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
""")

p.append("\n-- ── Ingredientes: vegetais e plantas ──────────────────────────────────────")
for nome, tier, preco, descricao in a.VEGETAIS:
    p.append(sql_item(nome, descricao, PESO_VEGETAL, preco, tier))

p.append("\n\n-- ── Ingredientes: carnes ──────────────────────────────────────────────────")
for nome, tier, preco, descricao in a.CARNES:
    p.append(sql_item(nome, descricao, PESO_CARNE, preco, tier))

p.append("\n\n-- ── Os pratos ─────────────────────────────────────────────────────────────")
p.append("""-- `usos` é porções: 1 para todos, 6 para o Banquete. `duracao` guarda o tempo
-- de refeição — é o que mantém comida fora de combate, e a tela precisa dizer.""")
for nome, tier, preco, social, descricao, receita in a.PRATOS:
    dado, pct = a.CURA_BEMFEITO[tier]
    _preparo, refeicao = a.TEMPO_POR_TIER[tier]
    porcoes = 6 if social == "banquete" else 1
    efeito = (f"Bem feito: recupera {dado} + {int(pct * 100)}% do PV máximo. "
              f"Mal feito: {a.CURA_MALFEITO}. Não aplica Saturação Alquímica.")
    if social:
        rotulo, detalhe = a.EFEITOS_SOCIAIS[social]
        efeito_bemfeito = f"{rotulo}. {detalhe}"
        sql_bemfeito = aspas(efeito_bemfeito)
    else:
        sql_bemfeito = "NULL"
    p.append(f"""
INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         cura_dado, cura_percentual, efeito_bemfeito,
                         raridade_item, categoria_consumivel_item)
SELECT {aspas(nome)}, {aspas(descricao)}, {aspas(efeito)}, {porcoes}, {aspas(f'Refeição de {refeicao} min')},
       {PESO_PRATO}, {preco}.00, {aspas(dado)}, {int(pct * 100)}, {sql_bemfeito},
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = 'Alimento' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE consumiveis SET descricao = {aspas(descricao)}, efeito = {aspas(efeito)}, usos = {porcoes},
       duracao = {aspas(f'Refeição de {refeicao} min')}, valor = {preco}.00, peso = {PESO_PRATO},
       cura_dado = {aspas(dado)}, cura_percentual = {int(pct * 100)}, efeito_bemfeito = {sql_bemfeito},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;""")

p.append("\n\n-- ── Receitas (Cozinha) ────────────────────────────────────────────────────")
p.append("""-- Primeiras receitas do projeto que NÃO são de Alquimia. `tempo_minutos` é o
-- preparo; a refeição está em `consumiveis.duracao`.""")
for nome, tier, preco, social, descricao, receita in a.PRATOS:
    preparo, _refeicao = a.TEMPO_POR_TIER[tier]
    p.append(sql_receita(nome, tier, "Cozinha", preparo, receita))

p.append("\n\n-- ── Regras ────────────────────────────────────────────────────────────────")
for chave, valor, descricao in a.REGRAS:
    p.append(sql_regra(chave, valor, descricao))
p.append(sql_regra("alimento.efeito_social", "so_bem_feito_e_para_quem_partilhou",
                   "O efeito social de um prato só sai em prato bem feito, e vale para quem partilhou a refeição — nunca para quem só cozinhou."))

p.append(f"""

-- ── Conferência ───────────────────────────────────────────────────────────
DO $$
DECLARE
  linha RECORD;
  fora  INTEGER := 0;
BEGIN
  RAISE NOTICE 'pratos: % (esperado {len(a.PRATOS)})  receitas de Cozinha: %  consumiveis com cura em numero: %',
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
""")

io.open(PASTA + "091_catalogo_alimentos.sql", "w", encoding="utf-8", newline="\n").write("\n".join(p))
print("escrito: 091_catalogo_alimentos.sql")


# ═══════════════════════════════════════════════════════════════════════════
# 092 — MOEDA DE OURO
# ═══════════════════════════════════════════════════════════════════════════
p = []
p.append("""-- 092 — o ouro vira moeda de nobre
--
-- A razão entre as moedas era 1:10:100 (bronze, prata, ouro). Passa a ser
-- 1:10:1000 — UM OURO VALE CEM PRATA. Bronze e prata não mudam; preço
-- continua se pensando em prata; e os dados de dinheiro inicial dos passados
-- continuam os mesmos.
--
-- O objetivo é deixar a moeda de ouro fora do alcance de quem não é nobre:
-- uma peça de ouro passa a ser quase dois meses de salário de um artesão, e
-- vê-la numa mesa de taverna vira acontecimento.
--
-- Nenhum código converte entre moedas — o dinheiro é guardado por moeda
-- (`{prata: 73, ouro: 2}`) — então a razão vive só aqui, no CLAUDE.md e no
-- ECONOMIA.pdf. Esta migration grava a regra para a mesa poder consultar.
--
-- ATENÇÃO, que não é cosmético: cinco passados rolam ouro no dinheiro inicial
-- (Nobreza 1d6, Mercenário/Aventureiro/Guarda/Varejista 1d4). A 100 prata por
-- ouro, esses dados valem dez vezes mais que antes. Esta migration NÃO mexe
-- neles — a decisão é do mestre e está registrada como pendente abaixo.
""")
p.append(sql_regra("moeda.bronze_por_prata", "10", "Dez moedas de bronze valem uma de prata."))
p.append(sql_regra("moeda.prata_por_ouro", "100",
                   "CEM moedas de prata valem uma de ouro (era 10 até a migration 092). O ouro é moeda de nobre e de realeza; quase dois meses de salário de artesão numa peça."))
p.append(sql_regra("moeda.referencia", "prata", "Todo preço do catálogo está em prata. É nela que convém pensar."))
p.append("""
DO $$
DECLARE
  linha RECORD;
BEGIN
  RAISE NOTICE 'razao das moedas: 1 bronze : 10 prata : 1000 ouro (1 ouro = 100 prata)';
  RAISE NOTICE 'PENDENTE — passados que rolam ouro no dinheiro inicial, e quanto isso vale agora:';
  FOR linha IN
    SELECT p.nome, d->>'quantidade' AS qtd, d->>'faces' AS faces
      FROM passados p, jsonb_array_elements(p.dinheiro_inicial) AS d
     WHERE p.deleted_at IS NULL AND d->>'moeda' = 'ouro'
     ORDER BY p.nome
  LOOP
    RAISE NOTICE '  %: %d% ouro  =  % a % prata (era % a %)',
      linha.nome, linha.qtd, linha.faces,
      linha.qtd::int * 100, linha.qtd::int * linha.faces::int * 100,
      linha.qtd::int * 10,  linha.qtd::int * linha.faces::int * 10;
  END LOOP;
END $$;
""")

io.open(PASTA + "092_ouro_moeda_de_nobre.sql", "w", encoding="utf-8", newline="\n").write("\n".join(p))
print("escrito: 092_ouro_moeda_de_nobre.sql")
