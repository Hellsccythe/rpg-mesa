<script setup lang="ts">
/**
 * Uma tira da folha que está virando. A folha é fatiada em N tiras verticais
 * encadeadas: cada tira é filha da anterior e gira em torno da própria borda
 * junto à lombada, então a rotação da tira 0 arrasta as demais e as dobras
 * relativas das tiras seguintes viram a curva do papel. Ver PaginaDobrando.
 *
 * Cada tira mostra duas faces — a frente é a página que está saindo, o verso
 * é a que vai aparecer no outro lado — e cada face renderiza a página inteira
 * deslocada para a coluna daquela tira, recortada pelo overflow.
 */
import { computed } from 'vue'
import BookPageContent from './BookPageContent.vue'
import type { BookPage } from '@/types/book'

const props = defineProps<{
  frente?: BookPage
  verso?: BookPage
  noteTitulo?: string
  sentido: 'frente' | 'tras'
  indice: number
  tiras: number
  /** Quanto esta tira dobra além da anterior, em graus, no meio da virada. */
  curvas: number[]
  reverso: boolean
  duracaoMs: number
}>()

const emit = defineEmits<{ (e: 'terminou'): void }>()

const ultima = computed(() => props.indice >= props.tiras - 1)

/** Coluna da página que esta tira mostra, de 0 a tiras-1, contada da esquerda da página. */
const colunaFrente = computed(() => (props.sentido === 'frente' ? props.indice : props.tiras - 1 - props.indice))
// Depois da virada a tira pousa espelhada no outro lado: a tira 0 (da lombada)
// fica colada na lombada de novo, a última vai para a borda externa.
const colunaVerso = computed(() => (props.sentido === 'frente' ? props.tiras - 1 - props.indice : props.indice))

const deslocar = (coluna: number) => ({
  width: `${props.tiras * 100}%`,
  transform: `translateX(${-(coluna / props.tiras) * 100}%)`,
})

// Duração e direção vão em variáveis, e não direto na propriedade: o ::after
// que faz a sombra precisa das mesmas duas, e variável CSS herda.
const estiloTira = computed(() => ({
  '--curva': `${props.curvas[props.indice] ?? 0}deg`,
  '--duracao': `${props.duracaoMs}ms`,
  '--direcao': props.reverso ? 'reverse' : 'normal',
  // A tira 0 é a única que precisa de largura e posição próprias: encosta na
  // lombada com a largura de uma fatia. As filhas herdam 100% da mãe.
  ...(props.indice === 0
    ? { width: `${100 / props.tiras}%`, [props.sentido === 'frente' ? 'left' : 'right']: '0' }
    : {}),
}))

function aoTerminar(evento: AnimationEvent) {
  // Só a animação da própria tira 0 encerra a virada — as filhas e as sombras
  // também disparam animationend e borbulham até aqui.
  if (props.indice !== 0 || evento.target !== evento.currentTarget) return
  emit('terminou')
}
</script>

<template>
  <div
    class="tira"
    :class="[`tira--${sentido}`, indice === 0 ? 'tira--base' : 'tira--dobra']"
    :style="estiloTira"
    @animationend="aoTerminar"
  >
    <div class="tira__face tira__face--frente" :class="`sentido-${sentido}`">
      <div class="tira__conteudo" :style="deslocar(colunaFrente)">
        <BookPageContent :page="frente" :note-titulo="noteTitulo" />
      </div>
    </div>
    <div class="tira__face tira__face--verso" :class="`sentido-${sentido}`">
      <div class="tira__conteudo" :style="deslocar(colunaVerso)">
        <BookPageContent :page="verso" :note-titulo="noteTitulo" />
      </div>
    </div>

    <TiraDaFolha
      v-if="!ultima"
      :frente="frente"
      :verso="verso"
      :note-titulo="noteTitulo"
      :sentido="sentido"
      :indice="indice + 1"
      :tiras="tiras"
      :curvas="curvas"
      :reverso="reverso"
      :duracao-ms="duracaoMs"
    />
  </div>
</template>

<style scoped>
.tira {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  transform-style: preserve-3d;
  animation-duration: var(--duracao);
  animation-direction: var(--direcao);
  animation-fill-mode: both;
  will-change: transform;
}

/* A tira 0 se posiciona sozinha (estilo inline); as demais nascem coladas na
   borda externa da anterior, com a mesma largura. */
.tira--frente { transform-origin: left center; }
.tira--tras   { transform-origin: right center; }
/* Meio pixel de sobreposição esconde a costura que o antialias deixa entre
   tiras; o desalinhamento acumulado fica abaixo de 3px em seis tiras. */
.tira--dobra.tira--frente { left: calc(100% - 0.6px); }
.tira--dobra.tira--tras   { right: calc(100% - 0.6px); }

/* A tira da lombada faz a volta inteira; as outras só se curvam no meio do
   caminho e chegam planas — senão a folha pousaria amassada. */
.tira--base.tira--frente { animation-name: dobra-base-frente; animation-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1); }
.tira--base.tira--tras   { animation-name: dobra-base-tras;   animation-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1); }
.tira--dobra             { animation-name: dobra-tira;        animation-timing-function: ease-in-out; }

@keyframes dobra-base-frente { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
@keyframes dobra-base-tras   { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
@keyframes dobra-tira {
  0%   { transform: rotateY(0deg); }
  28%  { transform: rotateY(var(--curva)); }
  58%  { transform: rotateY(0deg); }
  100% { transform: rotateY(0deg); }
}

.tira__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  background: #f3e6c8;
}
.tira__face--verso { transform: rotateY(180deg); }

.tira__conteudo {
  position: relative;
  height: 100%;
}

/* Sombra da dobra: escurece a partir da lombada enquanto a folha está de pé
   e some quando ela pousa. Fica no conteúdo, que tem a largura da página
   inteira, e não na tira: na tira o degradê recomeçava a cada fatia e
   desenhava faixas verticais. O verso é espelhado (rotateY 180), então a
   mesma direção do degradê, nas coordenadas da face, cai do lado certo. */
.tira__conteudo::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  animation-name: sombra-da-dobra;
  animation-duration: var(--duracao);
  animation-direction: var(--direcao);
  animation-fill-mode: both;
  animation-timing-function: ease-in-out;
}
.sentido-frente .tira__conteudo::after {
  background: linear-gradient(to right, rgba(20, 8, 0, 0.5), rgba(20, 8, 0, 0.1) 40%, transparent 70%);
}
.sentido-tras .tira__conteudo::after {
  background: linear-gradient(to left, rgba(20, 8, 0, 0.5), rgba(20, 8, 0, 0.1) 40%, transparent 70%);
}
@keyframes sombra-da-dobra {
  0%   { opacity: 0; }
  45%  { opacity: 1; }
  100% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .tira, .tira__conteudo::after { animation-duration: 1ms !important; }
}
</style>
