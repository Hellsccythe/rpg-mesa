# -*- coding: utf-8 -*-
"""Gera docs/virtude_marcos.html a partir de virtude_marcos_dados.py."""
import io
import sys
from collections import Counter

sys.path.insert(0, ".")
import virtude_marcos_dados as m

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/.claude/worktrees/"
         "postgres-db-access-951e7e/docs/virtude_marcos.html")

TODAS = m.todas_as_classes()
MELHOR, PIOR = m.melhor_orcamento(), m.pior_orcamento()


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def tabela_classes(tier):
    linhas = []
    for nome, (marcos, total, t, nota) in sorted(TODAS.items(), key=lambda x: (-x[1][1], x[0])):
        if t != tier:
            continue
        classe = "alto" if total >= 10 else ("medio" if total >= 8 else "baixo")
        linhas.append(
            f"<tr><td><strong>{esc(nome)}</strong></td>"
            + "".join(f'<td class="c">{p}</td>' for p in marcos)
            + f'<td class="c total-{classe}">{total}</td>'
            + f'<td class="fraco small">{esc(nota)}</td></tr>')
    return "\n".join(linhas)


def tabela_eficiencia():
    linhas = []
    for r in range(1, 6):
        acc = m.custo(r)
        eficiencia = r * 3 / acc
        marca = ' class="ruim"' if r == 5 else ""
        linhas.append(f'<tr><td class="c">{r}</td><td class="c">{r}</td><td class="c">{acc}</td>'
                      f'<td class="c">+{r*3}</td><td class="c"{marca}>{eficiencia:.2f}</td></tr>')
    return "\n".join(linhas)


def tabela_builds():
    linhas = []
    for nome, ranks in [("Espalhado — o que o otimizador escolhe", [4, 4, 4, 4, 4]),
                        ("Meio-termo", [5, 4, 4, 3, 2]),
                        ("Especializado", [5, 5, 5, 1, 1])]:
        c = sum(m.custo(r) for r in ranks)
        b = sum(r * 3 for r in ranks)
        destaque = ' class="bomlinha"' if ranks == [4, 4, 4, 4, 4] else ""
        linhas.append(f"<tr{destaque}><td>{esc(nome)}</td><td class='c'>{ranks}</td>"
                      f"<td class='c'>{c}</td><td class='c'><strong>{b}</strong></td></tr>")
    return "\n".join(linhas)


contagem = Counter(t for _, t, _, _ in TODAS.values())

ESTILO = """
  @page { size: A4; margin: 15mm 12mm 17mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0;
          --alt:#f5f6f9; --dest:#7a3e12; --destbg:#fdf3e7; --alerta:#8c2f2f;
          --alertabg:#fcf0f0; --ok:#1f5c3d; --okbg:#eef7f1; }
  * { box-sizing:border-box; }
  body { margin:0; font:9.2pt/1.46 "Segoe UI","Helvetica Neue",Arial,sans-serif; color:var(--tinta); background:#fff; }
  h1,h2,h3,h4 { line-height:1.2; margin:0; font-weight:650; }
  h1 { font-size:24pt; letter-spacing:-0.4pt; }
  h2 { font-size:14.5pt; margin:20pt 0 8pt; padding-bottom:4pt; border-bottom:1.6pt solid var(--tinta); break-after:avoid; }
  h3 { font-size:11pt; margin:14pt 0 5pt; color:var(--dest); break-after:avoid; }
  h4 { font-size:9.6pt; margin:10pt 0 3pt; break-after:avoid; }
  p { margin:0 0 6pt; }
  ul,ol { margin:0 0 7pt; padding-left:15pt; } li { margin-bottom:2.5pt; }
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:0.88em; background:var(--alt); padding:0.5pt 2.5pt; border-radius:2pt; }
  table { width:100%; border-collapse:collapse; margin:5pt 0 10pt; font-size:8.2pt; }
  th,td { text-align:left; vertical-align:top; padding:3pt 4.5pt; border-bottom:0.6pt solid var(--linha); }
  th { background:var(--alt); border-bottom:1pt solid var(--linha2); font-weight:650; font-size:7.6pt;
       text-transform:uppercase; letter-spacing:0.3pt; color:var(--fraca); }
  tr { break-inside:avoid; }
  td.c,th.c { text-align:center; white-space:nowrap; }
  .fraco { color:var(--fraca); } .small { font-size:7.6pt; }
  .total-alto { background:#eef7f1; font-weight:650; color:#1f5c3d; }
  .total-medio { background:#f7f3e8; color:#7a5a12; }
  .total-baixo { color:var(--fraca); }
  .ruim { color:var(--alerta); font-weight:650; }
  .bomlinha { background:#fcf0f0; }
  .pagina { break-before:page; }
  .capa { padding-top:40mm; text-align:center; }
  .capa .sub { font-size:12pt; color:var(--fraca); margin-top:6pt; }
  .capa .meta { margin-top:24mm; font-size:8.6pt; color:var(--fraca); border-top:0.6pt solid var(--linha);
                padding-top:8pt; display:inline-block; min-width:84mm; }
  .capa .selo { display:inline-block; margin-bottom:10pt; padding:3pt 10pt; border:1pt solid var(--linha2);
                border-radius:12pt; font-size:8pt; letter-spacing:1.4pt; text-transform:uppercase; color:var(--fraca); }
  .nota,.aviso,.bom { padding:6pt 9pt; margin:7pt 0 10pt; border-left:2.4pt solid var(--dest);
                      background:var(--destbg); font-size:8.4pt; break-inside:avoid; }
  .aviso { border-left-color:var(--alerta); background:var(--alertabg); }
  .bom { border-left-color:var(--ok); background:var(--okbg); }
  .nota p:last-child,.aviso p:last-child,.bom p:last-child { margin-bottom:0; }
  .numerao { text-align:center; margin:10pt 0 12pt; break-inside:avoid; }
  .numerao .n { font-size:26pt; font-weight:650; letter-spacing:-1pt; }
  .numerao .r { font-size:8.2pt; color:var(--fraca); display:block; margin-top:2pt; }
  .grade3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0 12pt; }
  figure { margin:9pt 0 12pt; break-inside:avoid; }
  figcaption { font-size:7.8pt; color:var(--fraca); margin-top:4pt; text-align:center; }
  svg { display:block; margin:0 auto; max-width:100%; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8">
<title>Virtude por Marcos de Classe — Caminho Sem Volta</title>
<style>{ESTILO}</style></head>
<body>

<section class="capa">
  <div class="selo">Proposta de Balanceamento</div>
  <h1>Virtude por Marcos</h1>
  <div class="sub">Pontos a cada 5 níveis, ajustados por classe</div>
  <div class="meta">
    29 classes &middot; 20 marcos em 100 níveis<br>
    orçamento de {PIOR} a {MELHOR} pontos &middot; 9 de setembro de 2026
  </div>
</section>

<section class="pagina">
  <h2>1. A propriedade que faz o desenho funcionar</h2>

  <p>Cada classe concede pontos de Virtude em quatro marcos — níveis <strong>5, 10, 15 e 20 da classe</strong>.
  Quanto vale cada marco depende de quanto aquela classe é de combate.</p>

  <p>E há uma coisa elegante nisso que vale enunciar:</p>

  <div class="numerao">
    <span class="n">100 ÷ 5 = 20 marcos</span>
    <span class="r">não importa como os 100 níveis sejam divididos entre classes</span>
  </div>

  <table>
    <thead><tr><th>Como o jogador divide</th><th class="c">Níveis</th><th class="c">Marcos</th></tr></thead>
    <tbody>
      <tr><td>5 classes até o nível 20</td><td class="c">100</td><td class="c">20</td></tr>
      <tr><td>10 classes até o nível 10</td><td class="c">100</td><td class="c">20</td></tr>
      <tr><td>20 classes até o nível 5</td><td class="c">100</td><td class="c">20</td></tr>
    </tbody>
  </table>

  <div class="bom">
    <p><strong>O número de marcos é invariante.</strong> Quem espalha por dez classes não ganha mais marcos que
    quem se dedica a cinco — ganha os mesmos 20. O que muda é <em>quanto cada marco vale</em>, e isso depende
    de quais classes ele escolheu.</p>
    <p>Isso resolve, sozinho, o problema que derrubou a proposta anterior: o orçamento
    <strong>parou de multiplicar com o número de classes</strong>.</p>
  </div>

  <div class="nota">
    <p><strong>Um detalhe que premia terminar o que se começa:</strong> níveis abaixo do próximo marco não
    contam. Uma classe levada ao nível 7 dá o marco do 5 e desperdiça 2 níveis. Colecionar começos custa caro,
    e a distribuição dos pontos dentro da classe é crescente — os marcos 15 e 20 valem mais que o 5 e o 10.</p>
  </div>

  <h3>Os dois números do seu pedido</h3>
  <div class="grade3">
    <div class="numerao"><span class="n">{MELHOR}</span>
      <span class="r">melhor cenário — as 5 classes<br>mais generosas</span></div>
    <div class="numerao"><span class="n">{PIOR}</span>
      <span class="r">pior cenário — as 5<br>menos generosas</span></div>
    <div class="numerao"><span class="n">{MELHOR - PIOR}</span>
      <span class="r">de amplitude entre<br>duas fichas</span></div>
  </div>

  <p>O alvo era um máximo de <strong>{m.ALVO_MAXIMO}</strong>, e o desenho fecha exatamente nele. E como
  maximizar as cinco perícias custaria <strong>{m.TETO_ABSOLUTO}</strong> pontos,
  <strong>{MELHOR} &lt; {m.TETO_ABSOLUTO}</strong>: nunca satura, nenhum marco é desperdiçado, e o nível 100
  ainda acrescenta alguma coisa.</p>
</section>

<section class="pagina">
  <h2>2. Quanto cada classe concede</h2>

  <p>As colunas são os quatro marcos da classe. O <strong>total</strong> é o que ela entrega se for levada do
  nível 1 ao 20.</p>

  <h3>Classes Base</h3>
  <table>
    <thead><tr><th style="width:20%">Classe</th>
    <th class="c">Nv 5</th><th class="c">Nv 10</th><th class="c">Nv 15</th><th class="c">Nv 20</th>
    <th class="c" style="width:9%">Total</th><th>Perfil</th></tr></thead>
    <tbody>{tabela_classes("Base")}</tbody>
  </table>

  <h3>Classes Híbridas</h3>
  <p>O total da híbrida é a <strong>média dos totais das duas raízes</strong>, redistribuída pelos quatro
  marcos. Não é digitado: mudar uma raiz recalcula a linha.</p>
  <table>
    <thead><tr><th style="width:20%">Classe</th>
    <th class="c">Nv 5</th><th class="c">Nv 10</th><th class="c">Nv 15</th><th class="c">Nv 20</th>
    <th class="c" style="width:9%">Total</th><th>Raízes</th></tr></thead>
    <tbody>{tabela_classes("Híbrida")}</tbody>
  </table>

  <p class="fraco small">Distribuição dos totais:
  {' &middot; '.join(f'<strong>{t}</strong> pontos em {contagem[t]} classe(s)' for t in sorted(contagem, reverse=True))}</p>

  <div class="nota">
    <p><strong>Uma correção que a verificação forçou.</strong> A primeira versão fazia a média
    <em>marco a marco</em>, arredondando para cima. O arredondamento inflava tudo: Guerreiro (10) + Mago (6)
    saía com 10 — o mesmo de um Guerreiro puro. Resultado: <strong>17 das 29 classes empatavam no topo</strong>,
    e a escolha de classe quase não mexia no orçamento, o que é o oposto da diversidade que você queria.</p>
    <p>Pela média dos totais, Guerreiro + Mago dá 8, que é o que uma híbrida de guerreiro com conjurador deve
    valer. E a granularidade melhorou: os totais passaram a variar de 6 a 10 em vez de só 6, 8 e 10.</p>
  </div>
</section>

<section class="pagina">
  <h2>3. O problema que sobra: todo mundo vira 4/4/4/4/4</h2>

  <p>Os dois objetivos do seu pedido foram atingidos. Mas ao simular o que um jogador faria com o orçamento,
  apareceu uma coisa que nenhum dos dois cobre.</p>

  <h3>A curva de custo premia espalhar</h3>
  <table>
    <thead><tr><th class="c">Rank</th><th class="c">Custo do degrau</th><th class="c">Acumulado</th>
    <th class="c">Bônus</th><th class="c">Bônus por ponto gasto</th></tr></thead>
    <tbody>{tabela_eficiencia()}</tbody>
  </table>

  <p>O degrau do rank 5 custa <strong>5 pontos e dá +3</strong>. Começar uma perícia nova do zero custa
  <strong>1 ponto e dá +3</strong>. Espalhar é sempre mais eficiente que aprofundar.</p>

  <h3>O que isso faz com {MELHOR} pontos</h3>
  <table>
    <thead><tr><th>Build</th><th class="c">Ranks</th><th class="c">Custa</th><th class="c">Bônus somado</th></tr></thead>
    <tbody>{tabela_builds()}</tbody>
  </table>

  <div class="aviso">
    <p><strong>O espalhado ganha em tudo:</strong> maior bônus somado, gasta o orçamento inteiro e não deixa
    nenhuma perícia em zero. Um jogador que otimize chega a <code>4/4/4/4/4</code> — e o jogador ao lado
    também.</p>
    <p>Ou seja: o orçamento variar de {PIOR} a {MELHOR} <strong>diversifica quanto</strong>, mas não
    <strong>diversifica no quê</strong>. Duas fichas com {MELHOR} pontos ficam idênticas em combate,
    independentemente de o personagem ser um Guerreiro/Monge ou um Mago/Bruxo.</p>
  </div>

  <h3>Por que isso não é o mesmo problema de antes</h3>
  <p>A proposta anterior saturava — o ponto virava lixo no nível 37. Esta não satura, e nisso ela é
  claramente melhor. O que sobra é diferente: <strong>a identidade da classe em combate</strong>. Ela não se
  dissolve por excesso de pontos; dissolve porque nada impede o jogador de comprar um pouco de tudo.</p>
</section>

<section class="pagina">
  <h2>4. O que fecha o buraco</h2>

  <p>Três caminhos, e eles não se excluem.</p>

  <h3>A — Teto de rank por classe</h3>
  <p>O que estava na proposta anterior: a classe define até onde cada perícia pode subir. Um Mago não passa de
  Luta 1; um Guerreiro não conjura. O orçamento continua sendo o seu, com marcos — só que agora ele não pode
  ser gasto em qualquer lugar.</p>
  <div class="bom">
    <p><strong>É o caminho que eu recomendo</strong>, porque ataca a causa: o problema não é quanto o jogador
    tem, é que nada limita <em>onde</em> ele gasta. E combina com a sua proposta sem substituí-la — marcos
    decidem o quanto, tetos decidem o quê.</p>
    <p>Uma ressalva: os tetos que propus antes foram calibrados para 27 pontos. Com {MELHOR}, vários deixariam
    o jogador sem onde gastar — precisariam ser recalculados para a capacidade acompanhar o orçamento novo.</p>
  </div>

  <h3>B — Fazer o rank 5 valer a pena</h3>
  <p>Se o rank 5 desse algo além de +3 — margem de crítico ampliada, sucesso automático contra dificuldade
  Comum, um efeito de "mestre do ofício" — a conta de eficiência mudaria e especializar voltaria a competir.</p>
  <p class="fraco">Custa desenhar cinco benefícios novos, um por perícia. Mais trabalho, mas premia sem proibir.</p>

  <h3>C — Curva de custo mais dura no topo</h3>
  <p>Se o rank 5 custasse 8 em vez de 5 (custo acumulado 18), <code>4/4/4/4/4</code> continuaria ganhando —
  isso <em>piora</em> o problema. Para inverter a conta seria preciso encarecer os ranks BAIXOS, o que
  encarece começar perícia nova. Fica estranho de explicar na mesa.</p>
  <p class="fraco">Não recomendo: mexer na curva conserta o sintoma e quebra a legibilidade.</p>

  <h3>Comparando os três</h3>
  <table>
    <thead><tr><th style="width:14%">Caminho</th><th class="c" style="width:14%">Resolve?</th>
    <th class="c" style="width:14%">Trabalho</th><th>Efeito colateral</th></tr></thead>
    <tbody>
      <tr><td><strong>A — Teto</strong></td><td class="c">sim</td><td class="c">médio</td>
          <td>145 linhas de dado; precisa recalibrar para o orçamento novo</td></tr>
      <tr><td><strong>B — Rank 5 especial</strong></td><td class="c">em parte</td><td class="c">alto</td>
          <td>cinco regras novas para lembrar na mesa</td></tr>
      <tr><td><strong>C — Curva</strong></td><td class="c">não</td><td class="c">baixo</td>
          <td>piora o problema ou fica ilegível</td></tr>
    </tbody>
  </table>
</section>

<section class="pagina">
  <h2>5. Resumo e o que decidir</h2>

  <h3>O que a sua proposta resolve</h3>
  <table>
    <thead><tr><th class="c" style="width:8%"></th><th>Ponto</th></tr></thead>
    <tbody>
      <tr><td class="c">✔</td><td>O orçamento <strong>parou de multiplicar</strong> com o número de classes — 20 marcos, sempre</td></tr>
      <tr><td class="c">✔</td><td><strong>Nunca satura</strong>: {MELHOR} &lt; {m.TETO_ABSOLUTO}, e o nível 100 ainda vale alguma coisa</td></tr>
      <tr><td class="c">✔</td><td>Fichas <strong>diferentes entre si</strong> no total: de {PIOR} a {MELHOR} pontos</td></tr>
      <tr><td class="c">✔</td><td>O máximo bate <strong>exatamente nos {m.ALVO_MAXIMO}</strong> que você pediu</td></tr>
      <tr><td class="c">✔</td><td>Premia levar a classe até o fim — marcos crescentes, níveis parciais desperdiçados</td></tr>
    </tbody>
  </table>

  <h3>O que continua aberto</h3>
  <table>
    <thead><tr><th class="c" style="width:8%"></th><th>Ponto</th></tr></thead>
    <tbody>
      <tr><td class="c">—</td><td>Sem teto, o jogador otimizado converge para <code>4/4/4/4/4</code> e a classe some do combate</td></tr>
      <tr><td class="c">—</td><td>Os tetos da proposta anterior foram calibrados para 27 pontos e não servem para {MELHOR}</td></tr>
      <tr><td class="c">—</td><td>As raízes das 21 híbridas foram <strong>inferidas pelos nomes</strong> e precisam da sua conferência</td></tr>
    </tbody>
  </table>

  <h3>O que muda no banco, se aprovar</h3>
  <table>
    <thead><tr><th style="width:38%">O que</th><th>Como</th></tr></thead>
    <tbody>
      <tr><td><code>classes.pontos_virtude_por_nivel</code></td><td><strong>Sai.</strong> Não é por nível, é por marco</td></tr>
      <tr><td><code>classe_marco_virtude</code> <em>(nova)</em></td><td>classe_id + nível do marco + pontos — 4 linhas por classe, 116 no total</td></tr>
      <tr><td><code>data.periciaPointsVirtude</code></td><td>a segunda bolsa, creditada ao cruzar marco de classe</td></tr>
      <tr><td>Subir nível de classe</td><td>ao cruzar 5, 10, 15 ou 20, credita o que aquela classe concede</td></tr>
      <tr><td><code>classe_teto_virtude</code></td><td>só se você escolher o caminho A</td></tr>
    </tbody>
  </table>

  <div class="nota">
    <p>Documento gerado de <code>docs/virtude_marcos_dados.py</code>. Os totais das híbridas são calculados
    das raízes, não digitados — corrigir uma dupla recalcula a linha inteira.</p>
  </div>
</section>

</body></html>
"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
print(f"  {len(TODAS)} classes | orcamento {PIOR}-{MELHOR} | alvo {m.ALVO_MAXIMO}")
