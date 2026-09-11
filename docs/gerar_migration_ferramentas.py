# -*- coding: utf-8 -*-
"""Gera a migration 094 a partir de ferramentas_dados.py."""
import io
import sys

sys.path.insert(0, ".")
import ferramentas_dados as f

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/.claude/worktrees/"
         "postgres-db-access-951e7e/database/migrations/094_ferramentas.sql")


def aspas(t):
    return "'" + str(t).replace("'", "''") + "'"


p = []
p.append(f"""-- 094 — as ferramentas, e o que cada receita passa a exigir
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
-- Entram {len(f.FERRAMENTAS)} ferramentas em {len(f.OFICIOS)} ofícios, e as exigências nas 56 receitas
-- existentes (44 de Alquimia, 12 de Cozinha).

-- ── As ferramentas ────────────────────────────────────────────────────────
-- `empilhavel = FALSE`: ninguém tem "3 bigornas" no inventário como tem
-- "3 ervas". Cada uma é uma.""")

for nome, oficio, preco, peso, descricao in f.FERRAMENTAS:
    p.append(f"""
INSERT INTO itens (nome, descricao, peso, valor, empilhavel, raridade_item, categoria_item)
SELECT {aspas(nome)}, {aspas(descricao)}, {peso:.2f}, {preco}.00, FALSE,
       (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
WHERE NOT EXISTS (SELECT 1 FROM itens WHERE nome = {aspas(nome)} AND deleted_at IS NULL);

UPDATE itens SET valor = {preco}.00, peso = {peso:.2f}, descricao = {aspas(descricao)}, empilhavel = FALSE,
       raridade_item = (SELECT item FROM raridade WHERE descricao = 'Comum' AND deleted_at IS NULL),
       categoria_item = (SELECT item FROM categoria_item WHERE descricao = 'Ferramenta' AND deleted_at IS NULL)
 WHERE nome = {aspas(nome)} AND deleted_at IS NULL;""")

p.append("""

-- ── O que cada receita passa a exigir ─────────────────────────────────────
-- Por ofício, lendo `receitas.pericia_id`, e não receita a receita: 44
-- receitas de Alquimia exigem o mesmo alambique, e listar uma a uma seria 44
-- chances de esquecer uma. `consumido = FALSE` é o que faz a ferramenta não
-- entrar no custo nem sumir ao fabricar.
--
-- O índice único de receita_ingredientes é (receita, tabela, id): o ON
-- CONFLICT torna isto reexecutável.""")

for oficio, ferramentas in f.FERRAMENTAS_POR_OFICIO.items():
    for ferramenta in ferramentas:
        filtro_extra = ""
        if oficio == "Cozinha":
            # A panela é o padrão; o que vai ao fogo direto usa espeto (abaixo).
            condicoes = " AND ".join(f"r.nome NOT ILIKE '%%{palavra}%%'" for palavra in f.PALAVRAS_DE_FOGO_DIRETO)
            filtro_extra = f"\n   AND {condicoes}"
        p.append(f"""
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = {aspas(oficio)}
  JOIN itens i ON i.nome = {aspas(ferramenta)} AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL{filtro_extra}
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;""")

for ferramenta in f.COZINHA_NO_FOGO_DIRETO:
    condicoes = " OR ".join(f"r.nome ILIKE '%%{palavra}%%'" for palavra in f.PALAVRAS_DE_FOGO_DIRETO)
    p.append(f"""
-- Cozinha no fogo direto: assado, grelhado, brasa.
INSERT INTO receita_ingredientes (receita_id, ingrediente_tabela, ingrediente_id, quantidade, consumido)
SELECT r.id, 'itens', i.id, 1, FALSE
  FROM receitas r
  JOIN pericias p ON p.id = r.pericia_id AND p.nome = 'Cozinha'
  JOIN itens i ON i.nome = {aspas(ferramenta)} AND i.deleted_at IS NULL
 WHERE r.deleted_at IS NULL AND ({condicoes})
ON CONFLICT (receita_id, ingrediente_tabela, ingrediente_id) DO NOTHING;""")

p.append(f"""

-- ── Regras ────────────────────────────────────────────────────────────────
INSERT INTO regras_do_sistema (chave, valor, descricao) VALUES
  ('ferramenta.raridade', 'sempre_comum',
   'Ferramenta não tem raridade: é compra, não achado. Preço fixo, sem multiplicador.'),
  ('ferramenta.fixa_pelo_peso', '{f.PESO_QUE_NAO_SE_CARREGA:g}',
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
  IF ferramentas <> {len(f.FERRAMENTAS)} THEN
    RAISE EXCEPTION 'ABORTADO: esperava {len(f.FERRAMENTAS)} ferramentas, encontrei %', ferramentas;
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
""")

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write("\n".join(p))
print(f"escrito: 094_ferramentas.sql")
