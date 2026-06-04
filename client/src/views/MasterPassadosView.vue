<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(139_92_246/0.08),transparent)]" />

    <!-- Header -->
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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-violet-400">⚔ Passados ⚔</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-600"
          @click="abrirModal()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Novo Passado
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">

      <!-- Erro -->
      <div v-if="erro" class="mb-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
        {{ erro }}
      </div>

      <!-- Carregando -->
      <div v-if="carregando" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-72 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
        />
      </div>

      <!-- Vazio -->
      <div
        v-else-if="!passados.length"
        class="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-950/30 text-violet-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <p class="text-sm font-semibold text-zinc-300">Nenhum passado cadastrado</p>
        <p class="mt-1 text-xs text-zinc-600">Clique em "Novo Passado" para começar</p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-600"
          @click="abrirModal()"
        >
          Criar primeiro passado
        </button>
      </div>

      <!-- Grid de cards -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="p in passados"
          :key="p.id"
          class="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
        >
          <!-- Imagem -->
          <div class="relative h-44 overflow-hidden">
            <img
              v-if="p.foto_url"
              :src="p.foto_url"
              :alt="p.nome"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950/80 to-slate-900/80"
            >
              <svg class="h-12 w-12 text-violet-800/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#070C18] via-[#070C18]/30 to-transparent" />

            <!-- Botões de ação sobre a imagem -->
            <div class="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm transition-colors hover:border-violet-500/50 hover:text-violet-300"
                title="Editar"
                @click.stop="abrirModal(p)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm transition-colors hover:border-red-500/50 hover:text-red-400"
                title="Deletar"
                @click.stop="abrirConfirmacaoDelete(p)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="flex flex-1 flex-col gap-3 p-5">
            <h3 class="text-base font-bold text-white leading-tight">{{ p.nome }}</h3>

            <p v-if="p.descricao" class="line-clamp-3 text-xs leading-relaxed text-zinc-400">
              {{ p.descricao }}
            </p>
            <p v-else class="text-xs italic text-zinc-600">Sem descrição.</p>

            <!-- Skills concedidas -->
            <div v-if="p.skills.length" class="space-y-1.5">
              <p class="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-500/70">Skills</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="s in p.skills"
                  :key="s.id"
                  class="rounded-full border border-emerald-500/25 bg-emerald-950/40 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-300"
                >
                  {{ s.name }}
                </span>
              </div>
            </div>

            <!-- Títulos concedidos -->
            <div v-if="p.titulos.length" class="space-y-1.5">
              <p class="text-[0.6rem] font-bold uppercase tracking-widest text-amber-500/70">Títulos</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="t in p.titulos"
                  :key="t.id"
                  class="rounded-full border border-amber-500/25 bg-amber-950/40 px-2 py-0.5 text-[0.65rem] font-medium text-amber-300"
                >
                  {{ t.name }}
                </span>
              </div>
            </div>

            <!-- Bônus de atributos -->
            <div v-if="p.atributo_bonus && Object.values(p.atributo_bonus).some(v => v !== 0)" class="space-y-1.5">
              <p class="text-[0.6rem] font-bold uppercase tracking-widest text-rose-500/70">Bônus de Atributos</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="attr in ATRIBUTOS_BONUS_CONFIG"
                  :key="attr.key"
                  v-if="(p.atributo_bonus as any)[attr.key] !== 0"
                  class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
                  :class="(p.atributo_bonus as any)[attr.key] > 0
                    ? 'border-emerald-500/25 bg-emerald-950/40 text-emerald-300'
                    : 'border-red-500/25 bg-red-950/40 text-red-300'"
                >
                  {{ (p.atributo_bonus as any)[attr.key] > 0 ? '+' : '' }}{{ (p.atributo_bonus as any)[attr.key] }} {{ attr.label }}
                </span>
              </div>
            </div>

            <div v-if="!p.skills.length && !p.titulos.length && (!p.atributo_bonus || Object.values(p.atributo_bonus).every(v => v === 0))" class="text-[0.65rem] italic text-zinc-700">
              Nenhuma recompensa configurada.
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- ── Modal Criar / Editar ──────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-2xl max-h-[90vh] flex flex-col"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">
          {{ editando ? 'Editar Passado' : 'Novo Passado' }}
        </h3>
        <button type="button" @click="fecharModal" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">

        <!-- Nome + Foto URL -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Nome <span class="text-red-400">*</span>
            </label>
            <input
              v-model="form.nome"
              type="text"
              maxlength="100"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              placeholder="Ex: Nobre Caído, Mercenário..."
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">URL da Imagem</label>
            <input
              v-model="form.foto_url"
              type="url"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              placeholder="https://..."
            />
          </div>
        </div>

        <!-- Preview de imagem -->
        <div v-if="form.foto_url" class="overflow-hidden rounded-2xl border border-white/10" style="max-height:140px">
          <img :src="form.foto_url" class="h-full w-full object-cover" style="max-height:140px" alt="preview" @error="form.foto_url = ''" />
        </div>

        <!-- Descrição -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="3"
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
            placeholder="Descreva a origem e contexto deste passado..."
          />
        </div>

        <!-- Bônus de Atributos -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wide text-rose-400/80">Bônus de Atributos</label>
          <p class="text-[0.65rem] text-zinc-600">Valores positivos concedem pontos; negativos penalizam. Use 0 para sem efeito.</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div v-for="attr in ATRIBUTOS_BONUS_CONFIG" :key="attr.key" class="space-y-1">
              <label class="block text-[0.65rem] font-semibold uppercase tracking-wide" :class="attr.color">{{ attr.label }}</label>
              <input
                v-model.number="form.atributo_bonus[attr.key]"
                type="number"
                step="1"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white text-center placeholder-zinc-600 outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
              />
            </div>
          </div>
        </div>

        <!-- Skills e Títulos lado a lado -->
        <div class="grid gap-5 sm:grid-cols-2">

          <!-- Skills -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Skills Concedidas</label>
              <span class="text-[0.65rem] text-zinc-600">{{ form.skill_ids.length }} selecionada(s)</span>
            </div>
            <input
              v-model="buscaSkill"
              type="text"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-emerald-500/40"
              placeholder="Buscar skill..."
            />
            <div class="custom-scroll max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/20 p-2 space-y-0.5">
              <p v-if="!skillsFiltradas.length" class="py-4 text-center text-xs italic text-zinc-600">
                {{ buscaSkill ? 'Nenhuma skill encontrada.' : 'Nenhuma skill cadastrada.' }}
              </p>
              <label
                v-for="s in skillsFiltradas"
                :key="s.id"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
                :class="form.skill_ids.includes(s.id) ? 'bg-emerald-950/30' : ''"
              >
                <input
                  type="checkbox"
                  :value="s.id"
                  v-model="form.skill_ids"
                  class="h-3.5 w-3.5 rounded accent-emerald-500"
                />
                <span :class="form.skill_ids.includes(s.id) ? 'text-emerald-300' : 'text-zinc-400'">{{ s.name }}</span>
              </label>
            </div>
          </div>

          <!-- Títulos -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold uppercase tracking-wide text-amber-400/80">Títulos Concedidos</label>
              <span class="text-[0.65rem] text-zinc-600">{{ form.titulo_ids.length }} selecionado(s)</span>
            </div>
            <input
              v-model="buscaTitulo"
              type="text"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500/40"
              placeholder="Buscar título..."
            />
            <div class="custom-scroll max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-black/20 p-2 space-y-0.5">
              <p v-if="!titulosFiltrados.length" class="py-4 text-center text-xs italic text-zinc-600">
                {{ buscaTitulo ? 'Nenhum título encontrado.' : 'Nenhum título cadastrado.' }}
              </p>
              <label
                v-for="t in titulosFiltrados"
                :key="t.id"
                class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
                :class="form.titulo_ids.includes(t.id) ? 'bg-amber-950/30' : ''"
              >
                <input
                  type="checkbox"
                  :value="t.id"
                  v-model="form.titulo_ids"
                  class="h-3.5 w-3.5 rounded accent-amber-500"
                />
                <span :class="form.titulo_ids.includes(t.id) ? 'text-amber-300' : 'text-zinc-400'">{{ t.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Erro de submit -->
        <div v-if="erroModal" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {{ erroModal }}
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="fecharModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvando || !form.nome.trim()"
            class="rounded-xl bg-violet-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : (editando ? 'Salvar Alterações' : 'Criar Passado') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- ── Modal Confirmação Delete ──────────────────────────────────────── -->
    <Modal
      v-if="modalDeleteAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalDeleteAberto = false"
    >
      <div class="space-y-4 p-6">
        <h3 class="text-base font-bold text-white">Deletar Passado</h3>
        <p class="text-sm text-zinc-400">
          Tem certeza que deseja deletar
          <span class="font-semibold text-white">"{{ passadoParaDelete?.nome }}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div v-if="erroDelete" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {{ erroDelete }}
        </div>
        <div class="flex gap-3">
          <button
            type="button"
            :disabled="deletando"
            class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-300 transition-colors hover:border-white/20 disabled:opacity-50"
            @click="modalDeleteAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="deletando"
            class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            @click="confirmarDelete"
          >
            {{ deletando ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import {
  listarPassados,
  criarPassado,
  editarPassado,
  deletarPassado,
  type PassadoApi,
} from '@/lib/api/passados.api'
import { api } from '@/plugins/axios'

const ATRIBUTOS_BONUS_CONFIG = [
  { key: 'aura' as const,         label: 'Aura',         color: 'text-pink-400' },
  { key: 'forca' as const,        label: 'Força',        color: 'text-orange-400' },
  { key: 'destreza' as const,     label: 'Destreza',     color: 'text-green-400' },
  { key: 'resistencia' as const,  label: 'Resistência',  color: 'text-blue-400' },
  { key: 'inteligencia' as const, label: 'Inteligência', color: 'text-violet-400' },
]

type AtribKey = typeof ATRIBUTOS_BONUS_CONFIG[number]['key']

const router = useRouter()

const carregando  = ref(true)
const erro        = ref('')
const passados    = ref<PassadoApi[]>([])

// Catálogos para o form
const skillsCatalogo  = ref<{ id: number; name: string }[]>([])
const titulosCatalogo = ref<{ id: number; name: string }[]>([])

// Form
const modalAberto = ref(false)
const editando    = ref<PassadoApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')

const buscaSkill  = ref('')
const buscaTitulo = ref('')

const emptyBonus = () => ({ aura: 0, forca: 0, destreza: 0, resistencia: 0, inteligencia: 0 })

const form = ref({
  nome:           '',
  descricao:      '',
  foto_url:       '',
  skill_ids:      [] as number[],
  titulo_ids:     [] as number[],
  atributo_bonus: emptyBonus() as Record<AtribKey, number>,
})

const skillsFiltradas = computed(() =>
  skillsCatalogo.value.filter(s =>
    !buscaSkill.value || s.name.toLowerCase().includes(buscaSkill.value.toLowerCase()),
  ),
)

const titulosFiltrados = computed(() =>
  titulosCatalogo.value.filter(t =>
    !buscaTitulo.value || t.name.toLowerCase().includes(buscaTitulo.value.toLowerCase()),
  ),
)

// Delete
const modalDeleteAberto = ref(false)
const passadoParaDelete = ref<PassadoApi | null>(null)
const deletando         = ref(false)
const erroDelete        = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    passados.value = await listarPassados()
  } catch (err: any) {
    erro.value = err?.response?.data?.error ?? err.message ?? 'Erro ao carregar passados.'
  } finally {
    carregando.value = false
  }
}

async function carregarCatalogos() {
  try {
    const [skillsRes, titulosRes] = await Promise.all([
      api.get<any[]>('/skills/catalogo'),
      api.get<any[]>('/titulos/catalogo'),
    ])
    skillsCatalogo.value  = (skillsRes.data  ?? []).map(s => ({ id: Number(s.id), name: s.name }))
    titulosCatalogo.value = (titulosRes.data ?? []).map(t => ({ id: Number(t.id), name: t.name }))
  } catch {
    // silently — catálogos vazios na UI
  }
}

function abrirModal(passado?: PassadoApi) {
  editando.value  = passado ?? null
  erroModal.value = ''
  buscaSkill.value  = ''
  buscaTitulo.value = ''
  if (passado) {
    const b = passado.atributo_bonus ?? {}
    form.value = {
      nome:           passado.nome,
      descricao:      passado.descricao ?? '',
      foto_url:       passado.foto_url  ?? '',
      skill_ids:      [...passado.skill_ids],
      titulo_ids:     [...passado.titulo_ids],
      atributo_bonus: {
        aura:         Number((b as any).aura         ?? 0),
        forca:        Number((b as any).forca        ?? 0),
        destreza:     Number((b as any).destreza     ?? 0),
        resistencia:  Number((b as any).resistencia  ?? 0),
        inteligencia: Number((b as any).inteligencia ?? 0),
      },
    }
  } else {
    form.value = { nome: '', descricao: '', foto_url: '', skill_ids: [], titulo_ids: [], atributo_bonus: emptyBonus() }
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value    = null
}

async function salvar() {
  if (!form.value.nome.trim()) return
  salvando.value  = true
  erroModal.value = ''
  try {
    const b = form.value.atributo_bonus
    const bonusVazio = Object.values(b).every(v => v === 0)
    const payload = {
      nome:           form.value.nome.trim(),
      descricao:      form.value.descricao.trim() || undefined,
      foto_url:       form.value.foto_url.trim()  || undefined,
      skill_ids:      form.value.skill_ids,
      titulo_ids:     form.value.titulo_ids,
      atributo_bonus: bonusVazio ? null : { ...b },
    }
    if (editando.value) {
      const updated = await editarPassado(editando.value.id, payload)
      const idx = passados.value.findIndex(p => p.id === editando.value!.id)
      if (idx !== -1) passados.value[idx] = updated
    } else {
      const created = await criarPassado(payload)
      passados.value.unshift(created)
    }
    fecharModal()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

function abrirConfirmacaoDelete(passado: PassadoApi) {
  passadoParaDelete.value = passado
  erroDelete.value        = ''
  modalDeleteAberto.value = true
}

async function confirmarDelete() {
  if (!passadoParaDelete.value) return
  deletando.value  = true
  erroDelete.value = ''
  try {
    await deletarPassado(passadoParaDelete.value.id)
    passados.value = passados.value.filter(p => p.id !== passadoParaDelete.value!.id)
    modalDeleteAberto.value = false
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.error ?? err.message ?? 'Erro ao deletar.'
  } finally {
    deletando.value = false
  }
}

onMounted(() => {
  carregar()
  carregarCatalogos()
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 4px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
}
</style>
