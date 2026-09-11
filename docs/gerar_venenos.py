# -*- coding: utf-8 -*-
"""Gera docs/venenos.html a partir de venenos_dados.py.

O documento nunca é escrito à mão: toda tabela sai dos dados já validados por
verificar_venenos.py, então não existe a possibilidade de o PDF contradizer o
catálogo.
"""
import io
import sys

sys.path.insert(0, ".")
import venenos_dados as d

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/venenos.html")

COR_TIER = {"Comum": "zinc", "Incomum": "emerald", "Raro": "sky"}
COR_CLASSE = {"mortifero": "mort", "sensorial": "sens",
              "debilitante": "debil", "farsante": "fars"}
COR_VIA = {"lamina": "lam", "ingestao": "ing", "contato": "cont"}


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def selo(texto, cor):
    return f'<span class="selo selo-{cor}">{esc(texto)}</span>'


def receita_em_texto(receita):
    return " + ".join(f"{q}× {esc(n)}" for n, q in receita)


def venenos_da_classe(chave):
    ordem = {"Comum": 1, "Incomum": 2, "Raro": 3}
    return sorted((v for v in d.VENENOS if v[2] == chave), key=lambda v: (ordem[v[1]], v[5]))


# ── As quatro classes ─────────────────────────────────────────────────────
def bloco_classes():
    partes = []
    for chave, (rotulo, descricao) in d.CLASSES.items():
        lista = venenos_da_classe(chave)
        partes.append(f'<h3>{esc(rotulo)} <span class="conta">— {len(lista)} venenos</span></h3>')
        partes.append(f'<p class="fraco">{esc(descricao)}</p>')
        partes.append('<table><thead><tr>'
                      '<th style="width:16%">Veneno</th>'
                      '<th style="width:7%">Tier</th>'
                      '<th style="width:8%">Via</th>'
                      '<th class="num" style="width:5%">Usos</th>'
                      '<th class="num" style="width:6%">Preço</th>'
                      '<th class="num" style="width:5%">DC</th>'
                      '<th style="width:11%">Aplica</th>'
                      '<th>Efeito e receita</th></tr></thead><tbody>')
        for nome, tier, classe, via, usos, preco, condicao, efeito, receita in lista:
            custo = d.custo_da_receita(receita)
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td>{selo(tier, COR_TIER[tier])}</td>'
                f'<td><span class="via via-{COR_VIA[via]}">{esc(d.VIAS[via][0])}</span></td>'
                f'<td class="num">{usos}</td>'
                f'<td class="num preco">{preco}</td>'
                f'<td class="num">{d.DIFICULDADE_POR_TIER[tier]}</td>'
                f'<td class="alvo">{esc(condicao)}</td>'
                f'<td>{esc(efeito)}'
                f'<div class="mono fraco">{receita_em_texto(receita)}'
                f' = {custo} pr ({custo / preco:.0%})</div></td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Condições novas ───────────────────────────────────────────────────────
def bloco_condicoes():
    partes = ['<table><thead><tr>'
              '<th style="width:14%">Condição</th>'
              '<th style="width:8%">Tier</th>'
              '<th style="width:10%">Categoria</th>'
              '<th style="width:12%">Duração</th>'
              '<th>Efeito</th>'
              '<th style="width:16%">Aplicada por</th></tr></thead><tbody>']
    for nome, tier, categoria, efeito, duracao, _janela, _se_nao in d.CONDICOES_NOVAS:
        quem = [v[0] for v in d.VENENOS if v[6] == nome]
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="cat">{esc(categoria)}</td>'
            f'<td class="fraco">{esc(duracao)}</td>'
            f'<td>{esc(efeito)}</td>'
            f'<td class="fraco">{esc(", ".join(quem)) or "—"}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Ingredientes novos ────────────────────────────────────────────────────
def bloco_ingredientes():
    uso = {}
    for v in d.VENENOS:
        for nome, _q in v[8]:
            uso[nome] = uso.get(nome, 0) + 1

    partes = ['<table><thead><tr>'
              '<th style="width:18%">Ingrediente</th>'
              '<th style="width:8%">Tier</th>'
              '<th class="num" style="width:8%">Preço</th>'
              '<th class="num" style="width:9%">Receitas</th>'
              '<th>Descrição</th></tr></thead><tbody>']
    for nome, tier, preco, descricao in d.INGREDIENTES_NOVOS:
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num preco">{preco}</td>'
            f'<td class="num fraco">{uso.get(nome, 0)}</td>'
            f'<td class="fraco">{esc(descricao)}</td></tr>')
    partes.append("</tbody></table>")

    reaproveitados = sorted(
        (n for n in uso if n in d.INGREDIENTES_EXISTENTES),
        key=lambda n: d.PRECO_INGREDIENTE[n])
    partes.append('<h3>Reaproveitados do catálogo de poções '
                  f'<span class="conta">— {len(reaproveitados)} dos 18</span></h3>')
    partes.append('<p class="fraco">A mesma glândula de víbora que dá o antídoto dá o veneno. '
                  'É o que a descrição dela sempre disse.</p>')
    partes.append('<table><thead><tr>'
                  '<th style="width:22%">Ingrediente</th>'
                  '<th class="num" style="width:8%">Preço</th>'
                  '<th class="num" style="width:9%">Receitas</th>'
                  '<th>Usado em</th></tr></thead><tbody>')
    for nome in reaproveitados:
        onde = [v[0] for v in d.VENENOS if any(i == nome for i, _q in v[8])]
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td class="num preco">{d.PRECO_INGREDIENTE[nome]}</td>'
            f'<td class="num fraco">{uso[nome]}</td>'
            f'<td class="fraco">{esc(", ".join(onde))}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Vias ──────────────────────────────────────────────────────────────────
def bloco_vias():
    partes = ['<table><thead><tr>'
              '<th style="width:12%">Via</th>'
              '<th class="num" style="width:8%">Venenos</th>'
              '<th style="width:16%">Serve em combate?</th>'
              '<th>Como funciona</th></tr></thead><tbody>']
    serve = {"lamina": "Sim", "ingestao": "Não", "contato": "Só preparado antes"}
    for chave, (rotulo, descricao) in d.VIAS.items():
        quantos = sum(1 for v in d.VENENOS if v[3] == chave)
        partes.append(
            f'<tr><td><span class="via via-{COR_VIA[chave]}">{esc(rotulo)}</span></td>'
            f'<td class="num">{quantos}</td>'
            f'<td class="{"ok" if chave == "lamina" else "fraco"}">{esc(serve[chave])}</td>'
            f'<td class="fraco">{esc(descricao)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Resumo ────────────────────────────────────────────────────────────────
def bloco_resumo():
    linhas = []
    for tier in ("Comum", "Incomum", "Raro"):
        venenos = [v for v in d.VENENOS if v[1] == tier]
        if not venenos:
            continue
        linhas.append(
            f'<tr><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num">{len(venenos)}</td>'
            f'<td class="num">{d.DIFICULDADE_POR_TIER[tier]}</td>'
            f'<td class="num preco">{min(v[5] for v in venenos)} – {max(v[5] for v in venenos)}</td>'
            f'<td class="fraco">{esc(", ".join(sorted({v[6] for v in venenos})))}</td></tr>')
    return "\n".join(linhas)


def bloco_defesa():
    """O que já existe contra cada veneno. Coluna vazia é buraco de propósito."""
    partes = ['<table><thead><tr>'
              '<th style="width:20%">Veneno</th>'
              '<th style="width:14%">Aplica</th>'
              '<th class="num" style="width:8%">Custa</th>'
              '<th style="width:22%">Antídoto que já existe</th>'
              '<th class="num" style="width:8%">Custa</th>'
              '<th>Diferença</th></tr></thead><tbody>']
    for nome, tier, classe, via, usos, preco, condicao, _ef, _rec in d.VENENOS:
        antidoto = d.ANTIDOTO_EXISTENTE.get(condicao)
        if antidoto:
            nome_a, preco_a = antidoto
            diferenca = preco - preco_a
            texto = (f'<span class="ok">+{diferenca} pr</span> — envenenar custa mais '
                     f'que se defender')
            celula_a, celula_pa = esc(nome_a), f'{preco_a}'
        else:
            texto = ('<span class="alertatxt">Nenhum antídoto no catálogo.</span> '
                     'Passa sozinho — é a classe farsante.')
            celula_a, celula_pa = '—', '—'
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td class="alvo">{esc(condicao)}</td>'
            f'<td class="num preco">{preco}</td>'
            f'<td class="fraco">{celula_a}</td>'
            f'<td class="num fraco">{celula_pa}</td>'
            f'<td class="fraco">{texto}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


ESTILO = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0;
          --alt:#f5f6f9; --dest:#5c2020; --destbg:#fbf0f0; --alerta:#8c2f2f;
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
  .mono { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.2pt; margin-top:2pt; }
  .preco { font-weight:650; color:#8a6a1f; }
  .ok { color:var(--ok); font-weight:650; }
  .alertatxt { color:var(--alerta); font-weight:650; }
  .cat { font-weight:600; font-size:7.6pt; }
  .alvo { font-size:7.6pt; font-style:italic; color:#8c2f2f; }
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
  .via { display:inline-block; padding:0.6pt 4pt; border-radius:2.5pt; font-size:7pt; font-weight:650; }
  .via-lam{background:#fde8e8;color:#8c2f2f} .via-ing{background:#f4eee4;color:#7a5a1f}
  .via-cont{background:#f2e9f7;color:#5b3a7a}
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.6pt; background:var(--alt); padding:0.5pt 3pt; border-radius:2pt; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Venenos — Caminho Sem Volta</title>
<style>{ESTILO}</style>
</head>
<body>

<section class="capa">
  <div class="selo0">Catálogo de Alquimia</div>
  <h1>Venenos</h1>
  <div class="sub">Mortíferos, Sensoriais, Debilitantes e Farsantes</div>
  <div class="meta">
    {len(d.VENENOS)} venenos &middot; {len(d.CONDICOES_NOVAS)} condições novas
    &middot; {len(d.INGREDIENTES_NOVOS)} ingredientes novos<br>
    RPG de Mesa — Caminho Sem Volta &middot; setembro de 2026
  </div>
</section>

<section class="pagina">
  <h2>1. O veneno é a poção com o sinal trocado</h2>

  <p>A máquina inteira já existe. A tabela <code>consumivel_condicao</code>, criada para dizer
  <em>"esta poção CURA Cegueira"</em>, passa a dizer <em>"este veneno INFLIGE Cegueira"</em> —
  a mesma linha de dado, com <code>acao = 'inflige'</code> em vez de <code>'cura'</code>.
  <code>categoria_consumivel</code> já tem <strong>Veneno</strong> desde a migration 075, e está vazia.</p>

  <div class="bom">
    <p><strong>O que isso compra:</strong> o antídoto que já existe contra uma condição vale contra
    <em>qualquer</em> veneno que a aplique, sem ninguém escrever essa ligação. Colírio de Visão Clara cura
    a cegueira venha ela de magia, de armadilha ou de <em>Cinza nos Olhos</em>. Nenhum caso especial.</p>
  </div>

  <h3>Resumo por tier</h3>
  <table>
    <thead><tr><th style="width:10%">Tier</th><th class="num" style="width:8%">Venenos</th>
    <th class="num" style="width:12%">Fortitude DC</th><th class="num" style="width:12%">Faixa de preço</th>
    <th>Condições aplicadas</th></tr></thead>
    <tbody>{bloco_resumo()}</tbody>
  </table>

  <h3>O teste para resistir</h3>
  <p>Um só, para o catálogo inteiro: <strong>Fortitude contra a DC do tier</strong> — 10, 15 ou 20. Passou,
  nada acontece; falhou, a condição se aplica com a duração dela.</p>
  <div class="nota">
    <p>A DC sai de <code>raridade.dificuldade_base</code>, a mesma coluna que já diz quanto custa
    <em>fabricar</em> algo daquele tier. Uma escala servindo aos dois lados, sem coluna nova — do mesmo jeito
    que a gravidade de uma condição já define a raridade do antídoto dela.</p>
    <p>Fortitude é perícia de <strong>Virtude</strong>, com Resistência como atributo base. Quem investiu em
    aguentar pancada aguenta veneno pelo mesmo ponto — que é o que a perícia deveria significar.</p>
  </div>

  <h2>2. Como o veneno chega no alvo</h2>
  <p>A via é o que decide se o veneno serve numa luta ou numa trama. É ela, e não o preço, que separa
  um frasco de uso imediato de um que exige uma cena inteira para aplicar.</p>
  {bloco_vias()}

  <div class="aviso">
    <p><strong>Só cinco dos dezesseis funcionam em combate.</strong> É de propósito: veneno que se joga em
    alguém no meio da iniciativa é só mais um dado de dano, e o catálogo viraria uma lista de armas caras.
    A ingestão e o contato existem para serem <em>planejados</em> — e é por isso que os efeitos mais duros
    do catálogo estão justamente neles.</p>
  </div>
</section>

<section class="pagina">
  <h2>3. As quatro classes</h2>
  <p class="fraco">Preço em prata. <code>DC</code> é o Fortitude para resistir. A linha em monoespaçado é a
  receita e a proporção do preço que ela representa — o alvo do projeto é 70–75%.</p>
  {bloco_classes()}
</section>

<section class="pagina">
  <h2>4. As quatro condições novas</h2>
  <p>As 20 que existem cobrem mortíferos, sensoriais e debilitantes inteiros. Quem precisa de vocabulário
  próprio é a classe <strong>farsante</strong>: o efeito dela não é o dano, é <em>o que as outras pessoas
  acreditam ao olhar</em>. Nenhuma condição existente diz isso.</p>
  {bloco_condicoes()}

  <div class="nota">
    <p><strong>Todas passam sozinhas, e nenhuma tira PV.</strong> É o que separa um farsante de um mortífero
    mal calibrado — e o script de verificação recusa o catálogo se um farsante aplicar condição que causa
    perda de vida, ou se uma dessas quatro tiver duração <em>"Permanente"</em> ou <em>"Até ser tratada"</em>.</p>
    <p>Cada uma traz a DC de <strong>Medicina</strong> que revela a farsa. É o contrapeso: um NPC competente
    desconfia, um coveiro apressado não.</p>
  </div>

  <h2>5. Ingredientes</h2>
  <p>Veneno não se faz com as ervas da poção de cura — cinco entram novos. Os outros são reaproveitados,
  e essa sobreposição é a parte interessante: quem compra os dois lados não levanta suspeita.</p>
  {bloco_ingredientes()}
</section>

<section class="pagina">
  <h2>6. Veneno contra antídoto</h2>
  <p>O catálogo foi calibrado para que <strong>envenenar nunca saia mais barato que se defender</strong>.
  Se o veneno custasse menos que o frasco que o anula, envenenar viraria a jogada barata e o antídoto
  viraria imposto — todo grupo andaria com um, e a decisão desapareceria.</p>
  {bloco_defesa()}

  <div class="aviso">
    <p><strong>Os quatro farsantes não têm antídoto, e isso é o desenho, não um buraco.</strong> Eles passam
    sozinhos em minutos, horas ou dias. Gastar um frasco Raro para encurtar um desmaio de dez minutos seria
    um mau negócio — e é exatamente por isso que a defesa contra um farsante não é alquimia, é
    <strong>Medicina</strong>: descobrir a tempo que o corpo no caixão está respirando.</p>
  </div>

  <h2>7. O que falta para isso virar banco</h2>
  <table>
    <thead><tr><th class="num" style="width:6%">Estado</th><th>Item</th></tr></thead>
    <tbody>
      <tr><td class="num">✔</td><td><code>categoria_consumivel</code> já tem <strong>Veneno</strong> (migration 075), vazia</td></tr>
      <tr><td class="num">✔</td><td><code>consumivel_condicao</code>, <code>condicoes</code> e <code>raridade</code> existem</td></tr>
      <tr><td class="num">✔</td><td><strong>Fortitude</strong> no catálogo de perícias, com Resistência como base</td></tr>
      <tr><td class="num">✔</td><td>As 12 condições que os venenos aplicam já estão cadastradas</td></tr>
      <tr><td class="num">—</td><td><strong>O CHECK de <code>consumivel_condicao.acao</code></strong> aceita só
          <code>'cura'</code> e <code>'previne'</code>. Precisa aceitar <code>'inflige'</code></td></tr>
      <tr><td class="num">—</td><td>Coluna de <strong>via</strong> em <code>consumiveis</code> — lâmina, ingestão ou contato</td></tr>
      <tr><td class="num">—</td><td>As {len(d.CONDICOES_NOVAS)} condições novas e os {len(d.INGREDIENTES_NOVOS)} ingredientes novos</td></tr>
      <tr><td class="num">—</td><td>Os {len(d.VENENOS)} venenos, suas receitas e seus vínculos</td></tr>
      <tr><td class="num">—</td><td>A tela de consumíveis mostrar <em>inflige</em> em vermelho, ao lado de cura e previne</td></tr>
    </tbody>
  </table>

  <div class="nota">
    <p>Documento gerado de <code>venenos_dados.py</code>, com as nove regras validadas por
    <code>verificar_venenos.py</code> antes da geração. Para mudar um preço ou uma receita, edite os dados e
    regere — não edite o HTML.</p>
  </div>
</section>

</body>
</html>
"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
print(f"  {len(d.VENENOS)} venenos | {len(d.CONDICOES_NOVAS)} condicoes novas | "
      f"{len(d.INGREDIENTES_NOVOS)} ingredientes novos")
