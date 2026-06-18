<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { usePortalTransition } from '@/composables/usePortalTransition'

const { state: portal } = usePortalTransition()

onMounted(() => {
  document.documentElement.classList.add('theme-dark')
})
</script>

<template>
  <!-- Overlay de transição portal — círculo preto que se expande do card clicado -->
  <div
    v-if="portal.phase !== 'idle'"
    class="portal-overlay"
    :class="portal.phase"
    :style="`--ox:${portal.ox}px;--oy:${portal.oy}px`"
  />

  <RouterView v-slot="{ Component, route }">
    <Transition :name="portal.phase !== 'idle' ? 'instant' : 'page-fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
/* ── Overlay portal ─────────────────────────────────────────────────────── */
.portal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  pointer-events: none;
}

/* Fase 1: círculo cresce do card até cobrir tudo */
.portal-overlay.expanding {
  animation: portal-expand 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes portal-expand {
  from { clip-path: circle(0% at var(--ox) var(--oy)); }
  to   { clip-path: circle(160% at var(--ox) var(--oy)); }
}

/* Fase 2: overlay some suavemente, revelando a nova tela */
.portal-overlay.fading {
  clip-path: circle(160% at var(--ox) var(--oy));
  animation: portal-fade 0.55s ease forwards;
}
@keyframes portal-fade {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* ── Transição instantânea (o overlay já cobre tudo) ────────────────────── */
.instant-enter-active,
.instant-leave-active {
  transition: none !important;
}

/* ── Transição padrão entre páginas ─────────────────────────────────────── */
.page-fade-leave-active {
  transition:
    opacity 0.45s cubic-bezier(0.4, 0, 1, 1),
    transform 0.45s cubic-bezier(0.4, 0, 1, 1),
    filter 0.45s ease;
}
.page-fade-enter-active {
  transition:
    opacity 0.5s cubic-bezier(0, 0, 0.2, 1),
    transform 0.5s cubic-bezier(0, 0, 0.2, 1),
    filter 0.5s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: scale(1.04);
  filter: blur(6px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
  filter: blur(6px);
}
</style>
