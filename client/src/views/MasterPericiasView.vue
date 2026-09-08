<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(56_189_248/0.07),transparent)]" />

    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-sky-400">◈ Perícias ◈</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
          @click="abrirForm(null)"
        >
          + Nova Perícia
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <p class="mb-2 text-sm text-zinc-500">
        A terceira trilha de progressão, ao lado do nível de personagem e do nível de classe.
      </p>
      <p class="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
        Teste: <code class="text-zinc-300">d20 + rank × 3 + ⌊atributo ÷ 2⌋</code> contra a dificuldade.
        Rank 0 é não treinado e <strong class="text-zinc-400">não pode tentar</strong>.
        Subir para o rank N custa N pontos — chegar ao rank {{ RANK_MAXIMO }} custa 15.
      </p>

      <div class="mb-4 flex flex-wrap gap-3">
        <input
          v-model="busca"
          type="text"
          placeholder="Filtrar por nome ou descrição..."
          class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500/50 sm:max-w-xs"
        />
        <div class="w-40">
          <VSelect v-model="filtroCategoria" :options="opcoesFiltroCategoria" />
        </div>
        <div class="w-44">
          <VSelect v-model="filtroAtributo" :options="opcoesFiltroAtributo" />
        </div>
      </div>

      <DataTable
        :colunas="[
          { label: 'Perícia' },
          { label: 'Categoria', classe: 'hidden sm:block' },
          { label: 'Atributo', classe: 'hidden sm:block' },
          { label: 'O que cobre', classe: 'hidden md:block' },
        ]"
        classe-grid="grid grid-cols-[1.6fr_7rem_8rem_3fr_3rem] items-center gap-3"
        :itens="listaFiltrada"
        :carregando="carregando"
        mensagem-vazia="Nenhuma perícia cadastrada."
        @editar="(item) => abrirForm(item as PericiaApi)"
        @deletar="(item) => paraDeletar = item as PericiaApi"
      >
        <template #linha="{ item }">
          <p class="truncate font-medium text-zinc-200">{{ (item as PericiaApi).nome }}</p>

          <span class="hidden sm:block">
            <span
              class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
              :class="CLASSE_POR_CATEGORIA[(item as PericiaApi).categoria]"
            >{{ (item as PericiaApi).categoria }}</span>
          </span>

          <span class="hidden truncate text-xs text-zinc-500 sm:block">
            {{ ROTULO_ATRIBUTO[(item as PericiaApi).atributoBase] }}
          </span>

          <span class="hidden truncate text-xs text-zinc-600 md:block">
            {{ (item as PericiaApi).descricao || '—' }}
          </span>
        </template>

        <template #vazia-cta>
          <button
            type="button"
            class="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            @click="abrirForm(null)"
          >
            Criar a primeira
          </button>
        </template>
      </DataTable>
    </main>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-lg"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalAberto = false"
    >
      <template #header>
        <p class="text-base font-bold text-white">{{ editando ? 'Editar Perícia' : 'Nova Perícia' }}</p>
      </template>

      <div class="space-y-4 p-6">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nome</label>
          <input v-model="form.nome" type="text" placeholder="Alquimia"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500/50" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">O que cobre</label>
          <textarea v-model="form.descricao" rows="2"
            placeholder="Extrair, macerar e destilar. Base das poções e dos venenos."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500/50" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Categoria</label>
            <VSelect v-model="form.categoria" :options="opcoesCategoria" />
            <p class="text-[0.65rem] text-zinc-600">Só organiza a tela.</p>
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-sky-400/80">Atributo base</label>
            <VSelect v-model="form.atributo_base" :options="opcoesAtributo" />
            <p class="text-[0.65rem] text-zinc-600">É este que entra no teste.</p>
          </div>
        </div>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="modalAberto = false">
            Cancelar
          </button>
          <button type="button" :disabled="salvando || !form.nome.trim()"
            class="flex-1 rounded-2xl bg-sky-600 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-40"
            @click="salvar">
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- ── Confirmação ────────────────────────────────────────────────────── -->
    <Modal
      v-if="paraDeletar"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="paraDeletar = null"
    >
      <div class="space-y-4 p-6">
        <p class="text-base font-bold text-white">Apagar perícia?</p>
        <p class="text-sm text-zinc-400">
          <strong class="text-white">{{ paraDeletar.nome }}</strong> sai do catálogo.
          Personagens que já têm rank nela <strong class="text-amber-400">mantêm o rank</strong> —
          ele fica gravado na ficha, não aqui.
        </p>
        <div class="flex gap-3">
          <button type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="paraDeletar = null">
            Cancelar
          </button>
          <button type="button" :disabled="salvando"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="deletar">
            Apagar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarPericias, criarPericia, editarPericia, deletarPericia,
  ATRIBUTOS, CATEGORIAS_PERICIA, ROTULO_ATRIBUTO, CLASSE_POR_CATEGORIA, RANK_MAXIMO,
  type PericiaApi, type Atributo, type CategoriaPericia,
} from '@/lib/api/pericias.api'

const router = useRouter()

const pericias   = ref<PericiaApi[]>([])
const carregando = ref(true)

const busca           = ref('')
const filtroCategoria = ref<string>('')
const filtroAtributo  = ref<string>('')

const modalAberto = ref(false)
const editando    = ref<PericiaApi | null>(null)
const paraDeletar = ref<PericiaApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')

const formVazio = () => ({
  nome: '',
  descricao: '',
  atributo_base: 'inteligencia' as Atributo,
  categoria: 'Ofício' as CategoriaPericia,
})
const form = ref(formVazio())

const opcoesCategoria = CATEGORIAS_PERICIA.map(c => ({ value: c, label: c }))
const opcoesAtributo  = ATRIBUTOS.map(a => ({ value: a, label: ROTULO_ATRIBUTO[a] }))
const opcoesFiltroCategoria = [{ value: '', label: 'Todas as categorias' }, ...opcoesCategoria]
const opcoesFiltroAtributo  = [{ value: '', label: 'Todos os atributos' }, ...opcoesAtributo]

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return pericias.value.filter(p => {
    if (termo && !`${p.nome} ${p.descricao}`.toLowerCase().includes(termo)) return false
    if (filtroCategoria.value && p.categoria !== filtroCategoria.value) return false
    if (filtroAtributo.value && p.atributoBase !== filtroAtributo.value) return false
    return true
  })
})

async function carregar() {
  carregando.value = true
  try {
    pericias.value = await listarPericias()
  } finally {
    carregando.value = false
  }
}

function abrirForm(pericia: PericiaApi | null) {
  erroModal.value = ''
  editando.value = pericia
  form.value = pericia
    ? {
        nome: pericia.nome,
        descricao: pericia.descricao,
        atributo_base: pericia.atributoBase,
        categoria: pericia.categoria,
      }
    : formVazio()
  modalAberto.value = true
}

async function salvar() {
  if (!form.value.nome.trim()) return
  salvando.value = true
  erroModal.value = ''
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim() || undefined,
      atributo_base: form.value.atributo_base,
      categoria: form.value.categoria,
    }
    if (editando.value) {
      const atualizada = await editarPericia(editando.value.id, payload)
      const posicao = pericias.value.findIndex(p => p.id === editando.value!.id)
      if (posicao !== -1) pericias.value[posicao] = atualizada
    } else {
      pericias.value.push(await criarPericia(payload))
    }
    modalAberto.value = false
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

async function deletar() {
  if (!paraDeletar.value) return
  salvando.value = true
  try {
    await deletarPericia(paraDeletar.value.id)
    pericias.value = pericias.value.filter(p => p.id !== paraDeletar.value!.id)
    paraDeletar.value = null
  } catch {
    // A listagem continua como está; o mestre pode tentar de novo.
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>
