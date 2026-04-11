<template>
  <component
    :is="elemento"
    class="tema-dark-light"
    :class="[
      `variante-${variante}`,
      `tema-${tema}`,
      `preset-${preset}`,
      { 'is-clicavel': clicavel },
    ]"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
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

<style scoped>
.tema-dark-light {
  --tdl-fonte-titulo: v-bind(fonteTitulo);
  --tdl-fonte-texto: v-bind(fonteTexto);
  --tdl-cor-titulo: var(--brand-primary);
  --tdl-cor-subtitulo: color-mix(in srgb, var(--text-main) 88%, var(--brand-primary) 12%);
  --tdl-cor-kicker: color-mix(in srgb, var(--brand-primary) 72%, #4f46e5 28%);
  --tdl-cor-texto: var(--text-main);
  --tdl-cor-texto-suave: var(--text-muted);
  --tdl-cor-label: var(--text-muted);

  border: 1px solid var(--border-soft);
  color: var(--tdl-cor-texto);
  font-family: var(--tdl-fonte-texto);
}

.tema-dark-light.variante-contexto {
  border: 0;
  background: transparent;
  box-shadow: none;
}

.variante-painel {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--border-soft) 65%);
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
  box-shadow: 0 24px 50px rgb(15 23 42 / 0.18);
}

.variante-cartao {
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
}

.variante-item {
  background: color-mix(in srgb, var(--bg-card) 90%, #0b1426 10%);
  border-color: color-mix(in srgb, var(--border-soft) 86%, transparent 14%);
}

.variante-aviso {
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
  color: var(--tdl-cor-texto-suave);
}

.variante-item.is-clicavel:hover {
  border-color: var(--brand-primary);
}

.preset-cidade {
  --tdl-fonte-titulo: 'Cinzel Decorative', 'Cinzel', 'Times New Roman', serif;
  --tdl-fonte-texto: 'Lora', 'Source Sans 3', 'Segoe UI', sans-serif;
}

.preset-deuses {
  --tdl-fonte-titulo: 'Marcellus SC', 'Cinzel', 'Times New Roman', serif;
  --tdl-fonte-texto: 'Spectral', 'Source Sans 3', 'Segoe UI', sans-serif;
}

.tema-claro.variante-painel {
  border-color: color-mix(in srgb, var(--brand-primary) 35%, var(--border-soft) 65%);
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
}

.tema-claro.variante-cartao,
.tema-claro.variante-aviso {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
}

.tema-claro.variante-item {
  border-color: color-mix(in srgb, var(--border-soft) 86%, transparent 14%);
  background: color-mix(in srgb, var(--bg-card) 90%, #0b1426 10%);
}

.tema-escuro.variante-painel {
  border-color: rgb(107 78 158 / 0.36);
  background: rgb(17 26 45 / 0.8);
}

.tema-escuro.variante-cartao,
.tema-escuro.variante-aviso {
  border-color: rgb(107 78 158 / 0.36);
  background: rgb(17 26 45 / 0.8);
}

.tema-escuro.variante-item {
  border-color: rgb(107 78 158 / 0.28);
  background: rgb(11 20 38 / 0.9);
}

:global(html.theme-dark) .variante-painel {
  border-color: rgb(107 78 158 / 0.36);
  background: rgb(17 26 45 / 0.8);
}

:global(html.theme-dark) .variante-cartao,
:global(html.theme-dark) .variante-aviso {
  border-color: rgb(107 78 158 / 0.36);
  background: rgb(17 26 45 / 0.8);
}

:global(html.theme-dark) .variante-item {
  border-color: rgb(107 78 158 / 0.28);
  background: rgb(11 20 38 / 0.9);
}

.tema-dark-light :deep(.tdl-titulo),
.tema-dark-light :deep(.tdl-subtitulo),
.tema-dark-light :deep(.tdl-kicker),
.tema-dark-light :deep(.tdl-label),
.tema-dark-light :deep(.tdl-texto),
.tema-dark-light :deep(.tdl-texto-suave) {
  margin: 0;
}

.tema-dark-light :deep(.tdl-titulo) {
  color: var(--tdl-cor-titulo);
  font-family: var(--tdl-fonte-titulo);
}

.tema-dark-light :deep(.tdl-subtitulo) {
  color: var(--tdl-cor-subtitulo);
  font-family: var(--tdl-fonte-titulo);
}

.tema-dark-light :deep(.tdl-kicker) {
  color: var(--tdl-cor-kicker);
  font-family: var(--tdl-fonte-titulo);
}

.tema-dark-light :deep(.tdl-label) {
  color: var(--tdl-cor-label);
  font-family: var(--tdl-fonte-texto);
}

.tema-dark-light :deep(.tdl-texto) {
  color: var(--tdl-cor-texto);
  font-family: var(--tdl-fonte-texto);
}

.tema-dark-light :deep(.tdl-texto-suave) {
  color: var(--tdl-cor-texto-suave);
  font-family: var(--tdl-fonte-texto);
}
</style>
