<template>
  <div class="min-h-screen overflow-hidden relative">
    <div class="absolute inset-0 bg-cover bg-center" :style="backgroundStyle" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/65 to-black/95" />

    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div v-if="loading" class="text-zinc-500 text-lg animate-pulse">Carregando...</div>

      <template v-else>
        <div class="text-center mb-16">
          <h1 class="text-6xl md:text-7xl font-bold text-red-400 tracking-wider drop-shadow-2xl">
            {{ layout?.titulo ?? 'Caminho Sem Volta' }}
          </h1>
          <p class="text-zinc-400 mt-4 text-xl">
            {{ layout?.subtitulo ?? 'Escolha seu destino ou crie um novo heroi' }}
          </p>
        </div>

        <div
          v-if="sessionExpiredMessage"
          class="w-full max-w-4xl mb-10 rounded-3xl border border-[#6B4E9E]/40 bg-[#1A2438]/80 backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div class="h-1 w-full bg-gradient-to-r from-red-500 via-[#6B4E9E] to-[#C8D0E0]" />
          <div class="px-6 py-5 md:px-8 md:py-6">
            <p class="text-xs uppercase tracking-[0.35em] text-red-300/80 mb-2">Sessao expirada</p>
            <h2 class="text-2xl md:text-3xl font-bold text-[#C8D0E0]">Faca login novamente</h2>
            <p class="mt-3 text-zinc-300 leading-relaxed">
              Sua sessao ativa atingiu o limite de 24 horas. Escolha novamente o personagem e
              informe e-mail e senha para continuar.
            </p>
          </div>
        </div>

        <div class="w-full max-w-6xl">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div
              @click="openMasterLogin"
              :class="[
                'group relative bg-[#1E1A0E]/90 border border-amber-600/50 rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                isAnyActionLoading
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:border-amber-400 active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="gameMasterAvatarUrl"
                  :src="gameMasterAvatarUrl"
                  class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  alt="Game Master"
                />
                <div v-else class="w-full h-full bg-[#2B210A] flex items-center justify-center">
                  <span class="text-4xl font-bold text-amber-500/80">GM</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div class="p-4 bg-black/80 border-t border-amber-700/30">
                <h3 class="font-semibold text-amber-200 text-base line-clamp-1">Game Master</h3>
                <p class="text-amber-400 text-sm mt-1">Acesso Mestre</p>
              </div>
            </div>

            <div
              v-for="char in characters"
              :key="char.characterId"
              @click="abrirLogin(char)"
              :class="[
                'group relative bg-zinc-900 border border-red-900/50 rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                isAnyActionLoading
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:border-red-500 active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="char.avatarUrl"
                  :src="char.avatarUrl"
                  class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  :alt="char.name"
                />
                <div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span class="text-3xl font-semibold text-zinc-600">SEM AVATAR</span>
                </div>
              </div>

              <div class="p-4 bg-zinc-950/90">
                <h3 class="font-semibold text-white text-base line-clamp-1">{{ char.name }}</h3>
                <p class="text-red-400 text-sm mt-1">
                  Nv. {{ char.level }}
                  <span v-if="char.classe"> • {{ char.classe }}</span>
                </p>
              </div>
            </div>

            <div
              @click="showCreateModal = true"
              :class="[
                'group relative bg-red-900/80 border border-red-500/50 rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center gap-4',
                isAnyActionLoading
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:bg-red-700 hover:border-red-400 active:scale-[0.98]',
              ]"
            >
              <div
                class="w-16 h-16 rounded-2xl border-4 border-red-400/50 group-hover:border-red-300 flex items-center justify-center transition-all text-4xl text-red-300"
              >
                +
              </div>
              <div class="text-center">
                <p class="text-red-300 font-semibold text-lg tracking-wide">Criar Novo</p>
                <p class="text-red-400/70 text-sm">Personagem</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Modal
      v-if="selectedChar"
      panel-class="max-w-md bg-zinc-950 border-red-900/60"
      body-class="p-0"
      :show-close-button="false"
      @close="closeCharacterLoginModal"
    >
      <div class="relative h-52 overflow-hidden">
        <img
          v-if="selectedChar.avatarUrl"
          :src="selectedChar.avatarUrl"
          class="h-full w-full object-cover object-top"
          :alt="selectedChar.name"
        />
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-zinc-900 text-3xl font-semibold text-zinc-600"
        >
          SEM AVATAR
        </div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"
        />

        <div class="absolute bottom-4 left-6 right-14">
          <h2 class="text-2xl font-bold leading-tight text-white">{{ selectedChar.name }}</h2>
          <p class="mt-1 text-sm text-red-400">
            Nv. {{ selectedChar.level }} • {{ selectedChar.classe ?? 'Sem Classe' }}
          </p>
        </div>

        <button
          @click="closeCharacterLoginModal"
          :disabled="characterLoginLoading"
          class="action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-zinc-300 transition-colors hover:bg-red-900/80 hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          ✕
        </button>
      </div>

      <div class="space-y-5 p-8">
        <p class="text-center text-sm text-zinc-500">
          Insira suas credenciais para entrar como este personagem
        </p>

        <div class="space-y-1">
          <label class="block text-sm text-zinc-400">E-mail</label>
          <input
            v-model="characterLoginEmail"
            type="email"
            autocomplete="email"
            class="w-full rounded-2xl border border-red-900/30 bg-zinc-900 px-5 py-3 text-white outline-none transition-colors focus:border-red-500"
            placeholder="seu@email.com"
            @keydown.enter="loginCharacter"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-sm text-zinc-400">Senha</label>
          <input
            v-model="characterLoginPassword"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-2xl border border-red-900/30 bg-zinc-900 px-5 py-3 text-white outline-none transition-colors focus:border-red-500"
            placeholder="••••••••"
            @keydown.enter="loginCharacter"
          />
        </div>

        <p v-if="characterLoginError" class="text-center text-sm text-red-400">
          {{ characterLoginError }}
        </p>

        <button
          @click="loginCharacter"
          :disabled="characterLoginLoading"
          class="action-btn w-full rounded-2xl bg-red-700 py-4 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-wait disabled:opacity-50"
        >
          {{ characterLoginLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <Modal
      v-if="showMasterLoginModal"
      panel-class="max-w-md border-amber-700/60 bg-zinc-950"
      body-class="space-y-5 p-8"
      header-class="border-amber-800/40 bg-zinc-900 px-8 py-6 text-center"
      :show-close-button="false"
      @close="closeMasterModal"
    >
      <template #header>
        <div>
          <h2 class="text-3xl font-bold text-amber-300">Game Master</h2>
          <p class="mt-2 text-sm text-zinc-400">Acesso mestre para todos os personagens</p>
        </div>
      </template>

      <div class="space-y-1">
        <label class="block text-sm text-zinc-400">E-mail</label>
        <input
          v-model="masterEmail"
          type="email"
          autocomplete="email"
          class="w-full rounded-2xl border border-amber-900/30 bg-zinc-900 px-5 py-3 text-white outline-none transition-colors focus:border-amber-500"
          placeholder="mestre@email.com"
          @keydown.enter="loginMaster"
        />
      </div>

      <div class="space-y-1">
        <label class="block text-sm text-zinc-400">Senha</label>
        <input
          v-model="masterPassword"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-2xl border border-amber-900/30 bg-zinc-900 px-5 py-3 text-white outline-none transition-colors focus:border-amber-500"
          placeholder="••••••••"
          @keydown.enter="loginMaster"
        />
      </div>

      <p v-if="masterError" class="text-center text-sm text-red-400">{{ masterError }}</p>

      <div class="grid grid-cols-2 gap-3">
        <button
          @click="closeMasterModal"
          :disabled="masterLoading"
          class="action-btn rounded-2xl border border-zinc-700 py-3 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          @click="loginMaster"
          :disabled="masterLoading"
          class="action-btn rounded-2xl bg-amber-700 py-3 font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-wait disabled:opacity-60"
        >
          {{ masterLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <Modal
      v-if="showCreateModal"
      overlay-class="bg-black/90"
      panel-class="max-w-2xl max-h-[95vh] bg-zinc-950 border-red-900/35 flex flex-col"
      body-class="custom-scroll flex-1 space-y-8 overflow-y-auto p-8"
      header-class="shrink-0 border-red-900/15 bg-zinc-900 px-8 py-4"
      footer-class="shrink-0 border-red-900/15 bg-zinc-900 px-8 py-4"
      :show-close-button="false"
      @close="closeCreateModal"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-red-400">Criar Novo Personagem</h2>
          <button
            @click="closeCreateModal"
            :disabled="createLoading"
            class="action-btn px-3 text-2xl text-zinc-400 transition-colors hover:text-red-400 disabled:cursor-wait disabled:opacity-60"
          >
            ×
          </button>
        </div>
      </template>

      <div>
        <label class="mb-3 block text-sm text-zinc-400">Avatar do Personagem</label>
        <div
          class="relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-red-900/50 transition-all"
          :class="[
            createLoading
              ? 'cursor-wait opacity-70 pointer-events-none'
              : 'cursor-pointer hover:border-red-500 active:scale-[0.995]',
            { 'border-red-500 bg-red-950/20': createIsDragging },
          ]"
          @dragover.prevent="createIsDragging = true"
          @dragleave.prevent="createIsDragging = false"
          @drop.prevent="handleCreateDrop"
          @click="triggerCreateFileInput"
        >
          <input
            ref="createFileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleCreateFileSelect"
          />

          <div
            v-if="createPreviewUrl"
            class="relative flex h-full w-full items-center justify-center px-6"
          >
            <div
              class="relative aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl border border-red-900/40 bg-zinc-900"
            >
              <img :src="createPreviewUrl" class="h-full w-full object-cover" alt="preview" />
            </div>
            <button
              @click.stop="removeCreateImage"
              :disabled="createLoading"
              class="action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-xl text-white hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
            >
              ✕
            </button>
          </div>

          <div v-else class="text-center">
            <p class="text-lg text-zinc-300">Arraste ou clique para adicionar avatar</p>
            <p class="mt-1 text-sm text-zinc-500">PNG, JPG ou WEBP • Max 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm text-zinc-400">Nome do Personagem</label>
        <input
          v-model="createForm.name"
          type="text"
          class="w-full rounded-2xl border border-red-900/30 bg-zinc-900 px-6 py-4 text-lg text-white outline-none focus:border-red-500"
          placeholder="Ex: Sir Elandor, o Guardiao Templario"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm text-zinc-400">Indole (Alinhamento)</label>
        <select
          v-model="createForm.indole"
          class="w-full rounded-2xl border border-red-900/30 bg-zinc-900 px-6 py-4 text-white outline-none focus:border-red-500"
        >
          <option value="bom">Bom</option>
          <option value="neutro-bom">Neutro com tendencias boas</option>
          <option value="neutro">Neutro</option>
          <option value="neutro-ruim">Neutro com tendencias ruins</option>
          <option value="ruim">Ruim</option>
        </select>
      </div>

      <div>
        <label class="mb-2 block text-sm text-zinc-400">Aparencia Fisica</label>
        <textarea
          v-model="createForm.appearance"
          rows="4"
          class="min-h-[120px] w-full resize-y rounded-2xl border border-red-900/30 bg-zinc-900 px-6 py-4 text-white outline-none focus:border-red-500"
          placeholder="Descreva a aparencia fisica do personagem..."
        />
      </div>

      <div>
        <label class="mb-2 block text-sm text-zinc-400">Historia do Personagem</label>
        <textarea
          v-model="createForm.history"
          rows="8"
          class="min-h-[200px] w-full resize-y rounded-2xl border border-red-900/30 bg-zinc-900 px-6 py-4 text-white outline-none focus:border-red-500"
          placeholder="Escreva a historia completa do seu personagem aqui..."
        />
      </div>

      <div>
        <label class="mb-2 block text-sm text-zinc-400"
          >Documento da Historia (opcional - Word ou PDF)</label
        >
        <div
          class="rounded-2xl border-2 border-dashed border-red-900/50 p-8 text-center transition-colors"
          :class="
            createLoading
              ? 'cursor-wait opacity-70 pointer-events-none'
              : 'cursor-pointer hover:border-red-500 active:scale-[0.995]'
          "
          @click="triggerCreateDocInput"
        >
          <input
            ref="createDocInput"
            type="file"
            accept=".doc,.docx,.pdf"
            class="hidden"
            @change="handleCreateDocSelect"
          />

          <div
            v-if="createSelectedDoc"
            class="flex items-center justify-center gap-2 text-green-400"
          >
            <span class="font-medium">{{ createSelectedDoc.name }}</span>
          </div>
          <div v-else>
            <p class="text-zinc-400">Clique para enviar documento</p>
            <p class="mt-1 text-xs text-zinc-500">.doc, .docx ou .pdf</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="closeCreateModal"
            :disabled="createLoading"
            class="action-btn rounded-xl border border-red-900/50 bg-red-950/50 px-6 py-2 text-red-200 transition-colors hover:bg-red-900/60 disabled:cursor-wait disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            @click="createCharacter"
            :disabled="createLoading || !createForm.name.trim()"
            class="action-btn rounded-xl bg-red-600 px-7 py-2 font-medium transition-all hover:bg-red-700 disabled:cursor-wait disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {{ createLoading ? 'Criando...' : 'Criar Personagem' }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import type { PersonagemPublicoApi } from '@/types/supabase'

const charactersStore = useCharactersStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const showCreateModal = ref(false)
const selectedChar = ref<PersonagemPublicoApi | null>(null)
const showMasterLoginModal = ref(false)
const gameMasterAvatarUrl = import.meta.env.VITE_GM_AVATAR_URL || ''

const characterLoginEmail = ref('')
const characterLoginPassword = ref('')
const characterLoginLoading = ref(false)
const characterLoginError = ref('')

const masterEmail = ref('')
const masterPassword = ref('')
const masterLoading = ref(false)
const masterError = ref('')

const createFileInput = ref<HTMLInputElement | null>(null)
const createDocInput = ref<HTMLInputElement | null>(null)
const createPreviewUrl = ref<string | null>(null)
const createSelectedFile = ref<File | null>(null)
const createSelectedDoc = ref<File | null>(null)
const createIsDragging = ref(false)
const createLoading = ref(false)
const createForm = ref({
  name: '',
  indole: 'neutro',
  appearance: '',
  history: '',
})

const characters = computed(() => charactersStore.publicCharacters)
const layout = computed(() => charactersStore.layout)
const loading = computed(() => charactersStore.loading)
const sessionExpiredMessage = computed(() => route.query.reason === 'session-expired')

const backgroundStyle = computed(() => {
  const img = layout.value?.backgroundImage ?? '/login-bg.jpg'
  return { backgroundImage: `url('${img}')` }
})

const isAnyActionLoading = computed(
  () => characterLoginLoading.value || masterLoading.value || createLoading.value,
)

onMounted(async () => {
  await charactersStore.fetchPaginaInicial()
})

function abrirLogin(char: PersonagemPublicoApi) {
  if (isAnyActionLoading.value) return

  if (authStore.canReuseSessionForCharacter(char.characterId)) {
    authStore.setActiveCharacter(char.characterId)
    router.push({ name: 'dashboard', query: { characterId: char.characterId } })
    return
  }

  selectedChar.value = char
  characterLoginEmail.value = ''
  characterLoginPassword.value = ''
  characterLoginError.value = ''
}

function closeCharacterLoginModal() {
  selectedChar.value = null
  characterLoginEmail.value = ''
  characterLoginPassword.value = ''
  characterLoginError.value = ''
}

async function loginCharacter() {
  if (!selectedChar.value) return

  if (!characterLoginEmail.value.trim() || !characterLoginPassword.value) {
    characterLoginError.value = 'Preencha e-mail e senha'
    return
  }

  characterLoginLoading.value = true
  characterLoginError.value = ''
  const characterId = selectedChar.value.characterId

  try {
    await authStore.signIn(
      characterLoginEmail.value.trim(),
      characterLoginPassword.value,
      characterId,
    )
    closeCharacterLoginModal()
    router.push({ name: 'dashboard', query: { characterId } })
  } catch {
    characterLoginError.value = 'Credenciais invalidas. Tente novamente.'
  } finally {
    characterLoginLoading.value = false
  }
}

function openMasterLogin() {
  if (isAnyActionLoading.value) return

  masterEmail.value = ''
  masterPassword.value = ''
  masterError.value = ''
  showMasterLoginModal.value = true
}

function closeMasterModal() {
  showMasterLoginModal.value = false
  masterError.value = ''
}

async function loginMaster() {
  if (!masterEmail.value.trim() || !masterPassword.value) {
    masterError.value = 'Preencha e-mail e senha'
    return
  }

  masterLoading.value = true
  masterError.value = ''

  try {
    await authStore.signIn(masterEmail.value.trim(), masterPassword.value, null, { asMaster: true })
    closeMasterModal()
    router.push({ name: 'master-panel' })
  } catch {
    masterError.value = 'Credenciais invalidas. Tente novamente.'
  } finally {
    masterLoading.value = false
  }
}

function triggerCreateFileInput() {
  if (createLoading.value) return
  createFileInput.value?.click()
}

function handleCreateFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) processCreateAvatar(target.files[0])
}

function handleCreateDrop(event: DragEvent) {
  createIsDragging.value = false
  if (event.dataTransfer?.files?.[0]) processCreateAvatar(event.dataTransfer.files[0])
}

function processCreateAvatar(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('Apenas imagens!')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Maximo 5MB!')
    return
  }

  createSelectedFile.value = file
  createPreviewUrl.value = URL.createObjectURL(file)
}

function removeCreateImage() {
  createPreviewUrl.value = null
  createSelectedFile.value = null
}

function triggerCreateDocInput() {
  if (createLoading.value) return
  createDocInput.value?.click()
}

function handleCreateDocSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) createSelectedDoc.value = target.files[0]
}

function resetCreateForm() {
  createForm.value = {
    name: '',
    indole: 'neutro',
    appearance: '',
    history: '',
  }
  createPreviewUrl.value = null
  createSelectedFile.value = null
  createSelectedDoc.value = null
}

function closeCreateModal() {
  showCreateModal.value = false
  resetCreateForm()
}

async function createCharacter() {
  if (!createForm.value.name.trim()) return

  createLoading.value = true

  try {
    await charactersStore.createCharacter(
      {
        name: createForm.value.name.trim(),
        data: {
          indole: createForm.value.indole,
          appearance: createForm.value.appearance,
          history: createForm.value.history,
        },
      },
      createSelectedFile.value || undefined,
      createSelectedDoc.value || undefined,
    )
    closeCreateModal()
  } catch (err: any) {
    alert(`Erro ao criar personagem: ${err?.message ?? 'erro desconhecido'}`)
  } finally {
    createLoading.value = false
  }
}
</script>

<style scoped>
.action-btn {
  transition:
    transform 140ms ease,
    filter 140ms ease,
    opacity 140ms ease;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
  filter: brightness(0.96);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #991b1b;
  border-radius: 3px;
}
</style>
