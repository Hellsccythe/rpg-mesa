# -*- coding: utf-8 -*-
"""Gera docs/fabricar.html a partir de fabricar_dados.py."""
import io
import sys

sys.path.insert(0, ".")
import fabricar_dados as d

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/fabricar.html")


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


COR_RESULTADO = {"desastre": "des", "malfeito": "mal", "bemfeito": "bem", "obra_prima": "obra"}


def bloco_escada():
    partes = ['<table><thead><tr><th style="width:14%">Resultado</th><th style="width:18%">Quando</th>'
              '<th>O que sai</th></tr></thead><tbody>']
    for chave, rotulo, quando, saida in d.RESULTADOS:
        partes.append(f'<tr><td><span class="res res-{COR_RESULTADO[chave]}">{esc(rotulo)}</span></td>'
                      f'<td class="mono">{esc(quando)}</td><td class="fraco">{esc(saida)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_probabilidades(atributo, titulo):
    partes = [f'<h3>{esc(titulo)} <span class="conta">— atributo base {atributo}</span></h3>']
    partes.append('<table><thead><tr><th style="width:7%">Rank</th><th class="num" style="width:8%">Bônus</th>')
    for nome, dc in d.DIFICULDADES:
        partes.append(f'<th style="width:28%">{esc(nome)} · DC {dc}</th>')
    partes.append('</tr></thead><tbody>')
    for rank in range(0, 6):
        b = d.bonus_do_teste(rank, atributo)
        celulas = []
        for _nome, dc in d.DIFICULDADES:
            des, mal, bem, obra = d.distribuicao(rank, atributo, dc)
            celulas.append(
                f'<td><span class="barra">'
                f'<span class="seg seg-des" style="width:{des}%" title="desastre {des}%"></span>'
                f'<span class="seg seg-mal" style="width:{mal}%" title="mal feito {mal}%"></span>'
                f'<span class="seg seg-bem" style="width:{bem}%" title="bem feito {bem}%"></span>'
                f'<span class="seg seg-obra" style="width:{obra}%" title="obra-prima {obra}%"></span>'
                f'</span><span class="mono fraco"> {des}/{mal}/{bem}/{obra}</span></td>')
        rotulo_rank = f'{rank}' + (' <span class="fraco">(não tenta)</span>' if rank == 0 else '')
        partes.append(f'<tr><td>{rotulo_rank}</td><td class="num">+{b}</td>{"".join(celulas)}</tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_piso_extra():
    partes = ['<table><thead><tr><th style="width:14%">Catálogo</th><th style="width:11%">Mal feito</th>'
              '<th style="width:29%">O que vale</th><th style="width:11%">Obra-prima</th><th>O que vale</th></tr></thead><tbody>']
    for cat, piso, piso_desc, extra, extra_desc in d.PISO_E_EXTRA:
        partes.append(f'<tr><td><strong>{esc(cat)}</strong></td>'
                      f'<td><span class="res res-mal">{esc(piso)}</span></td><td class="fraco">{esc(piso_desc)}</td>'
                      f'<td><span class="res res-obra">{esc(extra)}</span></td><td class="fraco">{esc(extra_desc)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def tabela_simples(linhas, cabecalhos, larguras):
    partes = ['<table><thead><tr>' + "".join(
        f'<th style="width:{l}%">{esc(c)}</th>' if l else f'<th>{esc(c)}</th>'
        for c, l in zip(cabecalhos, larguras)) + '</tr></thead><tbody>']
    for linha in linhas:
        celulas = [f'<td><strong>{esc(linha[0])}</strong></td>'] + [
            f'<td class="{"mono" if i == 1 else "fraco"}">{esc(v)}</td>' for i, v in enumerate(linha[1:], 1)]
        partes.append('<tr>' + "".join(celulas) + '</tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_ordem():
    partes = ['<table><thead><tr><th style="width:5%">#</th><th style="width:22%">Passo</th><th>O que é</th>'
              '<th style="width:8%">Tamanho</th></tr></thead><tbody>']
    for n, nome, desc, tamanho in d.ORDEM:
        partes.append(f'<tr><td class="num">{n}</td><td><strong>{esc(nome)}</strong></td>'
                      f'<td class="fraco">{esc(desc)}</td><td class="fraco">{esc(tamanho)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


ESTILO = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0; --alt:#f5f6f9;
          --dest:#1f4d7a; --destbg:#e9f1fa; --alerta:#8c2f2f; --alertabg:#fcf0f0; --ok:#1f5c3d; --okbg:#eef7f1; }
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
  .res { display:inline-block; padding:0.8pt 5pt; border-radius:2.5pt; font-size:7.2pt; font-weight:650; }
  .res-des{background:#fde8e8;color:#8c2f2f} .res-mal{background:#f4eee4;color:#7a5a1f}
  .res-bem{background:#e6f4ec;color:#1f5c3d} .res-obra{background:#e4f0fa;color:#1f4d7a}
  .barra { display:inline-flex; width:110pt; height:7pt; border-radius:2pt; overflow:hidden; vertical-align:middle; background:#eceef2; }
  .seg { display:block; height:100%; }
  .seg-des{background:#c94a4a} .seg-mal{background:#d9a441} .seg-bem{background:#3f9a6a} .seg-obra{background:#3b74b5}
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.6pt; background:var(--alt); padding:0.5pt 3pt; border-radius:2pt; }
  pre { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.4pt; background:var(--alt); padding:6pt 9pt;
        border-radius:3pt; margin:4pt 0 10pt; white-space:pre-wrap; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>A Ação de Fabricar — Caminho Sem Volta</title>
<style>{ESTILO}</style></head><body>

<section class="capa">
  <div class="selo0">Desenho de Sistema</div>
  <h1>A Ação de Fabricar</h1>
  <div class="sub">Uma escada de qualidade para todos os ofícios, e o inventário que ela exige</div>
  <div class="meta">4 resultados &middot; 5 catálogos &middot; 1 endpoint &middot; 1 tabela nova<br>
    RPG de Mesa — Caminho Sem Volta &middot; setembro de 2026</div>
</section>

<section class="pagina">
  <h2>1. Por que este documento vem antes de mais um catálogo</h2>
  <p>Quatro catálogos já usam <em>mal feito / bem feito</em>: poção e veneno de um jeito, comida de outro,
  roupa de um terceiro. Cada um foi desenhado com a régua certa — Cozinha contra DC 10/15/20, Costura idem — mas
  <strong>nenhum deles diz o que acontece quando o jogador aperta o botão</strong>. Não há botão. Não há
  inventário que a receita consiga ler. A regra existe em quatro PDFs e em nenhuma linha de código.</p>

  <div class="aviso">
    <p><strong>O que existe hoje em <code>characters.data</code>:</strong> <code>inventory</code> e
    <code>quickInventory</code> são texto livre — <code>{{name: "o que o jogador digitou", quantity}}</code>, sem
    ligação com o catálogo. "Erva de Sangue" ali é uma string, não <code>itens.id = 7</code>. E
    <code>equipamentos_iniciais</code> tem id, mas só de equipamento. A receita pede "2× Erva de Sangue" e não
    tem contra o que conferir.</p>
    <p><strong>Nenhum personagem tem dado em nenhum dos três.</strong> Não há o que converter. O inventário
    estruturado substitui os três de uma vez, sem migração de dado.</p>
  </div>

  <h2>2. A escada, uma só</h2>
  <p>A rolagem é <code>d20 + bônus da perícia</code> — a mesma conta de todo teste de perícia,
  <code>rank × 3 + min(⌊atributo ÷ 2⌋, rank × 2)</code> — contra a <strong>DC do tier do produto</strong>,
  que já está em <code>receitas.dificuldade</code>. A distância entre a rolagem e a DC decide uma de quatro saídas:</p>
  {bloco_escada()}

  <div class="nota">
    <p><strong>Assimétrica de propósito: −{d.MARGEM_DESASTRE} para o desastre, +{d.MARGEM_OBRA_PRIMA} para a
    obra-prima.</strong> Com ±10 nos dois lados, rank 1 tirava obra-prima em 30% das poções Comuns — um aprendiz
    com uma em cada três como obra-prima, e a palavra deixava de significar alguma coisa. Com +15, rank 1 tira 5%
    (sorte de principiante), rank 5 tira 70% das Comuns e 20% das Raras. Fracassar feio é mais fácil que brilhar.</p>
    <p><strong>O motor não calcula efeito nenhum.</strong> Ele grava a qualidade no item produzido; cada catálogo diz
    o que ela vale. É assim que a escada é uma só e os efeitos são cinco.</p>
  </div>

  <h3>O teto pelo ingrediente mais raro</h3>
  <p>A frase do mapa de itens fica verdadeira por construção: a qualidade é um modificador <em>dentro</em> do item do
  catálogo, nunca um salto de tier. Uma Poção de Cura Menor obra-prima é uma Poção de Cura Menor límpida — não é uma
  Maior. O produto é o da receita, e a receita já foi limitada pelos ingredientes dela.</p>
</section>

<section class="pagina">
  <h2>3. O que cada saída vale, por catálogo</h2>
  <p>Comida e roupa já tinham piso; poção e veneno ganham o deles aqui. Arma e armadura ficam reservados até
  existir receita de Ferraria.</p>
  {bloco_piso_extra()}

  <div class="bom">
    <p><strong>Poção límpida não satura.</strong> É a segunda resposta à Saturação Alquímica, depois da comida —
    e só sai da mão de um alquimista que tira obra-prima, o que a tabela abaixo mostra ser raro fora do rank 4.
    Um mestre alquimista passa a valer numa mesa pelo mesmo motivo que um mestre cozinheiro: é quem mantém o
    grupo de pé depois da segunda poção.</p>
  </div>

  <h2>4. As probabilidades, com a fórmula real</h2>
  <p>Cada célula é <em>desastre / mal feito / bem feito / obra-prima</em>, em %. Calculado com a mesma fórmula de
  bônus de <code>pericia.model.ts</code>. Rank 0 está na tabela só para mostrar o que a regra "não tenta" evita.</p>
  {bloco_probabilidades(d.ATRIBUTO_MEDIANO, "Personagem mediano")}
  {bloco_probabilidades(d.ATRIBUTO_ESPECIALISTA, "Especialista")}

  <div class="nota">
    <p><strong>O que a tabela diz:</strong> desastre só acontece tentando acima do próprio nível — rank 1 ou 2 num
    Raro, onde os insumos custam 300 prata e perdê-los dói. No próprio tier, rank 3 já não perde insumo e ainda não
    é confiável (35% mal feito no Raro). Rank 5 no próprio tier: 5% mal feito, 20% obra-prima. Rank 5 fazendo Comum:
    70% obra-prima — um mestre não faz trabalho simples que não seja perfeito.</p>
  </div>
</section>

<section class="pagina">
  <h2>5. O inventário estruturado</h2>
  <p><code>data.inventario</code>, uma lista de entradas com esta forma. Nome, peso e valor <strong>nunca são
  copiados</strong>: vêm do catálogo na hora de mostrar — é o mesmo princípio de <code>data.pericias</code>, que guarda
  o id e lê o resto.</p>
  {tabela_simples(d.ENTRADA_DE_INVENTARIO, ["Campo", "Tipo", "O que é"], [12, 30, 0])}

  <div class="nota">
    <p><strong>Substitui três coisas:</strong> <code>inventory</code>, <code>quickInventory</code> (vira o flag
    <code>rapido</code>) e <code>equipamentos_iniciais</code> (o onboarding passa a gravar aqui). O peso da barra
    de carga soma do catálogo em vez de vir copiado — e passa a contar itens e consumíveis, não só equipamento.</p>
    <p><strong><code>equipado</code> entra agora porque três desenhos já o pedem:</strong> a roupa de cosmético (de
    onde se lê o bônus social), a armadura (de onde se lê a defesa) e a arma (de onde se lê o dano). É um booleano.
    Quantas coisas podem estar equipadas ao mesmo tempo é regra de mesa, não coluna.</p>
  </div>

  <h2>6. O endpoint</h2>
  <pre>{esc(d.ENDPOINT)}</pre>
  {tabela_simples(d.ENDPOINT_CORPO, ["Campo", "Tipo", "Notas"], [16, 12, 0])}

  <h3>As sete checagens, na ordem</h3>
  <p>Cada uma falha com uma mensagem que diz <strong>o que falta</strong>, não só que falhou. "Faltam 1× Erva de
  Sangue e o Alambique" é o que o jogador precisa ler para saber o que ir buscar.</p>
  {tabela_simples(d.CHECAGENS, ["Checagem", "Como"], [22, 0])}

  <h3>A resposta</h3>
  {tabela_simples(d.RESPOSTA, ["Campo", "Conteúdo"], [16, 0])}

  <div class="aviso">
    <p><strong>A rolagem é no servidor, como o dinheiro inicial.</strong> No cliente bastaria recarregar a página até
    sair 20 — e uma obra-prima que qualquer um consegue não é obra-prima. Pelo mesmo motivo, consumir os insumos e
    entregar o produto acontecem numa transação: ou tudo, ou nada. Sem isso, um erro no meio deixaria o personagem
    sem os ingredientes e sem a poção.</p>
  </div>
</section>

<section class="pagina">
  <h2>7. O log: tabela <code>fabricacoes</code></h2>
  <p>Cada tentativa fica gravada. É o que permite ao mestre ver quem fabricou o quê e quando, e ao jogador provar
  que a obra-prima foi dele. Sem soft delete: é histórico, não cadastro.</p>
  {tabela_simples(d.TABELA_LOG, ["Coluna", "Tipo"], [18, 0])}

  <h2>8. Ferramenta fixa, ferramenta portátil</h2>
  <p>A regra do catálogo de ferramentas: acima de 12 kg a ferramenta é fixa. A ação trata as duas de jeito
  diferente, e é aqui que o peso vira código:</p>
  <table><thead><tr><th style="width:18%">Ferramenta</th><th style="width:22%">A ação exige</th><th>Por quê</th></tr></thead><tbody>
    <tr><td><strong>Portátil</strong> (≤ 12 kg)</td><td>estar no inventário</td>
        <td class="fraco">Alambique, panela, agulha. O jogador carrega, e se não carrega não tem.</td></tr>
    <tr><td><strong>Fixa</strong> (&gt; 12 kg)</td><td><code>oficina_disponivel: true</code> no pedido</td>
        <td class="fraco">Bigorna, tear. Ninguém carrega; a pergunta é "há uma forja aqui?", e quem responde é o mestre —
        ou o jogador, sob o olhar dele. A ação não tem como saber onde o personagem está.</td></tr>
  </tbody></table>

  <h2>9. Ordem de implementação</h2>
  {bloco_ordem()}

  <div class="nota">
    <p><strong>O passo 1 é o único grande, e é o que sustenta tudo.</strong> Os outros quatro são pequenos porque as
    peças já existem: <code>receitas</code> tem dificuldade, perícia e ingredientes com <code>consumido</code>;
    <code>bonusDoTeste</code> vive no servidor; a rolagem no servidor já tem precedente no dinheiro inicial; e a
    transação já tem precedente nos vínculos de consumível.</p>
    <p>Documento gerado de <code>fabricar_dados.py</code>. As probabilidades são calculadas, não digitadas — mudar
    uma margem na constante muda todas as tabelas.</p>
  </div>
</section>
</body></html>"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
