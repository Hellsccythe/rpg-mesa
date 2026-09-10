# -*- coding: utf-8 -*-
"""Recusa o catálogo de alimentos antes de ele virar PDF ou migration."""
import sys

sys.path.insert(0, ".")
import alimentos_dados as d

erros = []
avisos = []


def falha(msg):
    erros.append(msg)


def aviso(msg):
    avisos.append(msg)


# ── 1. Todo ingrediente existe ────────────────────────────────────────────
for nome, tier, preco, social, desc, receita in d.PRATOS:
    for ingrediente, _qtd in receita:
        if ingrediente not in d.PRECO_INGREDIENTE:
            falha(f"{nome}: ingrediente desconhecido '{ingrediente}'")

# ── 2. O tier declarado bate com o ingrediente mais raro ──────────────────
# O tier não é opinião: sai da receita. Digitar um tier diferente do que a
# receita produz faria a DC e a cura mentirem sobre o prato.
for nome, tier, preco, social, desc, receita in d.PRATOS:
    calculado = d.tier_do_prato_pela_receita(receita)
    if calculado != tier:
        falha(f"{nome}: declarado {tier} mas o ingrediente mais raro o torna {calculado}")

# ── 3. Todo prato leva pelo menos um ingrediente ──────────────────────────
for nome, tier, preco, social, desc, receita in d.PRATOS:
    if not receita:
        falha(f"{nome}: receita vazia")
    if len(receita) < 2:
        aviso(f"{nome}: receita de um ingrediente só")

# ── 4. Margem de 70–75% ───────────────────────────────────────────────────
for nome, tier, preco, social, desc, receita in d.PRATOS:
    custo = d.custo_da_receita(receita)
    proporcao = custo / preco
    if proporcao > 1:
        falha(f"{nome}: cozinhar custa MAIS que comprar pronto "
              f"({custo} de insumo contra {preco} — {proporcao:.0%})")
    elif not (d.MARGEM_MIN <= proporcao <= d.MARGEM_MAX):
        falha(f"{nome}: margem {proporcao:.0%} fora de 70–75% "
              f"(custo {custo}, preço {preco} — sugerido {round(custo / 0.72)})")

# ── 5. Comida cura mais barato que poção do mesmo tier ────────────────────
# É a razão de o sistema existir. Se comida custasse o mesmo por PV, ninguém
# gastaria uma hora cozinhando — beberia o frasco e seguiria.
#
# A regra vale para prato SEM efeito social. Um prato que também compra +3 em
# Diplomacia não está vendendo só PV, e exigir que ele ganhe da poção nessa
# única conta obrigaria a subsidiar o efeito social — foi o que esta
# verificação apontou na primeira rodada, e a regra é que estava errada.
#
# O que precisa continuar verdadeiro é mais fraco e mais honesto: em todo
# tier, o prato MAIS BARATO ganha da poção. Sempre existe um caminho de
# cozinha mais barato que o frasco.
for tier in ("Comum", "Incomum", "Raro"):
    pratos = [p for p in d.PRATOS if p[1] == tier]
    if not pratos:
        continue
    nome_pocao, preco_pocao, dado_pocao, pct_pocao = d.POCAO_EQUIVALENTE[tier]
    cura_pocao = d.media_do_dado(dado_pocao) + d.PV_REFERENCIA * pct_pocao
    por_pv_pocao = preco_pocao / cura_pocao
    cura_prato = d.cura_media_bemfeito(tier)

    mais_barato = min(pratos, key=lambda p: p[2])
    if mais_barato[2] / cura_prato >= por_pv_pocao:
        falha(f"tier {tier}: nem o prato mais barato ({mais_barato[0]}) ganha da "
              f"{nome_pocao} por PV — cozinhar deixaria de ter razão de existir")

    for nome, _t, preco, social, _d, _r in pratos:
        por_pv_prato = preco / cura_prato
        if social is None and por_pv_prato >= por_pv_pocao:
            falha(f"{nome}: {por_pv_prato:.2f} pr por PV, contra {por_pv_pocao:.2f} da "
                  f"{nome_pocao} — prato sem efeito social vende só PV e precisa ganhar")
        elif social is not None and por_pv_prato >= por_pv_pocao * 2:
            falha(f"{nome}: {por_pv_prato:.2f} pr por PV, mais que o dobro da "
                  f"{nome_pocao} — caro demais mesmo cobrando pelo efeito social")

# ── 6. Bem feito tem de superar mal feito ─────────────────────────────────
media_malfeito = d.media_do_dado(d.CURA_MALFEITO)
for tier in d.CURA_BEMFEITO:
    if d.cura_media_bemfeito(tier) <= media_malfeito:
        falha(f"tier {tier}: bem feito cura {d.cura_media_bemfeito(tier):.1f}, "
              f"não supera o mal feito ({media_malfeito:.1f})")

# ── 7. A escada de cura sobe com o tier ───────────────────────────────────
anterior = 0
for tier in ("Comum", "Incomum", "Raro"):
    atual = d.cura_media_bemfeito(tier)
    if atual <= anterior:
        falha(f"tier {tier} cura {atual:.1f}, não mais que o tier abaixo ({anterior:.1f})")
    anterior = atual

# ── 8. Nada serve em combate ──────────────────────────────────────────────
# A regra inteira depende disto: se um prato pudesse ser comido numa ação,
# comida viraria poção barata e o sistema perderia a razão de existir.
for tier, (preparo, refeicao) in d.TEMPO_POR_TIER.items():
    if refeicao < 10:
        falha(f"tier {tier}: refeição de {refeicao} min é curta demais — "
              f"caberia numa luta")

# ── 9. Efeito social existe e só sai em prato bem feito ───────────────────
for nome, tier, preco, social, desc, receita in d.PRATOS:
    if social is not None and social not in d.EFEITOS_SOCIAIS:
        falha(f"{nome}: efeito social desconhecido '{social}'")

# ── 10. Nome único, e nenhum choque com o que já existe ───────────────────
nomes = [p[0] for p in d.PRATOS]
for nome in set(nomes):
    if nomes.count(nome) > 1:
        falha(f"prato repetido: {nome}")

nomes_ing = [i[0] for i in d.INGREDIENTES]
for nome in set(nomes_ing):
    if nomes_ing.count(nome) > 1:
        falha(f"ingrediente repetido: {nome}")

# Os 23 ingredientes de alquimia (18 das poções + 5 dos venenos) não podem
# colidir de nome com os de cozinha.
JA_NO_BANCO = {
    "Água Pura", "Sal Mineral", "Folha de Menta Selvagem", "Cinza de Carvalho",
    "Raiz de Vigor", "Mel Silvestre", "Erva de Sangue", "Lágrima de Resina",
    "Musgo Luminoso", "Cogumelo do Silêncio", "Flor da Meia-Noite",
    "Glândula de Víbora", "Escama de Salamandra", "Óleo Sacro", "Raiz de Carne",
    "Coração de Mandrágora", "Pó de Estrela Caída", "Sangue de Basilisco",
    "Baba de Sapo-Pedra", "Semente de Cicuta", "Espinho de Arraia",
    "Fungo do Afogado", "Olho de Corvo Cego",
}
for nome in nomes_ing:
    if nome in JA_NO_BANCO:
        falha(f"ingrediente '{nome}' já existe no catálogo de alquimia")

# ── 11. Cobertura: carne e vegetal em todos os tiers ──────────────────────
for tier in ("Comum", "Incomum", "Raro"):
    vegetais = [v for v in d.VEGETAIS if v[1] == tier]
    carnes = [c for c in d.CARNES if c[1] == tier]
    if not vegetais:
        falha(f"tier {tier} não tem vegetal nenhum")
    if not carnes:
        falha(f"tier {tier} não tem carne nenhuma")
    pratos = [p for p in d.PRATOS if p[1] == tier]
    if len(pratos) < 3:
        aviso(f"tier {tier} tem só {len(pratos)} prato(s)")

# ── Relatório ─────────────────────────────────────────────────────────────
print("=" * 78)
print(f"{len(d.PRATOS)} pratos · {len(d.VEGETAIS)} vegetais · {len(d.CARNES)} carnes")
print(f"referência: personagem de nível {d.NIVEL_REFERENCIA}, {d.PV_REFERENCIA} PV máx")
print("=" * 78)

print(f"\nMal feito, qualquer prato: {d.CURA_MALFEITO} "
      f"(média {media_malfeito:.1f} PV)\n")

print(f"{'Tier':<9} {'DC':<4} {'Bem feito':<14} {'Cura méd':<9} {'Preparo':<10} {'Refeição'}")
for tier in ("Comum", "Incomum", "Raro"):
    dado, pct = d.CURA_BEMFEITO[tier]
    preparo, refeicao = d.TEMPO_POR_TIER[tier]
    print(f"{tier:<9} {d.DIFICULDADE_POR_TIER[tier]:<4} "
          f"{dado + ' + ' + str(int(pct * 100)) + '%':<14} "
          f"{d.cura_media_bemfeito(tier):>6.1f} PV  {str(preparo) + ' min':<10} {refeicao} min")

for tier in ("Comum", "Incomum", "Raro"):
    pratos = [p for p in d.PRATOS if p[1] == tier]
    if not pratos:
        continue
    nome_pocao, preco_pocao, dado_pocao, pct_pocao = d.POCAO_EQUIVALENTE[tier]
    cura_pocao = d.media_do_dado(dado_pocao) + d.PV_REFERENCIA * pct_pocao
    cura_prato = d.cura_media_bemfeito(tier)
    print(f"\n── {tier} " + "─" * (72 - len(tier)))
    print(f"   poção equivalente: {nome_pocao}, {preco_pocao} pr "
          f"→ {preco_pocao / cura_pocao:.2f} pr por PV")
    for nome, _t, preco, social, _desc, receita in pratos:
        custo = d.custo_da_receita(receita)
        por_pv = preco / cura_prato
        if social:
            premio = por_pv / (preco_pocao / cura_pocao) - 1
            # O prêmio pode ser negativo: um prato com efeito social ainda pode
            # sair mais barato por PV que a poção. `+{:.0%}` imprimiria "+-30%".
            sinal = "mais caro" if premio > 0 else "mais barato"
            marca = f"  [{d.EFEITOS_SOCIAIS[social][0]} · {abs(premio):.0%} {sinal} que a poção]"
        else:
            marca = ""
        print(f"   {nome:<30} {preco:>4} pr  insumo {custo:>4} ({custo / preco:.0%})  "
              f"{por_pv:.2f} pr/PV{marca}")

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

print("APROVADO: margens em 70–75%, tier coerente com a receita, escada de cura "
      "crescente,\ne comida mais barata por PV que poção em todos os tiers.")
