# -*- coding: utf-8 -*-
"""Marcos de Virtude por classe — a proposta dos marcos a cada 5 níveis.

Cada classe concede pontos de Virtude em quatro marcos: níveis 5, 10, 15 e 20
DA CLASSE. Quanto ela dá em cada um depende de quanto aquela classe é de
combate.

Propriedade que sustenta o desenho: **100 níveis dão 20 marcos, não importa
como sejam divididos** — cinco classes até 20, dez até 10, vinte até 5. O que
varia é QUANTO cada marco vale, e isso depende das classes escolhidas.
"""

PERICIAS = ["Luta", "Pontaria", "Magia", "Reflexo", "Fortitude"]
MARCOS = [5, 10, 15, 20]        # níveis de classe que concedem
NIVEL_MAXIMO_TOTAL = 100
ALVO_MAXIMO = 50                # o teto que o mestre pediu


def custo(rank):
    return sum(range(1, rank + 1))


TETO_ABSOLUTO = 5 * custo(5)    # 75, para maximizar as cinco

# ── Perfil de cada classe Base ────────────────────────────────────────────
# A distribuição cresce ao longo dos marcos: os últimos níveis de uma classe
# valem mais que os primeiros, o que premia levar uma classe até o fim em vez
# de colecionar começos.
PERFIL = {
    "combate":  ([2, 2, 3, 3], "combate puro"),      # 10 por classe
    "misto":    ([1, 2, 2, 3], "combate e outra coisa"),  # 8
    "conjurador": ([1, 1, 2, 2], "conjurador puro"),  # 6
}

BASE = {
    "Guerreiro": "combate",
    "Atirador":  "combate",
    "Monge":     "combate",
    "Protetor":  "combate",
    "Ladrão":    "misto",
    "Sacerdote": "misto",
    "Bruxo":     "misto",
    "Mago":      "conjurador",
}

# Raízes das híbridas, inferidas pelos nomes.
HIBRIDAS = {
    "Arcanista de Guerra":   ("Guerreiro", "Mago"),
    "Arqueiro Arcano":       ("Atirador",  "Mago"),
    "Assassino Arcano":      ("Ladrão",    "Mago"),
    "Atirador Fantasma":     ("Atirador",  "Ladrão"),
    "Caçador das Trevas":    ("Atirador",  "Bruxo"),
    "Clérigo das Sombras":   ("Sacerdote", "Ladrão"),
    "Flagelo Sangrento":     ("Guerreiro", "Bruxo"),
    "Guardião Templário":    ("Protetor",  "Sacerdote"),
    "Guerreiro das Sombras": ("Guerreiro", "Ladrão"),
    "Guerreiro Espiritual":  ("Guerreiro", "Sacerdote"),
    "Inquisidor das Trevas": ("Sacerdote", "Bruxo"),
    "Ladrão Divino":         ("Ladrão",    "Sacerdote"),
    "Mago das Sombras":      ("Mago",      "Ladrão"),
    "Mago do Éter":          ("Mago",      "Bruxo"),
    "Monge das Sombras":     ("Monge",     "Ladrão"),
    "Monge do Vento":        ("Monge",     "Atirador"),
    "Punho do Vazio":        ("Monge",     "Bruxo"),
    "Senhor dos Pactos":     ("Bruxo",     "Mago"),
    "Sentinela Divina":      ("Protetor",  "Sacerdote"),
    "Skirmisher":            ("Guerreiro", "Atirador"),
    "Teurgo Divino":         ("Sacerdote", "Mago"),
}


def concessao_da_base(nome):
    return PERFIL[BASE[nome]][0]


# Como distribuir um total pelos quatro marcos. Sempre crescente: os últimos
# níveis de uma classe valem mais que os primeiros, o que premia levá-la até o
# fim em vez de colecionar começos.
DISTRIBUICAO = {
    6:  [1, 1, 2, 2],
    7:  [1, 2, 2, 2],
    8:  [1, 2, 2, 3],
    9:  [2, 2, 2, 3],
    10: [2, 2, 3, 3],
}


def concessao_da_hibrida(raiz_a, raiz_b):
    """Média dos TOTAIS das duas raízes, redistribuída pelos quatro marcos.

    A primeira versão fazia a média marco a marco, arredondando para cima — e o
    arredondamento inflava tudo: Guerreiro (10) + Mago (6) saía com 10, o mesmo
    de um Guerreiro puro. Resultado: 17 das 29 classes empatavam no topo, e a
    escolha de classe quase não mexia no orçamento.

    Pela média dos totais, Guerreiro + Mago dá 8, que é o que uma híbrida de
    guerreiro com conjurador deve valer. A granularidade também melhora: os
    totais passam a variar de 6 a 10 em vez de só 6, 8 e 10.
    """
    total = round((sum(concessao_da_base(raiz_a)) + sum(concessao_da_base(raiz_b))) / 2)
    return list(DISTRIBUICAO[total])


def todas_as_classes():
    """{nome: (concessao_por_marco, total_da_classe, tier, nota)}"""
    saida = {}
    for nome, perfil in BASE.items():
        c = concessao_da_base(nome)
        saida[nome] = (c, sum(c), "Base", PERFIL[perfil][1])
    for nome, (a, b) in HIBRIDAS.items():
        c = concessao_da_hibrida(a, b)
        saida[nome] = (c, sum(c), "Híbrida", f"{a} + {b}")
    return saida


def melhor_orcamento():
    """O máximo que dá para juntar em 100 níveis, escolhendo as classes mais generosas."""
    totais = sorted((t for _, t, _, _ in todas_as_classes().values()), reverse=True)
    return sum(totais[:NIVEL_MAXIMO_TOTAL // 20])


def pior_orcamento():
    totais = sorted(t for _, t, _, _ in todas_as_classes().values())
    return sum(totais[:NIVEL_MAXIMO_TOTAL // 20])


def melhor_build(orcamento, teto=5, quantas=5):
    """A build mais forte que cabe no orçamento, subindo sempre o degrau mais barato."""
    ranks = [0] * quantas
    sobra = orcamento
    while True:
        opcoes = [(custo(r + 1) - custo(r), i) for i, r in enumerate(ranks) if r < teto]
        opcoes = [o for o in opcoes if o[0] <= sobra]
        if not opcoes:
            break
        preco, i = min(opcoes)
        ranks[i] += 1
        sobra -= preco
    return sorted(ranks, reverse=True), sobra
