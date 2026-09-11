# -*- coding: utf-8 -*-
"""Catálogo de cosméticos: tecidos, roupas, materiais e acessórios.

Fonte da verdade do PDF e da migration.

A ideia central: o TECIDO decide quem a roupa impressiona, e a QUALIDADE
decide quanto. Seda bem costurada abre porta de nobre; seda mal costurada é
só um tecido caro num corpo. Linho não abre porta de nobre nem bem costurado
— mas na taverna é o que faz alguém parecer gente da casa.
"""

# ── Públicos ──────────────────────────────────────────────────────────────
# Quem a roupa impressiona. Vem do tecido, não da peça: um casaco de seda e um
# vestido de seda falam com a mesma gente.
PUBLICOS = {
    "plebe":    ("Plebe", "Camponês, taverneiro, varejista, guarda de portão. Quem trabalha com as mãos."),
    "qualquer": ("Qualquer", "Respeitável em todo lugar, memorável em nenhum."),
    "nobreza":  ("Nobreza", "Casa nobre, clero alto, mercador rico. Quem julga pelo corte antes da palavra."),
}

# ── Tecidos: nome, tier, preço, público, descrição ────────────────────────
# O bônus máximo sai do tier — Comum +1, Incomum +2, Raro +3 — e é o que a
# roupa dá quando BEM FEITA.
TECIDOS = [
    ("Linho Cru",        "Comum",   4,   "plebe",    "Cor de palha, áspero no primeiro dia e macio no décimo. A roupa de todo mundo."),
    ("Lã Rústica",       "Comum",   5,   "plebe",    "Fiada em casa, tingida com casca de nogueira. Esquenta e cheira a ovelha."),
    ("Couro Curtido",    "Comum",   8,   "plebe",    "Curtido em tanino. Casaco, avental, bota. Dura mais que o dono."),
    ("Algodão Tingido",  "Incomum", 18,  "qualquer", "Liso, leve, cor firme. Nem rico nem pobre: limpo."),
    ("Lã Fina",          "Incomum", 24,  "nobreza",  "De carneiro de altitude, fiada apertada. O primeiro degrau da elegância."),
    ("Veludo",           "Raro",    90,  "nobreza",  "Pelo curto que muda de cor com a luz. Não se usa de dia, e é essa a mensagem."),
    ("Seda",             "Raro",    120, "nobreza",  "Chega de longe e custa o que custa por isso. Frio ao toque, quente ao olhar."),
    ("Brocado",          "Raro",    150, "nobreza",  "Seda com fio de ouro tecido no desenho. Uma roupa de brocado é um anúncio."),
]

# ── Materiais de joalheria: nome, tier, preço, descrição ──────────────────
MATERIAIS = [
    ("Fio de Cobre",     "Comum",   3,   "Verde-escuro com o tempo. O metal de quem quer um anel e não quer perguntas."),
    ("Pedra Polida",     "Comum",   6,   "Ágata, quartzo, o que o rio deu. Bonita se alguém a lapidou."),
    ("Prata em Barra",   "Incomum", 40,  "Escurece, e é polida de novo. Metal de quem tem posses e não precisa mostrar."),
    ("Ametista",         "Incomum", 60,  "Roxa, translúcida. A pedra mais cara que um artesão compra sem fiador."),
    ("Ouro em Barra",    "Raro",    300, "Três moedas de ouro fundidas numa. Vale mais como joia do que como dinheiro."),
    ("Rubi",             "Raro",    200, "Vermelho até o fundo. Quem usa um no dedo não precisa se apresentar."),
]

# ── A escada de qualidade ─────────────────────────────────────────────────
# O teste é Costura (roupa) ou Joalheria (acessório) contra a DC do tier — a
# mesma `raridade.dificuldade_base` de fabricar poção, resistir a veneno e
# cozinhar. Terceiro uso da mesma escada.
#
# MAL FEITA: bônus zero. A peça existe, veste, e não impressiona ninguém —
# seda mal costurada é um tecido caro num corpo. Não há penalidade: roupa
# malfeita é só roupa.
# BEM FEITA: o bônus máximo do tecido, com o público do tecido.
BONUS_POR_TIER = {"Comum": 1, "Incomum": 2, "Raro": 3}
DIFICULDADE_POR_TIER = {"Comum": 10, "Incomum": 15, "Raro": 20}

# Público errado: vestir seda na taverna ou linho no salão. A roupa fala com
# a plateia errada, e a plateia responde.
PENALIDADE_PUBLICO_ERRADO = -1

# Em que perícias o bônus entra. As mesmas da comida — e as duas fontes SOMAM,
# porque são coisas diferentes: uma é o que se veste, a outra é o que se
# serviu. Intimidação fica de fora (um colete de seda não assusta ninguém) e
# Atuação também (disfarce é outra conversa).
PERICIAS_AFETADAS = ["Encanto", "Diplomacia", "Negociação"]

# ── Roupas: nome, tecido, corte, preço, descrição ─────────────────────────
# Tier, público e bônus vêm do tecido — calculados, não digitados. O corte é
# só o que a peça é.
ROUPAS = [
    # Plebe
    ("Túnica de Linho",          "Linho Cru",       "túnica",  11,   "Um retângulo com buraco para a cabeça e um cinto. Não chama atenção, e é isso que faz."),
    ("Casaco de Lã Rústica",     "Lã Rústica",      "casaco",  21,  "Grosso, comprido, cor de terra. O inverno passa por fora."),
    ("Colete de Couro",          "Couro Curtido",   "colete",  22,  "Sem manga, com bolsos. Roupa de quem carrega ferramenta."),
    ("Vestido de Linho",         "Linho Cru",       "vestido", 17,  "Solto, prático, com bainha para subir escada. De domingo e de segunda."),

    # Qualquer
    ("Camisa de Algodão",        "Algodão Tingido", "camisa",  50,  "Branca, azul ou cinza. Serve na guarda, na loja e na igreja."),
    ("Vestido de Algodão",       "Algodão Tingido", "vestido", 75,  "Cor firme, corte simples. Bonito sem ser motivo de conversa."),

    # Nobreza
    ("Casaco de Lã Fina",        "Lã Fina",         "casaco",  100,  "Ombro estruturado, botão de osso. A primeira roupa que um nobre nota."),
    ("Traje de Veludo",          "Veludo",          "traje",   500, "Casaco e calça no mesmo pano. Reflete a luz das velas, e é para isso que existe."),
    ("Vestido de Seda",          "Seda",            "vestido", 500, "Cai como água. Quem o veste entra numa sala em silêncio."),
    ("Traje de Brocado",         "Brocado",         "traje",   833, "Fio de ouro no desenho. Não há como usá-lo por engano."),
]

# ── Acessórios: nome, material, preço, descrição ──────────────────────────
# Acessório dá +1 fixo, com o público do material — e só UM conta por vez. A
# roupa é o argumento; o acessório é a vírgula. Sem esse limite, dez anéis
# valeriam mais que um traje.
BONUS_ACESSORIO = 1
PUBLICO_DO_MATERIAL = {
    "Fio de Cobre": "qualquer", "Pedra Polida": "qualquer",
    "Prata em Barra": "nobreza", "Ametista": "nobreza",
    "Ouro em Barra": "nobreza", "Rubi": "nobreza",
}
ACESSORIOS = [
    ("Anel de Cobre",            "Fio de Cobre",    4,   "Um aro simples. Diz que alguém deu, e é o bastante."),
    ("Pingente de Pedra Polida", "Pedra Polida",    12,   "Ágata num cordão de couro. Bonito o suficiente para ser lembrado."),
    ("Broche de Prata",          "Prata em Barra",  60,  "Prende a capa e diz de onde vem quem a veste."),
    ("Anel de Ametista",         "Ametista",        84,  "Roxo num aro de prata. Discreto de longe, inconfundível de perto."),
    ("Colar de Ouro",            "Ouro em Barra",   420, "Elos grossos. Pesa no pescoço e no julgamento de quem olha."),
    ("Anel de Rubi",             "Rubi",            280, "Uma pedra, um aro. Quem o usa não se apresenta — é apresentado."),
]

MARGEM_MIN = 0.70
MARGEM_MAX = 0.75
ORDEM_TIER = {"Comum": 1, "Incomum": 2, "Raro": 3}

PRECO_TECIDO = {n: p for n, _t, p, _pub, _d in TECIDOS}
TIER_TECIDO = {n: t for n, t, _p, _pub, _d in TECIDOS}
PUBLICO_TECIDO = {n: pub for n, _t, _p, pub, _d in TECIDOS}
PRECO_MATERIAL = {n: p for n, _t, p, _d in MATERIAIS}
TIER_MATERIAL = {n: t for n, t, _p, _d in MATERIAIS}

# Quanto tecido cada corte gasta. É o que define o custo da roupa.
METROS_POR_CORTE = {"túnica": 2, "camisa": 2, "colete": 2, "vestido": 3, "casaco": 3, "traje": 4}
# Um acessório gasta uma unidade do material e uma de Fio de Cobre (o aro).
def custo_da_roupa(tecido, corte):
    return PRECO_TECIDO[tecido] * METROS_POR_CORTE[corte]

def custo_do_acessorio(material):
    return PRECO_MATERIAL[material] + (0 if material == "Fio de Cobre" else PRECO_MATERIAL["Fio de Cobre"])

def receita_da_roupa(tecido, corte):
    return [(tecido, METROS_POR_CORTE[corte])]

def receita_do_acessorio(material):
    if material == "Fio de Cobre":
        return [("Fio de Cobre", 1)]
    return [(material, 1), ("Fio de Cobre", 1)]
