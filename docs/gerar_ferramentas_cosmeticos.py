# -*- coding: utf-8 -*-
"""Gera docs/ferramentas.html e docs/cosmeticos.html a partir dos dados."""
import io
import sys

sys.path.insert(0, ".")
import ferramentas_dados as f
import cosmeticos_dados as c
import alimentos_dados as a

# Contado dos pratos reais, e não digitado: a primeira versão dizia 5/7 e o
# banco tinha 4/8.
PRATOS_NO_FOGO = [p[0] for p in a.PRATOS if any(k in p[0] for k in f.PALAVRAS_DE_FOGO_DIRETO)]
PRATOS_NA_PANELA = [p[0] for p in a.PRATOS if p[0] not in PRATOS_NO_FOGO]

PASTA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/")

COR_TIER = {"Comum": "zinc", "Incomum": "emerald", "Raro": "sky"}
COR_PUBLICO = {"plebe": "plebe", "qualquer": "qualquer", "nobreza": "nobreza"}


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def selo(texto, cor):
    return f'<span class="selo selo-{cor}">{esc(texto)}</span>'


ESTILO_BASE = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0;
          --alt:#f5f6f9; --dest:%s; --destbg:%s; --alerta:#8c2f2f;
          --alertabg:#fcf0f0; --ok:#1f5c3d; --okbg:#eef7f1; }
  * { box-sizing:border-box; }
  body { margin:0; font:8.8pt/1.45 "Segoe UI","Helvetica Neue",Arial,sans-serif; color:var(--tinta); background:#fff; }
  h1,h2,h3 { line-height:1.2; margin:0; font-weight:650; }
  h1 { font-size:26pt; letter-spacing:-0.4pt; }
  h2 { font-size:15pt; margin:20pt 0 8pt; padding-bottom:4pt; border-bottom:1.6pt solid var(--tinta); break-after:avoid; }
  h3 { font-size:11pt; margin:14pt 0 4pt; color:var(--dest); break-after:avoid; }
  h3 .conta { font-size:8.2pt; font-weight:400; color:var(--fraca); }
  p { margin:0 0 6pt; }
  table { width:100%%; border-collapse:collapse; margin:4pt 0 10pt; font-size:8pt; }
  th,td { text-align:left; vertical-align:top; padding:3.2pt 5pt; border-bottom:0.6pt solid var(--linha); }
  th { background:var(--alt); border-bottom:1pt solid var(--linha2); font-weight:650; font-size:7.4pt;
       text-transform:uppercase; letter-spacing:0.3pt; color:var(--fraca); }
  tr { break-inside:avoid; }
  td.num,th.num { text-align:right; white-space:nowrap; }
  .fraco { color:var(--fraca); }
  .mono { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.2pt; margin-top:2pt; }
  .preco { font-weight:650; color:#8a6a1f; }
  .ok { color:var(--ok); font-weight:650; }
  .alertatxt { color:var(--alerta); font-weight:650; }
  .pagina { break-before:page; }
  .capa { padding-top:34mm; text-align:center; }
  .capa .sub { font-size:12pt; color:var(--fraca); margin-top:6pt; }
  .capa .meta { margin-top:20mm; font-size:8.6pt; color:var(--fraca); border-top:0.6pt solid var(--linha);
                padding-top:8pt; display:inline-block; min-width:90mm; }
  .capa .selo0 { display:inline-block; margin-bottom:10pt; padding:3pt 10pt; border:1pt solid var(--linha2);
                 border-radius:12pt; font-size:8pt; letter-spacing:1.4pt; text-transform:uppercase; color:var(--fraca); }
  .nota,.aviso,.bom { padding:6pt 9pt; margin:7pt 0 10pt; border-left:2.4pt solid var(--dest);
                      background:var(--destbg); font-size:8.4pt; break-inside:avoid; }
  .aviso { border-left-color:var(--alerta); background:var(--alertabg); }
  .bom { border-left-color:var(--ok); background:var(--okbg); }
  .nota p:last-child,.aviso p:last-child,.bom p:last-child { margin-bottom:0; }
  .selo { display:inline-block; padding:0.8pt 5pt; border-radius:2.5pt; font-size:7.2pt; font-weight:650; }
  .selo-zinc{background:#eceef2;color:#4a505c} .selo-emerald{background:#e6f4ec;color:#1f5c3d}
  .selo-sky{background:#e4f0fa;color:#1f4d7a}
  .selo-plebe{background:#f4eee4;color:#7a5a1f} .selo-qualquer{background:#eceef2;color:#4a505c}
  .selo-nobreza{background:#f2e9f7;color:#5b3a7a}
  .fixa { color:#8c2f2f; font-size:7pt; font-weight:650; }
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.6pt; background:var(--alt); padding:0.5pt 3pt; border-radius:2pt; }
"""


# ═══════════════════════════════════════════════════════════════════════════
# FERRAMENTAS
# ═══════════════════════════════════════════════════════════════════════════
def bloco_ferramentas():
    partes = []
    for oficio in f.OFICIOS:
        lista = [t for t in f.FERRAMENTAS if t[1] == oficio]
        total = sum(t[2] for t in lista)
        partes.append(f'<h3>{esc(oficio)} <span class="conta">— {len(lista)} ferramentas · '
                      f'o kit completo custa {total} pr</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:20%">Ferramenta</th>'
                      '<th class="num" style="width:8%">Preço</th>'
                      '<th class="num" style="width:8%">Peso</th>'
                      '<th style="width:9%">Carrega?</th>'
                      '<th>Descrição</th></tr></thead><tbody>')
        for nome, _o, preco, peso, descricao in lista:
            fixa = peso > f.PESO_QUE_NAO_SE_CARREGA
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td class="num preco">{preco}</td>'
                f'<td class="num fraco">{peso:g} kg</td>'
                f'<td>{"<span class=fixa>Fixa</span>" if fixa else "<span class=fraco>Sim</span>"}</td>'
                f'<td class="fraco">{esc(descricao)}</td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_exigencias():
    partes = ['<table><thead><tr>'
              '<th style="width:16%">Receitas de</th>'
              '<th class="num" style="width:8%">Quantas</th>'
              '<th style="width:30%">Passam a exigir</th>'
              '<th>Regra</th></tr></thead><tbody>']
    partes.append(
        f'<tr><td><strong>Alquimia</strong></td><td class="num">44</td>'
        f'<td>{esc(" + ".join(f.FERRAMENTAS_POR_OFICIO["Alquimia"]))}</td>'
        f'<td class="fraco">Poção e veneno. Todas as 44, sem exceção — não há destilar sem alambique.</td></tr>')
    partes.append(
        f'<tr><td><strong>Cozinha</strong> (fogo direto)</td><td class="num">{len(PRATOS_NO_FOGO)}</td>'
        f'<td>{esc(" + ".join(f.COZINHA_NO_FOGO_DIRETO))}</td>'
        f'<td class="fraco">Os pratos com "{"", "".join(f.PALAVRAS_DE_FOGO_DIRETO)}" no nome: '
        f'assado, grelhado ou na brasa.</td></tr>')
    partes.append(
        f'<tr><td><strong>Cozinha</strong> (o resto)</td><td class="num">{len(PRATOS_NA_PANELA)}</td>'
        f'<td>{esc(" + ".join(f.FERRAMENTAS_POR_OFICIO["Cozinha"]))}</td>'
        f'<td class="fraco">Caldo, ensopado, torta, defumado.</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


HTML_F = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Ferramentas — Caminho Sem Volta</title>
<style>{ESTILO_BASE % ("#4a3a2a", "#f5f0ea")}</style></head><body>

<section class="capa">
  <div class="selo0">Catálogo de Ofícios</div>
  <h1>Ferramentas</h1>
  <div class="sub">O que a receita exige e não consome</div>
  <div class="meta">{len(f.FERRAMENTAS)} ferramentas &middot; {len(f.OFICIOS)} ofícios &middot; todas Comuns<br>
    RPG de Mesa — Caminho Sem Volta &middot; setembro de 2026</div>
</section>

<section class="pagina">
  <h2>1. Por que este catálogo é curto de propósito</h2>
  <p><code>receita_ingredientes.consumido = false</code> existe desde a migration 077 para a ferramenta: o
  item que a receita exige mas não gasta. Até aqui não havia <strong>uma</strong> cadastrada — nenhuma das
  44 receitas de Alquimia exigia alambique, e qualquer um com uma erva na mão destilava poção.</p>

  <div class="nota">
    <p><strong>Todas Comuns, e sem raridade.</strong> Ferramenta não é achado, é compra. Uma bigorna é cara porque
    pesa 45 kg de ferro, não porque é rara — qualquer cidade com ferreiro tem uma à venda. Dar raridade a
    ferramenta transformaria "quero fabricar" numa caçada, e o que se quer é que fabricar seja escolha de tempo e
    dinheiro, não de sorte.</p>
    <p><strong>Preço fixo, sem multiplicador.</strong> O mais barato ({min(t[2] for t in f.FERRAMENTAS)} pr) cabe no
    troco; o mais caro ({max(t[2] for t in f.FERRAMENTAS)} pr) é dois meses de salário de artesão. Nenhum kit inteiro
    passa de {max(sum(t[2] for t in f.FERRAMENTAS if t[1] == o) for o in f.OFICIOS)} pr.</p>
  </div>

  <h3>O peso é a regra que falta</h3>
  <p>A capacidade de carga é <code>2 + força × 2</code> kg. Um personagem de força 5 carrega 12 kg — e a bigorna
  pesa 45. Ela não se carrega: <strong>se instala</strong>, e fabricar exige ir até ela. É a diferença entre o
  alquimista que viaja com a mochila e o ferreiro que precisa de uma forja. Não há coluna "fixa": o peso já diz.</p>

  <h2>2. As ferramentas, por ofício</h2>
  {bloco_ferramentas()}
</section>

<section class="pagina">
  <h2>3. O que cada receita passa a exigir</h2>
  <p>Por ofício, e não receita a receita: 44 receitas de Alquimia exigem o mesmo alambique, e listar uma a uma
  seria 44 chances de esquecer uma. A migration lê <code>receitas.pericia_id</code> e insere a exigência.</p>
  {bloco_exigencias()}

  <div class="bom">
    <p><strong>Ferraria, Carpintaria, Costura e Joalheria ainda não têm receita nenhuma.</strong> As ferramentas
    entram agora para que a primeira receita de cada ofício já nasça exigindo o que deve — o catálogo de cosméticos
    traz as de Costura e Joalheria.</p>
  </div>

  <h2>4. O que falta para virar banco</h2>
  <table><thead><tr><th class="num" style="width:6%">Estado</th><th>Item</th></tr></thead><tbody>
    <tr><td class="num">✔</td><td><code>categoria_item</code> já tem <strong>Ferramenta</strong>, vazia</td></tr>
    <tr><td class="num">✔</td><td><code>receita_ingredientes.consumido</code> existe e a tela de receitas já o distingue</td></tr>
    <tr><td class="num">—</td><td>As {len(f.FERRAMENTAS)} ferramentas em <code>itens</code></td></tr>
    <tr><td class="num">—</td><td>As exigências nas 56 receitas existentes (44 de Alquimia, 12 de Cozinha)</td></tr>
    <tr><td class="num">—</td><td>A ação de fabricar conferir a ferramenta antes de rolar — hoje ninguém confere nada</td></tr>
  </tbody></table>

  <div class="nota"><p>Documento gerado de <code>ferramentas_dados.py</code>, validado por
  <code>verificar_ferramentas_cosmeticos.py</code>. Para mudar um preço, edite os dados e regere.</p></div>
</section>
</body></html>"""

io.open(PASTA + "ferramentas.html", "w", encoding="utf-8", newline="\n").write(HTML_F)
print(f"escrito: ferramentas.html ({len(f.FERRAMENTAS)} ferramentas)")


# ═══════════════════════════════════════════════════════════════════════════
# COSMÉTICOS
# ═══════════════════════════════════════════════════════════════════════════
def bloco_tecidos():
    partes = ['<table><thead><tr>'
              '<th style="width:16%">Tecido</th><th style="width:8%">Tier</th>'
              '<th class="num" style="width:7%">Preço/m</th><th style="width:10%">Público</th>'
              '<th class="num" style="width:9%">Bem feito</th><th>Descrição</th></tr></thead><tbody>']
    for nome, tier, preco, publico, descricao in c.TECIDOS:
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num preco">{preco}</td>'
            f'<td>{selo(c.PUBLICOS[publico][0], COR_PUBLICO[publico])}</td>'
            f'<td class="num ok">+{c.BONUS_POR_TIER[tier]}</td>'
            f'<td class="fraco">{esc(descricao)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_roupas():
    partes = []
    for publico in ("plebe", "qualquer", "nobreza"):
        lista = [r for r in c.ROUPAS if c.PUBLICO_TECIDO[r[1]] == publico]
        rotulo, desc = c.PUBLICOS[publico]
        partes.append(f'<h3>{esc(rotulo)} <span class="conta">— {len(lista)} peças · {esc(desc)}</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:18%">Peça</th><th style="width:8%">Tier</th>'
                      '<th class="num" style="width:7%">Preço</th><th class="num" style="width:6%">DC</th>'
                      '<th class="num" style="width:9%">Bem feita</th>'
                      '<th>Descrição e receita</th></tr></thead><tbody>')
        for nome, tecido, corte, preco, descricao in sorted(lista, key=lambda r: r[3]):
            tier = c.TIER_TECIDO[tecido]
            custo = c.custo_da_roupa(tecido, corte)
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td><td>{selo(tier, COR_TIER[tier])}</td>'
                f'<td class="num preco">{preco}</td><td class="num">{c.DIFICULDADE_POR_TIER[tier]}</td>'
                f'<td class="num ok">+{c.BONUS_POR_TIER[tier]}</td>'
                f'<td>{esc(descricao)}<div class="mono fraco">{c.METROS_POR_CORTE[corte]}m de {esc(tecido)}'
                f' = {custo} pr ({custo / preco:.0%}) · Costura</div></td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_materiais():
    partes = ['<table><thead><tr>'
              '<th style="width:16%">Material</th><th style="width:8%">Tier</th>'
              '<th class="num" style="width:7%">Preço</th><th style="width:10%">Público</th>'
              '<th>Descrição</th></tr></thead><tbody>']
    for nome, tier, preco, descricao in c.MATERIAIS:
        pub = c.PUBLICO_DO_MATERIAL[nome]
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num preco">{preco}</td><td>{selo(c.PUBLICOS[pub][0], COR_PUBLICO[pub])}</td>'
            f'<td class="fraco">{esc(descricao)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_acessorios():
    partes = ['<table><thead><tr>'
              '<th style="width:20%">Acessório</th><th style="width:8%">Tier</th>'
              '<th class="num" style="width:7%">Preço</th><th class="num" style="width:6%">DC</th>'
              '<th style="width:10%">Público</th><th>Descrição e receita</th></tr></thead><tbody>']
    for nome, material, preco, descricao in sorted(c.ACESSORIOS, key=lambda a: a[2]):
        tier = c.TIER_MATERIAL[material]
        pub = c.PUBLICO_DO_MATERIAL[material]
        custo = c.custo_do_acessorio(material)
        receita = " + ".join(f"{q}× {esc(n)}" for n, q in c.receita_do_acessorio(material))
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num preco">{preco}</td><td class="num">{c.DIFICULDADE_POR_TIER[tier]}</td>'
            f'<td>{selo(c.PUBLICOS[pub][0], COR_PUBLICO[pub])}</td>'
            f'<td>{esc(descricao)}<div class="mono fraco">{receita} = {custo} pr ({custo / preco:.0%}) · Joalheria</div></td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_matriz():
    """Roupa × plateia: o que acontece em cada cruzamento."""
    linhas = []
    for pub_roupa in ("plebe", "qualquer", "nobreza"):
        celulas = []
        for pub_plateia in ("plebe", "nobreza"):
            if pub_roupa == "qualquer":
                celulas.append('<td class="fraco">bônus do tecido, sem penalidade</td>')
            elif pub_roupa == pub_plateia:
                celulas.append('<td class="ok">bônus do tecido</td>')
            else:
                celulas.append(f'<td class="alertatxt">{c.PENALIDADE_PUBLICO_ERRADO}</td>')
        linhas.append(f'<tr><td>{selo(c.PUBLICOS[pub_roupa][0], COR_PUBLICO[pub_roupa])}</td>{"".join(celulas)}</tr>')
    return "\n".join(linhas)


HTML_C = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Cosméticos — Caminho Sem Volta</title>
<style>{ESTILO_BASE % ("#5b3a7a", "#f2e9f7")}</style></head><body>

<section class="capa">
  <div class="selo0">Catálogo de Costura e Joalheria</div>
  <h1>Cosméticos</h1>
  <div class="sub">O tecido decide quem a roupa impressiona; a qualidade decide quanto</div>
  <div class="meta">{len(c.TECIDOS)} tecidos &middot; {len(c.ROUPAS)} roupas &middot; {len(c.MATERIAIS)} materiais
    &middot; {len(c.ACESSORIOS)} acessórios<br>RPG de Mesa — Caminho Sem Volta &middot; setembro de 2026</div>
</section>

<section class="pagina">
  <h2>1. Duas perguntas, duas respostas</h2>
  <p>Uma roupa responde a duas perguntas separadas, e o desenho inteiro é manter as duas separadas:</p>
  <table><thead><tr><th style="width:22%">Pergunta</th><th style="width:22%">Quem responde</th><th>Como</th></tr></thead><tbody>
    <tr><td><strong>Quem ela impressiona?</strong></td><td>O <strong>tecido</strong></td>
        <td class="fraco">Linho e lã falam com a plebe; seda e brocado com a nobreza; algodão tingido é respeitável em todo lugar.
        Um casaco de seda e um vestido de seda falam com a mesma gente.</td></tr>
    <tr><td><strong>Quanto?</strong></td><td>A <strong>qualidade</strong></td>
        <td class="fraco">Costura contra a DC do tier. Bem feita, dá o bônus do tecido (+1/+2/+3). Mal feita, dá zero —
        seda mal costurada é um tecido caro num corpo. Não há penalidade por roupa malfeita: roupa malfeita é só roupa.</td></tr>
  </tbody></table>

  <div class="nota">
    <p><strong>É a mesma escada da cozinha, e da alquimia, e do veneno.</strong> Teste de ofício contra
    <code>raridade.dificuldade_base</code>; falhou, o item existe mas não rende; passou, rende o que o tier promete.
    Quarto uso da mesma régua — e a razão de a escada de qualidade precisar ser desenhada uma vez só, antes da ação de
    fabricar, em vez de uma por catálogo.</p>
  </div>

  <h3>Roupa certa na sala errada</h3>
  <p>Vestir seda na taverna ou linho no salão: a roupa fala com a plateia errada, e a plateia responde.</p>
  <table style="max-width:70%"><thead><tr><th style="width:24%">A roupa é de</th><th>Diante da plebe</th><th>Diante da nobreza</th></tr></thead>
  <tbody>{bloco_matriz()}</tbody></table>
  <p class="fraco">O bônus entra em {esc(", ".join(c.PERICIAS_AFETADAS))} — as mesmas da comida, e as duas fontes
  <strong>somam</strong>: uma é o que se veste, a outra é o que se serviu. Intimidação fica de fora (um colete de seda
  não assusta ninguém), Atuação também (disfarce é outra conversa).</p>

  <h2>2. Tecidos</h2>
  <p>Preço por metro. Uma túnica gasta 2, um vestido 3, um traje 4 — é isso que separa o preço da peça do preço do pano.</p>
  {bloco_tecidos()}
</section>

<section class="pagina">
  <h2>3. Roupas</h2>
  <p class="fraco">Tier, público e bônus vêm do tecido — calculados, não digitados; o verificador recusa uma peça que
  discorde do pano. A linha em monoespaçado é a receita e a proporção do preço (alvo 70–75%).</p>
  {bloco_roupas()}

  <div class="aviso">
    <p><strong>O Traje de Brocado custa {max(r[3] for r in c.ROUPAS)} prata — mais que a Nobreza começa com
    (572 em média).</strong> É de propósito: é a roupa que um nobre <em>compra</em>, não a que ele <em>tem</em>. E
    é o teto do catálogo por uma razão de jogo: +3 permanente em Diplomacia com a nobreza vale mais que qualquer
    banquete, e precisa custar de acordo.</p>
  </div>
</section>

<section class="pagina">
  <h2>4. Acessórios</h2>
  <p>Acessório dá <strong>+{c.BONUS_ACESSORIO} fixo</strong>, com o público do material — e <strong>só um conta por
  vez</strong>. A roupa é o argumento; o acessório é a vírgula. Sem esse limite, dez anéis valeriam mais que um traje.</p>
  <h3>Materiais <span class="conta">— {len(c.MATERIAIS)}</span></h3>
  {bloco_materiais()}
  <h3>Peças <span class="conta">— {len(c.ACESSORIOS)}, todas de Joalheria</span></h3>
  {bloco_acessorios()}

  <div class="nota">
    <p><strong>Ouro em Barra custa 300 — três moedas de ouro fundidas.</strong> Com o ouro a cem prata (migration
    092), o metal e a moeda voltam a bater: uma barra vale exatamente o que as moedas que a fizeram valiam, mais o
    trabalho de fundir. Um Colar de Ouro a 420 é uma peça que só nobre encomenda, e é o que o catálogo quer.</p>
  </div>

  <h2>5. O que falta decidir</h2>
  <table><thead><tr><th style="width:26%">Questão</th><th>Onde ela aperta</th></tr></thead><tbody>
    <tr><td><strong>Onde a roupa fica na ficha</strong></td>
        <td>Hoje não há "equipado" para cosmético — <code>data.equipamentos_iniciais</code> e
        <code>data.inventario</code> não distinguem o que se veste do que se carrega. Sem isso, o bônus não tem
        de onde ser lido. É a mesma pergunta que armadura vai fazer.</td></tr>
    <tr><td><strong>Duas colunas novas em <code>itens</code></strong></td>
        <td><code>publico</code> (plebe / qualquer / nobreza) e <code>bonus_social</code>. Tecido carrega os dois;
        roupa herda do tecido na receita. É pouco, e é o suficiente para a tela mostrar.</td></tr>
    <tr><td><strong>Categoria "Tecido"</strong></td>
        <td>Os oito tecidos e os seis materiais entram em <code>itens</code>. Tecido não é "Ingrediente" nem
        "Material Precioso" — vale uma categoria própria, curta, que é o que o mestre vai procurar.</td></tr>
    <tr><td><strong>A escada de qualidade, de uma vez</strong></td>
        <td>Quatro catálogos usam mal feito / bem feito. A ação de fabricar precisa nascer com a escada geral, e
        cosmético é o caso que mostra por quê: aqui a qualidade decide um bônus, não uma cura.</td></tr>
  </tbody></table>

  <div class="nota"><p>Documento gerado de <code>cosmeticos_dados.py</code>, validado por
  <code>verificar_ferramentas_cosmeticos.py</code> — que pegou 13 erros de margem na primeira rodada, sete deles em
  que costurar custava mais que comprar.</p></div>
</section>
</body></html>"""

io.open(PASTA + "cosmeticos.html", "w", encoding="utf-8", newline="\n").write(HTML_C)
print(f"escrito: cosmeticos.html ({len(c.ROUPAS)} roupas, {len(c.ACESSORIOS)} acessórios)")
