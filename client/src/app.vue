<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const isDarkMode = ref(true)

const themeLabel = computed(() => (isDarkMode.value ? 'Modo Dark' : 'Modo Light'))
const themeIcon = computed(() => (isDarkMode.value ? '🌙' : '☀️'))

function applyTheme() {
  const html = document.documentElement
  html.classList.toggle('theme-dark', isDarkMode.value)
  html.classList.toggle('theme-light', !isDarkMode.value)
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  applyTheme()
  localStorage.setItem('ui-theme', isDarkMode.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('ui-theme')
  isDarkMode.value = savedTheme ? savedTheme === 'dark' : true
  applyTheme()
})
</script>

<template>
  <div class="app-shell">
    <RouterView />

    <button
      class="theme-toggle"
      :aria-label="`Alternar tema. Tema atual: ${themeLabel}`"
      :title="themeLabel"
      @click="toggleTheme"
    >
      <span class="theme-icon" aria-hidden="true">{{ themeIcon }}</span>
      <span class="theme-text">{{ themeLabel }}</span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 999;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--toggle-border);
  background: var(--toggle-bg);
  padding: 0.55rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--toggle-text);
  backdrop-filter: blur(6px);
}

.theme-toggle:hover {
  background: var(--accent-soft);
}

.theme-icon {
  font-size: 0.95rem;
  line-height: 1;
}

.theme-text {
  line-height: 1;
}

@media (max-width: 640px) {
  .theme-toggle {
    right: 0.75rem;
    bottom: 0.75rem;
    padding: 0.52rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
