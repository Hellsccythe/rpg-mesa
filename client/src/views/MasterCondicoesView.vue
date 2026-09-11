<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(239_68_68/0.07),transparent)]" />

    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-red-400">☠ Condições ☠</span>
        </div>
        <button type="button"
          class="rounded-xl bg-red-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
          @click="abrirForm(null)">
          + Nova Condição
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p class="mb-2 text-sm text-zinc-500">
        O que dá errado com um personagem. Skills, venenos, armadilhas e monstros infligem;
        poção, Medicina e tempo respondem.
      </p>
      <p class="mb-5 text-xs text-zinc-600">
        A gravidade é a raridade da cura — uma condição Rara exige antídoto Raro, e a dificuldade
        de fabricá-lo sai da mesma escala.
      </p>

      <div class="mb-4 flex flex-wrap gap-3">
        <input v-model="busca" type="text" placeholder="Filtrar por nome ou efeito..."
          class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50 sm:max-w-xs" />
        <div class="w-40"><VSelect v-model="filtroCategoria" :options="opcoesFiltroCategoria" /></div>
        <div class="w-40"><VSelect v-model="filtroRaridade" :options="opcoesFiltroRaridade" /></div>
        <button type="button"
          class="rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
          :class="soSemCura
            ? 'border-amber-500/40 bg-amber-950/30 text-amber-300'
            : 'border-white/10 bg-white/[0.04] text-zinc-500 hover:text-zinc-300'"
          @click="soSemCura = !soSemCura">
          Sem tratamento
        </button>
      </div>

      <p v-if="carregando" class="py-16 text-center text-sm text-zinc-600">Carregando...</p>

      <div v-else-if="!listaFiltrada.length" class="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
        <p class="mb-4 text-sm text-zinc-500">Nenhuma condição encontrada.</p>
      </div>

      <div v-else class="space-y-3">
        <article v-for="condicao in listaFiltrada" :key="condicao.id"
          class="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div class="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-semibold text-zinc-100">{{ condicao.nome }}</h3>
              <span class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
                :class="CLASSE_POR_CATEGORIA[condicao.categoria]">{{ condicao.categoria }}</span>
              <span v-if="condicao.raridade"
                class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
                :class="classeDaRaridade(condicao.raridade.cor)">{{ condicao.raridade.descricao }}</span>
              <span v-if="condicao.acumulativa"
                class="rounded-full border border-white/10 px-2 py-0.5 text-[0.6rem] text-zinc-500">acumula</span>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button"
                class="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 hover:border-white/25 hover:text-white"
                @click="abrirForm(condicao)">Editar</button>
              <button type="button"
                class="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-400 hover:bg-red-900/25"
                @click="paraDeletar = condicao">Apagar</button>
            </div>
          </div>

          <p class="mb-2 text-sm text-zinc-400">{{ condicao.efeito }}</p>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-600">
            <span>Dura: <strong class="text-zinc-400">{{ condicao.duracao || '—' }}</strong></span>
            <span v-if="condicao.janela_de_cura" class="text-amber-400/90">
              Janela de cura: <strong>{{ condicao.janela_de_cura }}</strong>
            </span>
          </div>

          <p v-if="condicao.se_nao_tratada" class="mt-1.5 text-xs italic text-amber-500/80">
            Passada a janela: {{ condicao.se_nao_tratada }}
          </p>

          <!-- O que existe contra ela. Vazio é informação, não ausência de dado. -->
          <div class="mt-3 border-t border-white/[0.06] pt-2.5">
            <p v-if="!condicao.tratada_por.length" class="text-xs text-amber-400/80">
              Nenhum consumível trata esta condição.
            </p>
            <div v-else class="flex flex-wrap items-center gap-1.5">
              <span class="mr-1 text-[0.65rem] uppercase tracking-widest text-zinc-600">Tratada por</span>
              <span v-for="t in condicao.tratada_por" :key="`${t.id}-${t.acao}`"
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                :class="t.acao === 'cura'
                  ? 'border-emerald-500/25 bg-emerald-950/30 text-emerald-300'
                  : 'border-sky-500/25 bg-sky-950/30 text-sky-300'">
                {{ t.nome }}
                <span class="text-[0.6rem] opacity-70">{{ t.acao === 'cura' ? 'cura' : 'previne' }}</span>
                <span v-if="t.valor !== null" class="text-[0.6rem] text-zinc-500">{{ t.valor }} pr</span>
              </span>
            </div>

            <!-- Quem a causa. Em vermelho, e em linha própria: não é tratamento. -->
            <div v-if="condicao.infligida_por.length" class="mt-2 flex flex-wrap items-center gap-1.5">
              <span class="mr-1 text-[0.65rem] uppercase tracking-widest text-zinc-600">Infligida por</span>
              <span v-for="v in condicao.infligida_por" :key="v.id"
                class="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-950/30 px-2.5 py-1 text-xs text-red-300">
                {{ v.nome }}
                <span v-if="v.valor !== null" class="text-[0.6rem] text-zinc-500">{{ v.valor }} pr</span>
              </span>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <Modal v-if="modalAberto" panel-class="max-w-xl max-h-[90vh] flex flex-col" tema="escuro"
      :show-close-button="false" :close-on-backdrop="false" @close="modalAberto = false">
      <template #header>
        <p class="text-base font-bold text-white">{{ editando ? 'Editar Condição' : 'Nova Condição' }}</p>
      </template>

      <div class="space-y-4 overflow-y-auto p-6">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nome</label>
          <input v-model="form.nome" type="text" placeholder="Cegueira"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-red-400/80">Efeito</label>
          <p class="text-[0.65rem] text-zinc-600">O que acontece na prática. É isto que a mesa lê.</p>
          <textarea v-model="form.efeito" rows="2"
            placeholder="Não enxerga. Ataque à distância falha automaticamente."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Categoria</label>
            <VSelect v-model="form.categoria" :options="opcoesCategoria" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Gravidade</label>
            <VSelect v-model="form.raridade_item" :options="opcoesRaridade" />
            <p class="text-[0.65rem] text-zinc-600">Define a raridade do antídoto.</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Duração</label>
            <input v-model="form.duracao" type="text" placeholder="Até ser tratada"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-amber-400/80">Janela de cura</label>
            <input v-model="form.janela_de_cura" type="text" placeholder="3 dias — vazio = sem prazo"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50" />
          </div>
        </div>

        <div v-if="form.janela_de_cura.trim()" class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Passada a janela</label>
          <input v-model="form.se_nao_tratada" type="text"
            placeholder="A cegueira se torna permanente e nenhuma poção a alcança."
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50" />
        </div>

        <button type="button"
          class="w-full rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"
          :class="form.acumulativa
            ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
            : 'border-white/10 bg-white/[0.04] text-zinc-500'"
          @click="form.acumulativa = !form.acumulativa">
          {{ form.acumulativa ? 'Acumula de fontes diferentes' : 'Não acumula' }}
        </button>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="modalAberto = false">Cancelar</button>
          <button type="button" :disabled="salvando || !form.nome.trim()"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="salvar">{{ salvando ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </template>
    </Modal>

    <!-- ── Confirmação ────────────────────────────────────────────────────── -->
    <Modal v-if="paraDeletar" panel-class="max-w-sm" tema="escuro"
      :show-close-button="false" :close-on-backdrop="false" @close="paraDeletar = null">
      <div class="space-y-4 p-6">
        <p class="text-base font-bold text-white">Apagar condição?</p>
        <p class="text-sm text-zinc-400"><strong class="text-white">{{ paraDeletar.nome }}</strong> sai da listagem.</p>
        <p v-if="paraDeletar.tratada_por.length + paraDeletar.infligida_por.length" class="text-xs text-amber-400">
          {{ paraDeletar.tratada_por.length + paraDeletar.infligida_por.length }} consumível(is) tratam ou
          aplicam esta condição — o servidor vai recusar enquanto os vínculos existirem.
        </p>
        <p v-if="erroDelete" class="text-xs text-red-400">{{ erroDelete }}</p>
        <div class="flex gap-3">
          <button type="button" class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="paraDeletar = null">Cancelar</button>
          <button type="button" :disabled="salvando"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="deletar">Apagar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarCondicoes, criarCondicao, editarCondicao, deletarCondicao,
  CATEGORIAS_CONDICAO, CLASSE_POR_CATEGORIA,
  type CondicaoApi, type CategoriaCondicao,
} from '@/lib/api/condicoes.api'
import { listarRaridades, classeDaRaridade, type RaridadeApi } from '@/lib/api/raridades.api'

const router = useRouter()

const condicoes  = ref<CondicaoApi[]>([])
const raridades  = ref<RaridadeApi[]>([])
const carregando = ref(true)

const busca           = ref('')
const filtroCategoria = ref<string>('')
const filtroRaridade  = ref<string | number>('')
const soSemCura       = ref(false)

const modalAberto = ref(false)
const editando    = ref<CondicaoApi | null>(null)
const paraDeletar = ref<CondicaoApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')
const erroDelete  = ref('')

const formVazio = () => ({
  nome: '',
  efeito: '',
  categoria: 'Física' as CategoriaCondicao,
  raridade_item: '' as string | number,
  duracao: '',
  janela_de_cura: '',
  se_nao_tratada: '',
  acumulativa: false,
})
const form = ref(formVazio())

const opcoesCategoria = CATEGORIAS_CONDICAO.map(c => ({ value: c, label: c }))
const opcoesRaridade = computed(() => raridades.value.map(r => ({ value: r.item, label: r.descricao })))
const opcoesFiltroCategoria = [{ value: '', label: 'Todas as categorias' }, ...opcoesCategoria]
const opcoesFiltroRaridade = computed(() => [{ value: '', label: 'Todas as gravidades' }, ...opcoesRaridade.value])

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return condicoes.value.filter(c => {
    if (termo && !`${c.nome} ${c.efeito}`.toLowerCase().includes(termo)) return false
    if (filtroCategoria.value && c.categoria !== filtroCategoria.value) return false
    if (filtroRaridade.value !== '' && c.raridade_item !== Number(filtroRaridade.value)) return false
    if (soSemCura.value && c.tratada_por.length > 0) return false
    return true
  })
})

async function carregar() {
  carregando.value = true
  try {
    // allSettled: as raridades são apoio; se falharem, a tela ainda serve.
    const [conds, rars] = await Promise.allSettled([listarCondicoes(), listarRaridades()])
    if (conds.status === 'fulfilled') condicoes.value = conds.value
    if (rars.status === 'fulfilled') raridades.value = rars.value
  } finally {
    carregando.value = false
  }
}

function abrirForm(condicao: CondicaoApi | null) {
  erroModal.value = ''
  editando.value = condicao
  form.value = condicao
    ? {
        nome: condicao.nome,
        efeito: condicao.efeito,
        categoria: condicao.categoria,
        raridade_item: condicao.raridade_item ?? '',
        duracao: condicao.duracao,
        janela_de_cura: condicao.janela_de_cura ?? '',
        se_nao_tratada: condicao.se_nao_tratada ?? '',
        acumulativa: condicao.acumulativa,
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
      efeito: form.value.efeito.trim() || undefined,
      categoria: form.value.categoria,
      raridade_item: form.value.raridade_item === '' ? null : Number(form.value.raridade_item),
      duracao: form.value.duracao.trim() || undefined,
      janela_de_cura: form.value.janela_de_cura.trim() || null,
      // Sem janela, o texto do "passada a janela" não tem sentido e é descartado.
      se_nao_tratada: form.value.janela_de_cura.trim()
        ? (form.value.se_nao_tratada.trim() || null)
        : null,
      acumulativa: form.value.acumulativa,
    }
    if (editando.value) {
      const atualizada = await editarCondicao(editando.value.id, payload)
      const posicao = condicoes.value.findIndex(c => c.id === editando.value!.id)
      if (posicao !== -1) condicoes.value[posicao] = atualizada
    } else {
      condicoes.value.push(await criarCondicao(payload))
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
  erroDelete.value = ''
  try {
    await deletarCondicao(paraDeletar.value.id)
    condicoes.value = condicoes.value.filter(c => c.id !== paraDeletar.value!.id)
    paraDeletar.value = null
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.message ?? 'Erro ao apagar.'
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>
