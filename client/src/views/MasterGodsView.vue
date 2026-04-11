<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0A0F1C] text-white">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div class="mx-auto max-w-7xl space-y-6">
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              @click="goMasterPanel"
              class="mb-3 inline-flex items-center gap-2 rounded-xl border border-[#6B4E9E]/45 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-[#2A1B4A]"
            >
              <span class="text-xl">‹</span>
              <span>Voltar ao Painel</span>
            </button>
            <p class="text-xs uppercase tracking-[0.25em] text-zinc-400">Painel do Mestre</p>
            <h1 class="text-3xl font-bold text-amber-300 sm:text-4xl">Guia de Deuses</h1>
            <p class="mt-1 text-zinc-400">Visualizar, editar e criar deuses em cards.</p>
          </div>

          <div class="flex items-center gap-2 self-start">
            <button
              @click="logout"
              class="rounded-xl border border-red-900/65 bg-red-950/60 px-4 py-2 text-sm text-red-200 transition-colors hover:bg-red-900/70"
            >
              Logout
            </button>
          </div>
        </header>

        <section class="rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6">
          <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div class="lg:col-span-5">
              <label class="mb-2 block text-xs uppercase tracking-wide text-zinc-500"
                >Filtrar por nome</label
              >
              <input
                v-model="nameFilter"
                type="text"
                placeholder="Digite o nome do deus..."
                class="field"
              />
            </div>

            <div class="lg:col-span-4">
              <label class="mb-2 block text-xs uppercase tracking-wide text-zinc-500"
                >Filtrar por indole</label
              >
              <div class="select-wrap">
                <select v-model="alignmentFilter" class="field appearance-none pr-12">
                  <option value="all">Todos</option>
                  <option value="bom">Bom/Boa</option>
                  <option value="mau">Maligno(a)</option>
                  <option value="neutro">Neutro</option>
                </select>
                <span class="select-arrow" aria-hidden="true">˅</span>
              </div>
            </div>

            <div class="flex items-end justify-center lg:col-span-3">
              <button
                @click="openCreateModal"
                class="rounded-xl border border-amber-500/55 px-6 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-900/25"
              >
                Adicionar Deus
              </button>
            </div>
          </div>
        </section>

        <section
          v-if="loading"
          class="rounded-3xl border border-zinc-700/50 bg-[#111A2D]/80 p-6 text-zinc-300"
        >
          Carregando deuses...
        </section>

        <section
          v-else-if="filteredGods.length === 0"
          class="rounded-3xl border border-zinc-700/50 bg-[#111A2D]/80 p-6 text-zinc-300"
        >
          Nenhum deus encontrado com os filtros atuais.
        </section>

        <section v-else class="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          <article
            v-for="god in filteredGods"
            :key="god.id"
            @click="selectCard(god.id)"
            :class="[
              'cursor-pointer rounded-3xl border bg-[#111A2D]/80 transition-colors',
              selectedCardId === god.id
                ? 'border-amber-400/70 shadow-lg shadow-amber-900/20'
                : 'border-[#6B4E9E]/40 hover:border-[#6B4E9E]/70',
            ]"
          >
            <div
              class="relative h-52 overflow-hidden rounded-t-3xl border-b border-[#6B4E9E]/35 bg-[#0B1426]"
            >
              <img
                v-if="draftFor(god.id).imageUrl"
                :src="draftFor(god.id).imageUrl"
                :alt="draftFor(god.id).name || 'Imagem do deus'"
                class="h-full w-full object-cover"
                :style="{ objectPosition: getGodImagePosition(draftFor(god.id).name) }"
              />
              <div v-else class="flex h-full items-center justify-center text-sm text-zinc-500">
                Sem imagem
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"
              />
              <div class="absolute inset-x-0 bottom-0 px-4 pb-3">
                <h2 class="text-2xl font-bold text-white">
                  {{ draftFor(god.id).name || 'Sem nome' }}
                </h2>
                <p class="text-sm text-zinc-300">{{ draftFor(god.id).title || 'Sem titulo' }}</p>
              </div>
            </div>

            <div v-if="selectedCardId === god.id" class="space-y-3 p-4">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  v-model="draftFor(god.id).name"
                  class="field"
                  placeholder="Nome"
                  :disabled="!isEditing(god.id)"
                />
                <input
                  v-model="draftFor(god.id).title"
                  class="field"
                  placeholder="Titulo"
                  :disabled="!isEditing(god.id)"
                />
                <input
                  v-model="draftFor(god.id).indole"
                  class="field"
                  placeholder="Indole"
                  :disabled="!isEditing(god.id)"
                />
                <input
                  v-model="draftFor(god.id).weapons"
                  class="field"
                  placeholder="Weapons"
                  :disabled="!isEditing(god.id)"
                />
              </div>

              <div class="space-y-1">
                <label class="block text-xs uppercase tracking-wide text-zinc-500"
                  >Imagem do deus</label
                >
                <input
                  type="file"
                  accept="image/*"
                  class="field"
                  :disabled="!isEditing(god.id)"
                  @change="onEditImageSelected(god.id, $event)"
                />
                <p class="text-xs text-zinc-500">Upload para bucket com compressao automatica.</p>
              </div>

              <input
                v-model="draftFor(god.id).shortDescription"
                class="field"
                placeholder="Descricao curta"
                :disabled="!isEditing(god.id)"
              />

              <textarea
                v-model="draftFor(god.id).description"
                rows="3"
                class="field"
                placeholder="Descricao"
                :disabled="!isEditing(god.id)"
              />

              <textarea
                v-model="draftFor(god.id).dogma"
                rows="3"
                class="field"
                placeholder="Dogma"
                :disabled="!isEditing(god.id)"
              />

              <textarea
                v-model="draftFor(god.id).anatema"
                rows="3"
                class="field"
                placeholder="Anatema"
                :disabled="!isEditing(god.id)"
              />

              <div class="flex flex-wrap justify-end gap-2 border-t border-zinc-700/60 pt-3">
                <button
                  v-if="!isEditing(god.id)"
                  @click.stop="startEdit(god.id)"
                  class="rounded-xl border border-amber-500/55 px-4 py-2 text-sm text-amber-100 transition-colors hover:bg-amber-900/25"
                >
                  Editar
                </button>

                <template v-else>
                  <button
                    @click.stop="cancelEdit(god.id)"
                    class="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-400"
                  >
                    Cancelar
                  </button>
                  <button
                    @click.stop="saveGod(god.id)"
                    class="rounded-xl bg-[#6B4E9E] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                  >
                    Salvar
                  </button>
                </template>
              </div>
            </div>

            <div v-else class="space-y-3 p-4">
              <p class="line-clamp-2 text-sm leading-relaxed text-zinc-300">
                {{ draftFor(god.id).shortDescription || 'Descricao curta nao informada.' }}
              </p>

              <div class="flex flex-wrap gap-2 text-xs">
                <span :class="alignmentBadgeClass(draftFor(god.id).indole)">
                  {{ normalizeAlignmentLabel(draftFor(god.id).indole) }}
                </span>
                <span
                  class="rounded-full border border-[#6B4E9E]/45 bg-[#0B1426] px-2.5 py-1 text-zinc-300"
                >
                  {{ draftFor(god.id).weapons || 'Weapons nao informada' }}
                </span>
              </div>

              <p class="text-xs uppercase tracking-wider text-amber-200/80">
                Clique no card para abrir detalhes
              </p>
            </div>
          </article>
        </section>

        <p
          v-if="feedback"
          class="text-sm"
          :class="feedbackError ? 'text-red-300' : 'text-emerald-300'"
        >
          {{ feedback }}
        </p>
      </div>
    </div>

    <Modal
      v-if="showCreate"
      :show-close-button="false"
      overlay-class="bg-black/80 p-4"
      panel-class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#6B4E9E]/45 bg-[#111A2D]"
      body-class="p-5 sm:p-6"
      @close="closeCreateModal"
    >
      <div>
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-2xl font-semibold text-amber-300">Adicionar Novo Deus</h3>
          <button
            @click="closeCreateModal"
            class="rounded-xl border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:border-zinc-500"
          >
            Fechar
          </button>
        </div>

        <div class="space-y-3">
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input v-model="createForm.name" class="field" placeholder="Nome" />
            <input v-model="createForm.title" class="field" placeholder="Titulo" />
            <input v-model="createForm.indole" class="field" placeholder="Indole" />
            <input v-model="createForm.weapons" class="field" placeholder="Weapons" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs uppercase tracking-wide text-zinc-500"
              >Imagem do deus</label
            >
            <input type="file" accept="image/*" class="field" @change="onCreateImageSelected" />
            <p class="text-xs text-zinc-500">A imagem e obrigatoria e sera enviada ao bucket.</p>
          </div>
          <input
            v-model="createForm.shortDescription"
            class="field"
            placeholder="Descricao curta"
          />
          <textarea
            v-model="createForm.description"
            rows="3"
            class="field"
            placeholder="Descricao"
          />
          <textarea v-model="createForm.dogma" rows="3" class="field" placeholder="Dogma" />
          <textarea v-model="createForm.anatema" rows="3" class="field" placeholder="Anatema" />
        </div>

        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button
            @click="closeCreateModal"
            class="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-400"
          >
            Cancelar
          </button>
          <button
            @click="createGod"
            class="rounded-xl bg-[#6B4E9E] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Salvar Novo Deus
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMasterCatalogStore } from '@/stores/masterCatalog'
import { uploadGodImage } from '@/lib/api/gods.api'
import type { GodApi } from '@/types/supabase'

type GodFormState = {
  name: string
  description: string
  title: string
  indole: string
  dogma: string
  anatema: string
  weapons: string
  shortDescription: string
  imageUrl: string
}

const router = useRouter()
const authStore = useAuthStore()
const masterCatalogStore = useMasterCatalogStore()

const loading = ref(false)
const feedback = ref('')
const feedbackError = ref(false)
const nameFilter = ref('')
const alignmentFilter = ref<'all' | 'bom' | 'mau' | 'neutro'>('all')
const selectedCardId = ref('')
const editingGodId = ref('')
const showCreate = ref(false)
const createImageFile = ref<File | null>(null)
const editImageFiles = reactive<Record<string, File | null>>({})

const drafts = reactive<Record<string, GodFormState>>({})

const createForm = reactive<GodFormState>({
  name: '',
  description: '',
  title: '',
  indole: '',
  dogma: '',
  anatema: '',
  weapons: '',
  shortDescription: '',
  imageUrl: '',
})

const gods = computed(() => masterCatalogStore.gods)

const filteredGods = computed(() => {
  const term = nameFilter.value.trim().toLowerCase()

  return gods.value.filter((god) => {
    const matchesName = !term || god.name.toLowerCase().includes(term)
    const indole = (god.indole || '').toLowerCase()
    const matchesAlignment =
      alignmentFilter.value === 'all' ||
      (alignmentFilter.value === 'bom' && indole.includes('bom')) ||
      (alignmentFilter.value === 'mau' && (indole.includes('mau') || indole.includes('mal'))) ||
      (alignmentFilter.value === 'neutro' && indole.includes('neutro'))

    return matchesName && matchesAlignment
  })
})

function normalizeAlignmentLabel(raw: string) {
  const value = (raw || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (!value) return 'Indole nao informada'
  const hasNeutral = value.includes('neutro')
  const hasGood = value.includes('bom') || value.includes('boa')
  const hasEvil =
    value.includes('maligno') ||
    value.includes('maligna') ||
    value.includes('mau') ||
    value.includes('mal')

  if (hasNeutral && hasGood) return 'Neutro Bom'
  if (hasNeutral && hasEvil) return 'Neutro Maligno'
  if (hasNeutral) return 'Neutro'
  if (hasGood) return 'Bom/Boa'
  if (hasEvil) return 'Maligno(a)'

  return raw
}

function alignmentBadgeClass(raw: string) {
  const label = normalizeAlignmentLabel(raw)
  const base = 'rounded-full border bg-[#0B1426] px-2.5 py-1 text-zinc-200'

  if (label === 'Neutro') return `${base} border-zinc-500/60`
  if (label === 'Neutro Bom') return `${base} border-sky-400/55 text-sky-100`
  if (label === 'Neutro Maligno') return `${base} border-orange-500/55 text-orange-100`
  if (label === 'Bom/Boa') return `${base} border-emerald-500/55 text-emerald-100`
  if (label === 'Maligno(a)') return `${base} border-red-500/55 text-red-100`
  return `${base} border-[#6B4E9E]/45`
}

const GOD_IMAGE_POSITION_BY_NAME: Record<string, string> = {
  pharasma: '46% 20%',
  asmodeus: '50% 24%',
  inari: '50% 26%',
  iomedae: '50% 22%',
  sarenrae: '50% 22%',
}

function getGodImagePosition(name: string) {
  const key = (name || '').trim().toLowerCase()
  return GOD_IMAGE_POSITION_BY_NAME[key] || '50% 24%'
}

function toFormState(god: GodApi): GodFormState {
  return {
    name: god.name || '',
    description: god.description || '',
    title: god.title || '',
    indole: god.indole || '',
    dogma: god.dogma || '',
    anatema: god.anatema || '',
    weapons: god.weapons || '',
    shortDescription: god.shortDescription || '',
    imageUrl: god.imageUrl || '',
  }
}

function draftFor(godId: string): GodFormState {
  if (!drafts[godId]) {
    const found = gods.value.find((god) => god.id === godId)
    drafts[godId] = found
      ? toFormState(found)
      : toFormState({
          id: godId,
          name: '',
          description: '',
          title: '',
          indole: '',
          dogma: '',
          anatema: '',
          weapons: '',
          shortDescription: '',
          imageUrl: '',
        })
  }
  return drafts[godId]
}

function selectCard(godId: string) {
  selectedCardId.value = selectedCardId.value === godId ? '' : godId
  draftFor(godId)
}

function isEditing(godId: string) {
  return editingGodId.value === godId
}

function startEdit(godId: string) {
  selectedCardId.value = godId
  editingGodId.value = godId
  editImageFiles[godId] = null
  const found = gods.value.find((item) => item.id === godId)
  if (found) {
    drafts[godId] = toFormState(found)
  }
}

function cancelEdit(godId: string) {
  const found = gods.value.find((item) => item.id === godId)
  if (found) {
    drafts[godId] = toFormState(found)
  }
  editImageFiles[godId] = null
  editingGodId.value = ''
}

function onEditImageSelected(godId: string, event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return

  editImageFiles[godId] = file
  drafts[godId].imageUrl = URL.createObjectURL(file)
}

function onCreateImageSelected(event: Event) {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return

  createImageFile.value = file
  createForm.imageUrl = URL.createObjectURL(file)
}

async function saveGod(godId: string) {
  const draft = draftFor(godId)
  if (!draft.name.trim()) {
    feedback.value = 'Nome do deus e obrigatorio.'
    feedbackError.value = true
    return
  }

  try {
    let nextImageUrl = draft.imageUrl
    const selectedFile = editImageFiles[godId]
    if (selectedFile) {
      const uploaded = await uploadGodImage(selectedFile)
      nextImageUrl = uploaded.publicUrl
      draft.imageUrl = nextImageUrl
    }

    if (!nextImageUrl?.trim()) {
      feedback.value = 'Envie uma imagem para o bucket antes de salvar o deus.'
      feedbackError.value = true
      return
    }

    await masterCatalogStore.updateGod(godId, {
      name: draft.name,
      description: draft.description,
      title: draft.title,
      indole: draft.indole,
      dogma: draft.dogma,
      anatema: draft.anatema,
      weapons: draft.weapons,
      shortDescription: draft.shortDescription,
      imageUrl: nextImageUrl,
    })
    feedback.value = 'Deus atualizado com sucesso.'
    feedbackError.value = false
    editImageFiles[godId] = null
    editingGodId.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar alteracoes do deus.'
    feedbackError.value = true
  }
}

function resetCreateForm() {
  createForm.name = ''
  createForm.description = ''
  createForm.title = ''
  createForm.indole = ''
  createForm.dogma = ''
  createForm.anatema = ''
  createForm.weapons = ''
  createForm.shortDescription = ''
  createForm.imageUrl = ''
  createImageFile.value = null
}

function openCreateModal() {
  resetCreateForm()
  showCreate.value = true
}

function closeCreateModal() {
  showCreate.value = false
}

async function createGod() {
  if (!createForm.name.trim()) {
    feedback.value = 'Nome do deus e obrigatorio para cadastro.'
    feedbackError.value = true
    return
  }

  if (!createImageFile.value) {
    feedback.value = 'Envie uma imagem para o bucket antes de criar o deus.'
    feedbackError.value = true
    return
  }

  try {
    const uploaded = await uploadGodImage(createImageFile.value)
    const nextImageUrl = uploaded.publicUrl
    createForm.imageUrl = nextImageUrl

    const created = await masterCatalogStore.createGod({
      name: createForm.name,
      description: createForm.description,
      title: createForm.title,
      indole: createForm.indole,
      dogma: createForm.dogma,
      anatema: createForm.anatema,
      weapons: createForm.weapons,
      shortDescription: createForm.shortDescription,
      imageUrl: nextImageUrl,
    })

    drafts[created.id] = toFormState(created)
    selectedCardId.value = created.id
    editingGodId.value = ''
    feedback.value = 'Deus criado com sucesso.'
    feedbackError.value = false
    createImageFile.value = null
    showCreate.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao criar novo deus.'
    feedbackError.value = true
  }
}

async function fetchGods() {
  loading.value = true
  feedback.value = ''
  try {
    const result = await masterCatalogStore.fetchGods()
    result.forEach((god) => {
      drafts[god.id] = toFormState(god)
    })
  } catch {
    feedback.value = 'Nao foi possivel carregar os deuses.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

function goMasterPanel() {
  router.push({ name: 'master-panel' })
}

async function logout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await fetchGods()
})
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(107 78 158 / 0.4);
  background: #0b1426;
  padding: 0.75rem 1rem;
  color: #e4e4e7;
  outline: none;
  transition: border-color 0.2s ease;
}

.field:focus {
  border-color: rgb(200 208 224 / 0.7);
}

.field:disabled {
  opacity: 0.8;
  cursor: default;
}

.select-wrap {
  position: relative;
}

.select-arrow {
  pointer-events: none;
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-52%);
  color: rgb(212 212 216 / 0.95);
  font-size: 1rem;
  line-height: 1;
}

textarea.field {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 78, 158, 0.9) rgba(10, 15, 28, 0.75);
}

textarea.field::-webkit-scrollbar {
  width: 10px;
}

textarea.field::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(10, 15, 28, 0.95), rgba(26, 36, 56, 0.92));
  border-left: 1px solid rgba(107, 78, 158, 0.18);
}

textarea.field::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(200, 208, 224, 0.75), rgba(107, 78, 158, 0.9));
  border-radius: 999px;
  border: 2px solid rgba(26, 36, 56, 0.95);
}

textarea.field::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.9), rgba(107, 78, 158, 1));
}
</style>
