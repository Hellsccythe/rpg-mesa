<script setup lang="ts">
import { ref, watch } from 'vue'

/**
 * Avatar de personagem com dois fallbacks: quando não há URL e quando a URL
 * existe mas a imagem não carrega.
 *
 * O segundo caso não era tratado em lugar nenhum — cada tela tinha só um
 * `v-else` para avatar ausente. Uma URL que responde 404 (por exemplo as que
 * ainda apontam para o bucket do Supabase, que saiu do ar) mostrava o ícone
 * de imagem partida do navegador com o texto alternativo ao lado.
 *
 * Preenche o elemento pai, que é quem define tamanho e arredondamento.
 */
const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    /** Texto do fallback. Use o slot `fallback` para algo mais elaborado. */
    rotulo?: string
    /** Enquadramento da imagem, ex: "center 20%". */
    enquadramento?: string
    classeImagem?: string
  }>(),
  { alt: '', rotulo: 'SEM AVATAR', enquadramento: 'center 20%', classeImagem: '' },
)

const falhou = ref(false)

// Trocar a URL merece uma nova tentativa.
watch(() => props.src, () => { falhou.value = false })
</script>

<template>
  <img
    v-if="src && !falhou"
    :src="src"
    :alt="alt"
    class="h-full w-full object-cover"
    :class="classeImagem"
    :style="{ objectPosition: enquadramento }"
    @error="falhou = true"
  />
  <div
    v-else
    class="flex h-full w-full items-center justify-center bg-zinc-900/60 text-zinc-600"
  >
    <slot name="fallback">
      <span class="px-2 text-center text-[0.7rem] font-semibold leading-tight">{{ rotulo }}</span>
    </slot>
  </div>
</template>
