<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">⚔ Títulos ⚔</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
          @click="abrirModal()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Novo Título
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-5">

      <div v-if="erro" class="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">{{ erro }}</div>

      <!-- Filtro -->
      <input
        v-model="filtro"
        type="text"
        placeholder="Filtrar por nome ou tier..."
        class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"
      />

      <!-- DataTable -->
      <DataTable
        :colunas="[
          { label: 'Nome' },
          { label: 'Tier', classe: 'hidden sm:block' },
          { label: 'Atributos', classe: 'hidden md:block' },
          { label: 'Skills', classe: 'hidden lg:block' },
        ]"
        classe-grid="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_3rem_3rem] items-center gap-3"
        :itens="titulosFiltrados"
        :carregando="carregando"
        mensagem-vazia="Nenhum título cadastrado."
        @editar="abrirModal"
        @deletar="abrirConfirmacaoDelete"
      >
        <template #linha="{ item }">
          <p class="truncate text-sm font-medium text-zinc-100">{{ (item as TituloApi).name }}</p>
          <span class="hidden sm:block text-xs text-zinc-500">{{ (item as TituloApi).tier }}</span>
          <!-- Atributos bônus -->
          <div class="hidden md:flex flex-wrap gap-1">
            <template v-if="(item as TituloApi).bonuses && Object.keys((item as TituloApi).bonuses ?? {}).length">
              <span
                v-for="(val, key) in (item as TituloApi).bonuses"
                :key="key"
                v-if="val !== 0"
                class="rounded-full border px-2 py-0.5 text-[0.6rem] font-semibold"
                :class="(val as number) > 0 ? 'border-emerald-500/25 bg-emerald-950/30 text-emerald-300' : 'border-red-500/25 bg-red-950/30 text-red-300'"
              >{{ (val as number) > 0 ? '+' : '' }}{{ val }} {{ atribLabel(String(key)) }}</span>
            </template>
            <span v-else class="text-[0.65rem] italic text-zinc-700">—</span>
          </div>
          <!-- Skills -->
          <div class="hidden lg:flex flex-wrap gap-1">
            <span
              v-for="sk in (item as TituloApi).skills.slice(0, 2)"
              :key="sk.id"
              class="rounded-full border border-emerald-500/25 bg-emerald-950/30 px-2 py-0.5 text-[0.6rem] text-emerald-300"
            >{{ sk.name }}</span>
            <span
              v-if="(item as TituloApi).skills.length > 2"
              class="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[0.6rem] text-zinc-600"
            >+{{ (item as TituloApi).skills.length - 2 }}</span>
            <span v-if="!(item as TituloApi).skills.length" class="text-[0.65rem] italic text-zinc-700">—</span>
          </div>
        </template>
        <template #vazia-cta>
          <button type="button" @click="abrirModal()" class="mt-4 rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600">
            Criar primeiro título
          </button>
        </template>
      </DataTable>
    </main>

    <!-- Modal Criar / Editar -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-2xl max-h-[90vh] flex flex-col"
      body-class="flex-1 min-h-0 flex flex-col"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">{{ editando ? 'Editar Título' : 'Novo Título' }}</h3>
        <button type="button" @click="fecharModal" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="flex-1 overflow-y-auto p-6 space-y-5">
        <!-- Nome + Tier -->
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nome <span class="text-red-400">*</span></label>
            <input
              v-model="form.name"
              type="text"
              maxlength="100"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              placeholder="Ex: Campeão dos Deuses..."
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Tier <span class="text-red-400">*</span></label>
            <VSelect
              v-model="form.tier"
              :options="TIER_OPTIONS"
              placeholder="Selecione o tier..."
            />
          </div>
        </div>

        <!-- Descrição -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Descrição</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            placeholder="Descreva o título e como ele pode ser obtido..."
          />
        </div>

        <!-- Bônus de Atributos -->
        <div class="space-y-3">
          <label class="block text-xs font-semibold uppercase tracking-wide text-rose-400/80">Bônus de Atributos</label>

          <!-- Lista de bônus adicionados -->
          <div v-if="form.bonusEntries.length" class="flex flex-wrap gap-2">
            <div
              v-for="(entry, idx) in form.bonusEntries"
              :key="entry.key"
              class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1"
              :class="entry.valor >= 0 ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-red-500/30 bg-red-950/20'"
            >
              <span class="text-xs font-semibold" :class="entry.valor >= 0 ? 'text-emerald-300' : 'text-red-300'">
                {{ atribLabel(entry.key) }}: {{ entry.valor >= 0 ? '+' : '' }}{{ entry.valor }}
              </span>
              <button type="button" class="text-zinc-500 hover:text-red-400 transition-colors" @click="removerBonusEntry(idx)">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <p v-else class="text-xs italic text-zinc-600">Nenhum bônus adicionado.</p>

          <!-- Linha de adição: dropdown + valor + botão -->
          <div class="flex gap-2 items-end">
            <div class="flex-1 space-y-1">
              <label class="block text-[0.65rem] text-zinc-500 uppercase tracking-wide">Atributo</label>
              <VSelect
                v-model="novoBonus.key"
                :options="atributosDisponiveis"
                placeholder="Selecione..."
              />
            </div>
            <div class="w-28 space-y-1">
              <label class="block text-[0.65rem] text-zinc-500 uppercase tracking-wide">Valor</label>
              <input
                v-model.number="novoBonus.valor"
                type="number"
                step="1"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white text-center outline-none focus:border-rose-500/50"
                placeholder="ex: 2"
              />
            </div>
            <button
              type="button"
              :disabled="!novoBonus.key || novoBonus.valor === 0"
              class="rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="adicionarBonusEntry"
            >Adicionar</button>
          </div>
          <p class="text-[0.65rem] text-zinc-600">Positivo = bônus, negativo = penalidade.</p>
        </div>

        <!-- Skills concedidas -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Skills Concedidas</label>
            <span class="text-[0.65rem] text-zinc-600">{{ form.skillIds.length }} selecionada(s)</span>
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
              v-for="sk in skillsFiltradas"
              :key="sk.id"
              class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-white/[0.04]"
              :class="form.skillIds.includes(sk.id) ? 'bg-emerald-950/30' : ''"
            >
              <input type="checkbox" :value="sk.id" v-model="form.skillIds" class="h-3.5 w-3.5 rounded accent-emerald-500" />
              <span :class="form.skillIds.includes(sk.id) ? 'text-emerald-300' : 'text-zinc-400'">{{ sk.name }}</span>
            </label>
          </div>
        </div>

        <!-- Flags de visibilidade -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Visibilidade</label>
          <label class="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" v-model="form.is_hidden" class="h-4 w-4 rounded accent-amber-500" />
            <div>
              <span class="text-sm text-zinc-300">Ocultar requisitos</span>
              <p class="text-[0.65rem] text-zinc-600">Player vê o título mas não vê como obtê-lo (mostra 🔒)</p>
            </div>
          </label>
          <label class="flex cursor-pointer items-center gap-2.5">
            <input type="checkbox" v-model="form.linked_hidden_class" class="h-4 w-4 rounded accent-red-500" />
            <div>
              <span class="text-sm text-zinc-300">Vincular a classe secreta</span>
              <p class="text-[0.65rem] text-zinc-600">Título invisível para players sem a classe secreta específica</p>
            </div>
          </label>
          <div v-if="form.linked_hidden_class" class="pl-6 space-y-1">
            <label class="block text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">Classe secreta vinculada</label>
            <VSelect
              v-model="form.classe_secreta_id"
              :options="classesSecretasOptions"
              placeholder="Selecionar classe secreta..."
            />
            <p v-if="!classesSecretas.length" class="text-[0.65rem] text-zinc-600 italic">Nenhuma classe secreta cadastrada ainda.</p>
          </div>
        </div>

        <div v-if="erroModal" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroModal }}</div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:text-white" @click="fecharModal">Cancelar</button>
          <button
            type="button"
            :disabled="salvando || !form.name.trim() || !form.tier"
            class="rounded-xl bg-amber-700 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="salvar"
          >{{ salvando ? 'Salvando...' : (editando ? 'Salvar Alterações' : 'Criar Título') }}</button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmar Delete -->
    <Modal
      v-if="modalDeleteAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalDeleteAberto = false"
    >
      <div class="space-y-4 p-6">
        <h3 class="text-base font-bold text-white">Deletar Título</h3>
        <p class="text-sm text-zinc-400">
          Tem certeza que deseja deletar
          <span class="font-semibold text-white">"{{ tituloParaDelete?.name }}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div v-if="erroDelete" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroDelete }}</div>
        <div class="flex gap-3">
          <button type="button" :disabled="deletando" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-300 hover:border-white/20 disabled:opacity-50" @click="modalDeleteAberto = false">Cancelar</button>
          <button type="button" :disabled="deletando" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" @click="confirmarDelete">{{ deletando ? 'Deletando...' : 'Deletar' }}</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import DataTable from '@/components/DataTable.vue'
import VSelect from '@/components/VSelect.vue'
import { listarCatalogoTitulos, createTitle, editarTitulo, deletarTitulo, type TituloApi, type AtributoBonus } from '@/lib/api/titulos.api'
import { listarClassesAdmin, type ClasseApi } from '@/lib/api/classes.api'
import { api } from '@/plugins/axios'

const ATRIBUTOS_CONFIG = [
  { key: 'aura',         label: 'Aura' },
  { key: 'forca',        label: 'Força' },
  { key: 'destreza',     label: 'Destreza' },
  { key: 'resistencia',  label: 'Resistência' },
  { key: 'inteligencia', label: 'Inteligência' },
]

function atribLabel(key: string): string {
  return ATRIBUTOS_CONFIG.find(a => a.key === key)?.label ?? key
}

type BonusEntry = { key: string; valor: number }

const novoBonus = ref<BonusEntry>({ key: '', valor: 0 })

const atributosDisponiveis = computed(() => {
  const usados = new Set(form.value.bonusEntries.map(e => e.key))
  return ATRIBUTOS_CONFIG
    .filter(a => !usados.has(a.key))
    .map(a => ({ value: a.key, label: a.label }))
})

function adicionarBonusEntry() {
  if (!novoBonus.value.key || novoBonus.value.valor === 0) return
  form.value.bonusEntries.push({ key: novoBonus.value.key, valor: novoBonus.value.valor })
  novoBonus.value = { key: '', valor: 0 }
}

function removerBonusEntry(idx: number) {
  form.value.bonusEntries.splice(idx, 1)
}

function bonusEntriesToObject(entries: BonusEntry[]): Record<string, number> | null {
  if (!entries.length) return null
  return Object.fromEntries(entries.map(e => [e.key, e.valor]))
}

function objectToBonusEntries(obj: Record<string, unknown> | null | undefined): BonusEntry[] {
  if (!obj) return []
  return Object.entries(obj)
    .filter(([, v]) => typeof v === 'number' && v !== 0)
    .map(([k, v]) => ({ key: k, valor: v as number }))
}

const router = useRouter()

const TIER_OPTIONS = [
  { value: 'Comum',    label: 'Comum' },
  { value: 'Raro',     label: 'Raro' },
  { value: 'Épico',    label: 'Épico' },
  { value: 'Lendário', label: 'Lendário' },
]

const carregando = ref(true)
const erro       = ref('')
const titulos    = ref<TituloApi[]>([])
const filtro     = ref('')

const titulosFiltrados = computed(() =>
  filtro.value
    ? titulos.value.filter(t => t.name.toLowerCase().includes(filtro.value.toLowerCase()) || t.tier.toLowerCase().includes(filtro.value.toLowerCase()))
    : titulos.value
)

// Classes secretas para vincular ao título
const classesSecretas = ref<ClasseApi[]>([])
const classesSecretasOptions = computed(() =>
  classesSecretas.value.map(c => ({ value: Number(c.id), label: c.name }))
)

// Catálogo de skills para o form
const skillsCatalogo = ref<{ id: number; name: string }[]>([])
const buscaSkill     = ref('')
const skillsFiltradas = computed(() =>
  skillsCatalogo.value.filter(s =>
    !buscaSkill.value || s.name.toLowerCase().includes(buscaSkill.value.toLowerCase())
  )
)

// Modal form
const modalAberto = ref(false)
const editando    = ref<TituloApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')
const form = ref({
  name:                '',
  tier:                '',
  description:         '',
  skillIds:            [] as number[],
  bonusEntries:        [] as BonusEntry[],
  is_hidden:           false,
  linked_hidden_class: false,
  classe_secreta_id:   '' as number | string,
})

// Modal delete
const modalDeleteAberto = ref(false)
const tituloParaDelete  = ref<TituloApi | null>(null)
const deletando         = ref(false)
const erroDelete        = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    titulos.value = await listarCatalogoTitulos()
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao carregar títulos.'
  } finally {
    carregando.value = false
  }
}

async function carregarSkills() {
  try {
    const [skillsData, classesData] = await Promise.all([
      api.get<any[]>('/skills/catalogo').then(r => r.data),
      listarClassesAdmin(),
    ])
    skillsCatalogo.value  = (skillsData ?? []).map(s => ({ id: Number(s.id), name: s.name }))
    classesSecretas.value = classesData.filter(c => c.is_secret)
  } catch { /* silently */ }
}

function abrirModal(titulo?: TituloApi) {
  editando.value  = titulo ?? null
  erroModal.value = ''
  buscaSkill.value = ''
  novoBonus.value = { key: '', valor: 0 }
  if (titulo) {
    form.value = {
      name:                titulo.name,
      tier:                titulo.tier,
      description:         titulo.description,
      skillIds:            [...titulo.skill_ids],
      bonusEntries:        objectToBonusEntries(titulo.bonuses as any),
      is_hidden:           titulo.is_hidden ?? false,
      linked_hidden_class: titulo.linked_hidden_class ?? false,
      classe_secreta_id:   titulo.classe_secreta_id ?? '',
    }
  } else {
    form.value = { name: '', tier: '', description: '', skillIds: [], bonusEntries: [], is_hidden: false, linked_hidden_class: false, classe_secreta_id: '' }
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value    = null
}

async function salvar() {
  if (!form.value.name.trim() || !form.value.tier) return
  salvando.value  = true
  erroModal.value = ''
  try {
    const payload = {
      name:                form.value.name.trim(),
      tier:                form.value.tier,
      description:         form.value.description.trim(),
      skillIds:            form.value.skillIds,
      bonuses:             bonusEntriesToObject(form.value.bonusEntries),
      is_hidden:           form.value.is_hidden,
      linked_hidden_class: form.value.linked_hidden_class,
      classe_secreta_id:   form.value.linked_hidden_class && form.value.classe_secreta_id !== '' ? Number(form.value.classe_secreta_id) : null,
    }
    if (editando.value) {
      const updated = await editarTitulo(editando.value.id, payload)
      const idx = titulos.value.findIndex(t => t.id === editando.value!.id)
      if (idx !== -1) titulos.value[idx] = updated
    } else {
      titulos.value.unshift(await createTitle(payload))
    }
    fecharModal()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

function abrirConfirmacaoDelete(titulo: TituloApi) {
  tituloParaDelete.value  = titulo
  erroDelete.value        = ''
  modalDeleteAberto.value = true
}

async function confirmarDelete() {
  if (!tituloParaDelete.value) return
  deletando.value  = true
  erroDelete.value = ''
  try {
    await deletarTitulo(tituloParaDelete.value.id)
    titulos.value       = titulos.value.filter(t => t.id !== tituloParaDelete.value!.id)
    modalDeleteAberto.value = false
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.message ?? err.message ?? 'Erro ao deletar.'
  } finally {
    deletando.value = false
  }
}

onMounted(() => {
  carregar()
  carregarSkills()
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
</style>
