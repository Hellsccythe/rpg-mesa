<script setup lang="ts">
/**
 * A capa do livro. Sem `imagem`, desenha uma em SVG: fundo azul-grafite com
 * trama fina, moldura dupla dourada com cantoneiras e a coluna dos seis
 * poliedros em traço — o mesmo espírito da referência do mestre. Com
 * `imagem`, usa a arte como fundo e só sobrepõe o título.
 *
 * O título fica em HTML, não no SVG: quebra de linha, fonte e o relevo de
 * "folha de ouro gravada" (sombra clara em cima, escura embaixo) são mais
 * fáceis de acertar em CSS.
 */
defineProps<{
  titulo: string
  subtitulo?: string
  imagem?: string
}>()
</script>

<template>
  <div class="capa" :class="{ 'capa--com-imagem': !!imagem }">
    <img v-if="imagem" :src="imagem" alt="" class="capa__imagem" />
    <!-- viewBox na proporção da página (1:1,38) para a arte não esticar. -->
    <svg v-else class="capa__arte" viewBox="0 0 600 830" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="capa-trama" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.045)" stroke-width="1" />
        </pattern>
        <linearGradient id="capa-fundo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2a3140" />
          <stop offset="0.55" stop-color="#1e2431" />
          <stop offset="1" stop-color="#161b26" />
        </linearGradient>
        <linearGradient id="capa-ouro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e2c27a" />
          <stop offset="0.5" stop-color="#b8923f" />
          <stop offset="1" stop-color="#e6c985" />
        </linearGradient>
      </defs>

      <rect width="600" height="830" fill="url(#capa-fundo)" />
      <rect width="600" height="830" fill="url(#capa-trama)" />

      <!-- Moldura dupla: a externa fina, a interna um pouco mais grossa. -->
      <g fill="none" stroke="url(#capa-ouro)">
        <rect x="22" y="22" width="556" height="786" stroke-width="1.2" />
        <rect x="52" y="60" width="496" height="710" stroke-width="2" />
        <!-- Cantoneiras -->
        <g stroke-width="1.2">
          <path d="M22 60 h30 M52 22 v38" /><path d="M578 60 h-30 M548 22 v38" />
          <path d="M22 770 h30 M52 808 v-38" /><path d="M578 770 h-30 M548 808 v-38" />
          <rect x="16" y="16" width="12" height="12" /><rect x="572" y="16" width="12" height="12" />
          <rect x="16" y="802" width="12" height="12" /><rect x="572" y="802" width="12" height="12" />
        </g>
      </g>

      <!-- A coluna dos dados, em traço: d4, d6, d8, d10, d12, d20. -->
      <g fill="none" stroke="url(#capa-ouro)" stroke-width="2.2" stroke-linejoin="round" transform="translate(300 238)">
        <g>
          <path d="M0 -44 L38 10 L0 44 L-38 10 Z" /><path d="M0 -44 L0 44" /><path d="M-38 10 L38 10" stroke-opacity="0.55" />
        </g>
        <g transform="translate(0 96)">
          <path d="M0 -42 L37 -21 L37 21 L0 42 L-37 21 L-37 -21 Z" /><path d="M0 -42 L0 0 L37 21 M0 0 L-37 21" />
        </g>
        <g transform="translate(0 192)">
          <path d="M0 -44 L39 3 L0 44 L-39 3 Z" /><path d="M-39 3 L39 3 M0 -44 L0 44" stroke-opacity="0.55" />
        </g>
        <g transform="translate(0 288)">
          <path d="M0 -44 L40 -5 L24 38 L-24 38 L-40 -5 Z" /><path d="M0 -44 L0 5 L24 38 M0 5 L-24 38 M-40 -5 L0 5 L40 -5" stroke-opacity="0.55" />
        </g>
        <g transform="translate(0 384)">
          <path d="M0 -44 L42 -14 L26 36 L-26 36 L-42 -14 Z" /><path d="M0 -20 L20 -5 L13 18 L-13 18 L-20 -5 Z" />
          <path d="M0 -44 L0 -20 M42 -14 L20 -5 M26 36 L13 18 M-26 36 L-13 18 M-42 -14 L-20 -5" stroke-opacity="0.55" />
        </g>
        <g transform="translate(0 482)">
          <path d="M0 -46 L40 -23 L40 23 L0 46 L-40 23 L-40 -23 Z" /><path d="M0 -46 L23 -13 L-23 -13 Z M0 -46 L40 -23 L23 -13 M0 -46 L-40 -23 L-23 -13" stroke-opacity="0.55" />
          <path d="M23 -13 L40 23 L0 20 L-40 23 L-23 -13 L0 20 L23 -13 M40 23 L0 46 L0 20 M-40 23 L0 46" stroke-opacity="0.55" />
          <path d="M40 -23 L40 23 M-40 -23 L-40 23" stroke-opacity="0.55" />
        </g>
      </g>
    </svg>

    <div class="capa__titulo">
      <h2 class="capa__nome">{{ titulo }}</h2>
      <p v-if="subtitulo" class="capa__subtitulo">{{ subtitulo }}</p>
    </div>
  </div>
</template>

<style scoped>
.capa {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* `cqw` no título: a fonte acompanha a largura da capa, não da tela. */
  container-type: inline-size;
  background: #1e2431;
  /* A borda de couro: mais escura na lombada e nas quinas. */
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.45);
}

.capa__arte,
.capa__imagem {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.capa__imagem { object-fit: cover; }

.capa__titulo {
  position: absolute;
  inset: 9% 12% auto;
  text-align: center;
  pointer-events: none;
}

.capa__nome {
  font-family: 'Cinzel', 'Times New Roman', serif;
  font-weight: 700;
  font-size: clamp(1.1rem, 4.2cqw, 2rem);
  line-height: 1.15;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin: 0;
  color: #d9b862;
  background: linear-gradient(180deg, #f0d78e 0%, #c9a34a 55%, #9a7526 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  /* Relevo de ouro gravado: luz em cima, sombra embaixo. */
  filter: drop-shadow(0 1px 0 rgba(255, 240, 200, 0.35)) drop-shadow(0 -1px 0 rgba(0, 0, 0, 0.55)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.capa__subtitulo {
  font-family: 'EB Garamond', Georgia, serif;
  font-style: italic;
  font-size: clamp(0.7rem, 2.4cqw, 1rem);
  letter-spacing: 0.06em;
  margin: 0.6em 0 0;
  color: rgba(226, 194, 122, 0.85);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.capa--com-imagem .capa__titulo {
  inset: 7% 12% auto;
}
</style>
