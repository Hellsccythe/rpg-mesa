<script setup lang="ts">
/**
 * O leitor de folha única: não tem capa, não vira página. O conteúdo
 * inteiro vai numa folha, que rola por dentro se for comprido. Três caras
 * para a mesma folha, escolhidas pelo `formato`:
 *
 *   pergaminho — o rolo antigo, papel envelhecido e bordas rasgadas
 *   bilhete    — o papel pequeno e amassado, largado de qualquer jeito
 *   carta      — a folha limpa, com cabeçalho, dobras e lacre
 *
 * Os `---` que no livro quebram página aqui viram um ornamento separando
 * blocos: o mestre escreve do mesmo jeito para todos os formatos.
 */
import { computed } from 'vue'
import type { BookPage } from '@/types/book'

type FormatoDeFolha = 'pergaminho' | 'bilhete' | 'carta'

const props = withDefaults(defineProps<{
  paginas: BookPage[]
  titulo: string
  subtitulo?: string
  formato?: FormatoDeFolha
}>(), { formato: 'pergaminho' })

const blocos = computed(() => props.paginas.map((pagina) => pagina.textContent ?? '').filter((texto) => texto.trim()))

const DICA: Record<FormatoDeFolha, string> = {
  pergaminho: 'Uma folha só — role o texto se for longo.',
  bilhete: 'Um bilhete — role se for longo.',
  carta: 'Uma carta — role se for longa.',
}
</script>

<template>
  <div class="pergaminho" :class="`pergaminho--${formato}`">
    <div class="pergaminho__folha">
      <div class="pergaminho__miolo">
        <p v-if="formato === 'pergaminho'" class="pergaminho__ornamento">✦</p>
        <p v-else-if="formato === 'carta'" class="pergaminho__ornamento">✉</p>
        <h2 class="pergaminho__titulo">{{ titulo }}</h2>
        <p v-if="subtitulo" class="pergaminho__subtitulo">{{ subtitulo }}</p>
        <div class="pergaminho__regua" />
        <template v-for="(bloco, indice) in blocos" :key="indice">
          <p v-if="indice > 0" class="pergaminho__separador">{{ formato === 'bilhete' ? '~' : '— ✦ —' }}</p>
          <p class="pergaminho__texto">{{ bloco }}</p>
        </template>
        <!-- O lacre da carta: cera vermelha com o brasão, no canto de quem assina. -->
        <div v-if="formato === 'carta'" class="pergaminho__lacre" aria-hidden="true">✦</div>
      </div>
    </div>
    <p class="pergaminho__dica">{{ DICA[formato] }}</p>
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

/* ── Bilhete: papel menor, mais claro, amassado, largado torto ──────────── */
.pergaminho--bilhete .pergaminho__folha {
  width: min(440px, 92vw);
  transform: rotate(2.2deg);
}
.pergaminho--bilhete .pergaminho__miolo {
  padding: 1.6rem 1.5rem 1.8rem;
  color: #2f2416;
  background:
    /* os vincos: linhas claras e escuras cruzando o papel */
    linear-gradient(112deg, transparent 38%, rgba(255, 255, 255, 0.35) 39%, rgba(90, 70, 40, 0.14) 40.5%, transparent 42%),
    linear-gradient(-70deg, transparent 58%, rgba(255, 255, 255, 0.3) 59%, rgba(90, 70, 40, 0.12) 60.5%, transparent 62%),
    linear-gradient(28deg, transparent 20%, rgba(90, 70, 40, 0.1) 21%, rgba(255, 255, 255, 0.28) 22%, transparent 24%),
    radial-gradient(ellipse at 70% 20%, rgba(120, 90, 40, 0.12), transparent 50%),
    linear-gradient(180deg, #f1e9d4, #e9dfc4);
  clip-path: polygon(
    0.5% 1.5%, 12% 0.4%, 26% 1.8%, 41% 0.2%, 55% 1.4%, 70% 0.3%, 86% 1.6%, 99.2% 0.6%,
    99.6% 30%, 98.9% 62%, 99.5% 98.2%,
    84% 99.4%, 72% 97.6%, 60% 99.6%, 47% 98.1%, 33% 99.7%, 19% 98%, 6% 99.5%, 0.8% 97%,
    0.3% 66%, 1.1% 33%
  );
}
.pergaminho--bilhete .pergaminho__titulo {
  font-family: 'EB Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  text-align: left;
  color: #3a2a12;
  letter-spacing: 0;
}
.pergaminho--bilhete .pergaminho__subtitulo { text-align: left; }
.pergaminho--bilhete .pergaminho__regua { width: 40%; margin: 0.6rem 0 1rem; background: linear-gradient(to right, #9a7a3a, transparent); }
.pergaminho--bilhete .pergaminho__texto {
  font-style: italic;
  font-size: 1.06rem;
  text-align: left;
  hyphens: none;
}
.pergaminho--bilhete .pergaminho__separador { text-align: left; letter-spacing: 0; margin: 0.8rem 0; }

/* ── Carta: folha limpa, sem rasgo, com as duas dobras e o lacre ────────── */
.pergaminho--carta .pergaminho__folha {
  width: min(600px, 96vw);
  transform: none;
}
.pergaminho--carta .pergaminho__miolo {
  position: relative;
  padding: 2.6rem 2.6rem 5rem;
  color: #22180c;
  background:
    /* as dobras da carta em terços */
    linear-gradient(180deg, transparent 33.1%, rgba(80, 60, 30, 0.13) 33.3%, rgba(255, 255, 255, 0.35) 33.7%, transparent 34.2%),
    linear-gradient(180deg, transparent 66.1%, rgba(80, 60, 30, 0.13) 66.3%, rgba(255, 255, 255, 0.35) 66.7%, transparent 67.2%),
    radial-gradient(ellipse at 50% 0%, rgba(120, 90, 40, 0.08), transparent 60%),
    linear-gradient(180deg, #f5efdf, #efe6d0);
  clip-path: none;
  border: 1px solid rgba(120, 90, 40, 0.25);
}
.pergaminho--carta .pergaminho__ornamento { color: #7a2a1e; letter-spacing: 0; font-size: 1.3rem; }
.pergaminho--carta .pergaminho__titulo {
  font-size: clamp(1.1rem, 3.6vw, 1.5rem);
  color: #2a1e10;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.pergaminho--carta .pergaminho__regua { width: 100%; background: linear-gradient(to right, transparent, #7a5a2a, transparent); }
.pergaminho--carta .pergaminho__texto { font-size: 1.04rem; }
.pergaminho__lacre {
  position: absolute;
  right: 1.6rem;
  bottom: 1.2rem;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: rgba(255, 220, 200, 0.85);
  font-size: 1.1rem;
  transform: rotate(-12deg);
  background:
    radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.35), transparent 40%),
    radial-gradient(circle at 50% 50%, #8e2418 0 38%, #6b1a12 40% 62%, #8e2418 64% 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45), inset 0 0 0 2px rgba(60, 10, 8, 0.5);
}

@media (prefers-reduced-motion: reduce) {
  .pergaminho__folha { transform: none; }
}
</style>
