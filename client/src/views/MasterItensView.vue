<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(245_158_11/0.07),transparent)]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">✦ Itens ✦</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
          @click="abrirForm(null)"
        >
          + Novo Item
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p class="mb-5 text-sm text-zinc-500">
        O que só se carrega, vende ou entrega numa receita — ingredientes, materiais,
        ferramentas, equipamento de exploração e cosméticos.
        O que <span class="text-zinc-400">some ao usar</span> fica em Consumíveis.
      </p>

      <div class="mb-4 flex flex-wrap gap-3">
        <input
          v-model="busca"
          type="text"
          placeholder="Filtrar por nome ou descrição..."
          class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 sm:max-w-xs"
        />
        <div class="w-44">
          <VSelect v-model="filtroCategoria" :options="opcoesFiltroCategoria" />
        </div>
        <div class="w-40">
          <VSelect v-model="filtroRaridade" :options="opcoesFiltroRaridade" />
        </div>
      </div>

      <DataTable
        :colunas="[
          { label: 'Nome' },
          { label: 'Categoria', classe: 'hidden sm:block' },
          { label: 'Raridade', classe: 'hidden sm:block' },
          { label: 'Descrição', classe: 'hidden md:block' },
          { label: 'Peso', classe: 'hidden lg:block' },
          { label: 'Valor' },
        ]"
        classe-grid="grid grid-cols-[2fr_8rem_7rem_3fr_4rem_5rem_3rem] items-center gap-3"
        :itens="listaFiltrada"
        :carregando="carregando"
        mensagem-vazia="Nenhum item cadastrado."
        @editar="(item) => abrirForm(item as ItemApi)"
        @deletar="(item) => paraDeletar = item as ItemApi"
      >
        <template #linha="{ item }">
          <div class="min-w-0">
            <p class="truncate font-medium text-zinc-200">{{ (item as ItemApi).nome }}</p>
            <p v-if="!(item as ItemApi).empilhavel" class="text-[0.65rem] text-zinc-600">não empilha</p>
          </div>

          <span class="hidden truncate text-xs text-zinc-500 sm:block">
            {{ (item as ItemApi).categoria?.descricao ?? '—' }}
          </span>

          <span class="hidden sm:block">
            <span
              v-if="(item as ItemApi).raridade"
              class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
              :class="classeDaRaridade((item as ItemApi).raridade!.cor)"
            >{{ (item as ItemApi).raridade!.descricao }}</span>
            <span v-else class="text-xs text-zinc-700">—</span>
          </span>

          <span class="hidden truncate text-xs text-zinc-500 md:block">
            {{ (item as ItemApi).descricao || '—' }}
          </span>

          <span class="hidden text-xs text-zinc-500 lg:block">
            {{ (item as ItemApi).peso !== null ? `${(item as ItemApi).peso} kg` : '—' }}
          </span>

          <span class="text-xs font-semibold text-amber-300">
            {{ (item as ItemApi).valor !== null ? `${(item as ItemApi).valor} pr` : '—' }}
          </span>
        </template>

        <template #vazia-cta>
          <button
            type="button"
            class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500"
            @click="abrirForm(null)"
          >
            Criar o primeiro
          </button>
        </template>
      </DataTable>
    </main>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-xl max-h-[90vh] flex flex-col"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalAberto = false"
    >
      <template #header>
        <p class="text-base font-bold text-white">{{ editando ? 'Editar Item' : 'Novo Item' }}</p>
      </template>

      <div class="space-y-4 overflow-y-auto p-6">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nome</label>
          <input
            v-model="form.nome" type="text" placeholder="Erva de Sangue"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Descrição</label>
          <textarea
            v-model="form.descricao" rows="3"
            placeholder="Como o item se parece, onde se encontra, para que serve..."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Categoria</label>
            <VSelect v-model="form.categoria_item" :options="opcoesCategoria" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Raridade</label>
            <VSelect v-model="form.raridade_item" :options="opcoesRaridade" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Peso (kg)</label>
            <input v-model.number="form.peso" type="number" min="0" step="0.1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Valor (prata)</label>
            <input v-model.number="form.valor" type="number" min="0" step="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-amber-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Empilha?</label>
            <button
              type="button"
              class="w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
              :class="form.empilhavel
                ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                : 'border-white/10 bg-white/[0.04] text-zinc-500'"
              @click="form.empilhavel = !form.empilhavel"
            >
              {{ form.empilhavel ? 'Sim' : 'Não' }}
            </button>
          </div>
        </div>

        <p v-if="raridadeEscolhida" class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[0.7rem] text-zinc-500">
          <strong class="text-zinc-400">{{ raridadeEscolhida.descricao }}</strong> —
          {{ raridadeEscolhida.disponibilidade }}.
          Referência de preço: ×{{ raridadeEscolhida.multiplicador_valor }}
          <span class="mt-1 block text-zinc-600">
            O multiplicador é só referência para você decidir o valor — ele não é aplicado em cima do que digitar.
          </span>
        </p>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
            @click="modalAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button" :disabled="salvando || !form.nome.trim()"
            class="flex-1 rounded-2xl bg-amber-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-500 disabled:opacity-40"
            @click="salvar"
          >
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
        <p class="text-base font-bold text-white">Apagar item?</p>
        <p class="text-sm text-zinc-400">
          <strong class="text-white">{{ paraDeletar.nome }}</strong> sai da listagem.
          O registro é preservado no banco e pode ser restaurado.
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="paraDeletar = null"
          >
            Cancelar
          </button>
          <button
            type="button" :disabled="salvando"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="deletar"
          >
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
  listarItens, criarItem, editarItem, deletarItem, listarCategoriasItem,
  type ItemApi, type CategoriaItemApi,
} from '@/lib/api/itens.api'
import { listarRaridades, classeDaRaridade, type RaridadeApi } from '@/lib/api/raridades.api'

const router = useRouter()

const itens      = ref<ItemApi[]>([])
const categorias = ref<CategoriaItemApi[]>([])
const raridades  = ref<RaridadeApi[]>([])
const carregando = ref(true)

const busca           = ref('')
const filtroCategoria = ref<string | number>('')
const filtroRaridade  = ref<string | number>('')

const modalAberto = ref(false)
const editando    = ref<ItemApi | null>(null)
const paraDeletar = ref<ItemApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')

const formVazio = () => ({
  nome: '',
  descricao: '',
  peso: null as number | null,
  valor: null as number | null,
  empilhavel: true,
  raridade_item: '' as string | number,
  categoria_item: '' as string | number,
})
const form = ref(formVazio())

const opcoesCategoria = computed(() =>
  categorias.value.map(c => ({ value: c.item, label: c.descricao })),
)
const opcoesRaridade = computed(() =>
  raridades.value.map(r => ({ value: r.item, label: r.descricao })),
)
const opcoesFiltroCategoria = computed(() => [
  { value: '', label: 'Todas as categorias' },
  ...opcoesCategoria.value,
])
const opcoesFiltroRaridade = computed(() => [
  { value: '', label: 'Todas as raridades' },
  ...opcoesRaridade.value,
])

const raridadeEscolhida = computed(() =>
  raridades.value.find(r => r.item === Number(form.value.raridade_item)) ?? null,
)

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return itens.value.filter(i => {
    if (termo && !`${i.nome} ${i.descricao ?? ''}`.toLowerCase().includes(termo)) return false
    if (filtroCategoria.value !== '' && i.categoria_item !== Number(filtroCategoria.value)) return false
    if (filtroRaridade.value !== '' && i.raridade_item !== Number(filtroRaridade.value)) return false
    return true
  })
})

async function carregar() {
  carregando.value = true
  try {
    // allSettled: uma lista de apoio que falhe não pode apagar a tela inteira.
    const [lista, cats, rars] = await Promise.allSettled([
      listarItens(), listarCategoriasItem(), listarRaridades(),
    ])
    if (lista.status === 'fulfilled') itens.value      = lista.value
    if (cats.status  === 'fulfilled') categorias.value = cats.value
    if (rars.status  === 'fulfilled') raridades.value  = rars.value
  } finally {
    carregando.value = false
  }
}

function abrirForm(item: ItemApi | null) {
  erroModal.value = ''
  editando.value = item
  form.value = item
    ? {
        nome: item.nome,
        descricao: item.descricao ?? '',
        peso: item.peso,
        valor: item.valor,
        empilhavel: item.empilhavel,
        raridade_item: item.raridade_item ?? '',
        categoria_item: item.categoria_item ?? '',
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
      peso: form.value.peso ?? null,
      valor: form.value.valor ?? null,
      empilhavel: form.value.empilhavel,
      raridade_item: form.value.raridade_item === '' ? null : Number(form.value.raridade_item),
      categoria_item: form.value.categoria_item === '' ? null : Number(form.value.categoria_item),
    }

    if (editando.value) {
      const atualizado = await editarItem(editando.value.id, payload)
      const posicao = itens.value.findIndex(i => i.id === editando.value!.id)
      if (posicao !== -1) itens.value[posicao] = atualizado
    } else {
      itens.value.push(await criarItem(payload))
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
    await deletarItem(paraDeletar.value.id)
    itens.value = itens.value.filter(i => i.id !== paraDeletar.value!.id)
    paraDeletar.value = null
  } catch {
    // A listagem continua como está; o mestre pode tentar de novo.
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>
