# -*- coding: utf-8 -*-
"""Recusa o catálogo de venenos antes de ele virar PDF ou migration.

Foi este passo que pegou 13 erros de margem no catálogo de poções, quatro
deles em que fabricar custava MAIS que comprar pronto. Nenhum deles era
visível lendo a tabela.
"""
import sys

sys.path.insert(0, ".")
import venenos_dados as d

erros = []
avisos = []


def falha(msg):
    erros.append(msg)


def aviso(msg):
    avisos.append(msg)


# ── 1. Todo ingrediente da receita existe ─────────────────────────────────
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    for ingrediente, _qtd in receita:
        if ingrediente not in d.PRECO_INGREDIENTE:
            falha(f"{nome}: ingrediente desconhecido '{ingrediente}'")

# ── 2. Toda condição infligida existe ─────────────────────────────────────
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    if condicao not in d.TIER_CONDICAO:
        falha(f"{nome}: aplica condição inexistente '{condicao}'")

# ── 3. O veneno alcança a gravidade do que aplica ─────────────────────────
# Simétrica da regra das poções: lá o antídoto precisa alcançar a condição,
# aqui é o veneno. Sem isso, um veneno Comum de 20 prata aplicaria Paralisia.
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    tier_condicao = d.TIER_CONDICAO.get(condicao)
    if tier_condicao and d.ORDEM_TIER[tier] < d.ORDEM_TIER[tier_condicao]:
        falha(f"{nome} ({tier}) aplica {condicao}, que é {tier_condicao} — "
              f"o veneno precisa alcançar a gravidade")

# ── 4. Margem de fabricação entre 70% e 75% ───────────────────────────────
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    custo = d.custo_da_receita(receita)
    proporcao = custo / preco
    if proporcao > 1:
        falha(f"{nome}: fabricar custa MAIS que comprar "
              f"({custo} de insumo contra {preco} de preço — {proporcao:.0%})")
    elif not (d.MARGEM_MIN <= proporcao <= d.MARGEM_MAX):
        sugerido = round(custo / 0.72)
        falha(f"{nome}: margem {proporcao:.0%} fora de 70–75% "
              f"(custo {custo}, preço {preco} — sugerido {sugerido})")

# ── 5. Envenenar não pode sair mais barato que se defender ────────────────
# Se o veneno custa menos que o antídoto que o anula, envenenar vira a jogada
# barata e a defesa vira imposto. O preço é o que mantém veneno como escolha.
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    antidoto = d.ANTIDOTO_EXISTENTE.get(condicao)
    if antidoto:
        nome_antidoto, preco_antidoto = antidoto
        if preco < preco_antidoto:
            falha(f"{nome} custa {preco} pr, menos que {nome_antidoto} ({preco_antidoto} pr) "
                  f"que o anula — envenenar sairia mais barato que se defender")

# ── 6. Nome único ─────────────────────────────────────────────────────────
nomes = [v[0] for v in d.VENENOS]
for nome in set(nomes):
    if nomes.count(nome) > 1:
        falha(f"nome repetido: {nome}")

nomes_condicao = [c[0] for c in d.CONDICOES_NOVAS]
for nome in nomes_condicao:
    if nome in d.TIER_CONDICAO_EXISTENTE:
        falha(f"condição nova '{nome}' já existe no banco")

# ── 7. Classe e via válidas ───────────────────────────────────────────────
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    if classe not in d.CLASSES:
        falha(f"{nome}: classe desconhecida '{classe}'")
    if via not in d.VIAS:
        falha(f"{nome}: via desconhecida '{via}'")
    if via != "lamina" and usos != 1:
        aviso(f"{nome}: via {via} com {usos} usos — só lâmina costuma ter mais de um")

# ── 8. Farsante não pode ser letal nem durar demais ───────────────────────
# É a regra que define a classe. Um farsante que mata é um mortífero com
# nome errado, e um que dura semanas é uma maldição.
CONDICOES_LETAIS = {"Envenenado", "Sangramento", "Peste Negra", "Necrose", "Queimadura"}
for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
    if classe == "farsante" and condicao in CONDICOES_LETAIS:
        falha(f"{nome} é farsante mas aplica {condicao}, que causa perda de PV")

for nome_c, tier_c, cat, efeito_c, duracao, janela, se_nao in d.CONDICOES_NOVAS:
    if "Permanente" in duracao or "Até ser tratada" in duracao:
        falha(f"condição de farsante '{nome_c}' tem duração '{duracao}' — "
              f"a classe inteira depende de passar sozinha")

# ── 9. Cobertura: cada classe tem pelo menos um de cada tier? ─────────────
for chave, (rotulo, _desc) in d.CLASSES.items():
    tiers = {v[1] for v in d.VENENOS if v[2] == chave}
    if len(tiers) < 2:
        aviso(f"classe {rotulo} só tem venenos de {', '.join(tiers)}")

# ── Relatório ─────────────────────────────────────────────────────────────
print("=" * 74)
print(f"{len(d.VENENOS)} venenos · {len(d.CONDICOES_NOVAS)} condições novas · "
      f"{len(d.INGREDIENTES_NOVOS)} ingredientes novos")
print("=" * 74)

for chave, (rotulo, _desc) in d.CLASSES.items():
    print(f"\n── {rotulo} " + "─" * (68 - len(rotulo)))
    for nome, tier, classe, via, usos, preco, condicao, efeito, receita in d.VENENOS:
        if classe != chave:
            continue
        custo = d.custo_da_receita(receita)
        antidoto = d.ANTIDOTO_EXISTENTE.get(condicao)
        contra = f"  (antídoto {antidoto[1]} pr)" if antidoto else ""
        print(f"  {nome:<26} {tier:<8} {d.VIAS[via][0]:<9} "
              f"{preco:>5} pr  insumo {custo:>4} ({custo / preco:.0%}){contra}")
        print(f"  {'':26} aplica {condicao} · Fortitude DC {d.DIFICULDADE_POR_TIER[tier]}")

print()
if avisos:
    print("AVISOS:")
    for a in avisos:
        print(f"  ! {a}")
    print()

if erros:
    print(f"REPROVADO — {len(erros)} problema(s):")
    for e in erros:
        print(f"  x {e}")
    sys.exit(1)

print("APROVADO: margens em 70–75%, gravidade coerente, e nenhum veneno "
      "mais barato que seu antídoto.")
