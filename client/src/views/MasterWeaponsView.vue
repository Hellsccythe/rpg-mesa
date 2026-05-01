<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#1C0B0B]" />
    <div class="page-ambient fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(180_40_40/0.08),transparent)]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <!-- ══ Header ══════════════════════════════════════════════════════════════ -->
      <header class="page-header sticky top-0 z-20 border-b backdrop-blur-xl">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button
            @click="goMasterPanel"
            class="back-btn inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-colors"
            aria-label="Voltar ao painel"
          >
            <span class="text-lg leading-none">‹</span>
            <span class="hidden sm:inline">Painel</span>
          </button>

          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-red-400">⚙ Equipamentos ⚙</span>
          </div>

          <button
            @click="logout"
            class="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/60"
          >
            Sair
          </button>
        </div>
      </header>

      <!-- ══ Main ══════════════════════════════════════════════════════════════ -->
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">

        <!-- ── Título da página ───────────────────────────────────────────────── -->
        <div class="mb-8">
          <p class="page-kicker text-xs uppercase tracking-[0.25em]">Painel do Mestre</p>
          <h1 class="page-title text-3xl font-bold sm:text-4xl">Equipamentos</h1>
          <p class="page-sub mt-1 text-sm">Cadastre, edite e organize os equipamentos da campanha</p>
        </div>

        <!-- ── Filtros + Botão novo ──────────────────────────────────────────── -->
        <div class="mb-6 flex flex-wrap items-end gap-3">
          <div class="min-w-[180px] flex-1">
            <label class="field-label mb-1.5 block text-xs uppercase tracking-wide">Filtrar por nome</label>
            <div class="relative">
              <input
                v-model="filtroNome"
                type="text"
                placeholder="Buscar equipamento..."
                class="field-input w-full rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition-colors"
                aria-label="Filtrar por nome"
              />
              <button
                v-if="filtroNome"
                @click="filtroNome = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm leading-none opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Limpar filtro"
              >✕</button>
            </div>
          </div>

          <div class="w-48">
            <label class="field-label mb-1.5 block text-xs uppercase tracking-wide">Tipo</label>
            <div class="select-wrap">
              <select v-model="filtroTipo" class="field-input w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition-colors">
                <option value="">Todos os tipos</option>
                <option v-for="tipo in tiposUnicos" :key="tipo" :value="tipo">{{ tipo }}</option>
              </select>
              <span class="select-caret" aria-hidden="true">˅</span>
            </div>
          </div>

          <button
            @click="abrirFormNova"
            class="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Equipamento
          </button>
        </div>

        <!-- ── Formulário criar / editar ─────────────────────────────────────── -->
        <transition name="form-slide">
          <div v-if="mostrarForm" class="form-card mb-6 rounded-2xl border p-5 sm:p-6">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="form-title text-base font-bold tracking-wide">
                {{ editandoId ? 'Editar Equipamento' : 'Novo Equipamento' }}
              </h2>
              <button
                @click="fecharForm"
                class="close-btn rounded-lg p-1.5 transition-colors"
                aria-label="Fechar formulário"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <!-- Nome -->
              <div class="lg:col-span-2">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Nome <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.nome"
                  type="text"
                  placeholder="Ex: Espada Longa"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                  aria-required="true"
                />
              </div>

              <!-- Tipo -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Tipo <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.tipo"
                  type="text"
                  placeholder="Ex: Espada, Arco, Maça"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                  list="tipos-sugeridos"
                  aria-required="true"
                />
                <datalist id="tipos-sugeridos">
                  <option v-for="t in tiposUnicos" :key="t" :value="t" />
                </datalist>
              </div>

              <!-- Dano -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                  Dano <span class="text-red-400">*</span>
                </label>
                <input
                  v-model="form.dano"
                  type="text"
                  placeholder="Ex: 1d8+3"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm font-mono outline-none transition-colors"
                  aria-required="true"
                />
              </div>

              <!-- Peso -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Peso (kg)</label>
                <input
                  v-model.number="form.peso"
                  type="number"
                  min="0"
                  max="9999999.99"
                  step="0.01"
                  placeholder="Ex: 1.50"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <!-- Valor -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Valor (po)</label>
                <input
                  v-model.number="form.valor"
                  type="number"
                  min="0"
                  max="99999999999.99"
                  step="0.01"
                  placeholder="Ex: 15.00"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <!-- Propriedades (full width) -->
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Propriedades</label>
                <input
                  v-model="form.propriedades"
                  type="text"
                  placeholder="Ex: Versátil, Acuidade, Alcance 1,5m"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <!-- Categoria -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Categoria</label>
                <input
                  v-model="form.categoria_equipamento"
                  type="text"
                  placeholder="Ex: Combate, Exploração, Utilitário"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <!-- Pré-requisitos -->
              <div class="sm:col-span-2">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Pré-requisitos</label>
                <input
                  v-model="form.pre_requisitos"
                  type="text"
                  placeholder="Ex: Força 13, Proficiência em Armaduras Pesadas"
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                />
              </div>

              <!-- Descrição (full width) -->
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Descrição</label>
                <textarea
                  v-model="form.descricao_equipamento"
                  rows="2"
                  placeholder="Descrição do equipamento..."
                  class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                />
              </div>
            </div>

            <!-- Feedback -->
            <p v-if="formFeedback" class="mt-3 text-sm" :class="formFeedbackError ? 'text-red-400' : 'text-emerald-400'">
              {{ formFeedback }}
            </p>

            <!-- Ações -->
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <button
                @click="salvar"
                :disabled="salvando || !form.nome.trim() || !form.tipo.trim()"
                class="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 transition-all"
              >
                {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar Alterações' : 'Criar Equipamento') }}
              </button>
              <button
                @click="fecharForm"
                class="btn-ghost rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </transition>

        <!-- ── Feedback global ─────────────────────────────────────────────────── -->
        <p v-if="feedback && !mostrarForm" class="mb-4 text-sm" :class="feedbackError ? 'text-red-400' : 'text-emerald-400'">
          {{ feedback }}
        </p>

        <!-- ── Lista de armas ─────────────────────────────────────────────────── -->
        <div class="weapons-table rounded-2xl border overflow-hidden">
          <!-- Cabeçalho da tabela -->
          <div class="table-head grid grid-cols-[1fr_auto_auto_auto_auto_3rem] items-center gap-3 border-b px-4 py-3 text-xs font-bold uppercase tracking-wider sm:grid-cols-[2fr_1fr_1fr_1fr_2fr_3rem]">
            <span>Nome</span>
            <span class="hidden sm:block">Tipo</span>
            <span>Dano</span>
            <span class="hidden sm:block">Peso</span>
            <span class="hidden sm:block">Propriedades</span>
            <span class="text-center">Ações</span>
          </div>

          <!-- Loading -->
          <div v-if="carregando" class="flex items-center justify-center py-16">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-red-500/30 border-t-red-400" />
          </div>

          <!-- Vazio -->
          <div v-else-if="armasFiltradas.length === 0" class="empty-state flex flex-col items-center justify-center gap-2 py-16 text-center">
            <svg class="h-10 w-10 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>
              <path d="M13 19l6-6"/>
              <path d="M16 16l4 4"/>
              <path d="M19 21l2-2"/>
            </svg>
            <p class="text-sm font-medium opacity-50">
              {{ filtroNome || filtroTipo ? 'Nenhum equipamento encontrado com esses filtros.' : 'Nenhum equipamento cadastrado ainda.' }}
            </p>
            <button v-if="!filtroNome && !filtroTipo" @click="abrirFormNova" class="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">
              Cadastrar primeiro equipamento
            </button>
          </div>

          <!-- Linhas -->
          <template v-else>
            <div
              v-for="(arma, index) in armasFiltradas"
              :key="arma.id"
              class="weapon-row grid grid-cols-[1fr_auto_auto_auto_auto_3rem] items-center gap-3 border-b px-4 py-3.5 transition-colors last:border-b-0 sm:grid-cols-[2fr_1fr_1fr_1fr_2fr_3rem]"
              :class="{ 'row-even': index % 2 === 0 }"
            >
              <!-- Nome + badge tipo mobile -->
              <div class="min-w-0">
                <p class="weapon-name truncate text-sm font-semibold">{{ arma.nome }}</p>
                <span class="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-semibold sm:hidden"
                  :class="tipoBadgeClass(arma.tipo)">
                  {{ arma.tipo }}
                </span>
              </div>

              <!-- Tipo -->
              <span class="hidden truncate sm:block">
                <span class="tipo-badge rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="tipoBadgeClass(arma.tipo)">
                  {{ arma.tipo }}
                </span>
              </span>

              <!-- Dano -->
              <span class="dano-text font-mono text-sm font-bold">{{ arma.dano || '—' }}</span>

              <!-- Peso -->
              <span class="hidden text-sm sm:block text-muted">
                {{ arma.peso != null ? arma.peso.toFixed(2) + ' kg' : '—' }}
              </span>

              <!-- Propriedades -->
              <span class="hidden truncate text-xs sm:block text-muted" :title="arma.propriedades">
                {{ arma.propriedades || '—' }}
              </span>

              <!-- Ações -->
              <div class="flex items-center justify-end gap-1.5">
                <button
                  @click="iniciarEdicao(arma)"
                  class="action-btn-edit rounded-lg p-1.5 transition-colors"
                  :aria-label="`Editar ${arma.nome}`"
                  title="Editar"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  @click="confirmarDelete(arma)"
                  class="action-btn-del rounded-lg p-1.5 transition-colors"
                  :aria-label="`Deletar ${arma.nome}`"
                  title="Deletar"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- ── Contagem ────────────────────────────────────────────────────────── -->
        <p v-if="armas.length > 0" class="mt-3 text-xs text-muted">
          {{ armasFiltradas.length }} de {{ armas.length }} equipamento(s)
        </p>

      </main>
    </TemaDarkLight>

    <!-- ══ Modal de confirmação de delete ════════════════════════════════════ -->
    <transition name="modal-fade">
      <div
        v-if="armaParaDeletar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        @click.self="armaParaDeletar = null"
      >
        <div class="modal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div class="modal-card relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <h3 class="modal-title mb-1 text-base font-bold">Deletar Equipamento</h3>
          <p class="modal-body mb-4 text-sm">
            Tem certeza que deseja deletar
            <strong>{{ armaParaDeletar.nome }}</strong>?
            Esta ação é irreversível.
          </p>
          <div class="flex gap-3">
            <button
              @click="executarDelete"
              :disabled="deletando"
              class="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-wait disabled:opacity-50"
            >
              {{ deletando ? 'Deletando...' : 'Sim, deletar' }}
            </button>
            <button
              @click="armaParaDeletar = null"
              class="btn-ghost flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import {
  listarArmas,
  criarArma,
  editarArma,
  deletarArma,
  type ArmaApi,
} from '@/lib/api/armas.api'

const router = useRouter()
const authStore = useAuthStore()

const armas = ref<ArmaApi[]>([])
const carregando = ref(false)
const salvando = ref(false)
const deletando = ref(false)
const feedback = ref('')
const feedbackError = ref(false)

const filtroNome = ref('')
const filtroTipo = ref('')

const mostrarForm = ref(false)
const editandoId = ref<string | null>(null)
const formFeedback = ref('')
const formFeedbackError = ref(false)

const armaParaDeletar = ref<ArmaApi | null>(null)

const form = reactive({
  nome: '',
  tipo: '',
  dano: '',
  peso: null as number | null,
  propriedades: '',
  valor: null as number | null,
  categoria_equipamento: '',
  descricao_equipamento: '',
  pre_requisitos: '',
})

const TIPO_COLORS: Record<string, string> = {
  espada: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  arco: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  maça: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  maca: 'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  lança: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  lanca: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  adaga: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
  machado: 'bg-red-500/15 text-red-300 border border-red-500/25',
  cajado: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  besta: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
}

function tipoBadgeClass(tipo: string): string {
  const key = (tipo || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return TIPO_COLORS[key] ?? 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/25'
}

const tiposUnicos = computed(() => {
  const set = new Set(armas.value.map((a) => a.tipo).filter(Boolean))
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const armasFiltradas = computed(() => {
  const nome = filtroNome.value.trim().toLowerCase()
  const tipo = filtroTipo.value
  return armas.value.filter((a) => {
    if (nome && !a.nome.toLowerCase().includes(nome)) return false
    if (tipo && a.tipo !== tipo) return false
    return true
  })
})

function resetForm() {
  form.nome = ''
  form.tipo = ''
  form.dano = ''
  form.peso = null
  form.propriedades = ''
  form.valor = null
  form.categoria_equipamento = ''
  form.descricao_equipamento = ''
  form.pre_requisitos = ''
  formFeedback.value = ''
  formFeedbackError.value = false
  editandoId.value = null
}

function abrirFormNova() {
  resetForm()
  mostrarForm.value = true
}

function fecharForm() {
  mostrarForm.value = false
  resetForm()
}

function iniciarEdicao(arma: ArmaApi) {
  editandoId.value = arma.id
  form.nome = arma.nome
  form.tipo = arma.tipo
  form.dano = arma.dano
  form.peso = arma.peso
  form.propriedades = arma.propriedades
  form.valor = arma.valor
  form.categoria_equipamento = arma.categoria_equipamento ?? ''
  form.descricao_equipamento = arma.descricao_equipamento ?? ''
  form.pre_requisitos = arma.pre_requisitos ?? ''
  formFeedback.value = ''
  formFeedbackError.value = false
  mostrarForm.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function confirmarDelete(arma: ArmaApi) {
  armaParaDeletar.value = arma
}

async function carregar() {
  carregando.value = true
  try {
    armas.value = await listarArmas()
  } catch {
    feedback.value = 'Erro ao carregar equipamentos.'
    feedbackError.value = true
  } finally {
    carregando.value = false
  }
}

async function salvar() {
  if (!form.nome.trim() || !form.tipo.trim()) return
  salvando.value = true
  formFeedback.value = ''
  try {
    const pesoNum = form.peso != null && !isNaN(form.peso) ? form.peso : null
    const valorNum = form.valor != null && !isNaN(form.valor) ? form.valor : null

    const payload = {
      nome: form.nome,
      tipo: form.tipo,
      dano: form.dano.trim() || undefined,
      peso: pesoNum,
      propriedades: form.propriedades,
      valor: valorNum,
      categoria_equipamento: form.categoria_equipamento.trim() || null,
      descricao_equipamento: form.descricao_equipamento.trim() || null,
      pre_requisitos: form.pre_requisitos.trim() || null,
    }

    if (editandoId.value) {
      const atualizada = await editarArma(editandoId.value, payload)
      const idx = armas.value.findIndex((a) => a.id === editandoId.value)
      if (idx !== -1) armas.value[idx] = atualizada
      formFeedback.value = 'Equipamento atualizado com sucesso.'
      formFeedbackError.value = false
    } else {
      const nova = await criarArma(payload)
      armas.value.push(nova)
      armas.value.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      formFeedback.value = 'Equipamento criado com sucesso.'
      formFeedbackError.value = false
      resetForm()
    }
  } catch (err: any) {
    formFeedback.value = err?.response?.data?.message || 'Erro ao salvar equipamento.'
    formFeedbackError.value = true
  } finally {
    salvando.value = false
  }
}

async function executarDelete() {
  if (!armaParaDeletar.value) return
  deletando.value = true
  try {
    await deletarArma(armaParaDeletar.value.id)
    armas.value = armas.value.filter((a) => a.id !== armaParaDeletar.value!.id)
    armaParaDeletar.value = null
    feedback.value = 'Equipamento deletado com sucesso.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao deletar equipamento.'
    feedbackError.value = true
    armaParaDeletar.value = null
  } finally {
    deletando.value = false
  }
}

function goMasterPanel() {
  router.push({ name: 'master-panel' })
}

async function logout() {
  await authStore.sair()
  router.push({ name: 'login' })
}

onMounted(carregar)
</script>

<style scoped>
/* ── Page shell ──────────────────────────────────────────────────────────── */
.page-root {
  background: #070C18;
}
.page-header {
  background: rgb(7 12 24 / 0.85);
  border-color: rgb(255 255 255 / 0.07);
}
.back-btn {
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(255 255 255 / 0.04);
  color: #cbd5e1;
}
.back-btn:hover {
  background: rgb(255 255 255 / 0.08);
  color: #fff;
}

/* ── Página títulos ──────────────────────────────────────────────────────── */
.page-kicker  { color: #f87171; }
.page-title   { color: #fca5a5; font-family: 'Cinzel', serif; }
.page-sub     { color: #94a3b8; }

/* ── Campos ──────────────────────────────────────────────────────────────── */
.field-label { color: #64748b; }
.field-input {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.field-input::placeholder { color: #475569; }
.field-input:focus {
  border-color: rgb(248 113 113 / 0.5);
  background: rgb(255 255 255 / 0.06);
}
.select-wrap { position: relative; }
.select-caret {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #475569;
  pointer-events: none;
  font-size: 0.9rem;
}

/* ── Botões ──────────────────────────────────────────────────────────────── */
.btn-primary {
  background: #dc2626;
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: #b91c1c; }
.btn-ghost {
  border-color: rgb(255 255 255 / 0.1);
  color: #94a3b8;
}
.btn-ghost:hover { background: rgb(255 255 255 / 0.05); color: #e2e8f0; }

/* ── Formulário ──────────────────────────────────────────────────────────── */
.form-card {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(248 113 113 / 0.2);
}
.form-title { color: #fca5a5; }
.close-btn { color: #64748b; }
.close-btn:hover { background: rgb(255 255 255 / 0.07); color: #e2e8f0; }

/* ── Tabela ──────────────────────────────────────────────────────────────── */
.weapons-table {
  background: rgb(255 255 255 / 0.02);
  border-color: rgb(255 255 255 / 0.07);
}
.table-head {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(255 255 255 / 0.07);
  color: #64748b;
}
.weapon-row {
  border-color: rgb(255 255 255 / 0.05);
}
.weapon-row:hover { background: rgb(255 255 255 / 0.025); }
.row-even { background: rgb(0 0 0 / 0.12); }
.row-even:hover { background: rgb(255 255 255 / 0.025); }
.weapon-name { color: #e2e8f0; }
.dano-text { color: #fca5a5; }
.text-muted { color: #64748b; }

.empty-state { color: #475569; }

/* ── Botões de ação ──────────────────────────────────────────────────────── */
.action-btn-edit {
  color: #60a5fa;
  background: transparent;
}
.action-btn-edit:hover { background: rgb(96 165 250 / 0.12); }
.action-btn-del {
  color: #f87171;
  background: transparent;
}
.action-btn-del:hover { background: rgb(248 113 113 / 0.12); }

/* ── Modal ───────────────────────────────────────────────────────────────── */
.modal-card {
  background: #0f172a;
  border-color: rgb(255 255 255 / 0.1);
}
.modal-title { color: #f1f5f9; }
.modal-body { color: #94a3b8; }
.modal-body strong { color: #e2e8f0; }

/* ── Transições ──────────────────────────────────────────────────────────── */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.form-slide-enter-from,
.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.18s ease;
}
.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card { transform: scale(0.95); }

/* ══ Light mode ═════════════════════════════════════════════════════════════ */
:global(html.theme-light) .page-root { background: var(--bg-page); color: var(--text-main); }
:global(html.theme-light) .page-ambient { display: none; }
:global(html.theme-light) .page-header {
  background: rgb(255 255 255 / 0.92);
  border-color: var(--border-soft);
}
:global(html.theme-light) .back-btn {
  border-color: var(--border-soft);
  background: var(--bg-soft);
  color: var(--text-muted);
}
:global(html.theme-light) .back-btn:hover { background: var(--accent-soft); color: var(--text-main); }
:global(html.theme-light) .page-kicker { color: #dc2626; }
:global(html.theme-light) .page-title { color: #991b1b; }
:global(html.theme-light) .page-sub { color: var(--text-muted); }

:global(html.theme-light) .field-label { color: var(--text-muted); }
:global(html.theme-light) .field-input {
  background: #fff;
  border-color: var(--border-soft);
  color: var(--text-main);
}
:global(html.theme-light) .field-input::placeholder { color: #94a3b8; }
:global(html.theme-light) .field-input:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgb(248 113 113 / 0.15);
}

:global(html.theme-light) .btn-primary { background: #dc2626; }
:global(html.theme-light) .btn-primary:hover:not(:disabled) { background: #b91c1c; }
:global(html.theme-light) .btn-ghost {
  border-color: var(--border-soft);
  color: var(--text-muted);
}
:global(html.theme-light) .btn-ghost:hover { background: var(--bg-soft); color: var(--text-main); }

:global(html.theme-light) .form-card {
  background: var(--bg-card);
  border-color: rgb(220 38 38 / 0.2);
  box-shadow: 0 2px 12px rgb(0 0 0 / 0.06);
}
:global(html.theme-light) .form-title { color: #991b1b; }
:global(html.theme-light) .close-btn { color: var(--text-muted); }
:global(html.theme-light) .close-btn:hover { background: var(--bg-soft); }

:global(html.theme-light) .weapons-table {
  background: var(--bg-card);
  border-color: var(--border-soft);
}
:global(html.theme-light) .table-head {
  background: var(--bg-soft);
  border-color: var(--border-soft);
  color: var(--text-muted);
}
:global(html.theme-light) .weapon-row { border-color: var(--border-soft); }
:global(html.theme-light) .weapon-row:hover { background: var(--bg-soft); }
:global(html.theme-light) .row-even { background: var(--bg-soft); }
:global(html.theme-light) .row-even:hover { background: var(--accent-soft); }
:global(html.theme-light) .weapon-name { color: var(--text-main); }
:global(html.theme-light) .dano-text { color: #dc2626; }
:global(html.theme-light) .text-muted { color: var(--text-muted); }
:global(html.theme-light) .empty-state { color: var(--text-muted); }

:global(html.theme-light) .action-btn-edit:hover { background: rgb(59 130 246 / 0.1); }
:global(html.theme-light) .action-btn-del:hover { background: rgb(239 68 68 / 0.1); }

:global(html.theme-light) .modal-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.15);
}
:global(html.theme-light) .modal-title { color: var(--text-main); }
:global(html.theme-light) .modal-body { color: var(--text-muted); }
:global(html.theme-light) .modal-body strong { color: var(--text-main); }

:global(html.theme-light) .select-caret { color: var(--text-muted); }

/* Badge de tipo - light mode */
:global(html.theme-light) .tipo-badge { filter: saturate(1.2); }
</style>
