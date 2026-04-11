<template>
  <TemaDarkLight
    :elemento="elemento"
    :variante="variante"
    :clicavel="clicavel"
    :tema="tema"
    :preset="preset"
    :fonte-titulo="fonteTitulo"
    :fonte-texto="fonteTexto"
  >
    <slot />
  </TemaDarkLight>
</template>

<script setup lang="ts">
import TemaDarkLight from '@/components/TemaDarkLight.vue'

withDefaults(
  defineProps<{
    elemento?: string
    variante?: 'contexto' | 'painel' | 'cartao' | 'item' | 'aviso'
    clicavel?: boolean
    tema?: 'auto' | 'claro' | 'escuro'
    preset?: 'padrao' | 'cidade' | 'deuses'
    fonteTitulo?: string
    fonteTexto?: string
  }>(),
  {
    elemento: 'div',
    variante: 'cartao',
    clicavel: false,
    tema: 'auto',
    preset: 'padrao',
    fonteTitulo: 'Cinzel, "Times New Roman", serif',
    fonteTexto: '"Source Sans 3", "Segoe UI", sans-serif',
  },
)
</script>
