<script setup lang="ts">
/**
 * O que ocupa uma metade do livro: uma página de verdade, a guarda (o lado
 * de dentro da capa), ou nada — o miolo vazio no fim de um livro com número
 * ímpar de páginas. Também é o verso em branco da folha no modo de página
 * única, onde o papel não tem nada impresso atrás.
 */
import BookPageContent from './BookPageContent.vue'
import type { BookPage } from '@/types/book'

export type ConteudoDoSlot =
  | { tipo: 'pagina'; pagina: BookPage }
  | { tipo: 'guarda' }
  | { tipo: 'vazio' }

defineProps<{
  conteudo: ConteudoDoSlot
  noteTitulo?: string
}>()

defineEmits<{ (e: 'irParaPagina', numero: number): void }>()
</script>

<template>
  <div class="slot-livro" :class="`slot-livro--${conteudo.tipo}`">
    <BookPageContent
      v-if="conteudo.tipo === 'pagina'"
      :page="conteudo.pagina"
      :note-titulo="noteTitulo"
      @jump-to-page="$emit('irParaPagina', $event)"
    />
    <div v-else-if="conteudo.tipo === 'guarda'" class="slot-livro__guarda">
      <div class="slot-livro__guarda-marca">✦</div>
    </div>
    <div v-else class="slot-livro__vazio" />
  </div>
</template>

<style scoped>
.slot-livro {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #f5e8ce;
}

/* Guarda: papel mais escuro, colado por dentro da capa. */
.slot-livro__guarda {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.06), transparent 70%),
    linear-gradient(135deg, #3a2f22, #2a2119 60%, #1f1812);
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot-livro__guarda-marca {
  color: rgba(214, 178, 100, 0.35);
  font-size: 2rem;
}

.slot-livro__vazio {
  position: absolute;
  inset: 0;
  background: #efe1c4;
}
</style>
