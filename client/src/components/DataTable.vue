<template>
  <div class="dt-wrap rounded-2xl border overflow-hidden">

    <!-- ── Cabeçalho ─────────────────────────────────────────────────────────── -->
    <div
      class="dt-head border-b px-4 py-3 text-xs font-bold uppercase tracking-wider"
      :class="classeGrid"
    >
      <span
        v-for="col in colunas"
        :key="col.label"
        :class="col.classe"
      >{{ col.label }}</span>

      <span v-if="!semAcoes" class="text-center">Ações</span>
    </div>

    <!-- ── Carregando ─────────────────────────────────────────────────────────── -->
    <div v-if="carregando" class="flex items-center justify-center py-16">
      <div class="dt-spinner h-8 w-8 animate-spin rounded-full border-2" />
    </div>

    <!-- ── Vazio ──────────────────────────────────────────────────────────────── -->
    <div
      v-else-if="itens.length === 0"
      class="dt-empty flex flex-col items-center justify-center gap-2 py-16 text-center"
    >
      <p class="text-sm font-medium opacity-50">{{ mensagemVazia }}</p>
      <slot name="vazia-cta" />
    </div>

    <!-- ── Linhas ─────────────────────────────────────────────────────────────── -->
    <template v-else>
      <div
        v-for="(item, index) in itens"
        :key="(item as any).id ?? index"
        class="dt-row border-b px-4 py-3.5 transition-colors last:border-b-0"
        :class="[classeGrid, { 'dt-row-par': index % 2 === 0 }]"
      >
        <slot name="linha" :item="item" :index="index" />

        <div v-if="!semAcoes" class="flex items-center justify-end gap-1.5">
          <slot name="acoes" :item="item">
            <button
              @click="$emit('editar', item)"
              class="dt-btn-edit rounded-lg p-1.5 transition-colors"
              title="Editar"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button
              @click="$emit('deletar', item)"
              class="dt-btn-del rounded-lg p-1.5 transition-colors"
              title="Deletar"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </slot>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
export interface ColunaTabela {
  label: string
  classe?: string
}

defineProps<{
  colunas: ColunaTabela[]
  itens: unknown[]
  carregando?: boolean
  mensagemVazia?: string
  classeGrid: string
  semAcoes?: boolean
}>()

defineEmits<{
  editar: [item: unknown]
  deletar: [item: unknown]
}>()
</script>

<style scoped>
/* ── Dark (padrão) ────────────────────────────────────────────────────────── */
.dt-wrap { background: rgb(255 255 255 / 0.02); border-color: rgb(255 255 255 / 0.07); }

.dt-head {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(255 255 255 / 0.07);
  color: #64748b;
}

.dt-row  { border-color: rgb(255 255 255 / 0.05); }
.dt-row:hover { background: rgb(255 255 255 / 0.025); }
.dt-row-par { background: rgb(0 0 0 / 0.12); }
.dt-row-par:hover { background: rgb(255 255 255 / 0.025); }

.dt-empty { color: #475569; }

.dt-spinner {
  border-color: rgb(220 38 38 / 0.3);
  border-top-color: #f87171;
}

.dt-btn-edit { color: #60a5fa; }
.dt-btn-edit:hover { background: rgb(96 165 250 / 0.12); }

.dt-btn-del { color: #f87171; }
.dt-btn-del:hover { background: rgb(248 113 113 / 0.12); }

/* ── Light ───────────────────────────────────────────────────────────────── */
:global(html.theme-light) .dt-wrap  { background: var(--bg-card); border-color: var(--border-soft); }
:global(html.theme-light) .dt-head  { background: var(--bg-soft); border-color: var(--border-soft); color: var(--text-muted); }
:global(html.theme-light) .dt-row   { border-color: var(--border-soft); }
:global(html.theme-light) .dt-row:hover  { background: var(--bg-soft); }
:global(html.theme-light) .dt-row-par    { background: var(--bg-soft); }
:global(html.theme-light) .dt-empty      { color: var(--text-muted); }
:global(html.theme-light) .dt-btn-edit:hover { background: rgb(59 130 246 / 0.1); }
:global(html.theme-light) .dt-btn-del:hover  { background: rgb(239 68 68 / 0.1); }
</style>
