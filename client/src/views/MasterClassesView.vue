<template>
  <div class="page-root min-h-screen text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-20 border-b backdrop-blur-xl" style="background:rgb(7 12 24/0.82);border-color:rgb(255 255 255/0.07)">
        <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button @click="router.push({ name: 'master-panel' })" class="gm-btn-ghost">← Voltar</button>
          <h1 class="flex-1 text-center text-xs font-bold tracking-[0.3em] uppercase text-sky-400">🎓 Classes — Catálogo</h1>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 space-y-6">

        <!-- ── Formulário (criar) ──────────────────────────────────────────────── -->
        <section class="gm-card border-sky-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-sky-500/10 text-sky-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </div>
            <h2 class="gm-title">Nova Classe</h2>
          </div>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input v-model="form.name" type="text" placeholder="Nome *" class="gm-input" />
            <input v-model="form.tier" type="text" placeholder="Tier * (ex: Iniciante, Avançado)" class="gm-input" />
            <input v-model.number="form.max_level" type="number" min="1" placeholder="Nível máximo (padrão: 20)" class="gm-input" />
            <input v-model.number="form.req_min_level" type="number" min="0" placeholder="Nível mínimo requerido" class="gm-input" />
            <textarea v-model="form.description" rows="3" placeholder="Descrição *" class="gm-textarea sm:col-span-2" />

            <!-- Skills iniciais — chip multi-select -->
            <div class="sm:col-span-2 space-y-2">
              <VSelect
                :model-value="addSkillValue"
                @update:model-value="adicionarSkill"
                :options="skillOptionsCreate"
                root-class="w-full"
              />
              <div v-if="form.starting_skills.length > 0" class="flex flex-wrap gap-1.5">
                <span
                  v-for="sk in form.starting_skills" :key="sk"
                  class="inline-flex items-center gap-1 rounded-lg bg-sky-900/40 border border-sky-500/25 px-2.5 py-1 text-xs text-sky-300"
                >
                  {{ sk }}
                  <button @click="removerSkill(sk)" class="text-sky-400/70 hover:text-red-400 transition-colors ml-0.5">✕</button>
                </span>
              </div>
            </div>

            <div class="sm:col-span-2 space-y-1">
              <textarea
                v-model="form.stat_bonuses_json"
                rows="2"
                placeholder='Bônus de stats — JSON (ex: {"forca":2,"destreza":1})'
                class="gm-textarea w-full"
              />
              <p v-if="jsonErro" class="text-xs text-red-400">{{ jsonErro }}</p>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              @click="salvar"
              :disabled="carregando || !form.name.trim() || !form.tier.trim() || !form.description.trim()"
              class="gm-btn-sky disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {{ carregando ? 'Salvando...' : 'Criar Classe' }}
            </button>
          </div>
          <p v-if="feedback" class="mt-3 text-sm" :class="feedbackErro ? 'text-red-400' : 'text-emerald-400'">{{ feedback }}</p>
        </section>

        <!-- ── Filtro ──────────────────────────────────────────────────────────── -->
        <input v-model="filtro" type="text" placeholder="Filtrar por nome ou tier..." class="gm-input w-full" />

        <!-- ── Tabela ──────────────────────────────────────────────────────────── -->
        <DataTable
          :colunas="[
            { label: 'Nome' },
            { label: 'Tier' },
            { label: 'Nível Máx', classe: 'hidden sm:block' },
            { label: 'Descrição', classe: 'hidden md:block' },
          ]"
          classe-grid="grid grid-cols-[2fr_1fr_auto] sm:grid-cols-[2fr_1fr_4rem_2fr_auto] items-center gap-3"
          :itens="listaFiltrada"
          :carregando="carregandoLista"
          mensagem-vazia="Nenhuma classe cadastrada."
          @editar="iniciarEdicao"
          @deletar="confirmarDelete"
        >
          <template #linha="{ item }">
            <p class="truncate text-sm font-medium text-zinc-100">{{ (item as ClasseApi).name }}</p>
            <span class="text-xs text-zinc-400 truncate">{{ (item as ClasseApi).tier }}</span>
            <span class="hidden sm:block text-xs text-zinc-500 text-center">{{ (item as ClasseApi).max_level ?? 20 }}</span>
            <span class="hidden md:block text-xs text-zinc-500 truncate">{{ (item as ClasseApi).description }}</span>
          </template>
          <template #vazia-cta>
            <button @click="form.name = ''" class="gm-btn-ghost text-xs">Criar primeira classe</button>
          </template>
        </DataTable>

      </main>
    </TemaDarkLight>

    <!-- Modal edição -->
    <Modal v-if="editModal.show" @close="fecharEditModal" panel-class="max-w-xl">
      <div class="p-6 space-y-3 overflow-y-auto" style="max-height:80vh">
        <p class="text-sm font-semibold text-zinc-100">Editar Classe</p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input v-model="editModal.form.name" type="text" placeholder="Nome *" class="gm-input" />
          <input v-model="editModal.form.tier" type="text" placeholder="Tier *" class="gm-input" />
          <input v-model.number="editModal.form.max_level" type="number" min="1" placeholder="Nível máximo" class="gm-input" />
          <input v-model.number="editModal.form.req_min_level" type="number" min="0" placeholder="Nível mínimo requerido" class="gm-input" />
          <textarea v-model="editModal.form.description" rows="3" placeholder="Descrição *" class="gm-textarea sm:col-span-2" />

          <!-- Skills iniciais — chip multi-select -->
          <div class="sm:col-span-2 space-y-2">
            <VSelect
              :model-value="addSkillEditValue"
              @update:model-value="adicionarSkillEdit"
              :options="skillOptionsEdit"
              root-class="w-full"
            />
            <div v-if="editModal.form.starting_skills.length > 0" class="flex flex-wrap gap-1.5">
              <span
                v-for="sk in editModal.form.starting_skills" :key="sk"
                class="inline-flex items-center gap-1 rounded-lg bg-sky-900/40 border border-sky-500/25 px-2.5 py-1 text-xs text-sky-300"
              >
                {{ sk }}
                <button @click="removerSkillEdit(sk)" class="text-sky-400/70 hover:text-red-400 transition-colors ml-0.5">✕</button>
              </span>
            </div>
          </div>

          <div class="sm:col-span-2 space-y-1">
            <textarea
              v-model="editModal.form.stat_bonuses_json"
              rows="2"
              placeholder='Bônus de stats — JSON (ex: {"forca":2,"destreza":1})'
              class="gm-textarea w-full"
            />
            <p v-if="editModal.jsonErro" class="text-xs text-red-400">{{ editModal.jsonErro }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="fecharEditModal" class="gm-btn-ghost">Cancelar</button>
          <button
            @click="salvarEdicao"
            :disabled="carregando || !editModal.form.name.trim() || !editModal.form.tier.trim() || !editModal.form.description.trim()"
            class="gm-btn-sky disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ carregando ? 'Salvando...' : 'Salvar' }}</button>
        </div>
        <p v-if="editModal.feedback" class="text-sm" :class="editModal.feedbackErro ? 'text-red-400' : 'text-emerald-400'">{{ editModal.feedback }}</p>
      </div>
    </Modal>

    <!-- Modal delete -->
    <Modal v-if="deleteId !== null" @close="deleteId = null" panel-class="max-w-sm" :show-close-button="false">
      <div class="p-6 text-center">
        <p class="mb-4 text-zinc-200">Deletar a classe <strong class="text-white">{{ deleteNome }}</strong>?</p>
        <div class="flex justify-center gap-3">
          <button @click="executarDelete" :disabled="carregando" class="rounded-xl bg-red-800/80 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700/80 disabled:opacity-40">
            {{ carregando ? 'Deletando...' : 'Confirmar' }}
          </button>
          <button @click="deleteId = null" class="gm-btn-ghost">Cancelar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarClasses, createClass, editarClasse, deletarClasse,
  type ClasseApi,
} from '@/lib/api/classes.api'
import { listarCatalogoSkills, type SkillApi } from '@/lib/api/skills.api'

const router = useRouter()

const lista = ref<ClasseApi[]>([])
const skills = ref<SkillApi[]>([])
const carregandoLista = ref(false)
const carregando = ref(false)
const filtro = ref('')
const feedback = ref('')
const feedbackErro = ref(false)
const jsonErro = ref('')

const deleteId = ref<string | number | null>(null)
const deleteNome = ref('')

const form = ref({
  name: '',
  tier: '',
  description: '',
  max_level: null as number | null,
  req_min_level: null as number | null,
  starting_skills: [] as string[],
  stat_bonuses_json: '',
})

const addSkillValue = ref<string | number>('')
const addSkillEditValue = ref<string | number>('')

const editModal = ref({
  show: false,
  id: null as string | number | null,
  jsonErro: '',
  feedback: '',
  feedbackErro: false,
  form: {
    name: '',
    tier: '',
    description: '',
    max_level: null as number | null,
    req_min_level: null as number | null,
    starting_skills: [] as string[],
    stat_bonuses_json: '',
  },
})

const skillOptionsCreate = computed(() => {
  const selected = new Set(form.value.starting_skills)
  return [
    { value: '', label: 'Adicionar skill inicial...' },
    ...skills.value
      .filter((s) => !selected.has(s.name))
      .map((s) => ({ value: s.name, label: s.name })),
  ]
})

const skillOptionsEdit = computed(() => {
  const selected = new Set(editModal.value.form.starting_skills)
  return [
    { value: '', label: 'Adicionar skill inicial...' },
    ...skills.value
      .filter((s) => !selected.has(s.name))
      .map((s) => ({ value: s.name, label: s.name })),
  ]
})

function adicionarSkill(val: string | number) {
  const v = String(val)
  if (!v || form.value.starting_skills.includes(v)) return
  form.value.starting_skills.push(v)
  nextTick(() => { addSkillValue.value = '' })
}

function removerSkill(sk: string) {
  form.value.starting_skills = form.value.starting_skills.filter((s) => s !== sk)
}

function adicionarSkillEdit(val: string | number) {
  const v = String(val)
  if (!v || editModal.value.form.starting_skills.includes(v)) return
  editModal.value.form.starting_skills.push(v)
  nextTick(() => { addSkillEditValue.value = '' })
}

function removerSkillEdit(sk: string) {
  editModal.value.form.starting_skills = editModal.value.form.starting_skills.filter((s) => s !== sk)
}

const listaFiltrada = computed(() => {
  const q = filtro.value.toLowerCase().trim()
  if (!q) return lista.value
  return lista.value.filter(
    (c) => c.name.toLowerCase().includes(q) || c.tier.toLowerCase().includes(q),
  )
})

function parseJson(raw: string, setErro: (msg: string) => void): Record<string, unknown> | null | undefined {
  if (!raw.trim()) return null
  try { setErro(''); return JSON.parse(raw) }
  catch { setErro('JSON inválido — verifique a sintaxe.'); return undefined }
}

async function carregar() {
  carregandoLista.value = true
  try { lista.value = await listarClasses() } finally { carregandoLista.value = false }
}

async function salvar() {
  const statBonuses = parseJson(form.value.stat_bonuses_json, (m) => { jsonErro.value = m })
  if (statBonuses === undefined) return
  carregando.value = true
  feedback.value = ''
  try {
    await createClass({
      name: form.value.name.trim(),
      tier: form.value.tier.trim(),
      description: form.value.description.trim(),
      maxLevel: form.value.max_level ?? undefined,
      requirements: form.value.req_min_level
        ? { min_level: form.value.req_min_level, required_classes: [] }
        : null,
      statBonuses,
      startingSkills: form.value.starting_skills.length > 0 ? form.value.starting_skills : null,
    })
    feedback.value = 'Classe criada com sucesso.'
    feedbackErro.value = false
    resetForm()
    await carregar()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar classe.'
    feedbackErro.value = true
  } finally {
    carregando.value = false
  }
}

function iniciarEdicao(item: ClasseApi) {
  const req = item.requirements as { min_level?: number } | null
  const bonuses = item.stat_bonuses
    ? typeof item.stat_bonuses === 'string'
      ? item.stat_bonuses
      : JSON.stringify(item.stat_bonuses, null, 2)
    : ''
  const skillsIniciais = Array.isArray(item.starting_skills) ? [...(item.starting_skills as string[])] : []
  editModal.value = {
    show: true,
    id: item.id,
    jsonErro: '',
    feedback: '',
    feedbackErro: false,
    form: {
      name: item.name ?? '',
      tier: item.tier ?? '',
      description: item.description ?? '',
      max_level: (item.max_level as number | null) ?? null,
      req_min_level: req?.min_level ?? null,
      starting_skills: skillsIniciais,
      stat_bonuses_json: bonuses,
    },
  }
  addSkillEditValue.value = ''
}

function fecharEditModal() {
  editModal.value = {
    show: false, id: null, jsonErro: '', feedback: '', feedbackErro: false,
    form: { name: '', tier: '', description: '', max_level: null, req_min_level: null, starting_skills: [], stat_bonuses_json: '' },
  }
  addSkillEditValue.value = ''
}

async function salvarEdicao() {
  if (editModal.value.id === null) return
  const statBonuses = parseJson(editModal.value.form.stat_bonuses_json, (m) => { editModal.value.jsonErro = m })
  if (statBonuses === undefined) return
  carregando.value = true
  editModal.value.feedback = ''
  try {
    await editarClasse(editModal.value.id, {
      name: editModal.value.form.name.trim(),
      tier: editModal.value.form.tier.trim(),
      description: editModal.value.form.description.trim(),
      maxLevel: editModal.value.form.max_level ?? undefined,
      requirements: editModal.value.form.req_min_level
        ? { min_level: editModal.value.form.req_min_level, required_classes: [] }
        : null,
      statBonuses,
      startingSkills: editModal.value.form.starting_skills.length > 0 ? editModal.value.form.starting_skills : null,
    })
    await carregar()
    fecharEditModal()
  } catch (err: any) {
    editModal.value.feedback = err?.response?.data?.message || 'Erro ao salvar classe.'
    editModal.value.feedbackErro = true
  } finally {
    carregando.value = false
  }
}

function confirmarDelete(item: ClasseApi) {
  deleteId.value = item.id
  deleteNome.value = item.name
}

async function executarDelete() {
  if (deleteId.value === null) return
  carregando.value = true
  try {
    await deletarClasse(deleteId.value)
    deleteId.value = null
    feedback.value = 'Classe removida.'
    feedbackErro.value = false
    await carregar()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao deletar.'
    feedbackErro.value = true
  } finally {
    carregando.value = false
  }
}

function resetForm() {
  form.value = { name: '', tier: '', description: '', max_level: null, req_min_level: null, starting_skills: [], stat_bonuses_json: '' }
  jsonErro.value = ''
  addSkillValue.value = ''
}

onMounted(async () => {
  await Promise.all([
    carregar(),
    listarCatalogoSkills().then((s) => { skills.value = s }),
  ])
})
</script>

<style scoped>
.page-root { background: #070C18; }
.gm-card {
  background: rgb(255 255 255 / 0.025); border-width: 1px; border-style: solid;
  border-radius: 1.25rem; padding: 1.25rem; backdrop-filter: blur(8px);
}
@media (min-width: 640px) { .gm-card { padding: 1.5rem; } }
.gm-card-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
.gm-icon-wrap { display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 0.6rem; flex-shrink: 0; }
.gm-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }

.gm-input, .gm-textarea {
  background: rgb(0 0 0 / 0.35); border: 1px solid rgb(255 255 255 / 0.09);
  border-radius: 0.75rem; color: #e2e8f0; font-size: 0.875rem;
  padding: 0.55rem 0.85rem; width: 100%; outline: none; transition: border-color 0.15s;
}
.gm-input:focus, .gm-textarea:focus { border-color: rgb(14 165 233 / 0.55); box-shadow: 0 0 0 3px rgb(14 165 233 / 0.12); }
.gm-input::placeholder, .gm-textarea::placeholder { color: #3f3f46; }

.gm-btn-sky {
  display: inline-flex; align-items: center; gap: 0.35rem;
  border-radius: 0.75rem; background: rgb(2 132 199 / 0.7);
  padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; color: #fff; transition: background 0.15s;
}
.gm-btn-sky:hover { background: rgb(2 132 199 / 0.9); }
.gm-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border-radius: 0.75rem; border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04); padding: 0.45rem 0.9rem;
  font-size: 0.75rem; font-weight: 500; color: #a1a1aa; transition: background 0.15s, color 0.15s;
}
.gm-btn-ghost:hover { background: rgb(255 255 255 / 0.07); color: #e4e4e7; }

:global(html.theme-light) .page-root { background: var(--bg-page); color: var(--text-main); }
:global(html.theme-light) .gm-card { background: var(--bg-card); border-color: var(--border-soft); }
:global(html.theme-light) .gm-title { color: var(--text-main); }
:global(html.theme-light) .gm-input, :global(html.theme-light) .gm-textarea {
  background: #fff; border-color: var(--border-soft); color: var(--text-main);
}
</style>
