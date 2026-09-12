<script setup lang="ts">
/**
 * O leitor de pergaminho: uma folha só. É a nota achada numa masmorra, a
 * carta, o bilhete — não tem capa, não vira página. O conteúdo inteiro vai
 * numa folha de papel envelhecido, com bordas irregulares, e rola por
 * dentro se for comprido.
 *
 * Os `---` que no livro quebram página aqui viram um ornamento separando
 * blocos: o mestre escreve do mesmo jeito para os dois formatos.
 */
import { computed } from 'vue'
import type { BookPage } from '@/types/book'

const props = defineProps<{
  paginas: BookPage[]
  titulo: string
  subtitulo?: string
}>()

const blocos = computed(() => props.paginas.map((pagina) => pagina.textContent ?? '').filter((texto) => texto.trim()))
</script>

<template>
  <div class="pergaminho">
    <div class="pergaminho__folha">
      <div class="pergaminho__miolo">
        <p class="pergaminho__ornamento">✦</p>
        <h2 class="pergaminho__titulo">{{ titulo }}</h2>
        <p v-if="subtitulo" class="pergaminho__subtitulo">{{ subtitulo }}</p>
        <div class="pergaminho__regua" />
        <template v-for="(bloco, indice) in blocos" :key="indice">
          <p v-if="indice > 0" class="pergaminho__separador">— ✦ —</p>
          <p class="pergaminho__texto">{{ bloco }}</p>
        </template>
      </div>
    </div>
    <p class="pergaminho__dica">Uma folha só — role o texto se for longo.</p>
  </div>
</template>

<style scoped>
.pergaminho {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 0.5rem 0;
}

/* A folha: papel envelhecido com manchas, borda rasgada (clip-path irregular)
   e uma leve inclinação, como se tivesse sido largada na mesa. */
.pergaminho__folha {
  position: relative;
  width: min(640px, 96vw);
  max-height: calc(100vh - 11rem);
  transform: rotate(-0.8deg);
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.6)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
}

.pergaminho__miolo {
  max-height: calc(100vh - 11rem);
  overflow-y: auto;
  padding: 2.4rem 2.2rem 2.6rem;
  color: #2a1a0c;
  font-family: 'EB Garamond', Georgia, serif;
  background:
    radial-gradient(ellipse at 20% 15%, rgba(120, 80, 30, 0.18), transparent 45%),
    radial-gradient(ellipse at 80% 85%, rgba(110, 70, 25, 0.2), transparent 40%),
    radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(90, 55, 15, 0.22) 100%),
    linear-gradient(180deg, #ecdcb6, #e2cf9f 60%, #d9c48f);
  clip-path: polygon(
    1.2% 0.6%, 8% 0.2%, 15% 1%, 23% 0.4%, 31% 1.1%, 40% 0.3%, 49% 0.9%, 58% 0.2%, 66% 1%, 75% 0.5%, 84% 1.2%, 92% 0.3%, 98.6% 0.9%,
    99.4% 8%, 98.8% 17%, 99.6% 27%, 98.9% 38%, 99.5% 49%, 98.7% 60%, 99.6% 71%, 98.8% 82%, 99.4% 92%, 98.6% 99.2%,
    91% 99.6%, 82% 99%, 73% 99.7%, 63% 99.1%, 53% 99.8%, 43% 99.2%, 33% 99.7%, 24% 99%, 15% 99.6%, 7% 99.1%, 0.8% 99.5%,
    0.3% 91%, 1% 81%, 0.4% 70%, 1.1% 59%, 0.5% 48%, 1.2% 37%, 0.4% 26%, 1% 15%, 0.5% 6%
  );
}
.pergaminho__miolo::-webkit-scrollbar { width: 8px; }
.pergaminho__miolo::-webkit-scrollbar-thumb { background: rgba(90, 55, 15, 0.35); border-radius: 4px; }

.pergaminho__ornamento {
  text-align: center;
  color: #9a7a3a;
  margin: 0 0 0.4rem;
  letter-spacing: 0.4em;
}
.pergaminho__titulo {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-weight: 700;
  font-size: clamp(1.2rem, 4vw, 1.7rem);
  text-align: center;
  color: #2b3a1e;
  margin: 0;
  letter-spacing: 0.04em;
}
.pergaminho__subtitulo {
  text-align: center;
  font-style: italic;
  font-size: 0.95rem;
  color: #5a4020;
  margin: 0.3rem 0 0;
}
.pergaminho__regua {
  height: 1px;
  margin: 1rem auto 1.4rem;
  width: 70%;
  background: linear-gradient(to right, transparent, #9a7a3a, transparent);
}
.pergaminho__texto {
  white-space: pre-wrap;
  line-height: 1.65;
  font-size: 1.02rem;
  margin: 0;
  text-align: justify;
  hyphens: auto;
}
.pergaminho__separador {
  text-align: center;
  color: #9a7a3a;
  margin: 1.2rem 0;
  letter-spacing: 0.3em;
}

.pergaminho__dica {
  font-size: 0.72rem;
  color: rgba(200, 160, 80, 0.55);
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pergaminho__folha { transform: none; }
}
</style>
