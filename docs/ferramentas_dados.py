# -*- coding: utf-8 -*-
"""Catálogo de ferramentas: uma por ofício, todas Comuns, preço fixo.

Fonte da verdade do PDF e da migration.

A ferramenta é o item que a receita exige mas não consome —
`receita_ingredientes.consumido = false` existe desde a migration 077 para
isto, e até aqui não havia uma única ferramenta cadastrada. Sem alambique,
nenhuma das 44 receitas de Alquimia exigia alambique.
"""

# ── Por que todas Comuns e sem raridade ───────────────────────────────────
# Ferramenta não é achado, é compra. Uma bigorna é cara porque pesa 45 kg de
# ferro, não porque é rara — qualquer cidade com ferreiro tem uma à venda. Dar
# raridade a ferramenta transformaria "quero fabricar" numa caçada, e o que se
# quer é que fabricar seja uma escolha de tempo e dinheiro, não de sorte.
TIER = "Comum"

# ── Ferramentas: nome, ofício, preço em prata, peso em kg, descrição ──────
# O peso importa mais aqui que em qualquer outro catálogo. A capacidade de
# carga é 2 + força × 2 kg; um personagem de força 3 carrega 8. A bigorna
# (45 kg) e o tear (8 kg) são FIXOS: ficam onde foram instalados, e fabricar
# exige ir até eles. É a diferença entre o alquimista que viaja com a mochila
# e o ferreiro que precisa de uma forja.
FERRAMENTAS = [
    # ══ Alquimia ══════════════════════════════════════════════════════════
    ("Alambique",            "Alquimia",    60,  4.0,  "Vidro e cobre. Destila, condensa e separa — sem ele não há poção nem veneno."),
    ("Almofariz e Pilão",    "Alquimia",    8,   1.5,  "Pedra fundo, pedra em cima. Mói o que a receita manda moer."),
    ("Balança de Precisão",  "Alquimia",    25,  1.0,  "Dois pratos e um jogo de pesos. Um grão a mais estraga o Raro."),

    # ══ Cozinha ═══════════════════════════════════════════════════════════
    ("Panela de Ferro",      "Cozinha",     12,  3.0,  "Pesada e eterna. Caldo, ensopado, torta e o que mais couber."),
    ("Espeto e Grelha",      "Cozinha",     10,  2.0,  "Para o que vai ao fogo direto: assado, grelhado, brasa."),
    ("Faca de Cozinha",      "Cozinha",     6,   0.4,  "Afiada de um lado só. Não é arma, e quem tentar vai descobrir."),

    # ══ Ferraria ══════════════════════════════════════════════════════════
    ("Bigorna",              "Ferraria",    120, 45.0, "Quarenta e cinco quilos de ferro. Não se carrega: se instala."),
    ("Martelo de Forja",     "Ferraria",    18,  2.0,  "Cabeça curta, cabo comprido. Bate o dia inteiro sem cansar a mão."),
    ("Tenaz",                "Ferraria",    10,  1.0,  "Segura o que está em brasa. A alternativa é a própria mão."),
    ("Fole",                 "Ferraria",    35,  5.0,  "Couro e madeira. Sem ele o carvão não passa do vermelho."),

    # ══ Carpintaria ═══════════════════════════════════════════════════════
    ("Serra de Mão",         "Carpintaria", 15,  1.5,  "Dentes para madeira verde e para seca. Não se usa em osso."),
    ("Plaina",               "Carpintaria", 12,  1.2,  "Tira a lasca fina. O que sai dela cabe na mão sem farpa."),
    ("Formão e Maço",        "Carpintaria", 9,   1.0,  "Entalha, encaixa, abre furo quadrado. O maço é de madeira para não amassar o cabo."),

    # ══ Costura ═══════════════════════════════════════════════════════════
    ("Agulhas e Dedal",      "Costura",     3,   0.1,  "Seis agulhas de tamanhos diferentes e um dedal de latão. Cabe no bolso."),
    ("Tesoura de Alfaiate",  "Costura",     14,  0.3,  "Lâmina longa, corte reto. Nunca se empresta."),
    ("Tear de Mesa",         "Costura",     45,  8.0,  "Tece o tecido a partir do fio. Fixo: ocupa uma mesa inteira."),

    # ══ Joalheria ═════════════════════════════════════════════════════════
    ("Lupa de Joalheiro",    "Joalheria",   30,  0.2,  "Lente de aumento numa armação de latão. Vê o defeito antes do comprador."),
    ("Pinça e Lima Finas",   "Joalheria",   9,   0.2,  "Para o que é pequeno demais para os dedos."),
    ("Maçarico de Boca",     "Joalheria",   22,  0.6,  "Sopra chama fina o bastante para soldar um elo sem derreter o anel."),
]

OFICIOS = ["Alquimia", "Cozinha", "Ferraria", "Carpintaria", "Costura", "Joalheria"]

# Fixo = não se carrega. É o peso que decide, não uma coluna: acima da carga
# de um personagem forte (força 5 → 12 kg), a ferramenta fica onde está.
PESO_QUE_NAO_SE_CARREGA = 12.0

# ── O que cada receita passa a exigir ─────────────────────────────────────
# Por ofício, e não receita a receita: 44 receitas de Alquimia exigem o mesmo
# alambique, e listar uma a uma seria 44 chances de esquecer uma.
#
# Cozinha tem exceção por forma de preparo: o que vai ao fogo direto usa
# espeto, o resto usa panela. A lista abaixo é o que casa com "assado",
# "grelhado" ou "brasa" no nome do prato.
FERRAMENTAS_POR_OFICIO = {
    "Alquimia": ["Alambique", "Almofariz e Pilão"],
    "Cozinha":  ["Panela de Ferro"],
}
COZINHA_NO_FOGO_DIRETO = ["Espeto e Grelha"]
PALAVRAS_DE_FOGO_DIRETO = ("Assado", "Grelhado", "Brasa")

# Preço fixo, sem multiplicador de raridade. A faixa abaixo é o que "não
# muito alto, não muito baixo" quer dizer em prata: o mais barato cabe no
# troco, o mais caro é dois meses de salário de artesão.
PRECO_MIN = 3
PRECO_MAX = 150
