<template>
  <section class="gm-card border-white/[0.06]">
    <!-- Header -->
    <div class="gm-card-header">
      <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </div>
      <div>
        <h3 class="gm-title">{{ titulo }}</h3>
        <p v-if="subtitulo" class="gm-subtitle">{{ subtitulo }}</p>
      </div>
    </div>

    <!-- Formulário de criação -->
    <div class="mb-4 flex flex-wrap gap-2">
      <input
        v-model="descricaoInput"
        type="text"
        placeholder="Descrição *"
        class="gm-input flex-1 min-w-0"
        @keyup.enter="criar"
      />
      <VSelect
        v-if="categorias && categorias.length > 0"
        v-model="categoriaInput"
        :options="categoriaOptions"
        root-class="w-52 shrink-0"
      />
      <button
        @click="criar"
        :disabled="!descricaoInput.trim()"
        class="gm-btn-amber shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Adicionar
      </button>
    </div>

    <!-- Lista -->
    <div v-if="carregando" class="gm-empty">Carregando...</div>
    <div v-else-if="itens.length === 0" class="gm-empty">Nenhum item cadastrado.</div>
    <ul v-else class="space-y-1.5">
      <li
        v-for="it in itens"
        :key="it.item"
        class="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-2.5"
      >
        <span class="w-8 shrink-0 text-center text-xs font-mono text-zinc-600">{{ it.item }}</span>
        <span class="flex-1 text-sm text-zinc-200">{{ it.descricao }}</span>
        <span v-if="categorias && it[campoCategoria]" class="hidden sm:block text-xs text-zinc-500 italic">
          {{ nomeCategoria(it[campoCategoria] as number) }}
        </span>
        <button @click="abrirEdicao(it)" class="gm-btn-icon text-amber-400 hover:text-amber-300" title="Editar">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button @click="abrirDeleteConfirm(it)" class="gm-btn-icon text-red-400 hover:text-red-300" title="Deletar">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </li>
    </ul>
  </section>

  <!-- Modal de confirmação de delete -->
  <Modal v-if="deleteConfirm.item !== null" @close="deleteConfirm.item = null" panel-class="max-w-sm" :show-close-button="false">
    <div class="p-6 text-center">
      <p class="mb-1 text-sm text-zinc-400">Deletar item</p>
      <p class="mb-5 text-base font-semibold text-zinc-100">{{ deleteConfirm.item?.descricao }}</p>
      <div class="flex justify-center gap-3">
        <button @click="executarDelete" class="rounded-xl bg-red-800/80 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700/80">Confirmar</button>
        <button @click="deleteConfirm.item = null" class="gm-btn-ghost">Cancelar</button>
      </div>
    </div>
  </Modal>

  <!-- Modal de edição -->
  <Modal v-if="editModal.show" @close="fecharModal" panel-class="max-w-md">
    <div class="p-6 space-y-3">
      <p class="text-sm font-semibold text-zinc-100">
        Editar <span class="font-mono text-zinc-500">#{{ editModal.item?.item }}</span>
      </p>
      <input
        v-model="editModal.descricao"
        type="text"
        placeholder="Descrição *"
        class="gm-input w-full"
        @keyup.enter="salvarModal"
      />
      <VSelect
        v-if="categorias && categorias.length > 0"
        v-model="editModal.categoria"
        :options="categoriaOptions"
        root-class="w-full"
      />
      <div class="flex justify-end gap-2 pt-1">
        <button @click="fecharModal" class="gm-btn-ghost">Cancelar</button>
        <button
          @click="salvarModal"
          :disabled="!editModal.descricao.trim()"
          class="gm-btn-amber disabled:opacity-40 disabled:cursor-not-allowed"
        >Salvar</button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import VSelect from '@/components/VSelect.vue'
import Modal from '@/components/Modal.vue'
import type { TabelaItemApi } from '@/lib/api/tabelas-acessorias.api'

const props = withDefaults(defineProps<{
  titulo: string
  subtitulo?: string
  itens: TabelaItemApi[]
  carregando?: boolean
  categorias?: TabelaItemApi[]
  campoCategoria?: string
  labelCategoria?: string
}>(), {
  carregando: false,
  categorias: () => [],
  campoCategoria: '',
  labelCategoria: 'Categoria',
})

const emit = defineEmits<{
  (e: 'criar', descricao: string, extra?: Record<string, any>): void
  (e: 'editar', item: number, payload: Record<string, any>): void
  (e: 'deletar', item: number): void
}>()

const descricaoInput = ref('')
const categoriaInput = ref<number>(0)

const editModal = ref({
  show: false,
  item: null as TabelaItemApi | null,
  descricao: '',
  categoria: 0 as number,
})

const deleteConfirm = ref({ item: null as TabelaItemApi | null })

const categoriaOptions = computed(() => [
  { value: 0, label: `${props.labelCategoria} (opcional)` },
  ...(props.categorias ?? []).map((c) => ({ value: c.item, label: c.descricao })),
])

function nomeCategoria(item: number): string {
  return props.categorias?.find((c) => c.item === item)?.descricao ?? String(item)
}

function criar() {
  if (!descricaoInput.value.trim()) return
  const extra: Record<string, any> = {}
  if (props.campoCategoria && categoriaInput.value !== 0) {
    extra[props.campoCategoria] = categoriaInput.value
  }
  emit('criar', descricaoInput.value.trim(), extra)
  descricaoInput.value = ''
  categoriaInput.value = 0
}

function abrirDeleteConfirm(it: TabelaItemApi) {
  deleteConfirm.value.item = it
}

function executarDelete() {
  if (!deleteConfirm.value.item) return
  emit('deletar', deleteConfirm.value.item.item)
  deleteConfirm.value.item = null
}

function abrirEdicao(it: TabelaItemApi) {
  editModal.value = {
    show: true,
    item: it,
    descricao: it.descricao,
    categoria: props.campoCategoria ? (it[props.campoCategoria] as number | null) ?? 0 : 0,
  }
}

function fecharModal() {
  editModal.value = { show: false, item: null, descricao: '', categoria: 0 }
}

function salvarModal() {
  if (!editModal.value.descricao.trim() || !editModal.value.item) return
  const payload: Record<string, any> = { descricao: editModal.value.descricao.trim() }
  if (props.campoCategoria && editModal.value.categoria !== 0) {
    payload[props.campoCategoria] = editModal.value.categoria
  }
  emit('editar', editModal.value.item.item, payload)
  fecharModal()
}
</script>

<style scoped>
.gm-card {
  background: rgb(255 255 255 / 0.025); border-width: 1px; border-style: solid;
  border-radius: 1.25rem; padding: 1.25rem; backdrop-filter: blur(8px);
}
@media (min-width: 640px) { .gm-card { padding: 1.5rem; } }
.gm-card-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1rem; }
.gm-icon-wrap { display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 0.6rem; flex-shrink: 0; }
.gm-title { font-size: 0.9rem; font-weight: 700; color: #f1f5f9; }
.gm-subtitle { font-size: 0.72rem; color: #71717a; margin-top: 0.1rem; }
.gm-empty { font-size: 0.875rem; color: #52525b; font-style: italic; padding: 0.5rem 0; }
.gm-input {
  background: rgb(0 0 0 / 0.35); border: 1px solid rgb(255 255 255 / 0.09);
  border-radius: 0.75rem; color: #e2e8f0; font-size: 0.875rem;
  padding: 0.5rem 0.75rem; outline: none; transition: border-color 0.15s;
}
.gm-input:focus { border-color: rgb(180 83 9 / 0.55); box-shadow: 0 0 0 3px rgb(180 83 9 / 0.1); }
.gm-input::placeholder { color: #3f3f46; }
.gm-btn-amber {
  display: inline-flex; align-items: center; border-radius: 0.75rem;
  background: rgb(180 83 9 / 0.7); padding: 0.5rem 1rem;
  font-size: 0.8125rem; font-weight: 600; color: #fff; transition: background 0.15s;
}
.gm-btn-amber:hover { background: rgb(180 83 9 / 0.9); }
.gm-btn-ghost {
  display: inline-flex; align-items: center; border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1); background: rgb(255 255 255 / 0.04);
  padding: 0.45rem 0.9rem; font-size: 0.75rem; font-weight: 500; color: #a1a1aa;
  transition: background 0.15s, color 0.15s;
}
.gm-btn-ghost:hover { background: rgb(255 255 255 / 0.07); color: #e4e4e7; }
.gm-btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
  border: 1px solid rgb(255 255 255 / 0.06); background: rgb(255 255 255 / 0.02);
  transition: background 0.15s, border-color 0.15s;
}
.gm-btn-icon:hover { background: rgb(255 255 255 / 0.06); }
:global(html.theme-light) .gm-card { background: var(--bg-card); border-color: var(--border-soft); }
:global(html.theme-light) .gm-title { color: var(--text-main); }
:global(html.theme-light) .gm-subtitle { color: var(--text-muted); }
:global(html.theme-light) .gm-empty { color: var(--text-muted); }
:global(html.theme-light) .gm-input { background: #fff; border-color: var(--border-soft); color: var(--text-main); }
</style>
