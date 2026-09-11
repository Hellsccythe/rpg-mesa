# -*- coding: utf-8 -*-
"""Gera docs/alimentos.html a partir de alimentos_dados.py."""
import io
import sys

sys.path.insert(0, ".")
import alimentos_dados as d

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/alimentos.html")

COR_TIER = {"Comum": "zinc", "Incomum": "emerald", "Raro": "sky"}


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def selo(texto, cor):
    return f'<span class="selo selo-{cor}">{esc(texto)}</span>'


def receita_em_texto(receita):
    return " + ".join(f"{q}× {esc(n)}" for n, q in receita)


def por_pv_da_pocao(tier):
    _n, preco, dado, pct = d.POCAO_EQUIVALENTE[tier]
    return preco / (d.media_do_dado(dado) + d.PV_REFERENCIA * pct)


# ── A escada de qualidade ─────────────────────────────────────────────────
def bloco_escada():
    linhas = []
    for tier in ("Comum", "Incomum", "Raro"):
        dado, pct = d.CURA_BEMFEITO[tier]
        preparo, refeicao = d.TEMPO_POR_TIER[tier]
        linhas.append(
            f'<tr><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num">{d.DIFICULDADE_POR_TIER[tier]}</td>'
            f'<td class="mono fraco">{d.CURA_MALFEITO}</td>'
            f'<td class="mono ok">{dado} + {int(pct * 100)}%</td>'
            f'<td class="num">{d.cura_media_bemfeito(tier):.1f} PV</td>'
            f'<td class="num fraco">{preparo} min</td>'
            f'<td class="num fraco">{refeicao} min</td></tr>')
    return "\n".join(linhas)


# ── Pratos ────────────────────────────────────────────────────────────────
def bloco_pratos():
    partes = []
    for tier in ("Comum", "Incomum", "Raro"):
        pratos = [p for p in d.PRATOS if p[1] == tier]
        if not pratos:
            continue
        dado, pct = d.CURA_BEMFEITO[tier]
        cura = d.cura_media_bemfeito(tier)
        partes.append(
            f'<h3>{tier} <span class="conta">— {len(pratos)} pratos · '
            f'bem feito cura {dado} + {int(pct * 100)}% · Cozinha DC '
            f'{d.DIFICULDADE_POR_TIER[tier]}</span></h3>')
        partes.append('<table><thead><tr>'
                      '<th style="width:19%">Prato</th>'
                      '<th class="num" style="width:7%">Preço</th>'
                      '<th class="num" style="width:8%">pr por PV</th>'
                      '<th style="width:17%">Se bem feito, também</th>'
                      '<th>Descrição e receita</th></tr></thead><tbody>')
        for nome, _t, preco, social, descricao, receita in sorted(pratos, key=lambda p: p[2]):
            custo = d.custo_da_receita(receita)
            if social:
                rotulo, _det = d.EFEITOS_SOCIAIS[social]
                celula_social = f'<span class="social">{esc(rotulo)}</span>'
            else:
                celula_social = '<span class="fraco">—</span>'
            partes.append(
                f'<tr><td><strong>{esc(nome)}</strong></td>'
                f'<td class="num preco">{preco}</td>'
                f'<td class="num fraco">{preco / cura:.2f}</td>'
                f'<td>{celula_social}</td>'
                f'<td>{esc(descricao)}'
                f'<div class="mono fraco">{receita_em_texto(receita)}'
                f' = {custo} pr ({custo / preco:.0%})</div></td></tr>')
        partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Ingredientes ──────────────────────────────────────────────────────────
def bloco_ingredientes(lista, titulo):
    uso = {}
    for p in d.PRATOS:
        for nome, _q in p[5]:
            uso[nome] = uso.get(nome, 0) + 1

    partes = [f'<h3>{esc(titulo)} <span class="conta">— {len(lista)}</span></h3>']
    partes.append('<table><thead><tr>'
                  '<th style="width:20%">Ingrediente</th>'
                  '<th style="width:9%">Tier</th>'
                  '<th class="num" style="width:8%">Preço</th>'
                  '<th class="num" style="width:9%">Pratos</th>'
                  '<th>Descrição</th></tr></thead><tbody>')
    for nome, tier, preco, descricao in lista:
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="num preco">{preco}</td>'
            f'<td class="num fraco">{uso.get(nome, 0)}</td>'
            f'<td class="fraco">{esc(descricao)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


# ── Comida contra poção ───────────────────────────────────────────────────
def bloco_comparacao():
    linhas = []
    for tier in ("Comum", "Incomum", "Raro"):
        pratos = [p for p in d.PRATOS if p[1] == tier]
        if not pratos:
            continue
        nome_pocao, preco_pocao, dado_pocao, pct_pocao = d.POCAO_EQUIVALENTE[tier]
        cura_pocao = d.media_do_dado(dado_pocao) + d.PV_REFERENCIA * pct_pocao
        cura_prato = d.cura_media_bemfeito(tier)
        mais_barato = min(pratos, key=lambda p: p[2])
        vantagem = 1 - (mais_barato[2] / cura_prato) / (preco_pocao / cura_pocao)
        linhas.append(
            f'<tr><td>{selo(tier, COR_TIER[tier])}</td>'
            f'<td class="fraco">{esc(nome_pocao)}</td>'
            f'<td class="num">{preco_pocao}</td>'
            f'<td class="num">{cura_pocao:.1f} PV</td>'
            f'<td class="num">{preco_pocao / cura_pocao:.2f}</td>'
            f'<td><strong>{esc(mais_barato[0])}</strong></td>'
            f'<td class="num">{mais_barato[2]}</td>'
            f'<td class="num">{cura_prato:.1f} PV</td>'
            f'<td class="num ok">{mais_barato[2] / cura_prato:.2f}</td>'
            f'<td class="ok">{vantagem:.0%} mais barato</td></tr>')
    return "\n".join(linhas)


# ── Efeitos sociais ───────────────────────────────────────────────────────
def bloco_sociais():
    partes = ['<table><thead><tr>'
              '<th style="width:22%">Efeito</th>'
              '<th style="width:24%">Sai de</th>'
              '<th>Como funciona</th></tr></thead><tbody>']
    for chave, (rotulo, detalhe) in d.EFEITOS_SOCIAIS.items():
        pratos = [p[0] for p in d.PRATOS if p[3] == chave]
        partes.append(
            f'<tr><td><span class="social">{esc(rotulo)}</span></td>'
            f'<td class="fraco">{esc(", ".join(pratos))}</td>'
            f'<td class="fraco">{esc(detalhe)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


ESTILO = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0;
          --alt:#f5f6f9; --dest:#6b4a12; --destbg:#fdf6e9; --alerta:#8c2f2f;
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
  .social { display:inline-block; padding:0.8pt 5pt; border-radius:2.5pt; font-size:7.2pt;
            font-weight:650; background:#f2e9f7; color:#5b3a7a; }
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
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.6pt; background:var(--alt); padding:0.5pt 3pt; border-radius:2pt; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Alimentos e Cozinha — Caminho Sem Volta</title>
<style>{ESTILO}</style>
</head>
<body>

<section class="capa">
  <div class="selo0">Catálogo de Cozinha</div>
  <h1>Alimentos</h1>
  <div class="sub">A cura que não cabe numa luta</div>
  <div class="meta">
    {len(d.PRATOS)} pratos &middot; {len(d.VEGETAIS)} vegetais &middot; {len(d.CARNES)} carnes<br>
    RPG de Mesa — Caminho Sem Volta &middot; setembro de 2026
  </div>
</section>

<section class="pagina">
  <h2>1. Por que comida precisa existir</h2>

  <p>Poção de cura aplica <strong>Saturação Alquímica</strong>. Dois acúmulos e a terceira poção não
  faz mais efeito — <em>por uma semana</em>. Essa condição está no banco desde a migration 080 e até
  agora não tinha resposta nenhuma: o personagem saturado simplesmente ficava sem cura.</p>

  <div class="bom">
    <p><strong>Alimento não satura.</strong> É a única cura que continua funcionando depois da segunda
    poção, e é isso que faz cozinhar deixar de ser enfeite. O grupo que gastou os frascos na masmorra
    precisa de uma noite e de um cozinheiro para voltar inteiro.</p>
  </div>

  <p>O preço disso é o tempo. A refeição leva de 10 a 30 minutos — mais que qualquer combate —, então
  comida <strong>nunca</strong> é usada em luta. Poção é para a emergência e custa caro por ponto de vida;
  comida é para o interlúdio e custa pouco. As duas não competem.</p>

  <h3>O que já existe e não precisou ser criado</h3>
  <table>
    <thead><tr><th class="num" style="width:6%">Estado</th><th>Item</th></tr></thead>
    <tbody>
      <tr><td class="num">✔</td><td>Perícia <strong>Cozinha</strong> (Ofício, Inteligência), id 6 no catálogo</td></tr>
      <tr><td class="num">✔</td><td><code>categoria_consumivel</code> já tem <strong>Alimento</strong> (migration 075), vazia</td></tr>
      <tr><td class="num">✔</td><td><code>receitas</code> tem <code>tempo_minutos</code>, <code>dificuldade</code> e <code>pericia_id</code></td></tr>
      <tr><td class="num">✔</td><td>Condição <strong>Saturação Alquímica</strong>, que dá razão ao sistema</td></tr>
      <tr><td class="num">✔</td><td><code>raridade.dificuldade_base</code> — 10/15/20, que são as DCs deste catálogo</td></tr>
      <tr><td class="num">—</td><td>Colunas de cura mal feito / bem feito, e o efeito social</td></tr>
      <tr><td class="num">—</td><td>Os {len(d.PRATOS)} pratos e os {len(d.INGREDIENTES)} ingredientes</td></tr>
    </tbody>
  </table>

  <div class="nota">
    <p><code>receitas.pericia_id</code> foi criado reservado na migration 077 e preenchido com Alquimia nas
    28 receitas de poção pela 083. Cozinha é a <strong>primeira perícia que não é Alquimia</strong> a
    aparecer numa receita — a coluna foi feita para isto.</p>
  </div>

  <h2>2. A escada de qualidade</h2>
  <p>O preparo é um teste de <strong>Cozinha contra a DC do tier do prato</strong>. Duas saídas, e a
  distância entre elas é o sistema inteiro:</p>

  <table>
    <thead><tr><th style="width:11%">Tier</th><th class="num" style="width:8%">DC</th>
    <th style="width:13%">Mal feito</th><th style="width:15%">Bem feito</th>
    <th class="num" style="width:11%">Cura média</th>
    <th class="num" style="width:11%">Preparo</th><th class="num" style="width:11%">Refeição</th></tr></thead>
    <tbody>{bloco_escada()}</tbody>
  </table>

  <div class="aviso">
    <p><strong>Mal feito cura {d.CURA_MALFEITO} e nada mais, não importa o que foi para a panela.</strong>
    Estragar um coelho custa 11 prata; estragar um Peito de Fênix Menor custa 240 — e os dois curam a mesma
    coisa. É o que faz um cozinheiro ruim não encostar em ingrediente raro, e o que dá peso a treinar Cozinha
    até o rank que vence a DC 20.</p>
  </div>

  <div class="nota">
    <p><strong>O tier do prato é o do ingrediente mais raro da receita</strong>, e não um número digitado à
    mão — o script recusa o catálogo se os dois discordarem. É assim que "mais nutritivo conforme a raridade"
    vira conta em vez de intenção: colocar carne de grifo num ensopado sobe a cura <em>e</em> a DC junto.</p>
    <p>A DC sai de <code>raridade.dificuldade_base</code>, a mesma coluna que já diz a dificuldade de
    fabricar poção e a de resistir a veneno. Uma escala servindo aos três.</p>
  </div>
</section>

<section class="pagina">
  <h2>3. Os pratos</h2>
  <p class="fraco">Preço em prata. A coluna <em>pr por PV</em> usa a cura média do tier num personagem de
  nível {d.NIVEL_REFERENCIA} ({d.PV_REFERENCIA} PV máx). A linha em monoespaçado é a receita e a proporção
  do preço que ela representa — o alvo do projeto é 70–75%.</p>
  {bloco_pratos()}
</section>

<section class="pagina">
  <h2>4. Ingredientes</h2>
  <p>Duas trilhas, e nenhuma delas se cruza com as {23} ervas de alquimia — quem cozinha e quem destila
  compram em lugares diferentes. <strong>Sobrevivência</strong> (Resistência) é a perícia que caça e colhe;
  <strong>Cozinha</strong> (Inteligência) é a que transforma. Duas perícias, duas pessoas, um jantar.</p>
  {bloco_ingredientes(d.VEGETAIS, "Vegetais e plantas")}
  {bloco_ingredientes(d.CARNES, "Carnes")}
</section>

<section class="pagina">
  <h2>5. Comida contra poção</h2>
  <p>A conta que sustenta o desenho: em todo tier, o prato mais barato cura por menos prata que a poção
  equivalente. Cozinhar sempre compensa para quem tem tempo.</p>

  <table>
    <thead><tr><th style="width:8%">Tier</th>
    <th style="width:16%">Poção</th><th class="num" style="width:6%">Custa</th>
    <th class="num" style="width:8%">Cura</th><th class="num" style="width:8%">pr/PV</th>
    <th style="width:18%">Prato mais barato</th><th class="num" style="width:6%">Custa</th>
    <th class="num" style="width:8%">Cura</th><th class="num" style="width:8%">pr/PV</th>
    <th>Vantagem</th></tr></thead>
    <tbody>{bloco_comparacao()}</tbody>
  </table>

  <div class="nota">
    <p>A poção continua ganhando no que importa numa luta: age numa ação, não em meia hora. O que ela perde
    é o longo prazo — e a saturação garante que o longo prazo sempre chega.</p>
  </div>

  <h2>6. Efeitos sociais</h2>
  <p>A segunda metade da recompensa por acertar o ponto, e a razão de um cozinheiro valer numa mesa que não
  luta. <strong>Só saem em prato bem feito</strong>, e valem para quem <em>partilhou</em> a refeição — nunca
  para quem só cozinhou. O efeito é da mesa, não do prato.</p>
  {bloco_sociais()}

  <div class="aviso">
    <p><strong>Os quatro pratos com efeito social são os únicos que podem custar mais por PV que a poção</strong>,
    porque não estão vendendo só cura. O script permite o prêmio até o dobro e o reporta — hoje o Banquete cobra
    34% a mais, e o Ensopado de Galinha ainda sai 30% <em>mais barato</em> mesmo dando +2 em Encanto.</p>
  </div>

  <h2>7. O que falta decidir</h2>
  <table>
    <thead><tr><th style="width:26%">Questão</th><th>Onde ela aperta</th></tr></thead>
    <tbody>
      <tr><td><strong>A escada de qualidade é geral, não é de comida</strong></td>
          <td>Mal feito / bem feito é o mesmo problema da ação de fabricar (tópico 8 do mapa de itens), que
          vale para poção, arma e armadura. Desenhar duas escadas separadas garante que elas divirjam.
          A recomendação é uma só, e cozinha é o caso concreto para desenhá-la.</td></tr>
      <tr><td><strong>Crítico e falha crítica</strong></td>
          <td>Hoje há duas saídas. Vale um terceiro degrau para acerto por 10 ou mais acima da DC — e um
          degrau abaixo, em que o prato estraga de vez e não cura nada?</td></tr>
      <tr><td><strong>Quantas porções</strong></td>
          <td>O Banquete serve seis; os outros onze não dizem. <code>consumiveis.usos</code> já existe e
          resolveria — mas então o preço por PV precisa ser dividido pelas porções.</td></tr>
      <tr><td><strong>Comida estraga?</strong></td>
          <td>Enguia Defumada aguenta viagem, Peixe de Rio é "duvidoso à tarde". Se validade virar regra,
          precisa de coluna; se ficar na descrição, fica com o mestre.</td></tr>
    </tbody>
  </table>

  <div class="nota">
    <p>Documento gerado de <code>alimentos_dados.py</code>, com as onze regras validadas por
    <code>verificar_alimentos.py</code> antes da geração. Para mudar um preço ou uma receita, edite os dados
    e regere — não edite o HTML.</p>
  </div>
</section>

</body>
</html>
"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
print(f"  {len(d.PRATOS)} pratos | {len(d.VEGETAIS)} vegetais | {len(d.CARNES)} carnes")
