<script setup lang="ts">
/**
 * Uma folha do livro com a quina dobrada. Não anima nada sozinha: recebe onde
 * a quina está (`ponto`) e desenha a frente recortada, a aba refletida com o
 * verso, e as duas sombras. Quem move a quina — dedo, mouse, teclado ou a
 * animação automática — é o LivroLeitor. Ver lib/livro/dobra.ts.
 *
 * Ocupa exatamente a caixa da folha; a aba pode sair dela (pousa na página
 * ao lado do spread), por isso nada aqui tem overflow hidden.
 */
import { computed } from 'vue'
import { calcularDobra, type CantoDaFolha, type LadoDaFolha, type Ponto } from '@/lib/livro/dobra'

const props = defineProps<{
  largura: number
  altura: number
  lado: LadoDaFolha
  canto: CantoDaFolha
  ponto: Ponto
}>()

const dobra = computed(() =>
  calcularDobra({ largura: props.largura, altura: props.altura, lado: props.lado, canto: props.canto, ponto: props.ponto }),
)

defineExpose({ dobra })
</script>

<template>
  <div class="folha" :style="{ width: `${largura}px`, height: `${altura}px` }">
    <!-- Sombra que a aba levantada projeta na página que aparece por baixo.
         Fica só na região que a folha desocupou (o lado de C). -->
    <div v-if="!dobra.plana" class="folha__sombra-pagina" :style="{ clipPath: dobra.recorteAba, background: dobra.sombraPagina }" />

    <!-- A frente, recortada ao que ainda não virou. -->
    <div class="folha__frente" :style="{ clipPath: dobra.recorteFrente }">
      <slot name="frente" />
    </div>

    <!-- A aba: a região que virou, refletida pela linha da dobra. O verso é
         espelhado dentro da caixa (é o que se veria olhando o papel por trás)
         e a reflexão desespelha — o texto do verso sai lendo certo. -->
    <div v-if="!dobra.plana" class="folha__aba" :style="{ transform: dobra.transformAba }">
      <!-- O recorte fica num filho: clip-path corta também o drop-shadow do
           mesmo elemento, e a sombra da aba precisa sair dela. -->
      <div class="folha__aba-recorte" :style="{ clipPath: dobra.recorteAba }">
        <div class="folha__verso">
          <slot name="verso" />
        </div>
        <div class="folha__sombra-aba" :style="{ background: dobra.sombraAba }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.folha {
  position: absolute;
  top: 0;
  left: 0;
}

.folha__frente,
.folha__aba,
.folha__sombra-pagina {
  position: absolute;
  inset: 0;
}

.folha__sombra-pagina {
  pointer-events: none;
  z-index: 1;
}

.folha__frente {
  z-index: 2;
  isolation: isolate;
}

.folha__aba {
  z-index: 3;
  transform-origin: 0 0;
  will-change: transform;
  /* A aba é papel visto por trás: uma sombra própria a separa da página onde pousa. */
  filter: drop-shadow(-2px 3px 6px rgba(0, 0, 0, 0.28));
}

.folha__aba-recorte {
  position: absolute;
  inset: 0;
  will-change: clip-path;
}

.folha__verso {
  position: absolute;
  inset: 0;
  transform: scaleX(-1);
  overflow: hidden;
  isolation: isolate;
}

.folha__sombra-aba {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
