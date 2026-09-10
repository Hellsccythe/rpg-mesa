# -*- coding: utf-8 -*-
"""Gera a migration 083 a partir de pocoes_dados.py.

O mesmo arquivo que gera o PDF gera o SQL, então o banco não tem como divergir
do documento: se um preço mudar nos dados, muda nos dois.
"""
import io
import sys

sys.path.insert(0, ".")
import pocoes_dados as d

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/.claude/worktrees/"
         "postgres-db-access-951e7e/database/migrations/083_catalogo_pocoes.sql")

# Condições que não são nome de linha em `condicoes` — são texto descritivo das
# poções amplas ("uma condição Comum à escolha"). Não viram vínculo.
DESCRITIVAS = {c for p in d.POCOES for c in p[4] + p[5]} - set(d.TIER_CONDICAO)

# Peso por tier de ingrediente: frasco pequeno, saquinho, relicário.
PESO_INGREDIENTE = {"Comum": "0.10", "Incomum": "0.15", "Raro": "0.25"}
# Poção pesa o frasco.
PESO_POCAO = "0.30"


def aspas(t):
    return "'" + str(t).replace("'", "''") + "'"


partes = []
partes.append(f"""-- 083 — o catálogo de poções vira dado
--
-- Gerado por docs/gerar_migration_pocoes.py a partir de docs/pocoes_dados.py,
-- o mesmo arquivo que gera docs/POCOES.pdf. **Não editar à mão**: mexer aqui
-- faz o banco divergir do documento. Para mudar um preço ou uma receita,
-- edite os dados e regere os dois.
--
-- Entram {len(d.POCOES) - 1} consumíveis, {len(d.INGREDIENTES) - 2} itens e {len(d.POCOES)} receitas — os que já existiam
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
""")

# ── Ingredientes ──────────────────────────────────────────────────────────
partes.append("\n-- ── Ingredientes ──────────────────────────────────────────────────────────")
partes.append("""-- Todos entram como categoria Ingrediente e empilháveis: ninguém conta ervas
-- uma a uma. O ON CONFLICT não serve aqui porque não há UNIQUE em `nome` —
-- a checagem é por NOT EXISTS, o que também torna a migration reexecutável.""")
for nome, tier, preco, descricao in d.INGREDIENTES:
    partes.append(f"""
INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT {aspas(nome)}, {aspas(descricao)}, {PESO_INGREDIENTE[tier]}, {preco}.00, TRUE,
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ingrediente' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE itens SET valor = {preco}.00, peso = {PESO_INGREDIENTE[tier]}, descricao = {aspas(descricao)},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;""")

# ── Consumíveis ───────────────────────────────────────────────────────────
partes.append("\n\n-- ── Consumíveis ───────────────────────────────────────────────────────────")
for nome, tier, tipo, preco, cura, previne, efeito, receita in d.POCOES:
    categoria = "Poção"
    partes.append(f"""
INSERT INTO consumiveis (nome, descricao, efeito, usos, duracao, peso, valor,
                         raridade_item, categoria_consumivel_item)
SELECT {aspas(nome)}, '', {aspas(efeito)}, 1, 'Instantâneo', {PESO_POCAO}, {preco}.00,
       (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT item FROM categoria_consumivel WHERE descricao = {aspas(categoria)} AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE consumiveis SET efeito = {aspas(efeito)}, valor = {preco}.00, peso = {PESO_POCAO},
       raridade_item = (SELECT item FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;""")

# ── Vínculos com condições ────────────────────────────────────────────────
partes.append("\n\n-- ── Vínculos poção → condição ─────────────────────────────────────────────")
partes.append(f"""-- As poções amplas ({', '.join(sorted(DESCRITIVAS))[:120]}...) descrevem o alvo
-- em texto e não geram vínculo: "qualquer condição até o tier Raro" não é uma
-- linha em `condicoes`. Elas continuam explicadas no campo `efeito`.""")
for nome, tier, tipo, preco, cura, previne, efeito, receita in d.POCOES:
    for lista, acao in ((cura, "cura"), (previne, "previne")):
        for condicao in lista:
            if condicao in DESCRITIVAS:
                continue
            partes.append(f"""
INSERT INTO consumivel_condicao (consumivel_id, condicao_id, acao)
SELECT c.id, x.id, {aspas(acao)}
  FROM consumiveis c, condicoes x
 WHERE c.nome = {aspas(nome)} AND c.deleted_at IS NULL
   AND x.nome = {aspas(condicao)} AND x.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")

# ── Receitas ──────────────────────────────────────────────────────────────
partes.append("\n\n-- ── Receitas ──────────────────────────────────────────────────────────────")
partes.append("""-- Todas exigem Alquimia, e a dificuldade sai da raridade do produto: a
-- `dificuldade_base` de `raridade` (10/15/20) já era a DC do teste. Isso também
-- preenche `receitas.pericia_id`, que estava nulo desde a migration 077.""")
for nome, tier, tipo, preco, cura, previne, efeito, receita in d.POCOES:
    partes.append(f"""
INSERT INTO receitas (nome, descricao, produto_tabela, produto_id,
                      quantidade_produzida, tempo_minutos, dificuldade, pericia_id)
SELECT {aspas(nome)}, '', 'consumiveis',
       (SELECT id FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL),
       1, {60 if tier == 'Comum' else (180 if tier == 'Incomum' else 480)},
       (SELECT dificuldade_base FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL),
       (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL)
  AND EXISTS (SELECT 1 FROM consumiveis WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE receitas SET pericia_id = (SELECT id FROM pericias WHERE nome = 'Alquimia' AND deleted_at IS NULL),
       dificuldade = (SELECT dificuldade_base FROM raridade WHERE descricao = {aspas(tier)} AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;

DELETE FROM receita_ingredientes
 WHERE receita_id = (SELECT id FROM receitas WHERE nome = {aspas(nome)} AND deleted_at IS NULL);""")
    for ingrediente, quantidade in receita:
        partes.append(f"""INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, {quantidade}, TRUE
  FROM receitas r, itens i
 WHERE r.nome = {aspas(nome)} AND r.deleted_at IS NULL
   AND i.nome = {aspas(ingrediente)} AND i.deleted_at IS NULL
ON CONFLICT DO NOTHING;""")

# ── Conferência ───────────────────────────────────────────────────────────
partes.append("""

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
""")

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write("\n".join(partes))
print(f"escrito: {SAIDA}")
print(f"  {len(d.POCOES)} pocoes, {len(d.INGREDIENTES)} ingredientes")
print(f"  descritivas (sem vinculo): {sorted(DESCRITIVAS)}")
