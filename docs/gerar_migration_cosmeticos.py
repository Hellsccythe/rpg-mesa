# -*- coding: utf-8 -*-
"""Gera a migration 096 a partir de cosmeticos_dados.py."""
import io
import sys

sys.path.insert(0, ".")
import cosmeticos_dados as c

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/.claude/worktrees/"
         "postgres-db-access-951e7e/database/migrations/096_cosmeticos.sql")

PESO_TECIDO_POR_METRO = "0.40"
PESO_MATERIAL = {"Fio de Cobre": "0.10", "Pedra Polida": "0.10", "Prata em Barra": "0.50",
                 "Ametista": "0.05", "Ouro em Barra": "0.50", "Rubi": "0.02"}
PESO_ROUPA = {"túnica": "0.80", "camisa": "0.60", "colete": "0.90", "vestido": "1.20", "casaco": "1.60", "traje": "2.00"}
PESO_ACESSORIO = "0.05"
TEMPO_ROUPA = {"Comum": 120, "Incomum": 240, "Raro": 480}
TEMPO_ACESSORIO = {"Comum": 60, "Incomum": 180, "Raro": 360}

# Ferramentas que cada ofício exige (migration 094).
FERRAMENTAS_COSTURA = ["Agulhas e Dedal", "Tesoura de Alfaiate"]
FERRAMENTAS_JOALHERIA = ["Pinça e Lima Finas", "Lupa de Joalheiro"]


def aspas(t):
    return "'" + str(t).replace("'", "''") + "'"


def sql_item(nome, descricao, peso, preco, tier, categoria, empilhavel, publico=None, bonus=None):
    pub = aspas(publico) if publico else "NULL"
    bon = str(bonus) if bonus is not None else "NULL"
    return f"""
INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item, publico, bonus_social)
SELECT {aspas(nome)}, {aspas(descricao)}, {peso}, {preco}.00, {"TRUE" if empilhavel else "FALSE"},
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = {aspas(categoria)} AND deleted_at IS NULL),
       {pub}, {bon}
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE itens SET valor = {preco}.00, peso = {peso}, descricao = {aspas(descricao)}, empilhavel = {"TRUE" if empilhavel else "FALSE"},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = {aspas(categoria)} AND deleted_at IS NULL),
       publico = {pub}, bonus_social = {bon}
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;"""


def sql_receita(nome, tier, pericia, tempo, receita, ferramentas):
    partes = [f"""
INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT {aspas(nome)}, '', 'itens',
       (SELECT id FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL),
       1, {tempo},
       (SELECT dificuldade_base FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = {aspas(pericia)} AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL);"""]
    for ingrediente, quantidade in receita:
        partes.append(f"""INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, {quantidade}, TRUE
  FROM receitas r, itens i
 WHERE r.nome = {aspas(nome)} AND r.deleted_at IS NULL AND i.nome = {aspas(ingrediente)} AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")
    for ferramenta in ferramentas:
        partes.append(f"""INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r, itens i
 WHERE r.nome = {aspas(nome)} AND r.deleted_at IS NULL AND i.nome = {aspas(ferramenta)} AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")
    return "\n".join(partes)


p = []
p.append(f"""-- 096 — cosméticos: o tecido decide quem a roupa impressiona, a qualidade decide quanto
--
-- Gerado por docs/gerar_migration_cosmeticos.py a partir de
-- docs/cosmeticos_dados.py, o mesmo arquivo que gera docs/COSMETICOS.pdf.
-- **Não editar à mão.**
--
-- Entram {len(c.TECIDOS)} tecidos, {len(c.MATERIAIS)} materiais, {len(c.ROUPAS)} roupas e {len(c.ACESSORIOS)} acessórios, com as
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
""")

p.append("\n-- ── Tecidos (vendidos por metro) ──────────────────────────────────────────")
for nome, tier, preco, publico, descricao in c.TECIDOS:
    p.append(sql_item(nome, descricao, PESO_TECIDO_POR_METRO, preco, tier, "Tecido", True, publico, c.BONUS_POR_TIER[tier]))

p.append("\n\n-- ── Materiais de joalheria ────────────────────────────────────────────────")
for nome, tier, preco, descricao in c.MATERIAIS:
    p.append(sql_item(nome, descricao, PESO_MATERIAL[nome], preco, tier, "Material Precioso", True,
                      c.PUBLICO_DO_MATERIAL[nome], None))

p.append("\n\n-- ── Roupas ────────────────────────────────────────────────────────────────")
p.append("-- Tier, público e bônus vêm do tecido — calculados pelo gerador, não digitados.")
for nome, tecido, corte, preco, descricao in c.ROUPAS:
    tier = c.TIER_TECIDO[tecido]
    p.append(sql_item(nome, descricao, PESO_ROUPA[corte], preco, tier, "Cosmético", False,
                      c.PUBLICO_TECIDO[tecido], c.BONUS_POR_TIER[tier]))

p.append("\n\n-- ── Acessórios ────────────────────────────────────────────────────────────")
for nome, material, preco, descricao in c.ACESSORIOS:
    tier = c.TIER_MATERIAL[material]
    p.append(sql_item(nome, descricao, PESO_ACESSORIO, preco, tier, "Cosmético", False,
                      c.PUBLICO_DO_MATERIAL[material], c.BONUS_ACESSORIO))

p.append("\n\n-- ── Receitas de Costura ───────────────────────────────────────────────────")
for nome, tecido, corte, preco, descricao in c.ROUPAS:
    tier = c.TIER_TECIDO[tecido]
    p.append(sql_receita(nome, tier, "Costura", TEMPO_ROUPA[tier], c.receita_da_roupa(tecido, corte), FERRAMENTAS_COSTURA))

p.append("\n\n-- ── Receitas de Joalheria ─────────────────────────────────────────────────")
for nome, material, preco, descricao in c.ACESSORIOS:
    tier = c.TIER_MATERIAL[material]
    p.append(sql_receita(nome, tier, "Joalheria", TEMPO_ACESSORIO[tier], c.receita_do_acessorio(material), FERRAMENTAS_JOALHERIA))

p.append(f"""

-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('cosmetico.publico_errado', '{c.PENALIDADE_PUBLICO_ERRADO}',
   'Roupa de nobreza diante da plebe, ou de plebe diante da nobreza: este modificador. Roupa "qualquer" não sofre.'),
  ('cosmetico.pericias', '{", ".join(c.PERICIAS_AFETADAS)}',
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
""")

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write("\n".join(p))
print("escrito: 096_cosmeticos.sql")
