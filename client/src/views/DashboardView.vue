<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <header
        class="dashboard-header relative z-50 h-16 border-b px-6 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <HamburgerDrawerMenu
            :items="dashboardHeaderMenuItems"
            :active-item-id="activeDashboardHeaderItem"
            aria-label="Abrir menu de navegacao"
            @select="handleHeaderMenuSelect"
          />
        </div>

        <div class="flex items-center gap-3">
          <span class="header-title text-2xl font-bold tracking-widest">Caminho Sem Volta</span>
        </div>

        <div class="flex items-center gap-6 text-2xl">
          <div class="relative" @click.stop>
            <button
              @click="toggleSettingsMenu"
              class="header-link transition-colors"
              title="Abrir menu"
              aria-label="Abrir menu de configuracoes"
            >
              ⚙️
            </button>

            <div
              v-if="showSettingsMenu"
              class="absolute right-0 mt-2 w-52 rounded-2xl border border-[#6B4E9E]/50 bg-[#0F1C3A]/95 p-2 shadow-xl backdrop-blur-md"
            >
              <button
                v-if="authStore.eMestre"
                @click="retornarPainelMestre"
                class="block w-full rounded-xl px-4 py-2 text-left text-base text-amber-300 transition-colors hover:bg-amber-900/30"
              >
                Painel do Mestre
              </button>
              <button
                @click="openSettings"
                class="block w-full rounded-xl px-4 py-2 text-left text-base text-zinc-200 transition-colors hover:bg-[#2A1B4A]"
              >
                Configuracoes
              </button>
              <button
                @click="logout"
                class="block w-full rounded-xl px-4 py-2 text-left text-base text-red-300 transition-colors hover:bg-red-950/60"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="relative z-0 flex-1 px-6 md:px-12 py-10">
        <div v-if="loading" class="h-full flex items-center justify-center text-xl text-zinc-400">
          Carregando personagem...
        </div>

        <div v-else-if="error" class="h-full flex items-center justify-center">
          <div class="bg-black/50 border border-red-900/50 rounded-3xl p-10 text-center max-w-lg">
            <p class="text-red-300 text-lg font-semibold">{{ error }}</p>
            <p v-if="errorHint" class="mt-3 text-zinc-400 text-sm">{{ errorHint }}</p>

            <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                @click="retryLoad"
                class="px-6 py-3 bg-[#6B4E9E] hover:brightness-110 rounded-2xl font-semibold"
              >
                Tentar novamente
              </button>
              <button
                @click="goBack"
                class="px-6 py-3 bg-red-800 hover:bg-red-700 rounded-2xl font-semibold"
              >
                Voltar ao login
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="character" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="order-2 lg:order-1 lg:col-span-4">
            <div class="character-panel border border-[#6B4E9E]/40 rounded-3xl p-6">
              <div
                class="aspect-[4/5] relative rounded-2xl overflow-hidden border border-[#C8D0E0]/10 shadow-2xl"
              >
                <img
                  v-if="character.avatarUrl"
                  :src="character.avatarUrl"
                  :alt="character.name"
                  class="w-full h-full object-cover"
                  :style="{ objectPosition: character.data?.avatarFocalPoint ?? 'center 20%' }"
                />
                <div
                  v-else
                  class="avatar-placeholder w-full h-full flex items-center justify-center text-3xl font-semibold"
                >
                  SEM AVATAR
                </div>
              </div>

              <button
                class="inventory-btn mt-6 w-full py-5 border border-[#6B4E9E]/50 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <span class="font-medium">Inventario Rapido</span>
              </button>
            </div>
          </div>

          <div class="order-1 lg:order-2 lg:col-span-5 flex flex-col items-center justify-center gap-8">
            <div class="flex items-center gap-4">
              <div class="text-5xl font-bold tracking-wide text-[#C8D0E0]">
                {{ character.name }}
              </div>
              <button class="text-3xl text-[#6B4E9E] hover:text-white transition-colors" aria-label="Editar nome do personagem">✏️</button>
            </div>

            <div class="flex gap-10 text-center">
              <div>
                <div class="text-sm text-zinc-400">Nivel</div>
                <div class="text-6xl font-bold text-[#C8D0E0]">Lv {{ character.level }}</div>
              </div>
              <div>
                <div class="text-sm text-zinc-400">Indole</div>
                <div class="text-4xl font-medium text-emerald-400 mt-1">
                  {{ indoleLabel }}
                </div>
              </div>
            </div>

            <button
              @click="openManagementModal"
              class="management-btn mt-4 w-full max-w-lg py-6 text-2xl font-semibold rounded-3xl transition-all"
            >
              Gerenciamento de Personagem
            </button>
          </div>

          <div class="order-3 lg:col-span-3">
            <div class="notes-panel border border-[#6B4E9E]/30 rounded-3xl p-7 h-full">
              <h3 class="text-2xl font-semibold mb-5 text-[#C8D0E0]">Notas da Campanha</h3>
              <div class="notes-body leading-relaxed text-[15px] min-h-[260px]">
                {{ historyPreview }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Modal
      v-if="showSettingsModal && character"
      panel-class="max-w-3xl"
      body-class="max-h-[75vh] overflow-y-auto p-6"
      header-class="px-6 py-4"
      @close="closeSettingsModal"
    >
      <template #header>
        <div>
          <h2 class="text-2xl font-bold text-[#C8D0E0]">Configuracoes</h2>
          <p class="text-sm text-zinc-400">
            {{
              authStore.eMestre
                ? 'Painel de aprovacao do mestre'
                : 'Solicitar alteracao de personagem'
            }}
          </p>
        </div>
      </template>

      <div v-if="authStore.eMestre" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-amber-300">Solicitacoes pendentes</h3>
          <button
            @click="loadPending"
            class="rounded-xl border border-amber-700/40 px-4 py-2 text-sm text-amber-200 transition-colors hover:bg-amber-900/30"
          >
            Atualizar
          </button>
        </div>

        <div v-if="settingsLoading" class="text-zinc-400">Carregando solicitacoes...</div>
        <div
          v-else-if="pendingApprovals.length === 0"
          class="rounded-2xl border border-zinc-700/50 p-4 text-zinc-400"
        >
          Nenhuma solicitacao pendente no momento.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="request in pendingApprovals"
            :key="request.characterId"
            class="rounded-2xl border border-[#6B4E9E]/40 bg-[#0F1C3A]/60 p-4"
          >
            <p class="text-lg font-semibold text-white">{{ request.currentName }}</p>
            <p class="text-xs text-zinc-400">
              Solicitado por: {{ request.requestedByEmail || 'desconhecido' }}
            </p>

            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-zinc-700/50 p-3">
                <p class="text-xs uppercase tracking-wider text-zinc-500">Nome atual</p>
                <p class="mt-1 text-zinc-200">{{ request.currentName }}</p>
              </div>
              <div class="rounded-xl border border-zinc-700/50 p-3">
                <p class="text-xs uppercase tracking-wider text-zinc-500">Nome solicitado</p>
                <p class="mt-1 text-zinc-200">{{ request.requestedName || 'Sem alteracao' }}</p>
              </div>
            </div>

            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <img
                v-if="request.currentAvatarUrl"
                :src="request.currentAvatarUrl"
                alt="Avatar atual"
                class="h-40 w-full rounded-xl object-cover"
              />
              <div
                v-else
                class="flex h-40 items-center justify-center rounded-xl border border-zinc-700/50 text-zinc-500"
              >
                Sem avatar atual
              </div>

              <img
                v-if="request.requestedAvatarUrl"
                :src="request.requestedAvatarUrl"
                alt="Avatar solicitado"
                class="h-40 w-full rounded-xl object-cover"
              />
              <div
                v-else
                class="flex h-40 items-center justify-center rounded-xl border border-zinc-700/50 text-zinc-500"
              >
                Sem novo avatar
              </div>
            </div>

            <div class="mt-3 space-y-2 rounded-xl border border-zinc-700/50 p-3">
              <p class="text-xs uppercase tracking-wider text-zinc-500">Historia solicitada</p>
              <p class="text-sm text-zinc-300 whitespace-pre-wrap">
                {{ request.requestedHistory || 'Sem alteracao de texto.' }}
              </p>
              <a
                v-if="request.requestedHistoryDocumentPath"
                href="#"
                @click.prevent="openHistoryDocument(request.requestedHistoryDocumentPath)"
                class="inline-block text-sm text-[#C8D0E0] underline hover:text-white"
              >
                Abrir documento: {{ request.requestedHistoryDocumentName || 'Arquivo enviado' }}
              </a>
            </div>

            <div class="mt-4 flex gap-3">
              <button
                @click="reviewRequest(request.characterId, true)"
                class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Aprovar
              </button>
              <button
                @click="reviewRequest(request.characterId, false)"
                class="rounded-xl bg-red-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-5">
        <div
          class="rounded-2xl border border-[#6B4E9E]/40 bg-[#0F1C3A]/60 p-4 text-sm text-zinc-300"
        >
          Alteracoes de nome e imagem nao tem mais limite, mas precisam de aprovacao do mestre.
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-zinc-400">Novo nome</label>
          <input
            v-model="requestedName"
            type="text"
            class="w-full rounded-2xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3 text-white outline-none transition-colors focus:border-[#C8D0E0]/60"
            placeholder="Digite o novo nome"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-zinc-400">Nova imagem</label>
          <div
            class="relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[#6B4E9E]/40 bg-[#0B1426] transition-colors hover:border-[#C8D0E0]/60"
            :class="[
              requestedAvatarPreview
                ? 'mx-auto w-fit border-[#6B4E9E]/20 bg-transparent p-0'
                : 'h-56',
              { 'border-[#C8D0E0]/70 bg-[#15213B]': isDragging },
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerAvatarInput"
          >
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarSelect"
            />

            <div v-if="requestedAvatarPreview" class="relative mx-auto w-full max-w-[16rem]">
              <div
                class="aspect-square w-full overflow-hidden rounded-2xl border border-[#6B4E9E]/45 bg-[#050A17]"
              >
                <img
                  :src="requestedAvatarPreview"
                  alt="Previa do avatar"
                  class="h-full w-full object-cover"
                />
              </div>
              <button
                @click.stop="removeRequestedAvatar"
                aria-label="Remover avatar selecionado"
                class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-lg text-white transition-colors hover:bg-red-700"
              >
                ✕
              </button>
            </div>

            <div v-else class="flex h-full flex-col items-center justify-center px-6 text-center">
              <p class="text-zinc-300">Arraste ou clique para adicionar imagem</p>
              <p class="mt-1 text-xs text-zinc-500">PNG, JPG ou WEBP • Max 5MB</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-zinc-400">Historia do personagem</label>
          <textarea
            v-model="requestedHistory"
            rows="7"
            class="w-full rounded-2xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3 text-white outline-none transition-colors focus:border-[#C8D0E0]/60"
            placeholder="Edite ou complemente a historia do personagem"
          />
        </div>

        <div class="space-y-2">
          <label class="block text-sm text-zinc-400">Documento da historia (Word/PDF)</label>
          <div
            class="cursor-pointer rounded-2xl border-2 border-dashed border-[#6B4E9E]/40 bg-[#0B1426] p-4 text-center transition-colors hover:border-[#C8D0E0]/60"
            @click="triggerHistoryDocInput"
          >
            <input
              ref="historyDocInput"
              type="file"
              accept=".doc,.docx,.pdf"
              class="hidden"
              @change="handleHistoryDocSelect"
            />

            <div v-if="selectedHistoryDoc" class="text-sm text-zinc-300">
              Documento selecionado: {{ selectedHistoryDoc.name }}
            </div>
            <div v-else-if="requestedHistoryDocumentName" class="text-sm text-zinc-300">
              Documento atual: {{ requestedHistoryDocumentName }}
            </div>
            <div v-else class="text-sm text-zinc-400">
              Clique para anexar documento (.doc, .docx ou .pdf)
            </div>
          </div>

          <a
            v-if="requestedHistoryDocumentPath"
            href="#"
            @click.prevent="openHistoryDocument(requestedHistoryDocumentPath)"
            class="inline-block text-sm text-[#C8D0E0] underline hover:text-white"
          >
            Abrir documento atual
          </a>
        </div>

        <p
          v-if="feedback"
          class="text-sm"
          :class="feedbackIsError ? 'text-red-300' : 'text-emerald-300'"
        >
          {{ feedback }}
        </p>

        <div class="flex justify-end">
          <button
            @click="submitRequest"
            :disabled="settingsLoading"
            class="rounded-2xl bg-[#6B4E9E] px-6 py-3 font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-60"
          >
            {{ settingsLoading ? 'Enviando...' : 'Enviar para aprovacao' }}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { getHistoryDocumentSignedUrl } from '@/lib/supabase/storage'
import { limparMetaAuthLocal, useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import type { PersonagemApi } from '@/types/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const masterApprovalsStore = useMasterApprovalsStore()

const loading = ref(true)
const error = ref<string>('')
const errorHint = ref('')
const character = ref<PersonagemApi | null>(null)
const showSettingsMenu = ref(false)
const showSettingsModal = ref(false)
const settingsLoading = ref(false)

const requestedName = ref('')
const requestedAvatarPreview = ref('')
const selectedAvatarFile = ref<File | null>(null)
const requestedHistory = ref('')
const requestedHistoryDocumentPath = ref('')
const requestedHistoryDocumentName = ref('')
const avatarInput = ref<HTMLInputElement | null>(null)
const historyDocInput = ref<HTMLInputElement | null>(null)
const selectedHistoryDoc = ref<File | null>(null)
const isDragging = ref(false)
const feedback = ref('')
const feedbackIsError = ref(false)

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)
const dashboardHeaderMenuItems = [
  { id: 'back', label: 'Voltar' },
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Titulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'notas', label: 'Notas de Aventura' },
]

const activeDashboardHeaderItem = computed(() => {
  if (route.name === 'dashboard') return 'dashboard'
  if (route.name === 'deuses') return 'deuses'
  if (route.name === 'cidade') return 'cidade'

  const path = route.path || ''
  if (path.startsWith('/skills')) return 'skills'
  if (path.startsWith('/titulos')) return 'titulos'
  if (path.startsWith('/classes')) return 'classes'
  if (path.startsWith('/npcs')) return 'npcs'
  if (path.startsWith('/notas')) return 'notas'

  return null
})

const historyPreview = computed(() => {
  const notes = character.value?.data?.adventureNotes
  if (Array.isArray(notes) && notes.length) {
    return notes
      .slice(-3)
      .map((n: { text?: string }) => n.text ?? '')
      .filter(Boolean)
      .join('\n\n')
  }
  return 'Nenhuma anotacao registrada ainda.'
})

const indoleLabel = computed(() => {
  const raw = (character.value?.data?.indole as string) ?? 'neutro'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const goBack = () => {
  limparMetaAuthLocal()
  router.push({ name: 'login', query: { force: '1' } })
}

const retornarPainelMestre = () => {
  closeSettingsMenu()
  router.push({ name: 'master-panel' })
}

const toggleSettingsMenu = () => {
  showSettingsMenu.value = !showSettingsMenu.value
}

const closeSettingsMenu = () => {
  showSettingsMenu.value = false
}

async function handleHeaderMenuSelect(itemId: string) {
  if (itemId === 'back') {
    goBack()
    return
  }

  if (itemId === 'dashboard') {
    const characterId = getRequestedCharacterId()
    await router.push(
      characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    )
    return
  }

  const characterId = getRequestedCharacterId()
  const withCharId = (path: string) =>
    characterId ? { path, query: { characterId } } : { path }

  const routeMap: Record<string, ReturnType<typeof withCharId>> = {
    deuses: { path: '/deuses' },
    cidade: { path: '/cidade' },
    skills: withCharId('/skills'),
    titulos: withCharId('/titulos'),
    classes: withCharId('/classes'),
    npcs: withCharId('/npcs'),
    notas: withCharId('/notas'),
  }

  const target = routeMap[itemId]
  if (!target) return

  await router.push(target)
}

function initializeSettingsForm() {
  requestedName.value = character.value?.name ?? ''
  requestedAvatarPreview.value = character.value?.avatarUrl ?? ''
  selectedAvatarFile.value = null
  requestedHistory.value = String(character.value?.data?.history ?? '')
  requestedHistoryDocumentPath.value = String(
    character.value?.data?.historyDocumentPath ?? character.value?.data?.historyDocumentUrl ?? '',
  )
  requestedHistoryDocumentName.value = String(character.value?.data?.historyDocumentName ?? '')
  selectedHistoryDoc.value = null
  feedback.value = ''
  feedbackIsError.value = false
}

const openSettings = async () => {
  closeSettingsMenu()
  initializeSettingsForm()
  showSettingsModal.value = true

  if (authStore.eMestre) {
    await loadPending()
  }
}

function closeSettingsModal() {
  showSettingsModal.value = false
  feedback.value = ''
}

const logout = async () => {
  closeSettingsMenu()
  try {
    await authStore.sair()
  } finally {
    router.push({ name: 'login' })
  }
}

const onGlobalClick = () => {
  closeSettingsMenu()
}

onMounted(() => {
  window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onGlobalClick)
})

const openManagementModal = () => {
  alert('Modal de Gerenciamento sera implementado em breve!')
}

async function loadPending() {
  settingsLoading.value = true
  feedback.value = ''
  try {
    await masterApprovalsStore.fetchPendingApprovals()
  } catch {
    feedback.value = 'Nao foi possivel carregar as solicitacoes pendentes.'
    feedbackIsError.value = true
  } finally {
    settingsLoading.value = false
  }
}

async function reviewRequest(characterId: string, approve: boolean) {
  settingsLoading.value = true
  feedback.value = ''
  try {
    await masterApprovalsStore.reviewPendingApproval(characterId, approve)
    feedback.value = approve ? 'Solicitacao aprovada.' : 'Solicitacao rejeitada.'
    feedbackIsError.value = false
  } catch {
    feedback.value = 'Erro ao revisar solicitacao.'
    feedbackIsError.value = true
  } finally {
    settingsLoading.value = false
  }
}

async function submitRequest() {
  if (!character.value) return

  const nextName = requestedName.value.trim()
  const nextHistory = requestedHistory.value.trim()
  const changedName = nextName && nextName !== character.value.name ? nextName : undefined
  const changedAvatarFile = selectedAvatarFile.value
  const currentHistory = String(character.value.data?.history ?? '').trim()
  const changedHistory = nextHistory !== currentHistory ? nextHistory : undefined
  const changedDoc = selectedHistoryDoc.value != null
  const changedDocName =
    requestedHistoryDocumentName.value.trim() !==
    String(character.value.data?.historyDocumentName ?? '').trim()

  if (
    !changedName &&
    !changedAvatarFile &&
    changedHistory === undefined &&
    !changedDoc &&
    !changedDocName
  ) {
    feedback.value = 'Informe ao menos um campo para solicitar alteracao.'
    feedbackIsError.value = true
    return
  }

  settingsLoading.value = true
  feedback.value = ''

  try {
    await charactersStore.requestCharacterChangeWithFiles(
      character.value.characterId,
      {
        name: changedName,
        history: changedHistory,
        historyDocumentPath:
          !changedDoc && changedDocName ? requestedHistoryDocumentPath.value : undefined,
        historyDocumentName:
          !changedDoc && changedDocName ? requestedHistoryDocumentName.value : undefined,
      },
      changedAvatarFile || undefined,
      selectedHistoryDoc.value || undefined,
    )

    feedback.value = 'Solicitacao enviada para aprovacao do mestre.'
    feedbackIsError.value = false
  } catch {
    feedback.value = 'Erro ao enviar solicitacao. Tente novamente.'
    feedbackIsError.value = true
  } finally {
    settingsLoading.value = false
  }
}

function triggerAvatarInput() {
  avatarInput.value?.click()
}

function handleAvatarSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) processRequestedAvatar(target.files[0])
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files?.[0]) processRequestedAvatar(event.dataTransfer.files[0])
}

function processRequestedAvatar(file: File) {
  if (!file.type.startsWith('image/')) {
    feedback.value = 'Selecione apenas imagens.'
    feedbackIsError.value = true
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    feedback.value = 'A imagem deve ter no maximo 5MB.'
    feedbackIsError.value = true
    return
  }

  requestedAvatarPreview.value = URL.createObjectURL(file)
  selectedAvatarFile.value = file
  feedback.value = ''
  feedbackIsError.value = false
}

function removeRequestedAvatar() {
  requestedAvatarPreview.value = ''
  selectedAvatarFile.value = null
}

function triggerHistoryDocInput() {
  historyDocInput.value?.click()
}

function handleHistoryDocSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const lowerName = file.name.toLowerCase()
  const isDoc =
    lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.pdf')

  if (!isDoc) {
    feedback.value = 'Anexe apenas arquivos .doc, .docx ou .pdf.'
    feedbackIsError.value = true
    return
  }

  selectedHistoryDoc.value = file
  requestedHistoryDocumentName.value = file.name
  feedback.value = ''
  feedbackIsError.value = false
}

async function openHistoryDocument(pathOrUrl: string) {
  try {
    const signedUrl = await getHistoryDocumentSignedUrl(pathOrUrl)
    window.open(signedUrl, '_blank', 'noopener')
  } catch {
    feedback.value = 'Nao foi possivel abrir o documento privado.'
    feedbackIsError.value = true
  }
}

function getRequestedCharacterId() {
  const queryId = String(route.query.characterId ?? '').trim()
  if (queryId) return queryId

  return String(authStore.idPersonagemAtivo ?? '').trim()
}

function setLoadError(err: unknown, fallbackMessage: string) {
  const maybeError = err as { message?: string; code?: string; response?: { status?: number } }
  const status = maybeError?.response?.status
  const message = String(maybeError?.message ?? '')

  error.value = fallbackMessage
  errorHint.value = ''

  if (status === 401) {
    error.value = 'Sua sessao expirou ou nao esta autorizada.'
    errorHint.value = 'Faca login novamente para continuar.'
    return
  }

  if (status === 404) {
    error.value = 'Este personagem nao foi encontrado.'
    errorHint.value = 'Ele pode ter sido removido ou voce pode nao ter permissao para acessa-lo.'
    return
  }

  if (
    maybeError?.code === 'ECONNABORTED' ||
    message.includes('Network Error') ||
    message.includes('timeout')
  ) {
    error.value = 'Falha de conexao com o servidor.'
    errorHint.value = 'Verifique a API e tente novamente em alguns segundos.'
  }
}

async function loadCharacter() {
  loading.value = true
  error.value = ''
  errorHint.value = ''

  let characterId = getRequestedCharacterId()

  if (!characterId && !authStore.eMestre) {
    try {
      await charactersStore.fetchCharacters()
      characterId = charactersStore.myCharacters[0]?.characterId ?? ''
      if (characterId) {
        authStore.definirPersonagemAtivo(characterId)
        await router.replace({ name: 'dashboard', query: { characterId } })
      }
    } catch {
      // Keep normal error handling below if we still don't have a character id.
    }
  }

  if (!characterId) {
    error.value = authStore.eMestre
      ? 'Personagem nao informado para visualizacao.'
      : 'Nenhum personagem disponivel para esta conta.'
    errorHint.value = authStore.eMestre
      ? 'Abra um personagem a partir da lista para continuar.'
      : 'Crie ou selecione um personagem na tela inicial.'
    loading.value = false
    return
  }

  try {
    character.value = await charactersStore.fetchCharacterById(characterId)
    authStore.definirPersonagemAtivo(characterId)
    initializeSettingsForm()
  } catch (err) {
    const maybeError = err as { response?: { status?: number } }

    // If the stored/query character no longer exists, recover by loading first available one.
    if (!authStore.eMestre && maybeError?.response?.status === 404) {
      try {
        await charactersStore.fetchCharacters()
        const fallbackCharacterId = charactersStore.myCharacters[0]?.characterId ?? ''

        if (fallbackCharacterId) {
          authStore.definirPersonagemAtivo(fallbackCharacterId)
          await router.replace({ name: 'dashboard', query: { characterId: fallbackCharacterId } })
          character.value = await charactersStore.fetchCharacterById(fallbackCharacterId)
          initializeSettingsForm()
          return
        }
      } catch {
        // Keep generic error handling below if fallback cannot be resolved.
      }
    }

    setLoadError(err, 'Nao foi possivel carregar este personagem.')
  } finally {
    loading.value = false
  }
}

async function retryLoad() {
  await loadCharacter()
}

onMounted(async () => {
  await loadCharacter()
})

watch(
  () => route.query.characterId,
  async (next, prev) => {
    if (String(next ?? '') === String(prev ?? '')) return
    await loadCharacter()
  },
)
</script>

<style scoped>
.dashboard-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

.header-title {
  color: var(--brand-primary);
}

.header-link {
  color: var(--text-muted);
}

.header-link:hover {
  color: var(--text-main);
}

.character-panel {
  background: var(--bg-card);
}

.avatar-placeholder {
  background: var(--bg-soft);
  color: var(--text-muted);
}

.inventory-btn {
  background: var(--bg-soft);
  color: var(--text-main);
}

.inventory-btn:hover {
  background: var(--accent-soft);
}

.management-btn {
  background: linear-gradient(90deg, var(--brand-primary), var(--brand-primary-strong));
  color: #fff;
  box-shadow: 0 12px 22px rgb(79 70 229 / 0.28);
}

.management-btn:hover {
  filter: brightness(1.04);
}

.notes-panel {
  background: var(--bg-soft);
}

.notes-body {
  color: color-mix(in srgb, var(--text-main) 82%, #64748b 18%);
}

:global(html.theme-light) .notes-panel h3 {
  color: var(--brand-primary) !important;
}

:global(html.theme-dark) .dashboard-header {
  background: rgb(2 6 23 / 0.68);
}

:global(html.theme-dark) .header-link {
  color: #cbd5e1;
}

:global(html.theme-dark) .header-link:hover {
  color: #f8fafc;
}

:global(html.theme-dark) .character-panel {
  background: #111a2d;
}

:global(html.theme-dark) .avatar-placeholder {
  background: #0f1c3a;
  color: #64748b;
}

:global(html.theme-dark) .inventory-btn {
  background: #0f1c3a;
  color: #cbd5e1;
}

:global(html.theme-dark) .inventory-btn:hover {
  background: #1a2438;
}

:global(html.theme-dark) .management-btn {
  box-shadow: 0 12px 22px rgb(12 16 40 / 0.55);
}

:global(html.theme-dark) .notes-panel {
  background: rgb(26 36 56 / 0.8);
}

:global(html.theme-dark) .notes-body {
  color: #d1d9e6;
}
</style>
