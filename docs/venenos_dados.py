# -*- coding: utf-8 -*-
"""Catálogo de venenos: as quatro classes, os ingredientes e os preços.

Fonte da verdade do PDF e da migration. Número que não fecha aqui não chega
lá — `verificar_venenos.py` recusa o conjunto antes de qualquer coisa ser
gerada.

O veneno é o espelho da poção: a mesma tabela `consumivel_condicao` que diz
"esta poção CURA Cegueira" passa a dizer "este veneno INFLIGE Cegueira". Muda
o sinal, não a máquina.
"""

# ── Ingredientes novos ────────────────────────────────────────────────────
# Veneno não se faz com as mesmas ervas de poção de cura. Os cinco abaixo
# entram no catálogo de `itens` junto com os 18 que já existem.
#
# nome, tier, preço em prata, descrição
INGREDIENTES_NOVOS = [
    ("Baba de Sapo-Pedra",  "Comum",   6,   "Raspada do dorso do bicho, que não morre por isso. Irrita tudo que toca."),
    ("Semente de Cicuta",   "Comum",   8,   "Cresce em beira de charco. Toda criança do campo aprende a não colher."),
    ("Espinho de Arraia",   "Incomum", 26,  "Do rabo do bicho de rio. Guarda a peçonha por meses depois de seco."),
    ("Fungo do Afogado",    "Incomum", 32,  "Brota em corpo que ficou na água. Cheira a nada, e é esse o problema."),
    ("Olho de Corvo Cego",  "Raro",    190, "De ave que comeu de cadáver pestilento e sobreviveu cega."),
]

# Os 18 que já estão no banco (migration 083), para o cálculo de custo.
INGREDIENTES_EXISTENTES = {
    "Água Pura": 2, "Sal Mineral": 2, "Folha de Menta Selvagem": 3,
    "Cinza de Carvalho": 4, "Raiz de Vigor": 5, "Mel Silvestre": 6,
    "Erva de Sangue": 7, "Lágrima de Resina": 20, "Musgo Luminoso": 25,
    "Cogumelo do Silêncio": 28, "Flor da Meia-Noite": 30,
    "Glândula de Víbora": 35, "Escama de Salamandra": 40, "Óleo Sacro": 150,
    "Raiz de Carne": 180, "Coração de Mandrágora": 200,
    "Pó de Estrela Caída": 250, "Sangue de Basilisco": 300,
}

PRECO_INGREDIENTE = dict(INGREDIENTES_EXISTENTES)
for nome, _tier, preco, _desc in INGREDIENTES_NOVOS:
    PRECO_INGREDIENTE[nome] = preco


# ── Condições novas ───────────────────────────────────────────────────────
# As 20 que existem cobrem as três primeiras classes inteiras. Quem precisa de
# vocabulário próprio é a classe FARSANTE: o efeito dela não é o dano, é o que
# as outras pessoas acreditam ao olhar. Nenhuma condição existente diz isso.
#
# Todas as quatro têm duração FIXA e curta, e nenhuma delas mata — é o que
# separa um farsante de um mortífero mal calibrado.
#
# nome, tier, categoria, efeito, duração, janela_de_cura, se_nao_tratada
CONDICOES_NOVAS = [
    ("Febre Fingida", "Comum", "Alquímica",
     "Suor, tremor e testa quente, sem doença nenhuma por trás. Sofre −2 em tudo. "
     "Medicina DC 15 revela a farsa.",
     "1d6 horas", None, None),

    ("Desmaio Breve", "Incomum", "Física",
     "Cai inconsciente. Não age nem percebe. Acorda sozinho, sem sequela. "
     "Sacudir ou molhar não adianta.",
     "1d10 minutos", None, None),

    ("Estigma Falso", "Incomum", "Alquímica",
     "A pele racha em manchas escuras iguais às da peste. Quem vê foge, guarda "
     "fecha e cidade expulsa. Medicina DC 20 revela a farsa.",
     "1d4 dias", None, None),

    ("Morte Aparente", "Raro", "Alquímica",
     "Pulso imperceptível, respiração que não embaça espelho, corpo frio. Não age "
     "nem percebe, e continua consciente do que se fala ao redor. "
     "Medicina DC 25 revela a farsa — abaixo disso, o coveiro faz o trabalho dele.",
     "1d4 horas", None, None),
]


# ── Venenos ───────────────────────────────────────────────────────────────
# nome, tier, classe, via, usos, preço, condição infligida, efeito, receita
#
# classe: mortifero | sensorial | debilitante | farsante
# via:    lamina | ingestao | contato
VENENOS = [
    # ══ MORTÍFEROS — atentam direto contra a vida ═════════════════════════
    ("Corte que Não Fecha", "Comum", "mortifero", "lamina", 3, 31, "Sangramento",
     "A ferida para de coagular. O alvo perde 1d4 PV por turno até ser tratado.",
     [("Erva de Sangue", 2), ("Semente de Cicuta", 1)]),

    ("Fel de Víbora", "Incomum", "mortifero", "lamina", 3, 108, "Envenenado",
     "Peçonha concentrada de três glândulas numa. Perde 1d6 PV por turno e sofre −2 em tudo.",
     [("Glândula de Víbora", 2), ("Semente de Cicuta", 1)]),

    ("Toque da Serpente-Pedra", "Raro", "mortifero", "lamina", 1, 453, "Paralisia",
     "Uma gota na lâmina. O alvo trava onde está, e quem o alcançar acerta em cheio.",
     [("Sangue de Basilisco", 1), ("Espinho de Arraia", 1)]),

    ("Sopro da Vala", "Raro", "mortifero", "ingestao", 1, 642, "Peste Negra",
     "Não é veneno, é doença engarrafada. Mata devagar e não fica só no alvo.",
     [("Raiz de Carne", 1), ("Olho de Corvo Cego", 1), ("Fungo do Afogado", 2),
      ("Cogumelo do Silêncio", 1)]),

    ("Beijo da Necrose", "Raro", "mortifero", "contato", 1, 558, "Necrose",
     "Passado na maçaneta, na taça, na mão estendida. A carne que tocar apodrece.",
     [("Raiz de Carne", 1), ("Olho de Corvo Cego", 1), ("Fungo do Afogado", 1)]),

    # ══ SENSORIAIS — coordenação motora e funções do corpo ════════════════
    ("Água Torta", "Comum", "sensorial", "ingestao", 1, 19, "Náusea",
     "Some no vinho e aparece no estômago. O alvo não consegue usar consumível nenhum.",
     [("Baba de Sapo-Pedra", 2), ("Água Pura", 1)]),

    ("Vinho do Bobo", "Comum", "sensorial", "ingestao", 1, 22, "Embriaguez",
     "Bêbado sem ter bebido. Serve para desacreditar tanto quanto para atrapalhar.",
     [("Mel Silvestre", 1), ("Semente de Cicuta", 1), ("Água Pura", 1)]),

    ("Silêncio de Cripta", "Incomum", "sensorial", "ingestao", 1, 80, "Surdez",
     "O mundo cala. Ordem gritada não chega, e emboscada não se anuncia.",
     [("Cogumelo do Silêncio", 2), ("Água Pura", 1)]),

    ("Cinza nos Olhos", "Incomum", "sensorial", "contato", 1, 86, "Cegueira",
     "Um punhado no rosto. Ataque à distância do alvo falha automaticamente.",
     [("Espinho de Arraia", 1), ("Fungo do Afogado", 1), ("Cinza de Carvalho", 1)]),

    # ══ DEBILITANTES — restringem movimento e ações ═══════════════════════
    ("Fardo de Chumbo", "Comum", "debilitante", "ingestao", 1, 22, "Fadiga",
     "Os braços pesam. Sofre −2 em testes de Força e de Resistência até descansar.",
     [("Cinza de Carvalho", 2), ("Baba de Sapo-Pedra", 1), ("Sal Mineral", 1)]),

    ("Peçonha do Torpor", "Incomum", "debilitante", "lamina", 3, 100, "Enregelado",
     "Esfria o sangue de dentro. Move-se pela metade e sofre −3 em Destreza.",
     [("Escama de Salamandra", 1), ("Fungo do Afogado", 1)]),

    ("Trava-Língua", "Incomum", "debilitante", "ingestao", 1, 114, "Silenciado",
     "A garganta fecha. Nenhuma skill que exija palavra falada sai — o alvo é um conjurador mudo.",
     [("Cogumelo do Silêncio", 2), ("Espinho de Arraia", 1)]),

    # ══ FARSANTES — duração curta, feitos para enganar ════════════════════
    ("Máscara Febril", "Comum", "farsante", "ingestao", 1, 29, "Febre Fingida",
     "Febre de verdade sem doença nenhuma. Dispensa da guarda, entra na enfermaria, "
     "esvazia a mesa de jantar.",
     [("Erva de Sangue", 1), ("Semente de Cicuta", 1), ("Mel Silvestre", 1)]),

    ("Sopro Curto", "Incomum", "farsante", "contato", 1, 89, "Desmaio Breve",
     "Um lenço no rosto e a sentinela dorme. Acorda sem entender e sem sequela — "
     "o que também significa que vai poder contar.",
     [("Flor da Meia-Noite", 1), ("Fungo do Afogado", 1), ("Água Pura", 1)]),

    ("Pústula de Mentira", "Incomum", "farsante", "contato", 1, 62, "Estigma Falso",
     "As manchas da peste sem a peste. Serve para esvaziar uma rua, fechar um porto, "
     "ou fazer com que ninguém encoste em quem carrega.",
     [("Espinho de Arraia", 1), ("Erva de Sangue", 1), ("Baba de Sapo-Pedra", 2)]),

    ("Sono do Coveiro", "Raro", "farsante", "ingestao", 1, 583, "Morte Aparente",
     "Morre por algumas horas e volta. Escapa de execução, de cerco e de casamento — "
     "desde que alguém saiba onde vão enterrar o corpo.",
     [("Coração de Mandrágora", 1), ("Flor da Meia-Noite", 1), ("Olho de Corvo Cego", 1)]),
]


# ── Regras que valem para o catálogo inteiro ──────────────────────────────

VIAS = {
    "lamina": ("Lâmina",
               "Passado numa arma. Vale pelos golpes indicados em `usos` ou por 1 minuto, "
               "o que acabar antes. É a única via que funciona no meio de um combate."),
    "ingestao": ("Ingestão",
                 "Em comida ou bebida. Não serve em luta: exige acesso à cozinha, à taça ou "
                 "ao odre, o que é uma cena inteira e não uma ação."),
    "contato": ("Contato",
                "Pó, óleo ou pano. Atinge quem tocar a superfície ou respirar de perto. "
                "Meio-termo: dá para preparar uma armadilha, mas não para usar em iniciativa."),
}

CLASSES = {
    "mortifero":   ("Mortíferos", "Atentam direto contra a vida do alvo."),
    "sensorial":   ("Sensoriais", "Afetam coordenação motora ou funções do corpo — cegueira, surdez, náusea."),
    "debilitante": ("Debilitantes", "Restringem movimento e ações sem matar."),
    "farsante":    ("Farsantes", "Duração curta e efeito visível. O valor está no que as outras pessoas acreditam."),
}

# DC do teste de Fortitude para resistir. Sai da mesma coluna
# `raridade.dificuldade_base` que já define a dificuldade de fabricar — uma
# escala servindo aos dois lados, sem coluna nova.
DIFICULDADE_POR_TIER = {"Comum": 10, "Incomum": 15, "Raro": 20}

# O alvo da margem de fabricação, igual ao das poções (ECONOMIA.pdf).
MARGEM_MIN = 0.70
MARGEM_MAX = 0.75

ORDEM_TIER = {"Comum": 1, "Incomum": 2, "Raro": 3}

# As 20 condições que já existem, com o tier de cada uma — para a regra de que
# o veneno precisa alcançar a gravidade do que aplica.
TIER_CONDICAO_EXISTENTE = {
    "Sangramento": "Comum", "Atordoado": "Comum", "Fadiga": "Comum",
    "Náusea": "Comum", "Embriaguez": "Comum", "Ferida Leve": "Comum",
    "Saturação Alquímica": "Comum",
    "Cegueira": "Incomum", "Surdez": "Incomum", "Envenenado": "Incomum",
    "Queimadura": "Incomum", "Enregelado": "Incomum", "Silenciado": "Incomum",
    "Amedrontado": "Incomum",
    "Paralisia": "Raro", "Petrificação": "Raro", "Maldição": "Raro",
    "Enfeitiçado": "Raro", "Peste Negra": "Raro", "Necrose": "Raro",
}

TIER_CONDICAO = dict(TIER_CONDICAO_EXISTENTE)
for nome, tier, *_resto in CONDICOES_NOVAS:
    TIER_CONDICAO[nome] = tier

# O antídoto que já existe contra cada condição, e quanto custa. Serve para a
# checagem de que envenenar não sai mais barato que se defender.
ANTIDOTO_EXISTENTE = {
    "Sangramento": ("Emplastro de Sangue Firme", 15),
    "Náusea": ("Chá de Estômago Calmo", 11),
    "Embriaguez": ("Tônico do Desperto", 18),
    "Fadiga": ("Infusão Revigorante", 20),
    "Envenenado": ("Antídoto Comum", 60),
    "Surdez": ("Essência do Ouvido Aberto", 69),
    "Cegueira": ("Colírio de Visão Clara", 70),
    "Enregelado": ("Tônico do Sangue Quente", 46),
    "Silenciado": ("Xarope da Voz Livre", 86),
    "Paralisia": ("Soro do Corpo Livre", 350),
    "Necrose": ("Unguento de Carne Nova", 420),
    "Peste Negra": ("Panaceia da Peste", 445),
}


def custo_da_receita(receita):
    return sum(PRECO_INGREDIENTE[nome] * qtd for nome, qtd in receita)
