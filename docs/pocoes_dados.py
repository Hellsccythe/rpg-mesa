# -*- coding: utf-8 -*-
"""Catálogo de condições, poções e ingredientes.

Fonte da verdade do PDF: o documento é gerado DESTE arquivo, então número que
não fecha aqui não chega lá.
"""

# ── Ingredientes: nome, tier, preço em prata, descrição ───────────────────
INGREDIENTES = [
    ("Água Pura",               "Comum",   2,  "Água de nascente, fervida e lacrada. Base de quase toda poção."),
    ("Sal Mineral",             "Comum",   2,  "Raspado de veio de rocha. Conserva e estanca."),
    ("Folha de Menta Selvagem", "Comum",   3,  "Cresce em beira de trilha. Acorda quem está entorpecido."),
    ("Cinza de Carvalho",       "Comum",   4,  "De árvore atingida por raio, dizem os alquimistas. Absorve."),
    ("Raiz de Vigor",           "Comum",   5,  "Tubérculo amargo. Devolve o fôlego a quem já não tem."),
    ("Mel Silvestre",           "Comum",   6,  "De colmeia brava. Liga o que não liga e disfarça o gosto."),
    ("Erva de Sangue",          "Comum",   7,  "Folha de nervuras vermelhas, comum em beira de rio."),
    ("Lágrima de Resina",       "Incomum", 20, "Seiva endurecida de pinheiro antigo. Clarifica a mistura."),
    ("Musgo Luminoso",          "Incomum", 25, "Só cresce onde nunca bate sol. Brilha fraco no escuro."),
    ("Cogumelo do Silêncio",    "Incomum", 28, "Cresce em cripta. Não tem cheiro nenhum, e é isso que assusta."),
    ("Flor da Meia-Noite",      "Incomum", 30, "Abre por três horas, uma vez ao ano."),
    ("Glândula de Víbora",      "Incomum", 35, "Do próprio veneno se tira o antídoto."),
    ("Escama de Salamandra",    "Incomum", 40, "Fria ao toque, mesmo ao lado do fogo."),
    ("Óleo Sacro",              "Raro",   150, "Consagrado em altar, e só serve se o foi de verdade."),
    ("Raiz de Carne",           "Raro",   180, "Cresce em campo de batalha antigo. Ninguém planta."),
    ("Coração de Mandrágora",   "Raro",   200, "Colhido com o grito abafado, ou o colhedor enlouquece."),
    ("Pó de Estrela Caída",     "Raro",   250, "O que sobra onde o céu tocou o chão."),
    ("Sangue de Basilisco",     "Raro",   300, "Desfaz a pedra porque foi ele quem a fez."),
]

# ── Condições: nome, tier, categoria, efeito, duração ─────────────────────
CONDICOES = [
    ("Sangramento",  "Comum",   "Física", "Perde 1d4 PV no início de cada turno.",                          "Até ser tratada"),
    ("Atordoado",    "Comum",   "Física", "Perde a ação bônus e age por último na ordem.",                   "1 turno"),
    ("Fadiga",       "Comum",   "Física", "−2 em testes de Força e de Resistência.",                    "Até descansar"),
    ("Náusea",       "Comum",   "Física", "Não consegue usar consumível. −2 em ataques.",               "1d4 turnos"),
    ("Embriaguez",   "Comum",   "Mental", "−3 em Destreza e Inteligência, +2 contra medo.",             "1 hora"),
    ("Ferida Leve",  "Comum",   "Física", "Não recupera PV descansando enquanto durar.",                     "Até ser tratada"),
    ("Cegueira",     "Incomum", "Física", "Não enxerga. Ataque à distância falha automaticamente.",           "Até ser tratada"),
    ("Surdez",       "Incomum", "Física", "Não ouve. Falha em Percepção auditiva e em ordem dita em voz.",    "Até ser tratada"),
    ("Envenenado",   "Incomum", "Física", "Perde 1d6 PV por turno e sofre −2 em tudo.",                  "Até ser tratada"),
    ("Queimadura",   "Incomum", "Física", "Perde 1d6 PV por turno. Dano de fogo conta em dobro.",             "3 turnos ou até tratada"),
    ("Enregelado",   "Incomum", "Física", "Metade do movimento. −3 em Destreza.",                        "Até ser tratada"),
    ("Silenciado",   "Incomum", "Mágica", "Não usa skill que exija palavra falada.",                          "Até ser tratada"),
    ("Amedrontado",  "Incomum", "Mental", "Não pode se aproximar da fonte. Desvantagem contra ela.",          "1 minuto"),
    ("Paralisia",    "Raro",    "Física", "Não age nem se move. Ataque corpo a corpo contra ele é crítico.",  "Até ser tratada"),
    ("Petrificação", "Raro",    "Mágica", "Vira pedra. Não age, não percebe, não envelhece.",                 "Permanente"),
    ("Maldição",     "Raro",    "Mágica", "−4 permanente num atributo escolhido pelo mestre.",           "Permanente"),
    ("Enfeitiçado",  "Raro",    "Mental", "Obedece a quem o enfeitiçou. Trata aliados como inimigos.",        "Até ser quebrada"),
    ("Peste Negra",  "Raro",    "Doença", "Perde 1d8 PV por hora, dobrando a cada dia sem tratamento.",       "Até ser tratada"),
    ("Necrose",      "Raro",    "Doença", "Um membro apodrece e perde o uso. Espalha em 1d4 dias.",           "Até ser tratada"),
]

# ── Poções: nome, tier, tipo, preço, cura[], previne[], efeito, receita ───
# tipo: vida | cura | prevencao | ampla
POCOES = [
    ("Poção de Cura Menor", "Comum", "vida", 25, [], [],
     "Recupera 2d4 pontos de vida ao ser bebida.",
     [("Erva de Sangue", 2), ("Água Pura", 2)]),
    ("Chá de Estômago Calmo", "Comum", "cura", 11, ["Náusea"], [],
     "Assenta o estômago e devolve a capacidade de beber outra poção.",
     [("Folha de Menta Selvagem", 2), ("Sal Mineral", 1)]),
    ("Emplastro de Sangue Firme", "Comum", "cura", 15, ["Sangramento"], [],
     "Estanca o sangramento em um turno. Arde como o diabo.",
     [("Erva de Sangue", 1), ("Sal Mineral", 2)]),
    ("Tônico do Desperto", "Comum", "cura", 18, ["Atordoado", "Embriaguez"], [],
     "Limpa a cabeça na hora. O gosto ajuda.",
     [("Folha de Menta Selvagem", 2), ("Raiz de Vigor", 1), ("Água Pura", 1)]),
    ("Infusão Revigorante", "Comum", "cura", 20, ["Fadiga"], [],
     "Devolve o fôlego a quem andou demais.",
     [("Raiz de Vigor", 2), ("Água Pura", 2)]),
    ("Unguento Cicatrizante", "Comum", "cura", 25, ["Ferida Leve"], [],
     "Fecha o que não fechava. Volta a recuperar PV descansando.",
     [("Erva de Sangue", 2), ("Água Pura", 2)]),
    ("Elixir do Alívio Simples", "Comum", "ampla", 60, ["uma condição Comum à escolha"], [],
     "Limpa UMA condição Comum, qualquer que seja. A mais cara das comuns.",
     [("Musgo Luminoso", 1), ("Erva de Sangue", 2), ("Água Pura", 2)]),

    ("Licor da Coragem", "Incomum", "cura", 50, ["Amedrontado"], [],
     "O medo passa. O que causou o medo, não.",
     [("Mel Silvestre", 2), ("Raiz de Vigor", 1), ("Lágrima de Resina", 1)]),
    ("Bálsamo de Pele Fria", "Incomum", "cura", 55, ["Queimadura"], [],
     "Apaga a queimadura e tira o dobro de dano de fogo.",
     [("Escama de Salamandra", 1)]),
    ("Tônico do Sangue Quente", "Incomum", "cura", 46, ["Enregelado"], [],
     "Devolve o movimento a quem congelou.",
     [("Cinza de Carvalho", 2), ("Raiz de Vigor", 1), ("Lágrima de Resina", 1)]),
    ("Antídoto Comum", "Incomum", "cura", 60, ["Envenenado"], [],
     "Do próprio veneno se tira o antídoto.",
     [("Glândula de Víbora", 1), ("Sal Mineral", 2), ("Água Pura", 2)]),
    ("Essência do Ouvido Aberto", "Incomum", "cura", 69, ["Surdez"], [],
     "O mundo volta a fazer barulho.",
     [("Lágrima de Resina", 1), ("Cogumelo do Silêncio", 1), ("Água Pura", 1)]),
    ("Colírio de Visão Clara", "Incomum", "cura", 70, ["Cegueira"], [],
     "Pinga-se no olho. Arde, e enxerga.",
     [("Musgo Luminoso", 1), ("Lágrima de Resina", 1), ("Folha de Menta Selvagem", 2)]),
    ("Fôlego do Bravo", "Incomum", "prevencao", 74, [], ["Amedrontado"],
     "Imune a medo por 10 minutos. Bebe-se ANTES de abrir a porta.",
     [("Mel Silvestre", 3), ("Flor da Meia-Noite", 1), ("Raiz de Vigor", 1)]),
    ("Óleo do Manto Ígneo", "Incomum", "prevencao", 75, [], ["Queimadura"],
     "Passa-se na pele. Resiste a fogo por 10 minutos.",
     [("Escama de Salamandra", 1), ("Cinza de Carvalho", 2), ("Mel Silvestre", 1)]),
    ("Xarope da Voz Livre", "Incomum", "cura", 86, ["Silenciado"], [],
     "Quebra o silêncio imposto. Serve contra magia, não contra covardia.",
     [("Cogumelo do Silêncio", 2), ("Mel Silvestre", 1)]),
    ("Profilaxia da Víbora", "Incomum", "prevencao", 93, [], ["Envenenado"],
     "Imune a veneno por uma hora. O antídoto que se toma antes.",
     [("Glândula de Víbora", 1), ("Flor da Meia-Noite", 1), ("Sal Mineral", 1)]),
    ("Poção de Cura Maior", "Incomum", "vida", 90, [], [],
     "Recupera 4d4+4 pontos de vida.",
     [("Erva de Sangue", 6), ("Musgo Luminoso", 1)]),
    ("Elixir do Alívio Comum", "Incomum", "ampla", 140, ["todas as condições Comuns"], [],
     "Limpa TODAS as condições Comuns de uma vez.",
     [("Flor da Meia-Noite", 1), ("Musgo Luminoso", 1), ("Erva de Sangue", 3),
      ("Folha de Menta Selvagem", 4), ("Água Pura", 5)]),

    ("Poção de Cura Superior", "Raro", "vida", 445, [], [],
     "Recupera 8d4+10 pontos de vida. Traz de volta quem já estava indo.",
     [("Erva de Sangue", 10), ("Musgo Luminoso", 2), ("Coração de Mandrágora", 1)]),
    ("Soro do Corpo Livre", "Raro", "cura", 350, ["Paralisia"], [],
     "Devolve o movimento a quem estava travado.",
     [("Coração de Mandrágora", 1), ("Raiz de Vigor", 4), ("Lágrima de Resina", 2)]),
    ("Panaceia da Peste", "Raro", "cura", 445, ["Peste Negra"], [],
     "Corta a peste antes que ela dobre de novo.",
     [("Óleo Sacro", 1), ("Flor da Meia-Noite", 4), ("Musgo Luminoso", 2)]),
    ("Selo da Vontade", "Raro", "prevencao", 465, [], ["Enfeitiçado", "Amedrontado"],
     "Imune a controle mental e a medo por uma hora.",
     [("Pó de Estrela Caída", 1), ("Flor da Meia-Noite", 2), ("Mel Silvestre", 4)]),
    ("Unguento de Carne Nova", "Raro", "cura", 420, ["Necrose"], [],
     "A carne morta cai e a nova cresce. Dói os dois dias inteiros.",
     [("Raiz de Carne", 1), ("Erva de Sangue", 12), ("Mel Silvestre", 6)]),
    ("Água Benta Destilada", "Raro", "cura", 790, ["Maldição"], [],
     "Quebra a maldição — mas só a maldição, não quem a lançou.",
     [("Óleo Sacro", 2), ("Água Pura", 10), ("Pó de Estrela Caída", 1)]),
    ("Elixir da Mente Própria", "Raro", "cura", 740, ["Enfeitiçado"], [],
     "Devolve a vontade a quem obedecia outro.",
     [("Pó de Estrela Caída", 1), ("Coração de Mandrágora", 1), ("Cogumelo do Silêncio", 3)]),
    ("Solvente da Carne Viva", "Raro", "cura", 665, ["Petrificação"], [],
     "Desfaz a pedra porque foi o basilisco quem a fez.",
     [("Sangue de Basilisco", 1), ("Óleo Sacro", 1), ("Água Pura", 15)]),
    ("Panaceia Verdadeira", "Raro", "ampla", 1250, ["qualquer condição até o tier Raro"], [],
     "Limpa QUALQUER condição, até as Raras. O teto do que a alquimia alcança.",
     [("Sangue de Basilisco", 1), ("Pó de Estrela Caída", 1),
      ("Coração de Mandrágora", 1), ("Óleo Sacro", 1)]),
]

PRECO_INGREDIENTE = {n: p for n, t, p, d in INGREDIENTES}
TIER_INGREDIENTE = {n: t for n, t, p, d in INGREDIENTES}
TIER_CONDICAO = {n: t for n, t, c, e, d in CONDICOES}
ORDEM_TIER = {"Comum": 1, "Incomum": 2, "Raro": 3}
DIFICULDADE = {"Comum": 10, "Incomum": 15, "Raro": 20}


def custo_da_receita(receita):
    return sum(PRECO_INGREDIENTE[nome] * qtd for nome, qtd in receita)


def proporcao(preco, receita):
    return round(custo_da_receita(receita) / preco * 100)
