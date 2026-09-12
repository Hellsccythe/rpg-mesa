<script setup lang="ts">
/**
 * O leitor: um livro fechado que abre, com a folha virando pela quina.
 *
 * Três jeitos de virar, todos pelo mesmo caminho: o dedo ou o mouse arrastam
 * a quina e a folha acompanha (solta depois da metade, ela termina; antes,
 * volta); um toque na página, as setas do teclado ou os botões disparam a
 * mesma virada, só que com a quina guiada por uma animação. Em todos os
 * casos quem desenha é FolhaComDobra, a partir de um único ponto: onde a
 * quina está agora.
 *
 * Desktop mostra o spread (duas páginas); abaixo de 640px, uma página por
 * vez, com a lombada na borda esquerda da tela. As páginas são numeradas
 * como num livro impresso: a primeira fica à direita, depois da guarda.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CapaDoLivro from './CapaDoLivro.vue'
import FolhaComDobra from './FolhaComDobra.vue'
import SlotDeLivro, { type ConteudoDoSlot } from './SlotDeLivro.vue'
import { cantoEmRepouso, cantoVirado, type CantoDaFolha, type LadoDaFolha, type Ponto } from '@/lib/livro/dobra'
import type { BookPage } from '@/types/book'

const props = defineProps<{
  paginas: BookPage[]
  titulo: string
  subtitulo?: string
  noteTitulo?: string
  imagemDaCapa?: string
}>()

const emit = defineEmits<{ (e: 'fechar'): void }>()

// ── Medidas ──────────────────────────────────────────────────────────────────
const retrato = ref(false)
const larguraFolha = ref(400)
const alturaFolha = ref(560)
const zoom = ref(1)
const ZOOM_MIN = 0.7
const ZOOM_MAX = 1.4

function medir() {
  retrato.value = window.innerWidth < 640
  const alturaDisponivel = window.innerHeight - 9 * 16
  if (retrato.value) {
    larguraFolha.value = Math.floor(Math.min(420, window.innerWidth * 0.96))
    alturaFolha.value = Math.floor(Math.min(larguraFolha.value * 1.45, alturaDisponivel))
  } else {
    larguraFolha.value = Math.floor(Math.min(940, window.innerWidth * 0.94) / 2)
    alturaFolha.value = Math.floor(Math.min(larguraFolha.value * 1.38, alturaDisponivel, 820))
  }
}

const larguraCena = computed(() => (retrato.value ? larguraFolha.value : larguraFolha.value * 2))
/** Onde começa a folha da direita dentro da cena. No retrato só existe ela. */
const xDireita = computed(() => (retrato.value ? 0 : larguraFolha.value))

// ── Páginas e spreads ────────────────────────────────────────────────────────
// Slot 0 é a guarda (o lado de dentro da capa); a página 1 fica no slot 1,
// à direita — como num livro impresso. Spread s mostra os slots 2s e 2s+1.
const totalDePaginas = computed(() => props.paginas.length)
const totalDeSpreads = computed(() => Math.ceil((totalDePaginas.value + 1) / 2))
const spreadAtual = ref(0)
const paginaAtual = ref(0) // índice 0-based em `paginas`, só no retrato

function slot(indice: number): ConteudoDoSlot {
  if (indice === 0) return { tipo: 'guarda' }
  const pagina = props.paginas[indice - 1]
  return pagina ? { tipo: 'pagina', pagina } : { tipo: 'vazio' }
}
function slotDaPagina(indice: number): ConteudoDoSlot {
  const pagina = props.paginas[indice]
  return pagina ? { tipo: 'pagina', pagina } : { tipo: 'vazio' }
}
const EM_BRANCO: ConteudoDoSlot = { tipo: 'vazio' }

// ── O livro fechado e a capa ─────────────────────────────────────────────────
type Fase = 'fechado' | 'abrindo' | 'aberto' | 'fechando'
const fase = ref<Fase>('fechado')
/** 0 = capa fechada, 1 = capa aberta (virada para a esquerda). */
const aberturaDaCapa = ref(0)

function abrirLivro() {
  if (fase.value !== 'fechado') return
  fase.value = 'abrindo'
  animarValor(aberturaDaCapa, 1, 1100, () => { fase.value = 'aberto' })
}
function fecharLivro() {
  if (fase.value !== 'aberto' || virada.value) return
  fase.value = 'fechando'
  animarValor(aberturaDaCapa, 0, 900, () => { fase.value = 'fechado' })
}

/**
 * No desktop o livro fechado fica centrado; ao abrir, a cena desliza para o
 * spread caber. A cena tem duas folhas de largura e é centrada pelo flex, então
 * a capa (a metade direita) começa meia folha à direita do centro — para
 * centrá-la, a cena vai meia folha para a esquerda.
 */
const deslocamentoDaCena = computed(() => (retrato.value ? 0 : -(1 - aberturaDaCapa.value) * (larguraFolha.value / 2)))

// ── A virada ─────────────────────────────────────────────────────────────────
interface Virada {
  sentido: 'frente' | 'tras'
  lado: LadoDaFolha
  canto: CantoDaFolha
  /** Onde a quina está, em coordenadas locais da folha. */
  ponto: Ponto
  /** De onde ela partiu e para onde vai se a virada completar. */
  partida: Ponto
  destino: Ponto
  arrastando: boolean
}
const virada = ref<Virada | null>(null)

const podeAvancar = computed(() =>
  retrato.value ? paginaAtual.value < totalDePaginas.value - 1 : spreadAtual.value < totalDeSpreads.value - 1,
)
const podeVoltar = computed(() => (retrato.value ? paginaAtual.value > 0 : spreadAtual.value > 0))

/** A folha que vai virar: qual metade, qual canto, de onde para onde. */
function prepararVirada(sentido: 'frente' | 'tras', canto: CantoDaFolha): Virada | null {
  if (fase.value !== 'aberto' || virada.value) return null
  if (sentido === 'frente' && !podeAvancar.value) return null
  if (sentido === 'tras' && !podeVoltar.value) return null

  const medidas = { largura: larguraFolha.value, altura: alturaFolha.value, canto }
  if (retrato.value) {
    // Uma folha só, lombada à esquerda. Avançar leva a quina para fora da
    // tela; voltar traz a folha anterior de lá, no caminho inverso.
    const repouso = cantoEmRepouso({ ...medidas, lado: 'direita' })
    const virado = cantoVirado({ ...medidas, lado: 'direita' })
    return sentido === 'frente'
      ? { sentido, lado: 'direita', canto, ponto: repouso, partida: repouso, destino: virado, arrastando: false }
      : { sentido, lado: 'direita', canto, ponto: virado, partida: virado, destino: repouso, arrastando: false }
  }
  const lado: LadoDaFolha = sentido === 'frente' ? 'direita' : 'esquerda'
  const repouso = cantoEmRepouso({ ...medidas, lado })
  return { sentido, lado, canto, ponto: repouso, partida: repouso, destino: cantoVirado({ ...medidas, lado }), arrastando: false }
}

/** Quanto da virada já aconteceu, medido pela quina: 0 na partida, 1 no destino. */
function progressoDaVirada(v: Virada): number {
  const total = Math.hypot(v.destino.x - v.partida.x, v.destino.y - v.partida.y) || 1
  return Math.min(1, Math.hypot(v.ponto.x - v.partida.x, v.ponto.y - v.partida.y) / total)
}

function concluirVirada(v: Virada) {
  if (v.sentido === 'frente') {
    if (retrato.value) paginaAtual.value += 1
    else spreadAtual.value += 1
  } else if (retrato.value) paginaAtual.value -= 1
  else spreadAtual.value -= 1
  virada.value = null
}

/**
 * Leva a quina da posição atual até `alvo` numa curva: além de andar em
 * linha, ela sobe um pouco no meio do caminho — a folha levanta antes de
 * pousar, como uma de verdade.
 */
function animarQuina(v: Virada, alvo: Ponto, duracaoMs: number, aoTerminar: () => void) {
  const de = { ...v.ponto }
  const levantar = (v.canto === 'inferior' ? -1 : 1) * alturaFolha.value * 0.18
  const distanciaTotal = Math.hypot(v.destino.x - v.partida.x, v.destino.y - v.partida.y) || 1
  const proporcao = Math.hypot(alvo.x - de.x, alvo.y - de.y) / distanciaTotal
  animar(duracaoMs, (t) => {
    const e = suavizar(t)
    v.ponto = {
      x: de.x + (alvo.x - de.x) * e,
      y: de.y + (alvo.y - de.y) * e + Math.sin(Math.PI * e) * levantar * proporcao,
    }
  }, aoTerminar)
}

function soltarVirada(v: Virada) {
  v.arrastando = false
  const completa = progressoDaVirada(v) > 0.5
  const alvo = completa ? v.destino : v.partida
  const restante = Math.hypot(alvo.x - v.ponto.x, alvo.y - v.ponto.y)
  const duracao = Math.max(220, Math.min(650, restante * 0.9))
  animarQuina(v, alvo, duracao, () => {
    if (completa) concluirVirada(v)
    else virada.value = null
  })
}

/** Virada inteira, sem dedo: toque, tecla ou botão. */
function virar(sentido: 'frente' | 'tras', canto: CantoDaFolha = 'inferior') {
  if (fase.value === 'fechado') { if (sentido === 'frente') abrirLivro(); return }
  const v = prepararVirada(sentido, canto)
  if (!v) return
  // Mutações sempre pelo proxy (virada.value), nunca pelo objeto cru: o ref
  // envolve o objeto em reactive(), e mexer no cru não avisa o template.
  virada.value = v
  const ativa = virada.value
  animarQuina(ativa, ativa.destino, retrato.value ? 700 : 900, () => concluirVirada(ativa))
}

// ── Dedo e mouse ─────────────────────────────────────────────────────────────
const cenaRef = ref<HTMLElement | null>(null)
let ponteiro: { id: number; inicio: Ponto; virada: Virada | null; moveu: boolean; alvoEraLink: boolean } | null = null

/** Posição do ponteiro em coordenadas da cena, descontando o zoom. */
function pontoNaCena(evento: PointerEvent): Ponto {
  const caixa = cenaRef.value!.getBoundingClientRect()
  const escala = caixa.width / larguraCena.value
  return { x: (evento.clientX - caixa.left) / escala, y: (evento.clientY - caixa.top) / escala }
}

function aoPressionar(evento: PointerEvent) {
  if (!cenaRef.value || evento.button !== 0) return
  if (fase.value === 'fechado') { abrirLivro(); return }
  if (fase.value !== 'aberto' || virada.value) return

  const alvo = evento.target as HTMLElement
  const alvoEraLink = !!alvo.closest('a, button, .toc-god-link')
  const p = pontoNaCena(evento)
  const sentido: 'frente' | 'tras' = p.x >= xDireita.value + (retrato.value ? larguraFolha.value / 2 : 0) ? 'frente' : 'tras'
  const canto: CantoDaFolha = p.y >= alturaFolha.value / 2 ? 'inferior' : 'superior'
  const v = prepararVirada(sentido, canto)
  ponteiro = { id: evento.pointerId, inicio: p, virada: v, moveu: false, alvoEraLink }
  cenaRef.value.setPointerCapture(evento.pointerId)
}

function aoMover(evento: PointerEvent) {
  if (!ponteiro || evento.pointerId !== ponteiro.id || !ponteiro.virada) return
  const p = pontoNaCena(evento)
  const dx = p.x - ponteiro.inicio.x
  const dy = p.y - ponteiro.inicio.y
  if (!ponteiro.moveu) {
    if (Math.hypot(dx, dy) < 6) return
    ponteiro.moveu = true
    virada.value = ponteiro.virada
    ponteiro.virada = virada.value // daqui em diante, o proxy reativo
    ponteiro.virada.arrastando = true
  }
  // A quina anda com o dedo a partir de onde estava — não pula para ele.
  ponteiro.virada.ponto = { x: ponteiro.virada.partida.x + dx, y: ponteiro.virada.partida.y + dy }
}

function aoSoltar(evento: PointerEvent) {
  if (!ponteiro || evento.pointerId !== ponteiro.id) return
  const { virada: v, moveu, alvoEraLink } = ponteiro
  ponteiro = null
  if (!v) return
  if (moveu) soltarVirada(v)
  else if (!alvoEraLink) virar(v.sentido, v.canto)
}

function aoCancelar(evento: PointerEvent) {
  if (!ponteiro || evento.pointerId !== ponteiro.id) return
  const v = ponteiro.virada
  ponteiro = null
  if (v && v.arrastando) { v.ponto = { ...v.partida }; virada.value = null }
}

// ── Teclado, botões, índice ──────────────────────────────────────────────────
function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'ArrowRight') virar('frente')
  else if (evento.key === 'ArrowLeft') virar('tras')
  else if (evento.key === 'Escape') emit('fechar')
}

function avancar() { virar('frente') }
/** Voltar na primeira página fecha o livro; voltar com ele fechado devolve à prateleira. */
function voltar() {
  if (fase.value === 'fechado') { emit('fechar'); return }
  if (fase.value === 'aberto' && !podeVoltar.value) { fecharLivro(); return }
  virar('tras')
}

/** Salto do índice: sem animação, direto ao spread (ou página) do número pedido. */
function irParaPagina(numero: number) {
  if (virada.value) return
  const indice = Math.max(0, Math.min(totalDePaginas.value - 1, numero - 1))
  if (retrato.value) paginaAtual.value = indice
  else spreadAtual.value = Math.floor((indice + 1) / 2)
}
function irParaSpread(s: number) {
  if (virada.value) return
  spreadAtual.value = Math.max(0, Math.min(totalDeSpreads.value - 1, s))
}

// ── O que aparece em cada camada ─────────────────────────────────────────────
// Camada de baixo: o que a folha descobre ao sair. Camada do meio: o que não
// está virando. Camada de cima: a folha (FolhaComDobra).
interface Camadas {
  baixoEsquerda: ConteudoDoSlot | null
  baixoDireita: ConteudoDoSlot | null
  meioEsquerda: ConteudoDoSlot | null
  meioDireita: ConteudoDoSlot | null
  frente: ConteudoDoSlot | null
  verso: ConteudoDoSlot | null
}
const NADA: Camadas = { baixoEsquerda: null, baixoDireita: null, meioEsquerda: null, meioDireita: null, frente: null, verso: null }

const camadas = computed<Camadas>(() => {
  const v = virada.value
  if (retrato.value) {
    const atual = slotDaPagina(paginaAtual.value)
    if (!v) return { ...NADA, meioDireita: atual }
    if (v.sentido === 'frente') return { ...NADA, baixoDireita: slotDaPagina(paginaAtual.value + 1), frente: atual, verso: EM_BRANCO }
    return { ...NADA, baixoDireita: atual, frente: slotDaPagina(paginaAtual.value - 1), verso: EM_BRANCO }
  }
  const s = spreadAtual.value
  const esquerda = slot(2 * s)
  const direita = slot(2 * s + 1)
  if (!v) return { ...NADA, meioEsquerda: esquerda, meioDireita: direita }
  if (v.sentido === 'frente') {
    return { ...NADA, baixoEsquerda: slot(2 * s + 2), baixoDireita: slot(2 * s + 3), meioEsquerda: esquerda, frente: direita, verso: slot(2 * s + 2) }
  }
  return { ...NADA, baixoEsquerda: slot(2 * s - 2), baixoDireita: slot(2 * s - 1), meioDireita: direita, frente: esquerda, verso: slot(2 * s - 1) }
})

const xDaFolhaVirando = computed(() => (virada.value?.lado === 'esquerda' ? 0 : xDireita.value))

const pontinhos = computed(() => (retrato.value ? totalDePaginas.value : totalDeSpreads.value))
const pontinhoAtivo = computed(() => (retrato.value ? paginaAtual.value : spreadAtual.value))
function irParaPontinho(i: number) {
  if (retrato.value) irParaPagina(i + 1)
  else irParaSpread(i)
}

// ── Animação ─────────────────────────────────────────────────────────────────
const reduzirMovimento = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

function suavizar(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function animar(duracaoMs: number, passo: (t: number) => void, aoTerminar: () => void) {
  const duracao = reduzirMovimento() ? 1 : duracaoMs
  const inicio = performance.now()
  const quadro = (agora: number) => {
    const t = Math.min(1, (agora - inicio) / duracao)
    passo(t)
    if (t < 1) requestAnimationFrame(quadro)
    else aoTerminar()
  }
  requestAnimationFrame(quadro)
}

function animarValor(alvo: { value: number }, destino: number, duracaoMs: number, aoTerminar: () => void) {
  const de = alvo.value
  animar(duracaoMs, (t) => { alvo.value = de + (destino - de) * suavizar(t) }, aoTerminar)
}

// ── Ciclo de vida ────────────────────────────────────────────────────────────
onMounted(() => {
  medir()
  window.addEventListener('resize', medir)
  window.addEventListener('keydown', aoTeclar)
  // O livro chega fechado e abre sozinho — o leitor viu a capa por um instante.
  window.setTimeout(abrirLivro, 450)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', medir)
  window.removeEventListener('keydown', aoTeclar)
})

// Trocar de retrato para spread no meio de uma virada deixaria a folha no
// lugar errado; a virada é descartada e o índice da página vira spread.
watch(retrato, (agora) => {
  virada.value = null
  if (agora) paginaAtual.value = Math.max(0, spreadAtual.value * 2 - 1)
  else spreadAtual.value = Math.floor((paginaAtual.value + 1) / 2)
})

defineExpose({ avancar, voltar })
</script>

<template>
  <div class="leitor" :class="{ 'leitor--retrato': retrato }">
    <div
      class="leitor__palco"
      :style="{ width: `${larguraCena}px`, height: `${alturaFolha}px`, transform: `translateX(${deslocamentoDaCena}px) scale(${zoom})` }"
    >
      <div
        ref="cenaRef"
        class="leitor__cena"
        :class="{ 'leitor__cena--arrastando': virada?.arrastando, 'leitor__cena--fechada': fase !== 'aberto' }"
        :style="{ width: `${larguraCena}px`, height: `${alturaFolha}px` }"
        @pointerdown="aoPressionar"
        @pointermove="aoMover"
        @pointerup="aoSoltar"
        @pointercancel="aoCancelar"
      >
        <!-- Camada de baixo -->
        <template v-if="virada">
          <div v-if="!retrato && camadas.baixoEsquerda" class="leitor__metade" :style="{ left: '0px', width: `${larguraFolha}px` }">
            <SlotDeLivro :conteudo="camadas.baixoEsquerda" :note-titulo="noteTitulo" @ir-para-pagina="irParaPagina" />
          </div>
          <div v-if="camadas.baixoDireita" class="leitor__metade" :style="{ left: `${xDireita}px`, width: `${larguraFolha}px` }">
            <SlotDeLivro :conteudo="camadas.baixoDireita" :note-titulo="noteTitulo" @ir-para-pagina="irParaPagina" />
          </div>
        </template>

        <!-- Camada do meio: as páginas paradas -->
        <div v-if="!retrato && camadas.meioEsquerda && fase === 'aberto'" class="leitor__metade leitor__metade--parada" :style="{ left: '0px', width: `${larguraFolha}px` }">
          <SlotDeLivro :conteudo="camadas.meioEsquerda" :note-titulo="noteTitulo" @ir-para-pagina="irParaPagina" />
        </div>
        <div v-if="camadas.meioDireita" class="leitor__metade leitor__metade--parada" :style="{ left: `${xDireita}px`, width: `${larguraFolha}px` }">
          <SlotDeLivro :conteudo="camadas.meioDireita" :note-titulo="noteTitulo" @ir-para-pagina="irParaPagina" />
        </div>

        <!-- Lombada: sombra no vinco entre as páginas -->
        <div v-if="!retrato && fase !== 'fechado'" class="leitor__lombada" :style="{ left: `${larguraFolha - 24}px`, opacity: aberturaDaCapa }" />

        <!-- Camada de cima: a folha virando -->
        <FolhaComDobra
          v-if="virada && camadas.frente"
          class="leitor__folha"
          :style="{ left: `${xDaFolhaVirando}px` }"
          :largura="larguraFolha"
          :altura="alturaFolha"
          :lado="virada.lado"
          :canto="virada.canto"
          :ponto="virada.ponto"
        >
          <template #frente>
            <SlotDeLivro :conteudo="camadas.frente" :note-titulo="noteTitulo" @ir-para-pagina="irParaPagina" />
          </template>
          <template #verso>
            <SlotDeLivro v-if="camadas.verso" :conteudo="camadas.verso" :note-titulo="noteTitulo" />
          </template>
        </FolhaComDobra>

        <!-- A capa: folha dura, gira na lombada. Some quando o livro está aberto. -->
        <div
          v-if="fase !== 'aberto'"
          class="leitor__capa3d"
          :style="{ left: `${xDireita}px`, width: `${larguraFolha}px`, transform: `rotateY(${-180 * aberturaDaCapa}deg)` }"
        >
          <div class="leitor__capa-face leitor__capa-face--frente">
            <CapaDoLivro :titulo="titulo" :subtitulo="subtitulo" :imagem="imagemDaCapa" />
            <div class="leitor__capa-sombra" :style="{ opacity: Math.sin(Math.PI * aberturaDaCapa) * 0.55 }" />
          </div>
          <div class="leitor__capa-face leitor__capa-face--verso">
            <SlotDeLivro :conteudo="{ tipo: 'guarda' }" />
          </div>
        </div>
        <!-- Sombra que a capa em pé projeta na primeira página. -->
        <div
          v-if="fase === 'abrindo' || fase === 'fechando'"
          class="leitor__sombra-da-capa"
          :style="{ left: `${xDireita}px`, width: `${larguraFolha}px`, opacity: Math.sin(Math.PI * aberturaDaCapa) * 0.5 }"
        />
      </div>
    </div>

    <!-- Navegação -->
    <div class="leitor__nav">
      <button class="leitor__botao" :disabled="fase !== 'aberto' && fase !== 'fechado'" :aria-label="fase === 'fechado' ? 'Voltar à prateleira' : podeVoltar ? 'Página anterior' : 'Fechar o livro'" @click="voltar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div class="leitor__pontinhos">
        <button
          v-for="i in pontinhos"
          :key="i"
          class="leitor__pontinho"
          :class="{ 'leitor__pontinho--ativo': fase === 'aberto' && i - 1 === pontinhoAtivo }"
          :aria-label="`Ir para ${retrato ? 'página' : 'spread'} ${i}`"
          @click="irParaPontinho(i - 1)"
        />
      </div>
      <button class="leitor__botao" :disabled="fase === 'aberto' && !podeAvancar" aria-label="Próxima página" @click="avancar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
      <div v-if="!retrato" class="leitor__zoom">
        <button class="leitor__zoom-botao" :disabled="zoom <= ZOOM_MIN" aria-label="Reduzir" @click="zoom = Math.max(ZOOM_MIN, +(zoom - 0.1).toFixed(1))">−</button>
        <span class="leitor__zoom-valor">{{ Math.round(zoom * 100) }}%</span>
        <button class="leitor__zoom-botao" :disabled="zoom >= ZOOM_MAX" aria-label="Aumentar" @click="zoom = Math.min(ZOOM_MAX, +(zoom + 0.1).toFixed(1))">+</button>
      </div>
    </div>
    <p class="leitor__dica">
      <span v-if="retrato">Arraste a quina da página, ou toque nela.</span>
      <span v-else>Arraste a quina da página com o mouse, ou use as setas ← → do teclado.</span>
    </p>
  </div>
</template>

<style scoped>
.leitor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.5rem 0;
}

.leitor__palco {
  position: relative;
  transform-origin: top center;
  transition: transform 0.25s ease;
  filter: drop-shadow(0 26px 48px rgba(0, 0, 0, 0.7));
}

/* A perspectiva fica na cena, mãe direta da capa que gira: um `filter` no
   palco achata o 3D dos descendentes, e a capa precisa dele. */
.leitor__cena {
  position: relative;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  perspective: 2200px;
  perspective-origin: 50% 40%;
}
.leitor__cena--arrastando { cursor: grabbing; }

.leitor__metade {
  position: absolute;
  top: 0;
  height: 100%;
  /* Contexto de empilhamento próprio: o conteúdo de uma página (a lista de
     deuses tem z-index 1) não pode atravessar a página que está por cima. */
  isolation: isolate;
  z-index: 1;
}
.leitor__metade--parada { z-index: 2; }
/* O papel: leve vinheta e grão para não ficar chapado. */
.leitor__metade::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(90, 60, 20, 0.14) 100%);
}

.leitor__lombada {
  position: absolute;
  top: 0;
  width: 48px;
  height: 100%;
  pointer-events: none;
  z-index: 5;
  background: linear-gradient(to right, transparent, rgba(40, 20, 5, 0.22) 45%, rgba(40, 20, 5, 0.3) 50%, rgba(40, 20, 5, 0.22) 55%, transparent);
}

.leitor__folha {
  z-index: 10;
}

/* Capa dura: dois lados, gira na lombada com espessura sugerida pela sombra. */
.leitor__capa3d {
  position: absolute;
  top: 0;
  height: 100%;
  z-index: 20;
  transform-origin: left center;
  transform-style: preserve-3d;
  will-change: transform;
}
.leitor__capa-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
}
.leitor__capa-face--frente {
  box-shadow: inset 4px 0 10px rgba(0, 0, 0, 0.45);
}
.leitor__capa-face--verso {
  transform: rotateY(180deg);
}
.leitor__capa-sombra {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.55), transparent 60%);
}
.leitor__sombra-da-capa {
  position: absolute;
  top: 0;
  height: 100%;
  pointer-events: none;
  z-index: 15;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2) 40%, transparent 75%);
}

/* Miolo: as bordas das páginas empilhadas, nas duas laterais. */
.leitor__cena::before,
.leitor__cena::after {
  content: '';
  position: absolute;
  top: 3px;
  bottom: 3px;
  width: 7px;
  z-index: 1;
  background: repeating-linear-gradient(to right, #e6d8b8 0 1px, #c9b68e 1px 2px);
}
.leitor__cena::before { left: -7px; border-radius: 3px 0 0 3px; }
.leitor__cena::after { right: -7px; border-radius: 0 3px 3px 0; }
.leitor--retrato .leitor__cena::before,
.leitor__cena--fechada::before { display: none; }

/* Navegação */
.leitor__nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  user-select: none;
  position: relative;
  z-index: 30;
  background: rgba(10, 15, 28, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 160, 80, 0.18);
  border-radius: 999px;
  padding: 6px 14px;
}
.leitor__botao {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #c8a05040;
  background: #1a1408;
  color: #c8a050;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
}
.leitor__botao:hover:not(:disabled) { background: #2a2010; border-color: #c8a05080; }
.leitor__botao:disabled { opacity: 0.3; cursor: default; }

.leitor__pontinhos { display: flex; gap: 5px; align-items: center; }
.leitor__pontinho {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: none;
  background: #c8a05040;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.leitor__pontinho--ativo { background: #c8a050; transform: scale(1.35); }

.leitor__zoom { display: flex; align-items: center; gap: 4px; margin-left: 0.5rem; }
.leitor__zoom-botao {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #c8a05040;
  background: #1a1408;
  color: #c8a050;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.leitor__zoom-botao:disabled { opacity: 0.3; cursor: default; }
.leitor__zoom-valor { font-size: 0.7rem; color: #c8a050; min-width: 2.4rem; text-align: center; }

.leitor__dica {
  font-size: 0.72rem;
  color: rgba(200, 160, 80, 0.55);
  margin: 0;
}
</style>
