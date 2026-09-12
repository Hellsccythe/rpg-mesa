/**
 * Geometria da folha que dobra pela quina — o efeito do Apple Books e do
 * aplicativo do Kindle.
 *
 * O modelo é o da folha de papel de verdade: você segura a quina C e a leva
 * até o ponto P. A linha da dobra é a mediatriz do segmento C–P, e a parte da
 * folha que ficou do lado de C vira por cima, refletida por essa linha. Com
 * isso a aba (a parte virada, mostrando o verso) é só a reflexão de um
 * polígono — e reflexão é uma matriz 2D, que o CSS aplica na GPU. O que faz
 * o papel parecer curvo são os degradês de sombra ao longo da dobra, não a
 * geometria; é o mesmo truque do turn.js e do StPageFlip.
 *
 * Coordenadas locais da folha: origem no canto superior esquerdo, x para a
 * direita, y para baixo, em px. `lado` diz onde está a lombada: a folha da
 * direita do spread tem a lombada em x = 0; a da esquerda, em x = largura.
 */

export interface Ponto {
  x: number
  y: number
}

export type LadoDaFolha = 'direita' | 'esquerda'
export type CantoDaFolha = 'superior' | 'inferior'

export interface ParametrosDaDobra {
  largura: number
  altura: number
  lado: LadoDaFolha
  canto: CantoDaFolha
  /** Onde a quina está agora, em coordenadas locais da folha. */
  ponto: Ponto
}

export interface Dobra {
  /** Polígono (CSS `polygon(...)`) da parte da frente que continua à vista. */
  recorteFrente: string
  /** Polígono da região da folha que virou, em coordenadas da folha, antes da reflexão. */
  recorteAba: string
  /** `matrix(...)` que reflete a aba pela linha da dobra. Origem em 0 0. */
  transformAba: string
  /** Degradê de sombra na aba, escurecendo a partir da dobra. */
  sombraAba: string
  /** Degradê de sombra que a aba levantada projeta na página de baixo. */
  sombraPagina: string
  /** 0 = quina no lugar, 1 = folha inteiramente virada. */
  progresso: number
  /** A quina depois de aplicadas as restrições do papel. */
  ponto: Ponto
  /** Verdadeiro quando não há dobra nenhuma (P coincide com C). */
  plana: boolean
}

/** A quina em repouso. */
export function cantoEmRepouso(p: Omit<ParametrosDaDobra, 'ponto'>): Ponto {
  return {
    x: p.lado === 'direita' ? p.largura : 0,
    y: p.canto === 'inferior' ? p.altura : 0,
  }
}

/** Onde a quina termina quando a folha vira por completo: espelhada pela lombada. */
export function cantoVirado(p: Omit<ParametrosDaDobra, 'ponto'>): Ponto {
  return {
    x: p.lado === 'direita' ? -p.largura : 2 * p.largura,
    y: p.canto === 'inferior' ? p.altura : 0,
  }
}

/**
 * Papel não estica: a quina nunca fica mais longe da lombada do que a largura
 * da folha, nem mais longe do canto oposto da lombada do que a diagonal.
 * Sem isto, arrastar o dedo para fora do livro rasgaria a folha.
 */
export function restringirQuina(p: Omit<ParametrosDaDobra, 'ponto'>, ponto: Ponto): Ponto {
  const lombadaX = p.lado === 'direita' ? 0 : p.largura
  const cantoY = p.canto === 'inferior' ? p.altura : 0
  const cantoOpostoY = p.canto === 'inferior' ? 0 : p.altura
  let resultado = { ...ponto }
  resultado = limitarDistancia(resultado, { x: lombadaX, y: cantoY }, p.largura)
  resultado = limitarDistancia(resultado, { x: lombadaX, y: cantoOpostoY }, Math.hypot(p.largura, p.altura))
  return resultado
}

function limitarDistancia(ponto: Ponto, centro: Ponto, raio: number): Ponto {
  const dx = ponto.x - centro.x
  const dy = ponto.y - centro.y
  const distancia = Math.hypot(dx, dy)
  if (distancia <= raio || distancia === 0) return ponto
  const fator = raio / distancia
  return { x: centro.x + dx * fator, y: centro.y + dy * fator }
}

export function calcularDobra(p: ParametrosDaDobra): Dobra {
  const { largura, altura } = p
  const repouso = cantoEmRepouso(p)
  const ponto = restringirQuina(p, p.ponto)
  const folha: Ponto[] = [{ x: 0, y: 0 }, { x: largura, y: 0 }, { x: largura, y: altura }, { x: 0, y: altura }]

  const dx = ponto.x - repouso.x
  const dy = ponto.y - repouso.y
  const deslocamento = Math.hypot(dx, dy)
  const progresso = Math.min(1, deslocamento / (2 * largura))

  if (deslocamento < 0.5) {
    return {
      recorteFrente: poligono(folha),
      recorteAba: 'polygon(0 0, 0 0, 0 0)',
      transformAba: 'none',
      sombraAba: 'none',
      sombraPagina: 'none',
      progresso: 0,
      ponto: repouso,
      plana: true,
    }
  }

  // n aponta de C para P; a dobra é a reta por M perpendicular a n.
  const n = { x: dx / deslocamento, y: dy / deslocamento }
  const meio = { x: (repouso.x + ponto.x) / 2, y: (repouso.y + ponto.y) / 2 }

  // Do lado de P a frente continua à vista; do lado de C a folha virou.
  const ladoDeP = (q: Ponto) => (q.x - meio.x) * n.x + (q.y - meio.y) * n.y
  const frente = recortarPorSemiplano(folha, (q) => ladoDeP(q) >= 0)
  const aba = recortarPorSemiplano(folha, (q) => ladoDeP(q) <= 0)

  // Reflexão pela reta: X' = X − 2((X − M)·n) n. Em matriz afim de coluna:
  // a = 1 − 2nx², b = c = −2nxny, d = 1 − 2ny², e = 2(M·n)nx, f = 2(M·n)ny.
  const mn = meio.x * n.x + meio.y * n.y
  const a = 1 - 2 * n.x * n.x
  const b = -2 * n.x * n.y
  const d = 1 - 2 * n.y * n.y
  const e = 2 * mn * n.x
  const f = 2 * mn * n.y
  const transformAba = `matrix(${fixo(a)}, ${fixo(b)}, ${fixo(b)}, ${fixo(d)}, ${fixo(e)}, ${fixo(f)})`

  // Sombras: degradês perpendiculares à dobra. A "profundidade" cresce com a
  // dobra e para de crescer para a sombra não engolir a folha toda.
  const profundidade = Math.min(largura * 0.45, 40 + deslocamento * 0.35)
  const paraDentroDaAba = { x: -n.x, y: -n.y }
  const sombraAba = degradePerpendicular(largura, altura, meio, paraDentroDaAba, [
    [0, 'rgba(30, 14, 2, 0.32)'],
    [profundidade * 0.25, 'rgba(30, 14, 2, 0.16)'],
    [profundidade, 'rgba(30, 14, 2, 0)'],
  ])
  const sombraPagina = degradePerpendicular(largura, altura, meio, paraDentroDaAba, [
    [0, 'rgba(0, 0, 0, 0.42)'],
    [profundidade * 0.5, 'rgba(0, 0, 0, 0.14)'],
    [profundidade * 1.4, 'rgba(0, 0, 0, 0)'],
  ])

  return {
    recorteFrente: poligono(frente),
    recorteAba: poligono(aba),
    transformAba,
    sombraAba,
    sombraPagina,
    progresso,
    ponto,
    plana: false,
  }
}

/** Sutherland–Hodgman para um único semiplano. */
function recortarPorSemiplano(vertices: Ponto[], dentro: (q: Ponto) => boolean): Ponto[] {
  const saida: Ponto[] = []
  for (let i = 0; i < vertices.length; i++) {
    const atual = vertices[i]
    const anterior = vertices[(i + vertices.length - 1) % vertices.length]
    const atualDentro = dentro(atual)
    const anteriorDentro = dentro(anterior)
    if (atualDentro) {
      if (!anteriorDentro) saida.push(intersecao(anterior, atual, dentro))
      saida.push(atual)
    } else if (anteriorDentro) {
      saida.push(intersecao(anterior, atual, dentro))
    }
  }
  return saida
}

/** Bissecção sobre a aresta: chega ao ponto da reta sem precisar da equação dela. */
function intersecao(fora: Ponto, dentroP: Ponto, dentro: (q: Ponto) => boolean): Ponto {
  let a = fora
  let b = dentroP
  if (dentro(a)) [a, b] = [b, a]
  for (let i = 0; i < 24; i++) {
    const meio = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    if (dentro(meio)) b = meio
    else a = meio
  }
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function poligono(vertices: Ponto[]): string {
  if (vertices.length < 3) return 'polygon(0 0, 0 0, 0 0)'
  return `polygon(${vertices.map((v) => `${fixo(v.x)}px ${fixo(v.y)}px`).join(', ')})`
}

/**
 * Um `linear-gradient` cuja linha é perpendicular à dobra e cujas paradas são
 * medidas em px a partir dela. O CSS mede o degradê a partir do centro do
 * elemento; aqui a conta converte "px desde a dobra" para "px desde o início
 * da linha do degradê", que é o que o CSS entende.
 */
function degradePerpendicular(
  largura: number,
  altura: number,
  origem: Ponto,
  direcao: Ponto,
  paradas: Array<[number, string]>,
): string {
  const anguloRad = Math.atan2(direcao.x, -direcao.y)
  const comprimento = Math.abs(largura * Math.sin(anguloRad)) + Math.abs(altura * Math.cos(anguloRad))
  const centro = { x: largura / 2, y: altura / 2 }
  const distanciaDaDobra = (origem.x - centro.x) * direcao.x + (origem.y - centro.y) * direcao.y
  const inicio = distanciaDaDobra + comprimento / 2
  const graus = (anguloRad * 180) / Math.PI
  const lista = [`transparent ${fixo(inicio)}px`, ...paradas.map(([px, cor]) => `${cor} ${fixo(inicio + px)}px`)]
  return `linear-gradient(${fixo(graus)}deg, ${lista.join(', ')})`
}

function fixo(valor: number): string {
  return Number.isFinite(valor) ? valor.toFixed(2) : '0'
}
