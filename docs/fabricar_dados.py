# -*- coding: utf-8 -*-
"""A ação de fabricar: a escada de qualidade, o inventário que ela exige, e o
contrato do endpoint.

Fonte da verdade do PDF. As probabilidades da escada são calculadas daqui,
com a mesma fórmula de bônus de perícia que vive em pericia.model.ts.
"""

# ── A escada de qualidade ─────────────────────────────────────────────────
# Uma só, para todo ofício. Quatro saídas, decididas pela distância entre a
# rolagem (d20 + bônus da perícia) e a DC do tier do produto.
#
# Assimétrica de propósito: fracassar feio (−10) é mais fácil que brilhar
# (+15). Com +10 nos dois lados, rank 1 tirava obra-prima em 30% das poções
# Comuns — e a palavra deixava de significar alguma coisa.
MARGEM_DESASTRE = 10
MARGEM_OBRA_PRIMA = 15

RESULTADOS = [
    ("desastre",   "Desastre",   "rolagem ≤ DC − 10", "Nada é produzido. Os insumos consumidos se perdem; a ferramenta não."),
    ("malfeito",   "Mal feito",  "rolagem < DC",      "O item sai, no piso da categoria dele."),
    ("bemfeito",   "Bem feito",  "rolagem ≥ DC",      "O item sai como está no catálogo."),
    ("obra_prima", "Obra-prima", "rolagem ≥ DC + 15", "O item sai com o extra da categoria dele."),
]

# O que "piso" e "extra" significam em cada catálogo. O motor de fabricar não
# calcula nada disto: ele grava a QUALIDADE no item produzido, e cada
# catálogo diz o que ela vale. É assim que a escada é uma só e os efeitos são
# muitos.
PISO_E_EXTRA = [
    ("Poção", "Turva",
     "Aplica 1 acúmulo de Saturação Alquímica, mesmo não sendo de cura. A impureza satura.",
     "Límpida",
     "NÃO aplica Saturação Alquímica, mesmo sendo de cura. É a segunda resposta à saturação, depois da comida — e só sai da mão de quem domina o ofício."),
    ("Veneno", "Diluído",
     "Fortitude DC −5 para resistir.",
     "Concentrado",
     "Fortitude DC +5 para resistir."),
    ("Alimento", "Mal feito",
     "Cura 1d4, não importa o ingrediente. Sem efeito social. (Já definido no catálogo de alimentos.)",
     "Obra-prima",
     "+1 porção: alimenta mais um. O efeito social, se houver, vale para quem comer a porção extra também."),
    ("Roupa e acessório", "Mal feita",
     "Bônus social 0. A peça veste e não impressiona ninguém. (Já definido no catálogo de cosméticos.)",
     "Obra-prima",
     "+1 no bônus social. Uma Túnica de Linho obra-prima dá +2 diante da plebe."),
    ("Arma e armadura", "Tosca",
     "−1 no dado de dano (desce um passo na escada) ou −1 na defesa. Reservado: ainda não há receita de Ferraria.",
     "Obra-prima",
     "+1 passo no dado, ou +1 na defesa. Reservado."),
]

# ── O teto pelo ingrediente mais raro ─────────────────────────────────────
# "A escada de qualidade, com o teto travado pelo ingrediente mais raro" — a
# frase do mapa de itens. Fica verdadeira por construção: a qualidade é um
# modificador DENTRO do item do catálogo, nunca um salto de tier. Uma Poção de
# Cura Menor obra-prima é uma Poção de Cura Menor límpida, não uma Maior. O
# produto é o da receita; a receita já foi limitada pelos ingredientes dela.

# ── Quem pode tentar ──────────────────────────────────────────────────────
# Rank 0 não pode tentar — regra existente das perícias. Sem isso, quem tem
# Inteligência alta fabrica poções sem nunca ter estudado alquimia.
RANK_MINIMO = 1

# ── O inventário que a ação exige ─────────────────────────────────────────
# Hoje `data.inventory` é texto livre: {name: "o que o jogador digitou",
# quantity}. Sem ligação com o catálogo, "Erva de Sangue" é uma string, e a
# ação não tem como conferir "2× Erva de Sangue". Há também `quickInventory`
# (texto livre) e `equipamentos_iniciais` (com id, mas só de equipamentos).
#
# NENHUM personagem tem dado em nenhum dos três. Não há o que converter — o
# inventário estruturado substitui os três de uma vez.
ENTRADA_DE_INVENTARIO = [
    ("tabela",     "'itens' | 'consumiveis' | 'equipamentos'", "Qual catálogo. O mesmo par tabela+id de `receitas`."),
    ("id",         "INTEGER",                                    "A linha do catálogo. Nome, peso e valor vêm de lá — nunca copiados."),
    ("quantidade", "INTEGER ≥ 1",                                "Empilha se `itens.empilhavel`; senão, uma entrada por unidade."),
    ("qualidade",  "'malfeito' | 'bemfeito' | 'obra_prima' | null", "Só o que foi fabricado tem. Comprado é null — e vale como bem feito."),
    ("rapido",     "BOOLEAN",                                    "Na mochila rápida: à mão em combate. Substitui `quickInventory`."),
    ("equipado",   "BOOLEAN",                                    "Vestido ou empunhado. É de onde armadura e roupa serão lidas."),
]

# ── O contrato do endpoint ────────────────────────────────────────────────
ENDPOINT = "POST /api/personagens/:id/fabricar"
ENDPOINT_CORPO = [
    ("receita_id", "INTEGER", "obrigatório"),
    ("oficina_disponivel", "BOOLEAN", "opcional, default false — confirma que a ferramenta FIXA da receita está no lugar (há uma forja aqui?). Ferramenta portátil precisa estar no inventário; fixa, o mestre confirma."),
]

# As checagens, na ordem. Cada uma falha com uma mensagem que diz O QUE falta,
# não só que falhou.
CHECAGENS = [
    ("Dono ou mestre",              "garantirAcessoAoPersonagem — a mesma guarda de toda rota com :id."),
    ("Receita existe e está viva",  "404 se não."),
    ("Perícia com rank ≥ 1",        "Rank 0 não pode tentar. A mensagem diz qual perícia e qual rank o personagem tem."),
    ("Ferramentas",                 "Portáteis (peso ≤ 12 kg) no inventário; fixas exigem `oficina_disponivel`. Lista as que faltam."),
    ("Ingredientes consumidos",     "Cada `consumido = true` da receita, na quantidade, no inventário. Lista os que faltam e quanto."),
    ("Rolagem, no servidor",        "d20 + bonusDoTeste(rank, atributo) contra `receitas.dificuldade`. No servidor, como o dinheiro inicial: no cliente bastaria recarregar até sair 20."),
    ("Consumir e entregar, junto",  "Numa transação: tira os insumos, põe o produto com a qualidade, grava o log. Ou tudo, ou nada."),
]

RESPOSTA = [
    ("resultado",   "desastre | malfeito | bemfeito | obra_prima"),
    ("rolagem",     "{ d20, bonus, total, dificuldade } — a conta aberta, para a mesa conferir"),
    ("consumido",   "[{ tabela, id, nome, quantidade }]"),
    ("produzido",   "{ tabela, id, nome, quantidade, qualidade } ou null no desastre"),
    ("tempo_minutos", "o da receita — o mestre desconta do interlúdio"),
    ("personagem",  "o personagem atualizado, como toda rota de progressão devolve"),
]

# ── O log ─────────────────────────────────────────────────────────────────
# Cada tentativa fica gravada. É o que permite ao mestre ver quem fabricou o
# quê, e ao jogador provar que a obra-prima foi dele.
TABELA_LOG = [
    ("id",           "INTEGER PK IDENTITY"),
    ("character_id", "INTEGER → characters.id"),
    ("receita_id",   "INTEGER → receitas.id"),
    ("rolagem_d20",  "INTEGER 1–20"),
    ("bonus",        "INTEGER"),
    ("dificuldade",  "INTEGER"),
    ("resultado",    "VARCHAR(12) CHECK nos quatro"),
    ("created_at",   "TIMESTAMPTZ"),
    ("created_by",   "TEXT — quem apertou o botão, que pode ser o mestre"),
]

# ── Ordem de implementação ────────────────────────────────────────────────
ORDEM = [
    ("1", "Inventário estruturado",
     "`data.inventario` com a forma acima; onboarding grava nele em vez de `equipamentos_iniciais`; o Dashboard lê e escreve nele, com nome e peso vindos do catálogo. A mochila rápida vira o flag `rapido`. Sem isto nada abaixo existe.",
     "médio"),
    ("2", "Tabela `fabricacoes` e o endpoint",
     "As sete checagens, a rolagem no servidor, a transação. É a peça central e é curta: o trabalho está nas mensagens de erro dizerem o que falta.",
     "médio"),
    ("3", "O botão na tela de receitas",
     "Para o jogador: 'Fabricar', desabilitado com o motivo escrito quando falta algo. Para o mestre: o mesmo botão em nome de qualquer personagem.",
     "rápido"),
    ("4", "Qualidade visível",
     "O item no inventário e o card do consumível mostram a qualidade e o que ela vale naquela categoria — Turva, Límpida, Diluído, Concentrado.",
     "rápido"),
    ("5", "Cosméticos entram",
     "`itens.publico` e `itens.bonus_social`, categoria Tecido, e o catálogo aprovado. O flag `equipado` do passo 1 é de onde o bônus será lido.",
     "rápido"),
]


# ── A fórmula, espelhada de pericia.model.ts ──────────────────────────────
def bonus_do_teste(rank, atributo):
    return rank * 3 + min(atributo // 2, rank * 2)


def distribuicao(rank, atributo, dc):
    """% de cada saída para d20 + bônus contra a DC."""
    b = bonus_do_teste(rank, atributo)
    saidas = [0, 0, 0, 0]
    for d20 in range(1, 21):
        total = d20 + b
        if total <= dc - MARGEM_DESASTRE:
            saidas[0] += 5
        elif total < dc:
            saidas[1] += 5
        elif total < dc + MARGEM_OBRA_PRIMA:
            saidas[2] += 5
        else:
            saidas[3] += 5
    return saidas


ATRIBUTO_MEDIANO = 6
ATRIBUTO_ESPECIALISTA = 12
DIFICULDADES = [("Comum", 10), ("Incomum", 15), ("Raro", 20)]
