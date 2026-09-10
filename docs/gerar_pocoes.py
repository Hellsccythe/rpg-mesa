# -*- coding: utf-8 -*-
"""Gera docs/pocoes.html a partir de pocoes_dados.py.

O documento nunca é escrito à mão: toda tabela sai dos dados já validados,
então não existe a possibilidade de o PDF contradizer o catálogo.
"""
import io
import sys

sys.path.insert(0, ".")
import pocoes_dados as d

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/pocoes.html")

COR_TIER = {"Comum": "zinc", "Incomum": "emerald", "Raro": "sky"}
COR_CATEGORIA = {"Física": "#7a3e12", "Mental": "#5b3a7a", "Mágica": "#1f4d7a",
                 "Doença": "#7a1f2f", "Alquímica": "#1f5c3d"}
ROTULO_TIPO = {"vida": "Vida", "cura": "Cura", "prevencao": "Prevenção", "ampla": "Ampla"}


def esc(t):
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def selo(texto, cor):
    return f'<span class="selo selo-{cor}">{esc(texto)}</span>'


def receita_em_texto(receita):
    return " + ".join(f"{q}× {esc(n)}" for n, q in receita)


# ── Condições ─────────────────────────────────────────────────────────────
def bloco_condicoes():
    partes = []
    for tier in ("Comum", "Incomum", "Raro"):
        linhas = [c for c in d.CONDICOES if c[1] == tier]
        curas = {}
        for pn, pt, tipo, pr, cura, prev, ef, rec in d.POCOES:
            for cond in cura:
                curas.setdefault(cond, []).append(pn)

        partes.append(f'<h3>{tier} <span class="conta">— {len(linhas)} condições, DC {d.DIFICULDADE[tier]} para fabricar a cura</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:15%">Condição</th><th style="width:11%">Tipo</th>'
                      '<th style="width:34%">Efeito</th><th style="width:16%">Duração</th>'
                      '<th>Tratada por</th></tr></thead><tbody>')
        for nome, t, categoria, efeito, duracao in linhas:
            cor = COR_CATEGORIA[categoria]
            tratam = curas.get(nome, [])
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td><span class="cat" style="color:{cor}">{esc(categoria)}</span></td>'
                f'<td>{esc(efeito)}</td><td class="fraco">{esc(duracao)}</td>'
                f'<td class="fraco">{esc(", ".join(tratam)) if tratam else "—"}</td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Poções ────────────────────────────────────────────────────────────────
def bloco_pocoes():
    partes = []
    for tier in ("Comum", "Incomum", "Raro"):
        doTier = [p for p in d.POCOES if p[1] == tier]
        total = sum(p[3] for p in doTier)
        partes.append(
            f'<h3>{tier} <span class="conta">— {len(doTier)} poções · DC {d.DIFICULDADE[tier]} '
            f'· de {min(p[3] for p in doTier)} a {max(p[3] for p in doTier)} prata</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:19%">Poção</th><th style="width:9%">Tipo</th>'
                      '<th style="width:26%">Efeito</th><th style="width:26%">Receita</th>'
                      '<th class="num" style="width:6%">Ingr.</th>'
                      '<th class="num" style="width:7%">Preço</th>'
                      '<th class="num" style="width:6%">%</th></tr></thead><tbody>')
        for nome, t, tipo, preco, cura, prev, efeito, receita in doTier:
            custo = d.custo_da_receita(receita)
            pct = d.proporcao(preco, receita)
            alvo = ""
            if cura:
                alvo = f'<span class="alvo cura">cura {esc(", ".join(cura))}</span>'
            elif prev:
                alvo = f'<span class="alvo prev">previne {esc(", ".join(prev))}</span>'
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td><span class="tipo tipo-{tipo}">{ROTULO_TIPO[tipo]}</span></td>'
                f'<td>{esc(efeito)}{("<br>" + alvo) if alvo else ""}</td>'
                f'<td class="fraco mono">{receita_em_texto(receita)}</td>'
                f'<td class="num fraco">{custo}</td>'
                f'<td class="num preco">{preco}</td>'
                f'<td class="num ok">{pct}%</td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Ingredientes ──────────────────────────────────────────────────────────
def bloco_ingredientes():
    uso = {}
    for pn, pt, tipo, pr, cura, prev, ef, rec in d.POCOES:
        for n, q in rec:
            uso[n] = uso.get(n, 0) + 1

    partes = []
    for tier in ("Comum", "Incomum", "Raro"):
        linhas = [i for i in d.INGREDIENTES if i[1] == tier]
        partes.append(f'<h3>{tier} <span class="conta">— {len(linhas)} ingredientes</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:20%">Ingrediente</th>'
                      '<th class="num" style="width:8%">Preço</th>'
                      '<th class="num" style="width:9%">Receitas</th>'
                      '<th>Descrição</th></tr></thead><tbody>')
        for nome, t, preco, descricao in linhas:
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td class="num preco">{preco}</td>'
                f'<td class="num fraco">{uso.get(nome, 0)}</td>'
                f'<td class="fraco">{esc(descricao)}</td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_resumo():
    linhas = []
    for tier in ("Comum", "Incomum", "Raro"):
        conds = [c for c in d.CONDICOES if c[1] == tier]
        pocs = [p for p in d.POCOES if p[1] == tier]
        ings = [i for i in d.INGREDIENTES if i[1] == tier]
        linhas.append(
            f'<tr><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num">{len(conds)}</td><td class="num">{len(pocs)}</td>'
            f'<td class="num">{len(ings)}</td>'
            f'<td class="num">{d.DIFICULDADE[tier]}</td>'
            f'<td class="num preco">{min(p[3] for p in pocs)} – {max(p[3] for p in pocs)}</td></tr>')
    return "\n".join(linhas)


ESTILO = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0;
          --alt:#f5f6f9; --dest:#7a3e12; --destbg:#fdf3e7; --alerta:#8c2f2f;
          --alertabg:#fcf0f0; --ok:#1f5c3d; --okbg:#eef7f1; }
  * { box-sizing:border-box; }
  body { margin:0; font:8.8pt/1.45 "Segoe UI","Helvetica Neue",Arial,sans-serif; color:var(--tinta); background:#fff; }
  h1,h2,h3 { line-height:1.2; margin:0; font-weight:650; }
  h1 { font-size:26pt; letter-spacing:-0.4pt; }
  h2 { font-size:15pt; margin:20pt 0 8pt; padding-bottom:4pt; border-bottom:1.6pt solid var(--tinta); break-after:avoid; }
  h3 { font-size:11pt; margin:14pt 0 4pt; color:var(--dest); break-after:avoid; }
  h3 .conta { font-size:8.2pt; font-weight:400; color:var(--fraca); }
  p { margin:0 0 6pt; }
  table { width:100%; border-collapse:collapse; margin:4pt 0 10pt; font-size:8pt; }
  th,td { text-align:left; vertical-align:top; padding:3.2pt 5pt; border-bottom:0.6pt solid var(--linha); }
  th { background:var(--alt); border-bottom:1pt solid var(--linha2); font-weight:650; font-size:7.4pt;
       text-transform:uppercase; letter-spacing:0.3pt; color:var(--fraca); }
  tr { break-inside:avoid; }
  td.num,th.num { text-align:right; white-space:nowrap; }
  .fraco { color:var(--fraca); }
  .mono { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.4pt; }
  .preco { font-weight:650; color:#8a6a1f; }
  .ok { color:var(--ok); font-weight:650; }
  .cat { font-weight:600; font-size:7.6pt; }
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
  .tipo { display:inline-block; padding:0.6pt 4pt; border-radius:2.5pt; font-size:7pt; font-weight:650; }
  .tipo-vida{background:#fde8e8;color:#8c2f2f} .tipo-cura{background:#e6f4ec;color:#1f5c3d}
  .tipo-prevencao{background:#e4f0fa;color:#1f4d7a} .tipo-ampla{background:#f2e9f7;color:#5b3a7a}
  .alvo { font-size:7.2pt; font-style:italic; }
  .alvo.cura { color:#1f5c3d; } .alvo.prev { color:#1f4d7a; }
  figure { margin:8pt 0 12pt; break-inside:avoid; }
  figcaption { font-size:7.8pt; color:var(--fraca); margin-top:4pt; text-align:center; }
  svg { display:block; margin:0 auto; max-width:100%; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Condições, Poções e Ingredientes — Caminho Sem Volta</title>
<style>{ESTILO}</style>
</head>
<body>

<section class="capa">
  <div class="selo0">Catálogo de Alquimia</div>
  <h1>Condições, Poções e Ingredientes</h1>
  <div class="sub">RPG de Mesa — Caminho Sem Volta</div>
  <div class="meta">
    {len(d.CONDICOES)} condições &middot; {len(d.POCOES)} poções &middot; {len(d.INGREDIENTES)} ingredientes<br>
    Tiers Comum, Incomum e Raro &middot; 8 de setembro de 2026
  </div>
</section>

<section class="pagina">
  <h2>Como as três camadas se sustentam</h2>

  <p>Este catálogo tem uma ordem de leitura, e ela não é acidental. <strong>A condição vem primeiro</strong> —
  uma poção que cura Cegueira não significa nada até "Cegueira" existir com regra própria. Depois vem a poção,
  que é a resposta a ela. Por último o ingrediente, que existe porque uma receita pediu.</p>

  <p>Construir na ordem inversa produziria condições inventadas para justificar poções já batizadas, e
  ingredientes órfãos que nenhuma receita usa.</p>

  <figure>
  <svg viewBox="0 0 900 210" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Arial, sans-serif">
    <defs><marker id="s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#8a919e"/></marker></defs>

    <rect x="30" y="30" width="230" height="62" rx="5" fill="#fcf0f0" stroke="#d9b3b3"/>
    <text x="145" y="52" text-anchor="middle" font-size="12" font-weight="650">CONDIÇÃO</text>
    <text x="145" y="69" text-anchor="middle" font-size="8.5" fill="#5b6270">o que dá errado com o personagem</text>
    <text x="145" y="83" text-anchor="middle" font-size="8" fill="#8c2f2f">inflige: skill, veneno, armadilha, monstro</text>

    <rect x="335" y="30" width="230" height="62" rx="5" fill="#eef7f1" stroke="#a8c6b3"/>
    <text x="450" y="52" text-anchor="middle" font-size="12" font-weight="650">POÇÃO</text>
    <text x="450" y="69" text-anchor="middle" font-size="8.5" fill="#5b6270">a resposta a ela — cura ou previne</text>
    <text x="450" y="83" text-anchor="middle" font-size="8" fill="#1f5c3d">tier casa com o da condição</text>

    <rect x="640" y="30" width="230" height="62" rx="5" fill="#f5f6f9" stroke="#c3cad4"/>
    <text x="755" y="52" text-anchor="middle" font-size="12" font-weight="650">INGREDIENTE</text>
    <text x="755" y="69" text-anchor="middle" font-size="8.5" fill="#5b6270">o que a receita consome</text>
    <text x="755" y="83" text-anchor="middle" font-size="8" fill="#4a505c">soma 70–75% do preço de compra</text>

    <line x1="266" y1="61" x2="329" y2="61" stroke="#8a919e" stroke-width="1.4" marker-end="url(#s)"/>
    <text x="297" y="53" text-anchor="middle" font-size="7.5" fill="#5b6270">define</text>
    <line x1="571" y1="61" x2="634" y2="61" stroke="#8a919e" stroke-width="1.4" marker-end="url(#s)"/>
    <text x="602" y="53" text-anchor="middle" font-size="7.5" fill="#5b6270">exige</text>

    <rect x="30" y="120" width="840" height="66" rx="4" fill="#fdf3e7" stroke="#d9c3a3"/>
    <text x="48" y="141" font-size="9" font-weight="650" fill="#7a3e12">A espinha do catálogo: a gravidade da condição É a raridade da cura</text>
    <text x="48" y="158" font-size="8.4" fill="#5b6270">Uma condição Rara é rara porque o antídoto dela é difícil de achar E de fabricar — as duas coisas dizem a mesma verdade.</text>
    <text x="48" y="172" font-size="8.4" fill="#5b6270">Isso reaproveita a escala de raridade que já existe no banco, e a `dificuldade_base` dela já era a DC do teste de Alquimia.</text>
  </svg>
  <figcaption>As três camadas, e a regra que as amarra.</figcaption>
  </figure>

  <h3>Resumo por tier</h3>
  <table>
    <thead><tr><th style="width:14%">Tier</th><th class="num">Condições</th><th class="num">Poções</th>
    <th class="num">Ingredientes</th><th class="num">DC do teste</th><th class="num">Faixa de preço (prata)</th></tr></thead>
    <tbody>{bloco_resumo()}</tbody>
  </table>

  <div class="bom">
    <p><strong>Toda receita foi verificada por script</strong> contra quatro regras: margem de crafting entre 70 e 75%,
    tier da poção maior ou igual ao da condição que ela trata, nenhuma poção mais rara que seu ingrediente mais raro,
    e nenhuma condição sem tratamento. As {len(d.POCOES)} passam. O documento é gerado dos mesmos dados que o script
    valida, então não há como uma tabela aqui contradizer a conta.</p>
  </div>

  <div class="nota">
    <p><strong>Quatro tipos de poção.</strong>
    {' '.join(f'<span class="tipo tipo-{k}">{v}</span>' for k, v in ROTULO_TIPO.items())}
    &nbsp;— <em>Vida</em> devolve PV e não trata condição; <em>Cura</em> remove uma condição já sofrida;
    <em>Prevenção</em> dá imunidade por um tempo e se bebe <strong>antes</strong>;
    <em>Ampla</em> limpa mais de uma condição e é sempre a mais cara do seu tier.</p>
  </div>
</section>

<section class="pagina">
  <h2>1. Condições</h2>
  <p>O que pode dar errado com um personagem. Não são alvos de poção — são o que skills, venenos, armadilhas e
  monstros infligem. A poção é só uma das respostas; a perícia <strong>Medicina</strong> é outra, e o tempo é a terceira.</p>
  {bloco_condicoes()}

  <div class="nota">
    <p><strong>Duração importa tanto quanto o efeito.</strong> "Some sozinha em 1 turno" e "só sai com antídoto"
    são coisas muito diferentes — é a duração que decide se a poção vale o preço. Repare que nenhuma condição
    Comum é permanente, e nenhuma Rara passa sozinha.</p>
  </div>
</section>

<section class="pagina">
  <h2>2. Poções</h2>
  <p>A coluna <strong>Ingr.</strong> é o custo dos ingredientes; <strong>%</strong> é quanto isso representa do preço de
  compra. Todas ficam entre 70 e 75%, que é a margem do projeto: fabricar economiza, mas o suficiente para
  compensar tempo e risco — não o bastante para as lojas fecharem.</p>
  {bloco_pocoes()}
</section>

<section class="pagina">
  <h2>3. Ingredientes</h2>
  <p>A coluna <strong>Receitas</strong> conta em quantas poções o ingrediente aparece. Nenhum foi criado sem uso:
  cada um existe porque pelo menos uma receita o pediu.</p>
  {bloco_ingredientes()}

  <div class="nota">
    <p><strong>Poucos ingredientes, muitas combinações.</strong> {len(d.INGREDIENTES)} ingredientes sustentam
    {len(d.POCOES)} poções. Inventar uma erva exclusiva por poção teria inflado a tabela sem acrescentar decisão
    nenhuma — o interessante é o jogador precisar da <em>mesma</em> Erva de Sangue para três coisas diferentes e
    ter que escolher.</p>
  </div>

  <div class="bom">
    <p><strong>A terceira via da economia.</strong> Os preços acima são de <em>comprar</em> o ingrediente.
    Quem colhe a Erva de Sangue na beira do rio paga zero em moeda e paga em tempo — e é isso que faz um
    personagem coletor valer a pena. Comprar pronto é caro e imediato; comprar insumos e fabricar é ~72% e
    arriscado; colher e fabricar é lento e quase de graça.</p>
  </div>
</section>

<section class="pagina">
  <h2>4. O que falta para isso rodar</h2>

  <p>Este documento é o desenho. O que existe em banco hoje, e o que não:</p>

  <table>
    <thead><tr><th class="num" style="width:6%">Estado</th><th>Item</th></tr></thead>
    <tbody>
      <tr><td class="num">✔</td><td>Tabelas <code>consumiveis</code>, <code>itens</code>, <code>receitas</code> e <code>raridade</code></td></tr>
      <tr><td class="num">✔</td><td>Perícia <strong>Alquimia</strong> no catálogo, com Inteligência como atributo base</td></tr>
      <tr><td class="num">✔</td><td><code>raridade.dificuldade_base</code> — 10/15/20, que já são as DCs deste catálogo</td></tr>
      <tr><td class="num">✔</td><td>Poção de Cura Menor e seus dois ingredientes, já cadastrados</td></tr>
      <tr><td class="num">—</td><td><strong>Tabela <code>condicoes</code></strong> — não existe. É o primeiro passo</td></tr>
      <tr><td class="num">—</td><td>Vínculo <code>consumivel_condicao</code> (o que cada poção cura ou previne)</td></tr>
      <tr><td class="num">—</td><td>Os outros {len(d.POCOES) - 1} consumíveis e {len(d.INGREDIENTES) - 2} ingredientes</td></tr>
      <tr><td class="num">—</td><td><code>receitas.pericia_id</code> apontando para Alquimia — está nulo</td></tr>
      <tr><td class="num">—</td><td>A ação de fabricar: checar ingredientes, rolar, consumir, entregar</td></tr>
    </tbody>
  </table>

  <div class="aviso">
    <p><strong>A tabela de condições não é só para poções.</strong> Quem inflige condição é skill, veneno,
    armadilha e monstro. Se ela nascer como "a lista do que as poções curam", vai servir poção e mais nada — e
    o combate acabará com a própria lista, e as duas vão divergir.</p>
    <p>A prova de que isso é estrutural: <code>categoria_consumivel</code> já tem <strong>Veneno</strong>.
    Veneno é o espelho da poção — um inflige, o outro cura. Os dois têm que apontar para a mesma tabela.</p>
  </div>

  <div class="nota">
    <p>Documento gerado de <code>pocoes_dados.py</code>, com as quatro regras validadas por script antes da geração.
    Para mudar um preço ou uma receita, edite os dados e regere — não edite o HTML.</p>
  </div>
</section>

</body>
</html>
"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
print(f"  {len(d.CONDICOES)} condicoes | {len(d.POCOES)} pocoes | {len(d.INGREDIENTES)} ingredientes")
