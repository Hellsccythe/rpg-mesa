<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-violet-400">⚡ Overrides de Skill</span>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-6">

      <!-- Seletor de personagem -->
      <section class="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
        <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-2">Selecionar Personagem</label>
        <VSelect v-model="characterIdSelecionado" :options="personagemOptions" />
        <p class="mt-2 text-[0.65rem] text-zinc-600">
          Overrides permitem que uma skill tenha dano base ou multiplicador diferentes para um personagem específico.
        </p>
      </section>

      <!-- Conteúdo (após selecionar personagem) -->
      <template v-if="characterIdSelecionado">

        <!-- Estado de carregamento -->
        <div v-if="carregando" class="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-zinc-500">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Carregando...
        </div>

        <template v-else>
          <!-- Overrides existentes -->
          <section class="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-zinc-200">
                Overrides de <span class="text-violet-300">{{ personagemSelecionado?.name }}</span>
              </h2>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-xl bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 transition-colors"
                @click="abrirModalAdd()"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                Novo Override
              </button>
            </div>

            <!-- Nenhum override -->
            <div
              v-if="!overrides.length"
              class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center"
            >
              <p class="text-sm text-zinc-500">Nenhum override configurado</p>
              <p class="text-xs text-zinc-700 mt-1">Clique em "Novo Override" para criar o primeiro</p>
            </div>

            <!-- Tabela de overrides -->
            <div v-else class="space-y-2">
              <div
                v-for="ov in overrides"
                :key="ov.id"
                class="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3"
              >
                <div>
                  <p class="text-sm font-medium text-zinc-100">{{ ov.skill_name }}</p>
                  <p class="text-[0.65rem] text-zinc-600 mt-0.5">Override individual</p>
                </div>
                <div>
                  <p class="text-[0.6rem] uppercase tracking-wide text-zinc-600 mb-0.5">Dano Base</p>
                  <span class="text-xs font-semibold text-rose-400">{{ ov.damage_base_override || '—' }}</span>
                </div>
                <div>
                  <p class="text-[0.6rem] uppercase tracking-wide text-zinc-600 mb-0.5">Multiplicador</p>
                  <span class="text-xs font-semibold text-amber-400">{{ nomeAtributo(ov.multiplicador_override) }}</span>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-amber-400 transition-colors hover:bg-amber-900/20"
                    title="Editar"
                    @click="abrirModalEdit(ov)"
                  >
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    type="button"
                    class="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-red-400 transition-colors hover:bg-red-900/20"
                    title="Deletar"
                    @click="confirmarDelete(ov)"
                  >
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Skills disponíveis do personagem (referência) -->
          <section v-if="skillsDoPersonagem.length" class="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5 space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Skills do Personagem (referência)</h3>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="sk in skillsDoPersonagem"
                :key="sk.name"
                class="rounded-lg border px-2.5 py-0.5 text-xs"
                :class="temOverride(sk.name) ? 'border-violet-500/40 bg-violet-900/20 text-violet-300' : 'border-white/[0.06] bg-white/[0.02] text-zinc-500'"
              >
                {{ sk.name }}
                <span v-if="temOverride(sk.name)" class="ml-1 text-[0.6rem] text-violet-500">⚡</span>
              </span>
            </div>
          </section>
        </template>
      </template>

      <!-- Erro -->
      <div v-if="erro" class="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">{{ erro }}</div>

    </main>

    <!-- ── Modal Adicionar / Editar Override ──────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-md"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <div class="p-6 space-y-4">
        <h3 class="text-base font-bold text-white">{{ editandoOverride ? 'Editar Override' : 'Novo Override' }}</h3>

        <!-- Skill (apenas no add) -->
        <div v-if="!editandoOverride" class="space-y-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-zinc-400">Skill <span class="text-red-400">*</span></label>
          <VSelect v-model="form.skill_name" :options="skillOptions" />
        </div>
        <div v-else class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
          <p class="text-[0.65rem] text-zinc-500 uppercase tracking-wide">Skill</p>
          <p class="text-sm font-semibold text-zinc-200">{{ editandoOverride.skill_name }}</p>
        </div>

        <!-- Dano Base override -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-zinc-400">Dano Base Override</label>
          <input
            v-model="form.damage_base_override"
            type="text"
            placeholder="Ex: 2d6, 3d8+2 (vazio = usar padrão da skill)"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
          />
        </div>

        <!-- Multiplicador override -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold uppercase tracking-wide text-zinc-400">Multiplicador Override</label>
          <VSelectMulti v-model="form.multiplicador_override" :options="ATRIBUTOS_MULTI_OPTIONS" placeholder="Multiplicador — (usar padrão)" />
        </div>

        <div v-if="erroModal" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroModal }}</div>

        <div class="flex justify-end gap-3 pt-1">
          <button type="button" @click="fecharModal" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvando || (!editandoOverride && !form.skill_name)"
            class="rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : (editandoOverride ? 'Salvar' : 'Criar') }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- ── Modal Confirmar Delete ─────────────────────────────────────────── -->
    <Modal
      v-if="modalDeleteAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalDeleteAberto = false"
    >
      <div class="space-y-4 p-6">
        <h3 class="text-base font-bold text-white">Remover Override</h3>
        <p class="text-sm text-zinc-400">
          Remover o override da skill <span class="font-semibold text-white">"{{ overrideParaDelete?.skill_name }}"</span>?
          A skill voltará a usar os valores padrão do catálogo.
        </p>
        <div v-if="erroDelete" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroDelete }}</div>
        <div class="flex gap-3">
          <button type="button" :disabled="deletando" @click="modalDeleteAberto = false" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-300 hover:border-white/20 disabled:opacity-50">Cancelar</button>
          <button type="button" :disabled="deletando" @click="executarDelete" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
            {{ deletando ? 'Removendo...' : 'Remover' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import VSelectMulti from '@/components/VSelectMulti.vue'
import { listMyCharacters } from '@/lib/api/personagens.api'
import {
  listarOverridesPersonagem, criarOverride, editarOverride, deletarOverride,
  type SkillOverrideApi,
} from '@/lib/api/skills.api'
import type { PersonagemApi } from '@/types/supabase'

const router = useRouter()

const ATRIBUTOS_MULTI_OPTIONS = [
  { value: 'aura', label: 'Aura' },
  { value: 'forca', label: 'Força' },
  { value: 'destreza', label: 'Destreza' },
  { value: 'resistencia', label: 'Resistência' },
  { value: 'inteligencia', label: 'Inteligência' },
]

const ATRIBUTOS_LABELS: Record<string, string> = {
  aura: 'Aura', forca: 'Força', destreza: 'Destreza',
  resistencia: 'Resistência', inteligencia: 'Inteligência',
}

function nomeAtributo(val: string[] | null): string {
  if (!val || !val.length) return '—'
  return val.map(v => ATRIBUTOS_LABELS[v] ?? v).join(' + ')
}

const personagens = ref<PersonagemApi[]>([])
const characterIdSelecionado = ref<number | string>('')
const overrides = ref<SkillOverrideApi[]>([])
const carregando = ref(false)
const erro = ref('')

const personagemSelecionado = computed(() =>
  personagens.value.find(p => String(p.characterId) === String(characterIdSelecionado.value)) ?? null,
)

const personagemOptions = computed(() => [
  { value: '', label: 'Selecionar personagem...' },
  ...personagens.value.map(p => ({ value: p.characterId as number, label: p.name })),
])

const skillsDoPersonagem = computed<{ name: string }[]>(() => {
  const data = personagemSelecionado.value?.data
  if (!data?.skills || !Array.isArray(data.skills)) return []
  return data.skills as { name: string }[]
})

const skillOptions = computed(() => [
  { value: '', label: 'Selecionar skill...' },
  ...skillsDoPersonagem.value.map(s => ({ value: s.name, label: s.name })),
])

function temOverride(skillName: string): boolean {
  return overrides.value.some(ov => ov.skill_name === skillName)
}

// Form
const modalAberto = ref(false)
const editandoOverride = ref<SkillOverrideApi | null>(null)
const salvando = ref(false)
const erroModal = ref('')
const form = ref({ skill_name: '' as string, damage_base_override: '', multiplicador_override: [] as string[] })

// Delete
const modalDeleteAberto = ref(false)
const overrideParaDelete = ref<SkillOverrideApi | null>(null)
const deletando = ref(false)
const erroDelete = ref('')

async function carregarPersonagens() {
  try {
    personagens.value = await listMyCharacters()
  } catch {
    erro.value = 'Erro ao carregar personagens.'
  }
}

async function carregarOverrides() {
  if (!characterIdSelecionado.value) return
  carregando.value = true
  erro.value = ''
  try {
    overrides.value = await listarOverridesPersonagem(Number(characterIdSelecionado.value))
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao carregar overrides.'
  } finally {
    carregando.value = false
  }
}

watch(characterIdSelecionado, () => {
  overrides.value = []
  carregarOverrides()
})

function abrirModalAdd() {
  editandoOverride.value = null
  erroModal.value = ''
  form.value = { skill_name: '', damage_base_override: '', multiplicador_override: [] }
  modalAberto.value = true
}

function abrirModalEdit(ov: SkillOverrideApi) {
  editandoOverride.value = ov
  erroModal.value = ''
  form.value = {
    skill_name: ov.skill_name,
    damage_base_override: ov.damage_base_override ?? '',
    multiplicador_override: Array.isArray(ov.multiplicador_override) ? [...ov.multiplicador_override] : [],
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editandoOverride.value = null
}

async function salvar() {
  salvando.value = true
  erroModal.value = ''
  try {
    const payload = {
      damage_base_override: form.value.damage_base_override.trim() || null,
      multiplicador_override: form.value.multiplicador_override.length ? form.value.multiplicador_override : null,
    }
    if (editandoOverride.value) {
      const updated = await editarOverride(editandoOverride.value.id, payload)
      const idx = overrides.value.findIndex(o => o.id === editandoOverride.value!.id)
      if (idx !== -1) overrides.value[idx] = updated
    } else {
      const created = await criarOverride({
        skill_name: form.value.skill_name,
        character_id: Number(characterIdSelecionado.value),
        ...payload,
      })
      overrides.value.push(created)
    }
    fecharModal()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

function confirmarDelete(ov: SkillOverrideApi) {
  overrideParaDelete.value = ov
  erroDelete.value = ''
  modalDeleteAberto.value = true
}

async function executarDelete() {
  if (!overrideParaDelete.value) return
  deletando.value = true
  erroDelete.value = ''
  try {
    await deletarOverride(overrideParaDelete.value.id)
    overrides.value = overrides.value.filter(o => o.id !== overrideParaDelete.value!.id)
    modalDeleteAberto.value = false
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.message ?? err.message ?? 'Erro ao remover.'
  } finally {
    deletando.value = false
  }
}

onMounted(carregarPersonagens)
</script>
