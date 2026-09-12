<script setup lang="ts">
/**
 * A folha que vira, com dobra — em CSS, sem biblioteca, para rodar em celular
 * fraco. Substitui o flip rígido (a folha inteira girando como uma tábua).
 *
 * O truque: a folha é fatiada em `tiras` verticais aninhadas (TiraDaFolha).
 * A tira da lombada gira de 0 a 180°; cada tira seguinte é filha da anterior
 * e ganha uma dobra própria que sobe no primeiro terço da virada e volta a
 * zero antes do fim. Como as rotações se somam pela cadeia de filhos, a
 * borda solta lidera a curva e a folha pousa plana.
 *
 * Ocupa o espaço da folha que está virando: no spread é a metade da cena
 * (posicionada pelo pai), no celular é a página inteira. Quem está por baixo
 * (a página de destino) é responsabilidade de quem monta este componente.
 *
 * `sentido: 'frente'` gira a folha da direita para a esquerda, pivô na sua
 * borda esquerda; `'tras'` é o espelho. `reverso` toca a mesma animação de
 * trás para frente — a folha chega em vez de sair, usado no modo de página
 * única ao voltar, onde a folha anterior vem de fora da tela.
 */
import { computed } from 'vue'
import TiraDaFolha from './TiraDaFolha.vue'
import type { BookPage } from '@/types/book'

const props = withDefaults(defineProps<{
  frente?: BookPage
  verso?: BookPage
  noteTitulo?: string
  sentido: 'frente' | 'tras'
  reverso?: boolean
  tiras?: number
  duracaoMs?: number
  /** Dobra máxima da borda solta, em graus. As tiras do meio recebem frações dela. */
  curvaMaxima?: number
}>(), { reverso: false, tiras: 6, duracaoMs: 900, curvaMaxima: 16 })

const emit = defineEmits<{ (e: 'terminou'): void }>()

/**
 * Dobra relativa de cada tira. A tira 0 não dobra (ela é a volta inteira); as
 * demais dividem a curva máxima com peso maior perto da lombada, onde o papel
 * de verdade se curva mais. Negativa em 'frente' porque a volta é para -180°.
 */
const curvas = computed(() => {
  const partes = props.tiras - 1
  if (partes <= 0) return [0]
  const sinal = props.sentido === 'frente' ? -1 : 1
  const pesos = Array.from({ length: partes }, (_, i) => partes - i)
  const somaDosPesos = pesos.reduce((total, peso) => total + peso, 0)
  return [0, ...pesos.map((peso) => sinal * (props.curvaMaxima * peso) / somaDosPesos)]
})

</script>

<template>
  <div class="folha">
    <TiraDaFolha
      :frente="frente"
      :verso="verso"
      :note-titulo="noteTitulo"
      :sentido="sentido"
      :indice="0"
      :tiras="tiras"
      :curvas="curvas"
      :reverso="reverso"
      :duracao-ms="duracaoMs"
      @terminou="emit('terminou')"
    />
  </div>
</template>

<style scoped>
.folha {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  pointer-events: none;
}
</style>
