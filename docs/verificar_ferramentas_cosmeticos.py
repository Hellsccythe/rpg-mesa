# -*- coding: utf-8 -*-
"""Recusa os catálogos de ferramentas e cosméticos antes de virarem PDF ou migration."""
import sys

sys.path.insert(0, ".")
import ferramentas_dados as f
import cosmeticos_dados as c

erros, avisos = [], []
falha = erros.append
aviso = avisos.append

# Tudo que já existe em `itens`, para barrar colisão de nome.
JA_NO_BANCO = {
    "Água Pura", "Sal Mineral", "Folha de Menta Selvagem", "Cinza de Carvalho", "Raiz de Vigor",
    "Mel Silvestre", "Erva de Sangue", "Lágrima de Resina", "Musgo Luminoso", "Cogumelo do Silêncio",
    "Flor da Meia-Noite", "Glândula de Víbora", "Escama de Salamandra", "Óleo Sacro", "Raiz de Carne",
    "Coração de Mandrágora", "Pó de Estrela Caída", "Sangue de Basilisco",
    "Baba de Sapo-Pedra", "Semente de Cicuta", "Espinho de Arraia", "Fungo do Afogado", "Olho de Corvo Cego",
    "Nabo do Campo", "Cevada Rústica", "Repolho de Inverno", "Pimenta das Brasas", "Cogumelo Real",
    "Trufa de Raiz Negra", "Arroz da Colheita Única", "Açafrão de Altar", "Fruto da Árvore Velha",
    "Carne de Coelho", "Peixe de Rio", "Galinha de Terreiro", "Lombo de Javali", "Enguia do Fundo",
    "Cervo das Brumas", "Carne de Grifo", "Costela de Wyvern", "Peito de Fênix Menor",
}

# ═══ FERRAMENTAS ════════════════════════════════════════════════════════════
nomes = [t[0] for t in f.FERRAMENTAS]
for nome in set(nomes):
    if nomes.count(nome) > 1:
        falha(f"ferramenta repetida: {nome}")
    if nome in JA_NO_BANCO:
        falha(f"ferramenta '{nome}' colide com item existente")

for nome, oficio, preco, peso, desc in f.FERRAMENTAS:
    if oficio not in f.OFICIOS:
        falha(f"{nome}: ofício desconhecido '{oficio}'")
    if not (f.PRECO_MIN <= preco <= f.PRECO_MAX):
        falha(f"{nome}: preço {preco} fora de {f.PRECO_MIN}–{f.PRECO_MAX}")
    if peso <= 0:
        falha(f"{nome}: peso inválido")

for oficio in f.OFICIOS:
    quantas = sum(1 for t in f.FERRAMENTAS if t[1] == oficio)
    if quantas < 2:
        falha(f"ofício {oficio} tem só {quantas} ferramenta(s)")

for oficio, lista in f.FERRAMENTAS_POR_OFICIO.items():
    for nome in lista:
        if nome not in nomes:
            falha(f"FERRAMENTAS_POR_OFICIO: '{nome}' não existe")
for nome in f.COZINHA_NO_FOGO_DIRETO:
    if nome not in nomes:
        falha(f"COZINHA_NO_FOGO_DIRETO: '{nome}' não existe")

# ═══ COSMÉTICOS ═════════════════════════════════════════════════════════════
todos_cosmeticos = ([t[0] for t in c.TECIDOS] + [m[0] for m in c.MATERIAIS]
                    + [r[0] for r in c.ROUPAS] + [a[0] for a in c.ACESSORIOS])
for nome in set(todos_cosmeticos):
    if todos_cosmeticos.count(nome) > 1:
        falha(f"cosmético repetido: {nome}")
    if nome in JA_NO_BANCO or nome in nomes:
        falha(f"cosmético '{nome}' colide com item existente")

for nome, tier, preco, publico, desc in c.TECIDOS:
    if publico not in c.PUBLICOS:
        falha(f"tecido {nome}: público desconhecido '{publico}'")

# Roupas: tecido existe, corte existe, margem, e o tier É o do tecido.
for nome, tecido, corte, preco, desc in c.ROUPAS:
    if tecido not in c.PRECO_TECIDO:
        falha(f"{nome}: tecido desconhecido '{tecido}'"); continue
    if corte not in c.METROS_POR_CORTE:
        falha(f"{nome}: corte desconhecido '{corte}'"); continue
    custo = c.custo_da_roupa(tecido, corte)
    prop = custo / preco
    if prop > 1:
        falha(f"{nome}: costurar custa MAIS que comprar ({custo} contra {preco})")
    elif not (c.MARGEM_MIN <= prop <= c.MARGEM_MAX):
        falha(f"{nome}: margem {prop:.0%} fora de 70–75% (custo {custo}, preço {preco} — sugerido {round(custo / 0.72)})")

# Acessórios: idem.
for nome, material, preco, desc in c.ACESSORIOS:
    if material not in c.PRECO_MATERIAL:
        falha(f"{nome}: material desconhecido '{material}'"); continue
    if material not in c.PUBLICO_DO_MATERIAL:
        falha(f"{nome}: material '{material}' sem público")
    custo = c.custo_do_acessorio(material)
    prop = custo / preco
    if prop > 1:
        falha(f"{nome}: fabricar custa MAIS que comprar ({custo} contra {preco})")
    elif not (c.MARGEM_MIN <= prop <= c.MARGEM_MAX):
        falha(f"{nome}: margem {prop:.0%} fora de 70–75% (custo {custo}, preço {preco} — sugerido {round(custo / 0.72)})")

# Cobertura: cada público tem pelo menos uma roupa; cada tier tem tecido.
for chave in c.PUBLICOS:
    if not any(c.PUBLICO_TECIDO[r[1]] == chave for r in c.ROUPAS):
        falha(f"público {chave} sem roupa nenhuma")
for tier in ("Comum", "Incomum", "Raro"):
    if not any(t[1] == tier for t in c.TECIDOS):
        falha(f"tier {tier} sem tecido")

# Roupa de nobreza tem de custar mais que roupa de plebe — é o preço que
# separa os públicos, não só a etiqueta.
mais_cara_plebe = max(r[3] for r in c.ROUPAS if c.PUBLICO_TECIDO[r[1]] == "plebe")
mais_barata_nobreza = min(r[3] for r in c.ROUPAS if c.PUBLICO_TECIDO[r[1]] == "nobreza")
if mais_barata_nobreza <= mais_cara_plebe:
    falha(f"a roupa de nobreza mais barata ({mais_barata_nobreza}) não passa a de plebe mais cara ({mais_cara_plebe})")

# ═══ Relatório ══════════════════════════════════════════════════════════════
print("=" * 78)
print(f"{len(f.FERRAMENTAS)} ferramentas · {len(c.TECIDOS)} tecidos · {len(c.ROUPAS)} roupas · "
      f"{len(c.MATERIAIS)} materiais · {len(c.ACESSORIOS)} acessórios")
print("=" * 78)

print("\n── Ferramentas por ofício ─────────────────────────────────────────────────")
for oficio in f.OFICIOS:
    lista = [t for t in f.FERRAMENTAS if t[1] == oficio]
    total = sum(t[2] for t in lista)
    print(f"  {oficio:<12} {total:>4} pr o kit  " + ", ".join(
        f"{t[0]} ({t[2]}{'·fixa' if t[3] > f.PESO_QUE_NAO_SE_CARREGA else ''})" for t in lista))

print("\n── Roupas ─────────────────────────────────────────────────────────────────")
for nome, tecido, corte, preco, desc in c.ROUPAS:
    tier = c.TIER_TECIDO[tecido]
    pub = c.PUBLICO_TECIDO[tecido]
    custo = c.custo_da_roupa(tecido, corte)
    print(f"  {nome:<24} {tier:<8} {c.PUBLICOS[pub][0]:<9} +{c.BONUS_POR_TIER[tier]}  "
          f"{preco:>4} pr  insumo {custo:>3} ({custo / preco:.0%})  DC {c.DIFICULDADE_POR_TIER[tier]}")

print("\n── Acessórios ─────────────────────────────────────────────────────────────")
for nome, material, preco, desc in c.ACESSORIOS:
    custo = c.custo_do_acessorio(material)
    print(f"  {nome:<26} {c.TIER_MATERIAL[material]:<8} {c.PUBLICOS[c.PUBLICO_DO_MATERIAL[material]][0]:<9} "
          f"+{c.BONUS_ACESSORIO}  {preco:>4} pr  insumo {custo:>3} ({custo / preco:.0%})")

print()
if avisos:
    print("AVISOS:")
    for a in avisos: print(f"  ! {a}")
    print()
if erros:
    print(f"REPROVADO — {len(erros)} problema(s):")
    for e in erros: print(f"  x {e}")
    sys.exit(1)
print("APROVADO.")
