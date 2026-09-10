# -*- coding: utf-8 -*-
"""Catálogo de alimentos: ingredientes, pratos e a escada de qualidade.

Fonte da verdade do PDF e da migration. `verificar_alimentos.py` recusa o
conjunto antes de qualquer coisa ser gerada.

O alimento é a resposta à Saturação Alquímica. Duas poções de cura bastam
para travar a terceira por uma semana; comida cura sem saturar, e é por isso
que ela não é um luxo de mesa — é a única saída depois da segunda poção.
"""

# ── Personagem de referência ──────────────────────────────────────────────
# Cada nível de personagem dá 1d4 de vida, média 2,5. O nível 20 é o meio da
# campanha e serve de régua para comparar cura por prata entre comida e poção.
PV_REFERENCIA = 50
NIVEL_REFERENCIA = 20


# ── Ingredientes: vegetais e plantas ──────────────────────────────────────
# nome, tier, preço em prata, descrição
VEGETAIS = [
    ("Nabo do Campo",          "Comum",   1,   "Cresce em qualquer terra remexida. Enche, e é o que se pede dele."),
    ("Cevada Rústica",         "Comum",   2,   "O grão de todo dia. Engrossa o caldo e dura o inverno."),
    ("Repolho de Inverno",     "Comum",   2,   "Colhido depois da primeira geada, quando adoça."),
    ("Pimenta das Brasas",     "Incomum", 14,  "Vermelha até o talo. Um dedo tempera a panela, dois arruínam."),
    ("Cogumelo Real",          "Incomum", 18,  "Só brota sob carvalho velho, e só quem sabe olhar encontra."),
    ("Trufa de Raiz Negra",    "Incomum", 24,  "Farejada por porco treinado. Vale mais que o porco."),
    ("Arroz da Colheita Única", "Raro",   70,  "Um alqueire por ano, de um vale só. O resto do mundo paga o que pedirem."),
    ("Açafrão de Altar",       "Raro",    95,  "Três fios por flor, colhidos antes do sol. Tinge o prato de ouro."),
    ("Fruto da Árvore Velha",  "Raro",    120, "Dá uma vez a cada sete anos. Quem come lembra do gosto até morrer."),
]

# ── Ingredientes: carnes ──────────────────────────────────────────────────
CARNES = [
    ("Carne de Coelho",       "Comum",   3,   "Magra e rápida de assar. A caça de quem tem pressa."),
    ("Peixe de Rio",          "Comum",   4,   "Fresco pela manhã, duvidoso à tarde."),
    ("Galinha de Terreiro",   "Comum",   5,   "Dura de mastigar e generosa de caldo."),
    ("Lombo de Javali",       "Incomum", 22,  "Escuro e forte. O bicho cobra caro para ser abatido."),
    ("Enguia do Fundo",       "Incomum", 26,  "Gordurosa, difícil de limpar, inesquecível quando defumada."),
    ("Cervo das Brumas",      "Incomum", 30,  "Pasta onde a névoa não levanta. A carne guarda o cheiro."),
    ("Carne de Grifo",        "Raro",    150, "Metade ave, metade felino, e o sabor não decide qual."),
    ("Costela de Wyvern",     "Raro",    180, "Precisa de fogo alto e de coragem para chegar até ela."),
    ("Peito de Fênix Menor",  "Raro",    240, "Morna ao toque horas depois de abatida. Ninguém explica."),
]

INGREDIENTES = VEGETAIS + CARNES
PRECO_INGREDIENTE = {nome: preco for nome, _t, preco, _d in INGREDIENTES}
TIER_INGREDIENTE = {nome: tier for nome, tier, _p, _d in INGREDIENTES}
EH_CARNE = {nome for nome, _t, _p, _d in CARNES}


# ── A escada de qualidade ─────────────────────────────────────────────────
# O teste é Cozinha (Ofício, Inteligência) contra a DC do tier do prato — a
# mesma `raridade.dificuldade_base` que já define a dificuldade de fabricar
# poção e a de resistir a veneno.
#
# FALHOU: cura FIXA, igual para todo prato do catálogo, não importa se o que
# estragou foi um coelho ou uma fênix. É o que torna caro errar com
# ingrediente raro — e foi o pedido explícito do desenho.
CURA_MALFEITO = "1d4"

# PASSOU: a cura escala com o tier, porque o tier vem do ingrediente base.
# É aqui que "alimento mais nutritivo conforme a raridade" acontece.
CURA_BEMFEITO = {
    "Comum":   ("1d6", 0.20),
    "Incomum": ("1d8", 0.35),
    "Raro":    ("1d10", 0.55),
}

DIFICULDADE_POR_TIER = {"Comum": 10, "Incomum": 15, "Raro": 20}

# Minutos de preparo e de refeição. O tempo de REFEIÇÃO é o que mantém comida
# fora de combate: dez minutos é mais longo que qualquer luta.
TEMPO_POR_TIER = {
    "Comum":   (30, 10),
    "Incomum": (60, 15),
    "Raro":    (120, 30),
}

MARGEM_MIN = 0.70
MARGEM_MAX = 0.75
ORDEM_TIER = {"Comum": 1, "Incomum": 2, "Raro": 3}

# Poção do mesmo tier, para a comparação de cura por prata. Comida precisa ser
# mais barata por PV — é o que paga o preço de levar uma hora e não servir em luta.
POCAO_EQUIVALENTE = {
    "Comum":   ("Poção de Cura Menor", 25, "1d4", 0.20),
    "Incomum": ("Poção de Cura Maior", 90, "1d6", 0.40),
    "Raro":    ("Poção de Cura Superior", 445, "1d10", 0.60),
}


# ── Pratos ────────────────────────────────────────────────────────────────
# nome, tier, preço, efeito social (ou None), descrição, receita
#
# O tier do prato é o do ingrediente MAIS RARO da receita: é ele que decide
# quanta nutrição existe para ser aproveitada, e também quanto se perde ao
# errar o ponto.
PRATOS = [
    # ══ Comum ═════════════════════════════════════════════════════════════
    ("Caldo de Nabo e Cevada", "Comum", 10, None,
     "O que se serve quando não há mais nada. Quente, e isso já é alguma coisa.",
     [("Nabo do Campo", 3), ("Cevada Rústica", 2)]),

    ("Coelho Assado", "Comum", 11, None,
     "Espeto, fogo e paciência. Erra-se pelo excesso, nunca pela falta.",
     [("Carne de Coelho", 2), ("Repolho de Inverno", 1)]),

    ("Peixe Grelhado com Ervas", "Comum", 15, None,
     "Simples de fazer e fácil de estragar: um minuto a mais e vira couro.",
     [("Peixe de Rio", 2), ("Nabo do Campo", 1), ("Repolho de Inverno", 1)]),

    ("Ensopado de Galinha", "Comum", 19, "encanto",
     "Cozinha a tarde inteira e junta gente na cozinha antes de ficar pronto.",
     [("Galinha de Terreiro", 2), ("Cevada Rústica", 1), ("Nabo do Campo", 2)]),

    # ══ Incomum ═══════════════════════════════════════════════════════════
    ("Torta de Cogumelo Real", "Incomum", 36, None,
     "Massa fina, recheio escuro. Aguenta viagem de dois dias sem estragar.",
     [("Cogumelo Real", 1), ("Cevada Rústica", 2), ("Repolho de Inverno", 2)]),

    ("Enguia Defumada", "Incomum", 56, None,
     "Três dias na fumaça fria. Quem tem pressa não faz, quem faz não tem pressa.",
     [("Enguia do Fundo", 1), ("Pimenta das Brasas", 1)]),

    ("Cervo Assado às Brasas", "Incomum", 67, None,
     "Selado por fora, vermelho por dentro. O ponto é tudo, e o ponto é curto.",
     [("Cervo das Brumas", 1), ("Pimenta das Brasas", 1), ("Repolho de Inverno", 2)]),

    ("Ensopado de Javali com Trufa", "Incomum", 68, "negociacao",
     "O prato que se põe na mesa quando há um acordo para fechar.",
     [("Lombo de Javali", 1), ("Trufa de Raiz Negra", 1), ("Nabo do Campo", 3)]),

    # ══ Raro ══════════════════════════════════════════════════════════════
    ("Costela de Wyvern na Brasa", "Raro", 297, None,
     "Fogo alto por quatro horas. A carne cede antes do osso, e só então.",
     [("Costela de Wyvern", 1), ("Pimenta das Brasas", 2), ("Nabo do Campo", 2)]),

    ("Caldo de Fênix", "Raro", 385, None,
     "Continua quente na tigela depois de fria a noite. Recompõe o que a magia gastou.",
     [("Peito de Fênix Menor", 1), ("Cogumelo Real", 2)]),

    ("Grifo ao Açafrão de Altar", "Raro", 438, "diplomacia",
     "Dourado, caro e servido devagar. Ninguém discute de barriga cheia disto.",
     [("Carne de Grifo", 1), ("Açafrão de Altar", 1), ("Arroz da Colheita Única", 1)]),

    ("Banquete da Casa Antiga", "Raro", 553, "banquete",
     "Não é um prato, é uma mesa. Serve seis, e o que se decide nela costuma valer.",
     [("Carne de Grifo", 1), ("Arroz da Colheita Única", 1), ("Fruto da Árvore Velha", 1),
      ("Trufa de Raiz Negra", 2), ("Galinha de Terreiro", 2)]),
]


# ── Efeitos sociais ───────────────────────────────────────────────────────
# Só saem em prato BEM FEITO — é a segunda metade da recompensa por acertar o
# ponto, e a razão de um cozinheiro valer numa mesa que não luta.
#
# Todos duram uma cena e valem para quem PARTILHOU a refeição, nunca para quem
# só cozinhou: o efeito é da mesa, não do prato.
EFEITOS_SOCIAIS = {
    "encanto": ("+2 em Encanto",
                "Vale para quem partilhou a refeição, pela próxima cena social."),
    "negociacao": ("+2 em Negociação",
                   "Vale para quem partilhou a refeição, pela próxima cena social."),
    "diplomacia": ("+3 em Diplomacia",
                   "Vale para quem partilhou a refeição, pela próxima cena social."),
    "banquete": ("+3 em Encanto, Diplomacia e Negociação",
                 "Serve seis. Vale para todos que se sentaram, pela próxima cena social. "
                 "É o efeito mais forte do catálogo, e custa o que custa."),
}


# ── Regras que valem para o catálogo inteiro ──────────────────────────────
REGRAS = [
    ("alimento.fora_de_combate", "sim",
     "Comida nunca é usada em combate. A refeição leva de 10 a 30 minutos, mais que qualquer luta."),
    ("alimento.sem_saturacao", "sim",
     "Alimento NÃO aplica Saturação Alquímica. É a única cura que continua funcionando depois da segunda poção."),
    ("alimento.pericia", "Cozinha",
     "O preparo é um teste de Cozinha contra a DC do tier do prato."),
    ("alimento.cura_malfeito", CURA_MALFEITO,
     "Prato malfeito cura isto e nada mais, independente da raridade do que foi usado."),
    ("alimento.tier_do_prato", "ingrediente_mais_raro",
     "O tier do prato é o do ingrediente mais raro da receita. É ele que decide a nutrição e a DC."),
]


def custo_da_receita(receita):
    return sum(PRECO_INGREDIENTE[nome] * qtd for nome, qtd in receita)


def tier_do_prato_pela_receita(receita):
    """O tier sai do ingrediente mais raro, e não é digitado à mão."""
    return max((TIER_INGREDIENTE[nome] for nome, _q in receita), key=lambda t: ORDEM_TIER[t])


def media_do_dado(notacao):
    """Média de 'NdM'. Serve para comparar cura por prata."""
    quantidade, faces = notacao.lower().split("d")
    return int(quantidade or 1) * (int(faces) + 1) / 2


def cura_media_bemfeito(tier, pv_maximo=PV_REFERENCIA):
    dado, percentual = CURA_BEMFEITO[tier]
    return media_do_dado(dado) + pv_maximo * percentual
