# -*- coding: utf-8 -*-
"""Gera docs/hospedagem.html — opções de hospedagem com preços de 10/09/2026.

Preços vêm das fontes listadas no fim do documento. Câmbio do dia:
USD 5,13 e EUR 5,92. Os valores em reais são conversão, não preço cobrado
em real — variam com o câmbio e com a promoção do dia.
"""
import io

SAIDA = ("C:/Users/Hellsccythe/Documents/PROJETOS/rpg-mesa/"
         ".claude/worktrees/postgres-db-access-951e7e/docs/hospedagem.html")

USD = 5.13
EUR = 5.92


def brl(valor, moeda):
    taxa = {"USD": USD, "EUR": EUR, "BRL": 1.0}[moeda]
    return valor * taxa


# ── As opções ─────────────────────────────────────────────────────────────
# nome, familia, preço, moeda, período, região, o que cobre, prós, contras
OPCOES = [
    ("Casa + Cloudflare Tunnel", "casa", 0, "BRL", "mês",
     "onde a máquina estiver",
     "API, Postgres e uploads na sua máquina; o Tunnel expõe sem abrir porta",
     ["Custo zero de hospedagem — o Tunnel ficou gratuito de vez em julho de 2026, sem cobrança por banda",
      "Nenhuma porta aberta no roteador, HTTPS e proteção DDoS de graça",
      "É o que você já planejava, e é o mesmo docker compose de desenvolvimento"],
     ["Fica no ar enquanto sua luz e sua internet ficarem — queda em casa é queda do site",
      "Backup é problema seu: sem rotina de pg_dump e cópia dos uploads, um HD que morre leva a campanha",
      "Limite de 100 MB por requisição no plano grátis (avatar e PDF cabem; vídeo não)"]),

    ("Hostinger VPS (São Paulo)", "vps", 27.99, "BRL", "mês",
     "São Paulo",
     "Tudo numa VPS: docker compose com os três serviços",
     ["Data center em São Paulo — latência de dezenas de ms, não centenas",
      "Cobrado em real, sem câmbio; 1 vCPU, 4 GB, 50 GB NVMe, backup semanal incluso",
      "Suporte em português"],
     ["R$ 27,99 é o preço do ciclo ANUAL; a renovação sobe 40–60% depois do primeiro período",
      "1 vCPU compartilhada: suficiente para uma mesa, apertado se o app futuro pesar"]),

    ("DigitalOcean Droplet (São Paulo)", "vps", 6, "USD", "mês",
     "São Paulo",
     "Tudo numa VPS: docker compose com os três serviços",
     ["Mesmo preço em toda região — São Paulo custa igual a Nova York",
      "1 GB de RAM, 25 GB, 1 TB de tráfego; cobrança por segundo com teto mensal",
      "A documentação mais farta do mercado; tudo que você procurar já tem tutorial"],
     ["Cobrado em dólar — R$ 31 hoje, mais na próxima alta",
      "1 GB de RAM é o mínimo para Node + Postgres juntos; o próximo degrau é US$ 12",
      "Backup automático é adicional (20% do preço)"]),

    ("Vultr (São Paulo)", "vps", 6, "USD", "mês",
     "São Paulo",
     "Tudo numa VPS: docker compose com os três serviços",
     ["Data center em São Paulo, cobrança por hora",
      "Preço e recursos equivalentes ao DigitalOcean"],
     ["Cobrado em dólar; backup e proteção DDoS cobrados à parte",
      "Suporte só em inglês"]),

    ("Hetzner CX22 (Alemanha/Finlândia)", "vps", 3.79, "EUR", "mês",
     "Europa",
     "Tudo numa VPS: docker compose com os três serviços",
     ["O melhor hardware por euro que existe: 2 vCPU, 4 GB, 40 GB, 20 TB de tráfego",
      "R$ 22 por mês por uma máquina que aguenta o site e o app futuro folgados"],
     ["Servidor na Europa: ~200 ms de ida e volta para o Brasil. Numa mesa em tempo real isso se sente",
      "Reajuste de 20–30% anunciado para 2026; o preço acima já é o novo",
      "Cobrado em euro"]),

    ("Railway (PaaS)", "paas", 12, "USD", "mês (típico)",
     "EUA (us-west/us-east)",
     "API como serviço, Postgres gerenciado, volume para uploads",
     ["Deploy por git push; sem servidor para administrar",
      "Postgres gerenciado com backup"],
     ["Hobby é US$ 5 fixos + uso; um Postgres sempre ligado soma US$ 10–20. Total real: US$ 10–15",
      "Uploads em disco precisam de volume (US$ 0,15/GB) — o desenho do projeto guarda arquivo no disco",
      "Sem região no Brasil"]),

    ("Fly.io (PaaS)", "paas", 9, "USD", "mês (típico)",
     "São Paulo (GRU) disponível",
     "Máquina para a API, volume para uploads, Postgres gerenciado",
     ["Tem região em São Paulo — o único PaaS da lista com isso",
      "Máquina de 1 GB a US$ 5,92; volume a US$ 0,15/GB"],
     ["A conta cresce em peças: máquina + volume + Postgres + snapshots (novos em 2026) + egress",
      "Curva de aprendizado maior que uma VPS com docker compose"]),

    ("Oracle Cloud Always Free", "gratis", 0, "USD", "mês",
     "São Paulo disponível",
     "VPS ARM grátis: 2 OCPU, 12 GB — tudo numa máquina",
     ["Zero reais, com região em São Paulo, e hardware que sobra para o projeto"],
     ["Em junho de 2026 a Oracle CORTOU o free tier pela metade (era 4 OCPU/24 GB) sem anúncio, e mandou "
      "terminar instâncias acima do novo limite em agosto. Não é base para depender",
      "Capacidade esgotada com frequência: criar a instância pode levar dias de tentativa",
      "Exige cartão de crédito no cadastro"]),
]

# Frontend estático, à parte — serve com qualquer uma das opções acima.
FRONTEND = [
    ("Cloudflare Pages", 0, "BRL",
     "Banda ilimitada no grátis, uso comercial permitido, 500 builds/mês. Se a API estiver em casa, o site continua no ar mostrando 'servidor offline' em vez de sumir."),
    ("Vercel Hobby", 0, "BRL",
     "100 GB de banda/mês, só uso pessoal. É onde o projeto está hoje (vercel.json). Funciona; a Cloudflare é a mesma coisa sem o limite de banda."),
]

DOMINIO = [
    ("registro.br — .com.br", 40, "BRL", "ano", "O registro oficial brasileiro. Preço fixo em real, sem promoção e sem reajuste na renovação."),
    ("Cloudflare Registrar — .com", 10.5, "USD", "ano", "Vende a preço de custo, sem markup. Já fica na Cloudflare para o Tunnel e o Pages."),
]


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


COR_FAMILIA = {"casa": "casa", "vps": "vps", "paas": "paas", "gratis": "gratis"}
ROTULO_FAMILIA = {"casa": "Casa", "vps": "VPS", "paas": "PaaS", "gratis": "Grátis"}


def bloco_tabela():
    partes = ['<table><thead><tr>'
              '<th style="width:20%">Opção</th><th style="width:6%">Tipo</th>'
              '<th class="num" style="width:9%">Preço</th><th class="num" style="width:9%">≈ R$/mês</th>'
              '<th style="width:12%">Região</th><th>O que cobre</th></tr></thead><tbody>']
    for nome, fam, preco, moeda, periodo, regiao, cobre, _p, _c in OPCOES:
        em_reais = brl(preco, moeda)
        preco_txt = "grátis" if preco == 0 else f"{moeda} {preco:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") + f"/{periodo}"
        reais_txt = "0" if preco == 0 else f"{em_reais:,.0f}".replace(",", ".")
        partes.append(
            f'<tr><td><strong>{esc(nome)}</strong></td>'
            f'<td><span class="fam fam-{COR_FAMILIA[fam]}">{ROTULO_FAMILIA[fam]}</span></td>'
            f'<td class="num">{esc(preco_txt)}</td><td class="num preco">{reais_txt}</td>'
            f'<td class="fraco">{esc(regiao)}</td><td class="fraco">{esc(cobre)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_detalhes():
    partes = []
    for nome, fam, preco, moeda, periodo, regiao, cobre, pros, contras in OPCOES:
        partes.append(f'<h3>{esc(nome)} <span class="conta">— {ROTULO_FAMILIA[fam]} · {esc(regiao)}</span></h3>')
        partes.append('<div class="duas"><div><p class="rotulo ok">A favor</p><ul>')
        for p in pros:
            partes.append(f'<li>{esc(p)}</li>')
        partes.append('</ul></div><div><p class="rotulo alertatxt">Contra</p><ul>')
        for c in contras:
            partes.append(f'<li>{esc(c)}</li>')
        partes.append('</ul></div></div>')
    return "\n".join(partes)


def bloco_frontend():
    partes = ['<table><thead><tr><th style="width:22%">Serviço</th><th class="num" style="width:10%">Preço</th><th>Notas</th></tr></thead><tbody>']
    for nome, preco, moeda, nota in FRONTEND:
        partes.append(f'<tr><td><strong>{esc(nome)}</strong></td><td class="num preco">grátis</td><td class="fraco">{esc(nota)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


def bloco_dominio():
    partes = ['<table><thead><tr><th style="width:28%">Registrador</th><th class="num" style="width:12%">Preço</th><th class="num" style="width:10%">≈ R$/ano</th><th>Notas</th></tr></thead><tbody>']
    for nome, preco, moeda, periodo, nota in DOMINIO:
        partes.append(f'<tr><td><strong>{esc(nome)}</strong></td><td class="num">{moeda} {preco:.2f}/{periodo}</td>'
                      f'<td class="num preco">{brl(preco, moeda):.0f}</td><td class="fraco">{esc(nota)}</td></tr>')
    partes.append("</tbody></table>")
    return "\n".join(partes)


ESTILO = """
  @page { size: A4 landscape; margin: 12mm 12mm 14mm 12mm; }
  :root { --tinta:#16181d; --fraca:#5b6270; --linha:#d8dce3; --linha2:#aeb5c0; --alt:#f5f6f9;
          --dest:#1f5c3d; --destbg:#eef7f1; --alerta:#8c2f2f; --alertabg:#fcf0f0; --ok:#1f5c3d; --okbg:#eef7f1; }
  * { box-sizing:border-box; }
  body { margin:0; font:8.8pt/1.45 "Segoe UI","Helvetica Neue",Arial,sans-serif; color:var(--tinta); background:#fff; }
  h1,h2,h3 { line-height:1.2; margin:0; font-weight:650; }
  h1 { font-size:26pt; letter-spacing:-0.4pt; }
  h2 { font-size:15pt; margin:20pt 0 8pt; padding-bottom:4pt; border-bottom:1.6pt solid var(--tinta); break-after:avoid; }
  h3 { font-size:11pt; margin:14pt 0 4pt; color:var(--dest); break-after:avoid; }
  h3 .conta { font-size:8.2pt; font-weight:400; color:var(--fraca); }
  p { margin:0 0 6pt; }
  ul { margin:0 0 6pt 14pt; padding:0; } li { margin-bottom:2pt; }
  table { width:100%; border-collapse:collapse; margin:4pt 0 10pt; font-size:8pt; }
  th,td { text-align:left; vertical-align:top; padding:3.2pt 5pt; border-bottom:0.6pt solid var(--linha); }
  th { background:var(--alt); border-bottom:1pt solid var(--linha2); font-weight:650; font-size:7.4pt;
       text-transform:uppercase; letter-spacing:0.3pt; color:var(--fraca); }
  tr { break-inside:avoid; }
  td.num,th.num { text-align:right; white-space:nowrap; }
  .fraco { color:var(--fraca); }
  .preco { font-weight:650; color:#8a6a1f; }
  .ok { color:var(--ok); font-weight:650; }
  .alertatxt { color:var(--alerta); font-weight:650; }
  .rotulo { font-size:7.2pt; text-transform:uppercase; letter-spacing:0.4pt; margin-bottom:2pt; }
  .duas { display:grid; grid-template-columns:1fr 1fr; gap:12pt; break-inside:avoid; }
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
  .fam { display:inline-block; padding:0.8pt 5pt; border-radius:2.5pt; font-size:7pt; font-weight:650; }
  .fam-casa{background:#e6f4ec;color:#1f5c3d} .fam-vps{background:#e4f0fa;color:#1f4d7a}
  .fam-paas{background:#f2e9f7;color:#5b3a7a} .fam-gratis{background:#fde8e8;color:#8c2f2f}
  code { font-family:"Cascadia Mono",Consolas,monospace; font-size:7.6pt; background:var(--alt); padding:0.5pt 3pt; border-radius:2pt; }
  .fontes { font-size:7.4pt; color:var(--fraca); } .fontes li { margin-bottom:1pt; }
"""

HTML = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Hospedagem — Caminho Sem Volta</title>
<style>{ESTILO}</style></head><body>

<section class="capa">
  <div class="selo0">Infraestrutura</div>
  <h1>Onde hospedar o site</h1>
  <div class="sub">Oito opções, com preço de 10 de setembro de 2026</div>
  <div class="meta">Câmbio do dia: US$ 1 = R$ {USD:.2f} &middot; € 1 = R$ {EUR:.2f}<br>
    RPG de Mesa — Caminho Sem Volta</div>
</section>

<section class="pagina">
  <h2>1. O que precisa ser hospedado</h2>
  <p>Três peças, com exigências diferentes — e é a terceira que decide quase tudo:</p>
  <table><thead><tr><th style="width:18%">Peça</th><th style="width:22%">O que é</th><th>O que exige</th></tr></thead><tbody>
    <tr><td><strong>Frontend</strong></td><td class="fraco">Vue compilado: HTML, JS e CSS estáticos</td>
        <td class="fraco">Nada além de um CDN. Grátis em qualquer lugar, e pode ficar separado do resto.</td></tr>
    <tr><td><strong>API</strong></td><td class="fraco">NestJS, Node, sempre ligado</td>
        <td class="fraco">Um processo que não dorme. Serverless não serve: a sessão de mesa precisa de resposta em milissegundos, não de <em>cold start</em>.</td></tr>
    <tr><td><strong>Estado</strong></td><td class="fraco">Postgres 18 + a pasta <code>uploads/</code></td>
        <td class="fraco"><strong>Disco persistente.</strong> Avatares, capas e PDFs ficam no disco, ao lado do banco. Isso é o que torna PaaS caro (volume à parte) e serverless impossível.</td></tr>
  </tbody></table>

  <div class="nota">
    <p><strong>Tudo já roda em <code>docker compose</code>.</strong> Postgres em container, API em Node, uploads em pasta.
    Qualquer máquina Linux com Docker sobe o projeto com o mesmo arquivo de desenvolvimento — e é por isso que a
    tabela abaixo compara máquinas, não plataformas: o trabalho de deploy é o mesmo em todas as VPS.</p>
  </div>

  <h2>2. As opções, lado a lado</h2>
  <p class="fraco">Preço em reais é conversão pelo câmbio do dia, não valor cobrado em real. Só a Hostinger cobra em real.</p>
  {bloco_tabela()}

  <div class="aviso">
    <p><strong>Latência importa mais aqui que em um site comum.</strong> Uma mesa de RPG é conversa em tempo real: cada
    rolagem, cada consulta ao inventário é uma ida e volta ao servidor. Europa custa ~200 ms por ida; São Paulo custa
    ~20. O app futuro, em celular fraco, vai sentir cada um desses milissegundos. As opções em São Paulo estão marcadas.</p>
  </div>
</section>

<section class="pagina">
  <h2>3. Cada opção, a favor e contra</h2>
  {bloco_detalhes()}
</section>

<section class="pagina">
  <h2>4. O frontend, à parte</h2>
  <p>O Vue compilado é estático e não precisa morar com a API. Deixá-lo num CDN grátis tem uma vantagem que vale por si:
  <strong>se a API cair (a luz da sua casa, por exemplo), o site continua no ar</strong> e mostra "servidor offline" em vez de sumir.</p>
  {bloco_frontend()}

  <h2>5. O domínio</h2>
  <p>Qualquer opção precisa de um. É o único custo fixo que existe em todas.</p>
  {bloco_dominio()}

  <h2>6. Recomendação</h2>
  <div class="bom">
    <p><strong>Agora, com o site e uma mesa: casa + Cloudflare Tunnel, frontend no Cloudflare Pages.</strong>
    R$ 0 por mês além do domínio (R$ 40/ano no registro.br). É o que você já planejava, o Tunnel ficou gratuito de vez,
    e o frontend separado garante que o site nunca some — só a API. O que precisa existir desde o primeiro dia é uma
    <strong>rotina de backup</strong>: <code>pg_dump</code> diário e cópia dos uploads para fora da máquina. Sem isso, um HD é a campanha inteira.</p>
    <p><strong>Quando o app chegar, ou quando a casa cair na hora errada: uma VPS em São Paulo.</strong> DigitalOcean ou
    Vultr a US$ 6 (~R$ 31), ou Hostinger a R$ 28 no anual — com o aviso de que renova mais caro. A migração é copiar o
    <code>docker-compose.yml</code>, restaurar o <code>pg_dump</code> e apontar o Tunnel para a nova máquina. Uma tarde.</p>
  </div>

  <div class="aviso">
    <p><strong>O que eu evitaria.</strong> <em>PaaS</em> (Railway, Fly) para esta pilha: o desenho guarda arquivo em disco e o
    Postgres nunca dorme — é exatamente o caso em que PaaS custa o dobro de uma VPS pelo mesmo resultado. E o
    <em>Oracle Always Free</em>: é grátis e tem São Paulo, mas cortou o plano pela metade em junho de 2026 sem avisar
    ninguém. Base que muda sem anúncio não é base.</p>
  </div>

  <h2>7. O que o deploy precisa, em qualquer opção</h2>
  <table><thead><tr><th style="width:26%">Item</th><th>Por quê</th></tr></thead><tbody>
    <tr><td><strong><code>PUBLIC_BASE_URL</code> e <code>ALLOWED_ORIGIN</code></strong></td>
        <td class="fraco">A URL pública da API monta o link de toda imagem; a origem permitida é o domínio do frontend. Errado, o site abre e as imagens não.</td></tr>
    <tr><td><strong>HTTPS</strong></td><td class="fraco">Cloudflare dá de graça em todas as opções — Tunnel ou proxy na frente da VPS.</td></tr>
    <tr><td><strong>Backup</strong></td><td class="fraco"><code>pg_dump</code> agendado + cópia de <code>uploads/</code> para outro lugar (um bucket, outro HD, o Drive). Testar a restauração uma vez.</td></tr>
    <tr><td><strong>Migrations</strong></td><td class="fraco"><code>docs/SCHEMA_CURRENT.sql</code> sobe o banco do zero; as migrations em ordem atualizam um existente.</td></tr>
    <tr><td><strong>Senha do GM e <code>JWT_SECRET</code></strong></td><td class="fraco">Fora do repositório, como hoje. Em produção, um <code>JWT_SECRET</code> novo — o de desenvolvimento não vai junto.</td></tr>
  </tbody></table>

  <h2>Fontes</h2>
  <ul class="fontes">
    <li>Hetzner: <a href="https://www.hetzner.com/cloud/regular-performance/">hetzner.com/cloud</a> · <a href="https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/">reajuste 2026</a></li>
    <li>Oracle Always Free: <a href="https://www.infoq.com/news/2026/07/oracle-cloud-free-tier-limits/">InfoQ, corte de junho/2026</a> · <a href="https://docs.oracle.com/iaas/Content/FreeTier/freetier.htm">documentação</a></li>
    <li>Railway: <a href="https://docs.railway.com/pricing/plans">planos</a> · <a href="https://dev.to/nayankyada/railway-pricing-2026-free-tier-limits-usage-costs-when-to-upgrade-1acm">custo real 2026</a></li>
    <li>Fly.io: <a href="https://fly.io/docs/about/pricing/">preços</a> · <a href="https://fly.io/docs/mpg/">Postgres gerenciado</a></li>
    <li>DigitalOcean: <a href="https://kuberns.com/blogs/digitalocean-pricing/">preços 2026</a></li>
    <li>VPS no Brasil: <a href="https://runzos.com/vps-brasil-barato-2026/">comparativo julho/2026</a> · <a href="https://kildaryoliver.com.br/quanto-custa-vps-hostinger-brasil/">Hostinger BR</a></li>
    <li>Cloudflare Tunnel: <a href="https://stachu.dev/self-hosting-a-website/">self-hosting 2026</a> · <a href="https://www.mrplanb.com/proxmox/free-homelab-tunnels">limites do grátis</a></li>
    <li>Vercel / Cloudflare Pages: <a href="https://www.fencode.dev/en/blog/vercel-free-vs-pro-2026-official-limits-pricing">limites 2026</a> · <a href="https://www.customjs.space/blog/serverless-static-site-hosting/">comparativo</a></li>
    <li>Câmbio 10/09/2026: <a href="https://mercadohoje.uai.com.br/2026/09/10/dolar-hoje-10-09-2026-veja-as-informacoes-da-moeda-americana/">dólar</a> · <a href="https://www.remessaonline.com.br/cotacao/cotacao-euro">euro</a></li>
  </ul>
</section>
</body></html>"""

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(HTML)
print(f"escrito: {SAIDA}")
