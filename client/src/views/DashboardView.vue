<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <header
        class="h-16 border-b border-[#6B4E9E]/30 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between"
      >
        <button
          @click="goBack"
          class="text-3xl text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
        >
          ‹ <span class="text-base font-medium">Voltar</span>
        </button>

        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold tracking-widest text-red-400">Caminho Sem Volta</span>
        </div>

        <nav class="flex items-center gap-8 text-lg font-medium">
          <router-link to="/dashboard" class="text-zinc-400 hover:text-white transition-colors">
            Personagem
          </router-link>

          <router-link to="/deuses" class="text-zinc-400 hover:text-white transition-colors">
            Deuses
          </router-link>

          <router-link to="/cidade" class="text-zinc-400 hover:text-white transition-colors">
            Cidade
          </router-link>

          <router-link to="/skills" class="text-zinc-400 hover:text-white transition-colors">
            Skills
          </router-link>

          <router-link to="/titulos" class="text-zinc-400 hover:text-white transition-colors">
            Titulos
          </router-link>

          <router-link to="/classes" class="text-zinc-400 hover:text-white transition-colors">
            Classes
          </router-link>

          <router-link to="/npcs" class="text-zinc-400 hover:text-white transition-colors">
            NPCs
          </router-link>

          <router-link to="/notas" class="text-zinc-400 hover:text-white transition-colors">
            Notas de Aventura
          </router-link>
        </nav>

        <div class="flex items-center gap-6 text-2xl text-zinc-300">
          <button class="rounded-lg px-2 py-1 text-sm hover:text-[#C8D0E0] transition-colors">
            PERFIL
          </button>
          <div class="relative" @click.stop>
            <button
              @click="toggleSettingsMenu"
              class="hover:text-[#C8D0E0] transition-colors"
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

      <main class="flex-1 px-6 md:px-12 py-10">
        <div v-if="loading" class="h-full flex items-center justify-center text-xl text-zinc-400">
          Carregando personagem...
        </div>

        <div v-else-if="error" class="h-full flex items-center justify-center">
          <div class="bg-black/50 border border-red-900/50 rounded-3xl p-10 text-center max-w-md">
            <p class="text-red-300">{{ error }}</p>
            <button @click="goBack" class="mt-6 px-8 py-3 bg-red-800 hover:bg-red-700 rounded-2xl">
              Voltar
            </button>
          </div>
        </div>

        <div v-else-if="character" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4">
            <div
              class="bg-gradient-to-br from-[#2A1B4A] to-[#1A2438] border border-[#6B4E9E]/40 rounded-3xl p-6"
            >
              <div
                class="aspect-[4/5] relative rounded-2xl overflow-hidden border border-[#C8D0E0]/10 shadow-2xl"
              >
                <img
                  v-if="character.avatarUrl"
                  :src="character.avatarUrl"
                  :alt="character.name"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center bg-[#0F1C3A] text-3xl font-semibold text-zinc-500"
                >
                  SEM AVATAR
                </div>
              </div>

              <button
                class="mt-6 w-full py-5 bg-[#0F1C3A] hover:bg-[#2A1B4A] border border-[#6B4E9E]/50 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                <span class="font-medium">Inventario Rapido</span>
              </button>
            </div>
          </div>

          <div class="lg:col-span-5 flex flex-col items-center justify-center gap-8">
            <div class="flex items-center gap-4">
              <div class="text-5xl font-bold tracking-wide text-[#C8D0E0]">
                {{ character.name }}
              </div>
              <button class="text-3xl text-[#6B4E9E] hover:text-white transition-colors">✏️</button>
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
              class="mt-4 w-full max-w-lg py-6 text-2xl font-semibold bg-gradient-to-r from-[#6B4E9E] to-[#4C2D7A] hover:brightness-110 rounded-3xl transition-all shadow-xl shadow-purple-950"
            >
              Gerenciamento de Personagem
            </button>
          </div>

          <div class="lg:col-span-3">
            <div class="bg-[#1A2438]/80 border border-[#6B4E9E]/30 rounded-3xl p-7 h-full">
              <h3 class="text-2xl font-semibold mb-5 text-[#C8D0E0]">Notas da Campanha</h3>
              <div class="text-zinc-300 leading-relaxed text-[15px] min-h-[260px]">
                {{ historyPreview }}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <Modal
      v-if="showSettingsModal && character"
      panel-class="max-w-3xl border-[#6B4E9E]/50 bg-[#111A2D]"
      body-class="max-h-[75vh] overflow-y-auto p-6"
      header-class="border-[#6B4E9E]/30 px-6 py-4"
      @close="closeSettingsModal"
    >
      <template #header>
        <div>
          <h2 class="text-2xl font-bold text-[#C8D0E0]">Configuracoes</h2>
          <p class="text-sm text-zinc-400">
            {{
              authStore.isMaster
                ? 'Painel de aprovacao do mestre'
                : 'Solicitar alteracao de personagem'
            }}
          </p>
        </div>
      </template>

      <div v-if="authStore.isMaster" class="space-y-4">
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { getHistoryDocumentSignedUrl } from '@/lib/supabase/storage'
import { useAuthStore } from '@/stores/auth'
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

const historyPreview = computed(() => {
  const txt = (character.value?.data?.history as string) || ''
  return txt.trim()
    ? txt.slice(0, 320) + (txt.length > 320 ? '...' : '')
    : 'Nenhuma anotacao registrada ainda.'
})

const indoleLabel = computed(() => {
  const raw = (character.value?.data?.indole as string) ?? 'neutro'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const goBack = () => {
  router.push({ name: 'login' })
}

const toggleSettingsMenu = () => {
  showSettingsMenu.value = !showSettingsMenu.value
}

const closeSettingsMenu = () => {
  showSettingsMenu.value = false
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

  if (authStore.isMaster) {
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
    await authStore.signOut()
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

onMounted(async () => {
  const characterId = String(route.query.characterId ?? '').trim()

  if (!characterId) {
    error.value = 'Personagem nao informado. Faca login novamente.'
    loading.value = false
    return
  }

  try {
    character.value = await charactersStore.fetchCharacterById(characterId)
    initializeSettingsForm()
  } catch {
    error.value = 'Nao foi possivel carregar este personagem.'
  } finally {
    loading.value = false
  }
})
</script>
