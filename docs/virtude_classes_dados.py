# -*- coding: utf-8 -*-
"""Tetos de rank de Virtude por classe.

O orçamento vem do nível de PERSONAGEM (27 marcos, não multiplica com
multiclasse). A classe não dá pontos — ela decide até onde cada perícia pode
subir. Multiclassar libera tetos; o orçamento continua o mesmo.

Ordem das perícias: Luta, Pontaria, Magia, Reflexo, Fortitude.
"""

PERICIAS = ["Luta", "Pontaria", "Magia", "Reflexo", "Fortitude"]


def custo(rank):
    return sum(range(1, rank + 1))


ORCAMENTO = 27          # 27 marcos de nível de personagem, 1 ponto cada
TETO_ABSOLUTO = 5 * custo(5)   # 75, se alguém pudesse maximizar tudo

# ── Classes Base: o teto é a identidade da classe ─────────────────────────
# nome: (Luta, Pontaria, Magia, Reflexo, Fortitude), papel
BASE = {
    "Guerreiro": ((5, 3, 0, 3, 5), "Linha de frente. Bate e aguenta; não conjura."),
    "Protetor":  ((4, 2, 2, 2, 5), "Segura o dano pelos outros. Fortitude máxima."),
    "Monge":     ((5, 2, 1, 5, 4), "Corpo como arma. Bate e desvia."),
    "Atirador":  ((2, 5, 0, 5, 3), "Resolve à distância. Frágil de perto."),
    "Ladrão":    ((3, 4, 1, 5, 2), "Não ser acertado é a defesa. Reflexo máximo."),
    "Sacerdote": ((2, 1, 4, 2, 4), "Fé que sustenta. Aguenta mais do que conjura."),
    "Bruxo":     ((1, 2, 5, 2, 3), "Pacto que cobra caro. Magia máxima, corpo fraco."),
    "Mago":      ((1, 1, 5, 3, 2), "Estudo puro. O mais frágil, e o que mais alcança."),
}

# ── Híbridas: raízes inferidas pelo nome ──────────────────────────────────
# O teto é o MAIOR das duas raízes menos 1, com piso 1 — a híbrida alcança
# quase o que cada raiz alcança, mas nunca o topo das duas.
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


def capacidade(tetos):
    """Quanto custa levar cada perícia até o seu teto."""
    return sum(custo(t) for t in tetos)


def teto_hibrida(raiz_a, raiz_b):
    """Teto da híbrida: o maior das duas raízes, com o topo rebaixado em 1.

    Rebaixar só o topo (e não tudo, como na primeira versão) resolve o caso da
    híbrida de duas classes PARECIDAS. Mago + Bruxo são os dois conjuradores:
    com "maior menos 1" em tudo, a classe ficava com tetos tão baixos que não
    conseguia gastar os 27 pontos do orçamento — sobravam 9. Uma classe que não
    consegue gastar o próprio orçamento é estritamente pior que as outras, e
    ninguém a escolheria.

    Depois disso, se a capacidade ainda não alcançar o orçamento, os tetos mais
    baixos sobem até alcançar. A regra que vale acima de qualquer outra é:
    **toda classe precisa conseguir gastar tudo o que recebe.**
    """
    a, b = BASE[raiz_a][0], BASE[raiz_b][0]
    tetos = [max(x, y) for x, y in zip(a, b)]

    topo = max(tetos)
    tetos = [t - 1 if t == topo else t for t in tetos]
    tetos = [max(1, t) for t in tetos]

    # Sobe os tetos mais baixos até a classe conseguir gastar o orçamento.
    # A margem de 3 evita a classe ficar no limite exato, sem nenhuma escolha.
    while capacidade(tetos) < ORCAMENTO + 3:
        menor = min(range(len(tetos)), key=lambda i: (tetos[i], -i))
        if tetos[menor] >= 5:
            break
        tetos[menor] += 1

    return tuple(tetos)


def tetos_de_todas():
    """{nome: (tetos, tier, explicacao)} para as 29."""
    todas = {}
    for nome, (tetos, papel) in BASE.items():
        todas[nome] = (tetos, "Base", papel)
    for nome, (a, b) in HIBRIDAS.items():
        todas[nome] = (teto_hibrida(a, b), "Híbrida", f"{a} + {b}")
    return todas


def melhor_build(tetos, orcamento=ORCAMENTO):
    """A build mais forte que cabe no orçamento, gastando de cima para baixo.

    Serve para mostrar o que a classe consegue de verdade — o teto sozinho não
    diz nada se o orçamento não alcança.
    """
    ranks = [0] * len(tetos)
    sobra = orcamento
    # Sobe o degrau mais barato disponível, sempre priorizando a perícia de
    # maior teto: é como um jogador racional gastaria.
    while True:
        candidatos = [
            (custo(ranks[i] + 1) - custo(ranks[i]), -tetos[i], i)
            for i in range(len(tetos))
            if ranks[i] < tetos[i]
        ]
        candidatos = [c for c in candidatos if c[0] <= sobra]
        if not candidatos:
            break
        # prioriza a de maior teto; entre iguais, o degrau mais barato
        candidatos.sort(key=lambda c: (c[1], c[0]))
        preco, _, i = candidatos[0]
        ranks[i] += 1
        sobra -= preco
    return ranks, sobra
