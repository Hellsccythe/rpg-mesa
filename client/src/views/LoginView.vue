<template>
  <div class="min-h-screen overflow-hidden relative">
    <div class="absolute inset-0 bg-cover bg-center" :style="estiloFundo" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/65 to-black/95" />

    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div v-if="carregando" class="text-zinc-500 text-lg animate-pulse">Carregando...</div>

      <template v-else>
        <div class="text-center mb-16">
          <h1
            class="login-page-title text-6xl md:text-7xl font-bold tracking-wider drop-shadow-2xl"
          >
            {{ layout?.titulo ?? 'Caminho Sem Volta' }}
          </h1>
          <p class="text-zinc-400 mt-4 text-xl">
            {{ layout?.subtitulo ?? 'Escolha seu destino ou crie um novo heroi' }}
          </p>
        </div>

        <div
          v-if="sessaoExpirada && !notificacaoFechada"
          class="notificacao-sessao relative w-full max-w-4xl mb-10 rounded-3xl border backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div class="h-1 w-full bg-gradient-to-r from-red-500 via-[#6B4E9E] to-indigo-300" />
          <div class="px-6 py-5 md:px-8 md:py-6">
            <button
              @click="notificacaoFechada = true"
              class="notificacao-fechar absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
              aria-label="Fechar notificacao"
            >
              ✕
            </button>
            <p class="notificacao-label text-xs uppercase tracking-[0.35em] mb-2">Sessao expirada</p>
            <h2 class="notificacao-titulo text-2xl md:text-3xl font-bold">Faca login novamente</h2>
            <p class="notificacao-corpo mt-3 leading-relaxed">
              Sua sessao ativa atingiu o limite de 24 horas. Escolha novamente o personagem e
              informe e-mail e senha para continuar.
            </p>
          </div>
        </div>

        <div class="w-full max-w-6xl">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div
              @click="abrirLoginMestre"
              :class="[
                'group relative bg-[#1E1A0E]/90 border border-amber-600/50 rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:border-amber-400 active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="avatarUrlMestre"
                  :src="avatarUrlMestre"
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
              v-for="char in personagens"
              :key="char.characterId"
              @click="abrirLogin(char)"
              :class="[
                'login-character-card group relative border rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="char.avatarUrl"
                  :src="char.avatarUrl"
                  class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  :alt="char.name"
                />
                <div
                  v-else
                  class="login-character-fallback w-full h-full flex items-center justify-center"
                >
                  <span class="login-character-fallback-text text-3xl font-semibold"
                    >SEM AVATAR</span
                  >
                </div>
              </div>

              <div class="login-character-footer p-4">
                <h3 class="login-character-title font-semibold text-base line-clamp-1">
                  {{ char.name }}
                </h3>
                <p class="login-character-subtitle text-sm mt-1">
                  Nv. {{ char.level }}
                  <span v-if="char.classe"> • {{ char.classe }}</span>
                </p>
              </div>
            </div>

            <div
              @click="mostrarModalCriacao = true"
              :class="[
                'login-create-card group relative border rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center gap-4',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl active:scale-[0.98]',
              ]"
            >
              <div
                class="login-create-icon w-16 h-16 rounded-2xl border-4 flex items-center justify-center transition-all text-4xl"
              >
                +
              </div>
              <div class="text-center">
                <p class="login-create-title font-semibold text-lg tracking-wide">Criar Novo</p>
                <p class="login-create-subtitle text-sm">Personagem</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal de login de personagem -->
    <Modal
      v-if="personagemSelecionado"
      panel-class="max-w-md login-themed-modal"
      body-class="p-0"
      :show-close-button="false"
      @close="fecharModalLoginPersonagem"
    >
      <div
        class="login-modal-hero relative h-52 overflow-hidden"
        :class="{ 'has-avatar': !!personagemSelecionado.avatarUrl }"
      >
        <img
          v-if="personagemSelecionado.avatarUrl"
          ref="heroImgRef"
          :src="personagemSelecionado.avatarUrl"
          class="h-full w-full object-cover transition-[object-position] duration-500"
          :style="{ objectPosition: heroImagePosition }"
          :alt="personagemSelecionado.name"
          @load="analisarHeroImage(heroImgRef)"
        />
        <div
          v-else
          class="login-modal-hero-fallback flex h-full w-full items-center justify-center text-3xl font-semibold"
        >
          SEM AVATAR
        </div>

        <div class="login-modal-hero-overlay absolute inset-0" />

        <div class="absolute bottom-4 left-6 right-14">
          <h2 class="login-modal-hero-name text-2xl font-bold leading-tight">
            {{ personagemSelecionado.name }}
          </h2>
          <p class="login-modal-hero-subtitle mt-2 text-sm">
            Nv. {{ personagemSelecionado.level }} •
            {{ personagemSelecionado.classe ?? 'Sem Classe' }}
          </p>
        </div>

        <button
          @click="fecharModalLoginPersonagem"
          :disabled="carregandoLoginPersonagem"
          class="login-modal-hero-close action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          ✕
        </button>
      </div>

      <div class="login-modal-form space-y-5 p-8">
        <p class="login-modal-muted text-center text-sm">
          Insira suas credenciais para entrar como este personagem
        </p>

        <div class="space-y-1">
          <label class="login-modal-label block text-sm">Nome de usuario</label>
          <input
            v-model="usernameLoginPersonagem"
            type="text"
            autocomplete="username"
            class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
            placeholder="seu_usuario"
            @keydown.enter="logarPersonagem"
          />
        </div>

        <div class="space-y-1">
          <label class="login-modal-label block text-sm">Senha</label>
          <input
            v-model="senhaLoginPersonagem"
            type="password"
            autocomplete="current-password"
            class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
            placeholder="••••••••"
            @keydown.enter="logarPersonagem"
          />
        </div>

        <p v-if="erroLoginPersonagem" class="text-center text-sm text-red-400">
          {{ erroLoginPersonagem }}
        </p>

        <button
          @click="logarPersonagem"
          :disabled="carregandoLoginPersonagem"
          class="login-modal-submit action-btn w-full rounded-2xl py-4 font-semibold transition-colors disabled:cursor-wait disabled:opacity-50"
        >
          {{ carregandoLoginPersonagem ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <!-- Modal de login do mestre -->
    <Modal
      v-if="mostrarModalLoginMestre"
      panel-class="max-w-md login-themed-modal"
      body-class="space-y-5 p-8"
      header-class="px-8 py-6 text-center"
      :show-close-button="false"
      @close="fecharModalLoginMestre"
    >
      <template #header>
        <div>
          <h2 class="login-modal-title-blue text-3xl font-bold">Game Master</h2>
          <p class="login-modal-muted mt-2 text-sm">Acesso mestre para todos os personagens</p>
        </div>
      </template>

      <div class="space-y-1">
        <label class="login-modal-label block text-sm">E-mail</label>
        <input
          v-model="emailMestre"
          type="email"
          autocomplete="email"
          class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
          placeholder="mestre@email.com"
          @keydown.enter="logarMestre"
        />
      </div>

      <div class="space-y-1">
        <label class="login-modal-label block text-sm">Senha</label>
        <input
          v-model="senhaMestre"
          type="password"
          autocomplete="current-password"
          class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
          placeholder="••••••••"
          @keydown.enter="logarMestre"
        />
      </div>

      <p v-if="erroMestre" class="text-center text-sm text-red-400">{{ erroMestre }}</p>

      <div class="grid grid-cols-2 gap-3">
        <button
          @click="fecharModalLoginMestre"
          :disabled="carregandoMestre"
          class="login-modal-cancel-btn action-btn rounded-2xl border py-3 transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          @click="logarMestre"
          :disabled="carregandoMestre"
          class="login-modal-submit action-btn rounded-2xl py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {{ carregandoMestre ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <!-- Modal de criação de personagem -->
    <Modal
      v-if="mostrarModalCriacao"
      overlay-class="bg-black/90"
      panel-class="max-w-2xl max-h-[95vh] flex flex-col login-themed-modal relative"
      body-class="custom-scroll flex-1 space-y-8 overflow-y-auto p-8"
      header-class="shrink-0 px-8 py-4"
      footer-class="shrink-0 px-8 py-4"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModalCriacao"
    >
      <template #header>
        <h2 class="login-modal-title-blue text-2xl font-bold">Criar Novo Personagem</h2>
        <button
          @click="fecharModalCriacao"
          :disabled="carregandoCriacao"
          aria-label="Fechar modal de criacao de personagem"
          class="login-modal-close-x action-btn absolute top-4 right-4 px-3 text-2xl transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          ×
        </button>
      </template>

      <div>
        <label class="login-modal-label mb-3 block text-sm">Avatar do Personagem</label>
        <div
          class="login-create-dropzone relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all"
          :class="[
            carregandoCriacao
              ? 'cursor-wait opacity-70 pointer-events-none'
              : 'cursor-pointer active:scale-[0.995]',
            { 'login-create-dropzone-dragging': arrastando },
          ]"
          @dragover.prevent="arrastando = true"
          @dragleave.prevent="arrastando = false"
          @drop.prevent="soltarArquivo"
          @click="acionarInputArquivo"
        >
          <input
            ref="inputArquivoCriacao"
            type="file"
            accept="image/*"
            class="hidden"
            @change="selecionarArquivo"
          />

          <div
            v-if="urlPreviewCriacao"
            class="relative flex h-full w-full items-center justify-center px-6"
          >
            <div
              class="login-create-preview relative aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl border"
            >
              <img :src="urlPreviewCriacao" class="h-full w-full object-cover" alt="preview" />
            </div>
            <button
              @click.stop="removerImagem"
              :disabled="carregandoCriacao"
              class="login-create-remove action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl disabled:cursor-wait disabled:opacity-60"
            >
              ✕
            </button>
          </div>

          <div v-else class="text-center">
            <p class="login-modal-text-main text-lg">Arraste ou clique para adicionar avatar</p>
            <p class="login-modal-muted mt-1 text-sm">PNG, JPG ou WEBP • Max 5MB</p>
          </div>
        </div>
      </div>

      <div>
        <label class="login-modal-label mb-2 block text-sm">Nome do Personagem</label>
        <input
          v-model="formularioCriacao.nome"
          type="text"
          class="login-modal-input w-full rounded-2xl border px-6 py-4 text-lg outline-none"
          placeholder="Ex: Sir Elandor, o Guardiao Templario"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <p class="login-modal-muted sm:col-span-2 text-xs">
          Use o e-mail liberado pelo mestre. Crie um usuario unico para fazer login — ele pode ser diferente do seu e-mail.
        </p>

        <div class="sm:col-span-2">
          <label class="login-modal-label mb-2 block text-sm">E-mail liberado pelo mestre</label>
          <input
            v-model="emailContaCriacao"
            type="email"
            autocomplete="email"
            class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
            placeholder="email@cadastrado.com"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="login-modal-label mb-2 block text-sm">Nome de usuario (para login)</label>
          <input
            v-model="usernameContaCriacao"
            type="text"
            autocomplete="username"
            class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
            placeholder="ex: hellsccythe (3-20 chars)"
          />
          <p class="mt-1 text-xs text-zinc-500">Apenas letras, numeros, _ e -. Sera usado para entrar no jogo.</p>
        </div>

        <div>
          <label class="login-modal-label mb-2 block text-sm">Senha</label>
          <input
            v-model="senhaContaCriacao"
            type="password"
            autocomplete="new-password"
            class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
            placeholder="Minimo 6 caracteres"
          />
        </div>

        <div>
          <label class="login-modal-label mb-2 block text-sm">Confirmar senha</label>
          <input
            v-model="confirmacaoSenha"
            type="password"
            autocomplete="new-password"
            class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
            placeholder="Repita sua senha"
          />
        </div>
      </div>

      <div>
        <label class="login-modal-label mb-2 block text-sm">Indole (Alinhamento)</label>
        <v-select
          id="create-character-indole"
          v-model="formularioCriacao.indole"
          :options="opcoesIndole"
          aria-label="Selecionar indole do personagem"
          root-class="w-full"
          trigger-class="login-modal-input px-6 py-4 !rounded-2xl"
        />
      </div>

      <div>
        <label class="login-modal-label mb-2 block text-sm">Aparencia Fisica</label>
        <textarea
          v-model="formularioCriacao.aparencia"
          rows="4"
          class="login-modal-input min-h-[120px] w-full resize-y rounded-2xl border px-6 py-4 outline-none"
          placeholder="Descreva a aparencia fisica do personagem..."
        />
      </div>

      <div>
        <label class="login-modal-label mb-2 block text-sm">Historia do Personagem</label>
        <textarea
          v-model="formularioCriacao.historia"
          rows="8"
          class="login-modal-input min-h-[200px] w-full resize-y rounded-2xl border px-6 py-4 outline-none"
          placeholder="Escreva a historia completa do seu personagem aqui..."
        />
      </div>

      <div>
        <label class="login-modal-label mb-2 block text-sm"
          >Documento da Historia (opcional - Word ou PDF)</label
        >
        <div
          class="login-create-doczone rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
          :class="
            carregandoCriacao
              ? 'cursor-wait opacity-70 pointer-events-none'
              : 'cursor-pointer active:scale-[0.995]'
          "
          @click="acionarInputDoc"
        >
          <input
            ref="inputDocCriacao"
            type="file"
            accept=".doc,.docx,.pdf"
            class="hidden"
            @change="selecionarDoc"
          />

          <div
            v-if="docSelecionado"
            class="login-create-doc-selected flex items-center justify-center gap-2"
          >
            <span class="font-medium">{{ docSelecionado.name }}</span>
          </div>
          <div v-else>
            <p class="login-modal-label">Clique para enviar documento</p>
            <p class="login-modal-muted mt-1 text-xs">.doc, .docx ou .pdf</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="space-y-3">
          <p v-if="erroCriacao" class="text-sm text-red-400">{{ erroCriacao }}</p>

          <div class="flex justify-end gap-3">
            <button
              @click="fecharModalCriacao"
              :disabled="carregandoCriacao"
              class="login-modal-cancel-btn action-btn rounded-xl border px-6 py-2 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              @click="criarPersonagem"
              :disabled="envioDesabilitado"
              class="login-modal-submit action-btn rounded-xl px-7 py-2 font-medium transition-all disabled:cursor-wait disabled:opacity-60"
            >
              {{ carregandoCriacao ? 'Criando...' : 'Criar Personagem' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useSmartImageFocus } from '@/composables/useSmartImageFocus'
import { registrarECriarPersonagem } from '@/lib/api/personagens.api'
import { uploadAvatar, uploadHistoryDocument } from '@/lib/supabase/storage'
import type { PersonagemPublicoApi } from '@/types/supabase'

const storePersonagens = useCharactersStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const mostrarModalCriacao = ref(false)
const personagemSelecionado = ref<PersonagemPublicoApi | null>(null)
const mostrarModalLoginMestre = ref(false)
const avatarUrlMestre = import.meta.env.VITE_GM_AVATAR_URL || ''

const heroImgRef = ref<HTMLImageElement | null>(null)
const { position: heroImagePosition, analyzeImage: analisarHeroImage, reset: resetarHeroFoco } = useSmartImageFocus()

watch(personagemSelecionado, (novo) => {
  if (!novo?.avatarUrl) { resetarHeroFoco(); return }
  // Aguarda a imagem ser montada antes de analisar
  setTimeout(() => analisarHeroImage(heroImgRef.value), 50)
})

const usernameLoginPersonagem = ref('')
const senhaLoginPersonagem = ref('')
const carregandoLoginPersonagem = ref(false)
const erroLoginPersonagem = ref('')

const emailMestre = ref('')
const senhaMestre = ref('')
const carregandoMestre = ref(false)
const erroMestre = ref('')

const inputArquivoCriacao = ref<HTMLInputElement | null>(null)
const inputDocCriacao = ref<HTMLInputElement | null>(null)
const urlPreviewCriacao = ref<string | null>(null)
const arquivoSelecionado = ref<File | null>(null)
const docSelecionado = ref<File | null>(null)
const arrastando = ref(false)
const carregandoCriacao = ref(false)
const erroCriacao = ref('')
const emailContaCriacao = ref('')
const usernameContaCriacao = ref('')
const senhaContaCriacao = ref('')
const confirmacaoSenha = ref('')
const formularioCriacao = ref({
  nome: '',
  indole: 'neutro',
  aparencia: '',
  historia: '',
})

const opcoesIndole = [
  { value: 'bom', label: 'Bom' },
  { value: 'neutro-bom', label: 'Neutro com tendencias boas' },
  { value: 'neutro', label: 'Neutro' },
  { value: 'neutro-ruim', label: 'Neutro com tendencias ruins' },
  { value: 'ruim', label: 'Ruim' },
]

const personagens = computed(() => storePersonagens.publicCharacters)
const layout = computed(() => storePersonagens.layout)
const carregando = computed(() => storePersonagens.loading)
const sessaoExpirada = ref(false)
const notificacaoFechada = ref(false)

const estiloFundo = computed(() => {
  const img = layout.value?.backgroundImage ?? '/login-bg.jpg'
  return { backgroundImage: `url('${img}')` }
})

const algumCarregamento = computed(
  () => carregandoLoginPersonagem.value || carregandoMestre.value || carregandoCriacao.value,
)

const envioDesabilitado = computed(() => {
  if (carregandoCriacao.value) return true
  if (!formularioCriacao.value.nome.trim()) return true
  if (!emailContaCriacao.value.trim()) return true
  if (!senhaContaCriacao.value) return true
  if (!confirmacaoSenha.value) return true
  return false
})

onMounted(async () => {
  if (route.query.reason === 'session-expired') {
    sessaoExpirada.value = true
    router.replace({ path: route.path, query: {} })
  }
  await storePersonagens.fetchPaginaInicial()
})

function traduzirErroAuth(mensagem: string): string {
  const msg = mensagem.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'E-mail ou senha invalidos. Verifique suas credenciais.'
  }
  if (msg.includes('email not confirmed')) {
    return 'E-mail ainda nao confirmado. Verifique sua caixa de entrada e clique no link de confirmacao.'
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'Este e-mail ja esta cadastrado.'
  }
  if (msg.includes('password should be') || msg.includes('password is too short')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Falha de conexao. Verifique sua internet e tente novamente.'
  }
  return mensagem
}

function abrirLogin(char: PersonagemPublicoApi) {
  if (algumCarregamento.value) return

  if (authStore.podeReutilizarSessao(char.characterId)) {
    authStore.definirPersonagemAtivo(char.characterId)
    router.push({ name: 'dashboard', query: { characterId: char.characterId } })
    return
  }

  personagemSelecionado.value = char
  usernameLoginPersonagem.value = ''
  senhaLoginPersonagem.value = ''
  erroLoginPersonagem.value = ''
}

function fecharModalLoginPersonagem() {
  personagemSelecionado.value = null
  usernameLoginPersonagem.value = ''
  senhaLoginPersonagem.value = ''
  erroLoginPersonagem.value = ''
}

async function logarPersonagem() {
  if (!personagemSelecionado.value) return

  const username = usernameLoginPersonagem.value.trim().toLowerCase()
  if (!username || !senhaLoginPersonagem.value) {
    erroLoginPersonagem.value = 'Preencha usuario e senha.'
    return
  }

  carregandoLoginPersonagem.value = true
  erroLoginPersonagem.value = ''
  const idPersonagem = personagemSelecionado.value.characterId

  try {
    await authStore.entrar(`${username}@rpg.internal`, senhaLoginPersonagem.value, idPersonagem)
    fecharModalLoginPersonagem()
    router.push({ name: 'dashboard', query: { characterId: idPersonagem } })
  } catch (err: any) {
    erroLoginPersonagem.value = traduzirErroAuth(String(err?.message ?? '')) || 'Usuario ou senha invalidos.'
  } finally {
    carregandoLoginPersonagem.value = false
  }
}

function abrirLoginMestre() {
  if (algumCarregamento.value) return

  emailMestre.value = ''
  senhaMestre.value = ''
  erroMestre.value = ''
  mostrarModalLoginMestre.value = true
}

function fecharModalLoginMestre() {
  mostrarModalLoginMestre.value = false
  erroMestre.value = ''
}

async function logarMestre() {
  if (!emailMestre.value.trim() || !senhaMestre.value) {
    erroMestre.value = 'Preencha e-mail e senha.'
    return
  }

  carregandoMestre.value = true
  erroMestre.value = ''

  try {
    await authStore.entrar(emailMestre.value.trim(), senhaMestre.value, null, { comoMestre: true })
    fecharModalLoginMestre()
    router.push({ name: 'master-panel' })
  } catch (err: any) {
    erroMestre.value = traduzirErroAuth(String(err?.message ?? '')) || 'Credenciais invalidas. Tente novamente.'
  } finally {
    carregandoMestre.value = false
  }
}

function acionarInputArquivo() {
  if (carregandoCriacao.value) return
  inputArquivoCriacao.value?.click()
}

function selecionarArquivo(event: Event) {
  const alvo = event.target as HTMLInputElement
  if (alvo.files?.[0]) processarAvatar(alvo.files[0])
}

function soltarArquivo(event: DragEvent) {
  arrastando.value = false
  if (event.dataTransfer?.files?.[0]) processarAvatar(event.dataTransfer.files[0])
}

function processarAvatar(arquivo: File) {
  if (!arquivo.type.startsWith('image/')) {
    alert('Apenas imagens sao permitidas!')
    return
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    alert('O arquivo deve ter no maximo 5MB!')
    return
  }

  arquivoSelecionado.value = arquivo
  urlPreviewCriacao.value = URL.createObjectURL(arquivo)
}

function removerImagem() {
  urlPreviewCriacao.value = null
  arquivoSelecionado.value = null
}

function acionarInputDoc() {
  if (carregandoCriacao.value) return
  inputDocCriacao.value?.click()
}

function selecionarDoc(event: Event) {
  const alvo = event.target as HTMLInputElement
  if (alvo.files?.[0]) docSelecionado.value = alvo.files[0]
}

function resetarFormulario() {
  formularioCriacao.value = {
    nome: '',
    indole: 'neutro',
    aparencia: '',
    historia: '',
  }
  erroCriacao.value = ''
  emailContaCriacao.value = ''
  usernameContaCriacao.value = ''
  senhaContaCriacao.value = ''
  confirmacaoSenha.value = ''
  urlPreviewCriacao.value = null
  arquivoSelecionado.value = null
  docSelecionado.value = null
}

function fecharModalCriacao() {
  mostrarModalCriacao.value = false
  resetarFormulario()
}

async function criarPersonagem() {
  if (!formularioCriacao.value.nome.trim()) {
    erroCriacao.value = 'Informe o nome do personagem.'
    return
  }

  const email = emailContaCriacao.value.trim().toLowerCase()
  if (!email) {
    erroCriacao.value = 'Informe o e-mail liberado pelo mestre.'
    return
  }

  const username = usernameContaCriacao.value.trim().toLowerCase()
  if (!username) {
    erroCriacao.value = 'Informe o nome de usuario para login.'
    return
  }
  if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
    erroCriacao.value = 'Usuario deve ter 3-20 caracteres (letras, numeros, _ ou -).'
    return
  }

  if (!senhaContaCriacao.value || senhaContaCriacao.value.length < 6) {
    erroCriacao.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  if (senhaContaCriacao.value !== confirmacaoSenha.value) {
    erroCriacao.value = 'A confirmacao de senha nao confere.'
    return
  }

  carregandoCriacao.value = true
  erroCriacao.value = ''

  let personagemCriado: Awaited<ReturnType<typeof registrarECriarPersonagem>>

  // Passo 1: servidor cria usuario + personagem
  try {
    personagemCriado = await registrarECriarPersonagem({
      email,
      username,
      senha: senhaContaCriacao.value,
      nome: formularioCriacao.value.nome.trim(),
      data: {
        indole: formularioCriacao.value.indole,
        appearance: formularioCriacao.value.aparencia,
        history: formularioCriacao.value.historia,
      },
    })
  } catch (err: any) {
    carregandoCriacao.value = false
    const mensagemErro = String(err?.response?.data?.message ?? err?.message ?? '')

    if (/liberado/i.test(mensagemErro)) {
      erroCriacao.value = 'Este e-mail nao foi liberado pelo mestre. Solicite a liberacao e tente novamente.'
      return
    }
    if (/cadastrado/i.test(mensagemErro)) {
      erroCriacao.value = 'Este e-mail ja esta cadastrado. Verifique a senha informada.'
      return
    }
    erroCriacao.value = `Erro ao criar personagem: ${mensagemErro || 'Tente novamente.'}`
    return
  }

  // Passo 2: login com as credenciais recem-criadas (username@rpg.internal)
  try {
    await authStore.entrar(`${username}@rpg.internal`, senhaContaCriacao.value, personagemCriado.characterId)
  } catch (err: any) {
    carregandoCriacao.value = false
    const mensagemErro = String(err?.message ?? '')
    erroCriacao.value = `Personagem criado! Erro ao fazer login automatico: ${traduzirErroAuth(mensagemErro) || mensagemErro}. Clique no personagem para entrar.`
    await storePersonagens.fetchPaginaInicial()
    fecharModalCriacao()
    return
  }

  const userId = authStore.usuario?.id

  if (arquivoSelecionado.value && userId) {
    try {
      const publicUrl = await uploadAvatar(arquivoSelecionado.value, userId)
      await storePersonagens.editCharacter(personagemCriado.characterId, { avatarUrl: publicUrl })
    } catch {
      // Avatar falhou mas personagem foi criado
    }
  }

  if (docSelecionado.value && userId) {
    try {
      const doc = await uploadHistoryDocument(docSelecionado.value, userId)
      await storePersonagens.editCharacter(personagemCriado.characterId, {
        data: {
          historyDocumentPath: doc.path,
          historyDocumentName: doc.name,
          historyDocumentMimeType: doc.mimeType,
        },
      })
    } catch {
      // Doc falhou mas personagem foi criado
    }
  }

  carregandoCriacao.value = false
  fecharModalCriacao()
  authStore.definirPersonagemAtivo(personagemCriado.characterId)
  router.push({ name: 'dashboard', query: { characterId: personagemCriado.characterId } })
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

.login-page-title {
  color: var(--title-color);
}

.login-master-card {
  background: color-mix(in srgb, var(--bg-card) 88%, #3b2f10 12%);
  border-color: color-mix(in srgb, var(--brand-primary) 34%, #d4a017 66%);
}

.login-master-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, #fbbf24 60%);
}

.login-master-fallback {
  background: color-mix(in srgb, var(--bg-soft) 70%, #3b2f10 30%);
}

.login-master-fallback-text,
.login-master-title {
  color: color-mix(in srgb, #fbbf24 78%, var(--text-main) 22%);
}

.login-master-subtitle {
  color: color-mix(in srgb, #fcd34d 72%, var(--text-main) 28%);
}

.login-master-footer {
  background: color-mix(in srgb, var(--bg-card) 78%, #1f2937 22%);
  border-top-color: color-mix(in srgb, var(--border-soft) 56%, #fbbf24 44%);
}

.login-character-card {
  background: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%);
  border-color: color-mix(in srgb, var(--border-soft) 70%, var(--brand-primary) 30%);
}

.login-character-card:hover {
  border-color: var(--brand-primary);
}

.login-character-fallback {
  background: color-mix(in srgb, var(--bg-soft) 72%, #0f172a 28%);
}

.login-character-fallback-text {
  color: color-mix(in srgb, var(--text-main) 34%, transparent 66%);
}

.login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 82%, #0f172a 18%);
}

.login-character-title {
  color: var(--text-main);
}

.login-character-subtitle {
  color: color-mix(in srgb, var(--brand-primary-strong) 72%, var(--text-main) 28%);
}

.login-create-card {
  background: color-mix(in srgb, var(--brand-primary) 56%, var(--bg-card) 44%);
  border-color: color-mix(in srgb, var(--brand-primary-strong) 62%, var(--border-soft) 38%);
}

.login-create-card:hover {
  background: color-mix(in srgb, var(--brand-primary-strong) 62%, var(--bg-card) 38%);
  border-color: color-mix(in srgb, var(--brand-primary-strong) 72%, #ffffff 28%);
}

.login-create-icon {
  border-color: rgb(255 255 255 / 0.56);
  color: rgb(255 255 255 / 0.92);
}

.login-create-title {
  color: rgb(255 255 255 / 0.96);
}

.login-create-subtitle {
  color: rgb(255 255 255 / 0.74);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #991b1b;
  border-radius: 3px;
}

:deep(.login-themed-modal) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-soft) !important;
  color: var(--text-main) !important;
}

:deep(.login-themed-modal input),
:deep(.login-themed-modal textarea),
:deep(.login-themed-modal select) {
  background-color: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%) !important;
  border-color: var(--border-soft) !important;
  color: var(--text-main) !important;
}

:deep(.login-themed-modal input::placeholder),
:deep(.login-themed-modal textarea::placeholder) {
  color: var(--text-muted) !important;
}

:deep(.login-themed-modal .bg-red-700),
:deep(.login-themed-modal .bg-red-600),
:deep(.login-themed-modal .bg-amber-700) {
  color: #ffffff !important;
}

:deep(.login-themed-modal .text-zinc-500),
:deep(.login-themed-modal .text-zinc-400) {
  color: var(--text-muted) !important;
}

:deep(.login-themed-modal .text-zinc-300),
:deep(.login-themed-modal .text-zinc-200),
:deep(.login-themed-modal .text-white) {
  color: var(--text-main) !important;
}

.login-modal-hero-name {
  color: var(--title-color) !important;
}

.login-modal-hero-subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 0.28rem 0.78rem;
  border: 1px solid color-mix(in srgb, var(--border-soft) 82%, var(--text-main) 18%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-card) 84%, var(--bg-soft) 16%);
  color: color-mix(in srgb, var(--text-main) 72%, var(--bg-card) 28%) !important;
  font-weight: 600;
  line-height: 1.3;
}

.login-modal-hero {
  background-color: color-mix(in srgb, var(--bg-card) 86%, var(--bg-soft) 14%);
  border-bottom: 1px solid var(--border-soft);
}

.login-modal-hero-fallback {
  color: color-mix(in srgb, var(--text-main) 40%, transparent 60%);
}

.login-modal-hero-overlay {
  background: color-mix(in srgb, var(--bg-card) 68%, transparent 32%);
}

.login-modal-hero.has-avatar .login-modal-hero-overlay {
  background: rgb(2 6 23 / 0.48);
}

.login-modal-hero.has-avatar .login-modal-hero-name {
  color: color-mix(in srgb, var(--title-color) 82%, #ffffff 18%) !important;
  text-shadow: 0 2px 10px rgb(2 6 23 / 0.62);
}

.login-modal-hero.has-avatar .login-modal-hero-subtitle {
  border-color: rgb(255 255 255 / 0.22);
  background: rgb(15 23 42 / 0.44);
  color: rgb(248 250 252 / 0.98) !important;
  text-shadow: 0 2px 10px rgb(2 6 23 / 0.5);
  backdrop-filter: blur(3px);
}

.login-modal-hero-close {
  background-color: color-mix(in srgb, var(--bg-soft) 74%, transparent 26%);
  color: var(--text-muted);
  border: 1px solid color-mix(in srgb, var(--border-soft) 88%, transparent 12%);
}

.login-modal-hero-close:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 86%, transparent 14%);
  color: var(--text-main);
}

.login-modal-form {
  color: var(--text-main);
}

.login-modal-muted,
.login-modal-label {
  color: color-mix(in srgb, var(--text-main) 68%, var(--bg-card) 32%) !important;
}

.login-modal-input {
  background-color: color-mix(in srgb, var(--bg-card) 96%, var(--bg-soft) 4%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 72%, var(--text-main) 28%) !important;
  color: var(--text-main) !important;
  font-weight: 500;
}

.login-modal-input:focus {
  border-color: var(--brand-primary) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 24%, transparent 76%);
}

.login-modal-input::placeholder {
  color: color-mix(in srgb, var(--text-main) 54%, var(--bg-card) 46%) !important;
  font-weight: 400;
}

.login-modal-submit {
  background-color: var(--brand-primary) !important;
  color: #ffffff !important;
}

.login-modal-submit:hover {
  background-color: var(--brand-primary-strong) !important;
}

.login-modal-cancel-btn {
  background-color: color-mix(in srgb, var(--bg-card) 92%, var(--bg-soft) 8%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 76%, var(--text-main) 24%) !important;
  color: var(--text-main) !important;
}

.login-modal-cancel-btn:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 84%, var(--bg-card) 16%) !important;
}

.login-modal-title-blue {
  color: var(--title-color) !important;
}

.login-modal-close-x {
  color: var(--text-muted) !important;
}

.login-modal-close-x:hover {
  color: var(--title-color) !important;
}

.login-modal-text-main {
  color: var(--text-main) !important;
}

.login-create-dropzone,
.login-create-doczone {
  border-color: color-mix(in srgb, var(--border-soft) 70%, var(--brand-primary) 30%);
  background: color-mix(in srgb, var(--bg-card) 92%, var(--bg-soft) 8%);
}

.login-create-dropzone:hover,
.login-create-doczone:hover {
  border-color: var(--brand-primary);
}

.login-create-dropzone-dragging {
  border-color: var(--brand-primary) !important;
  background: color-mix(in srgb, var(--accent-soft) 58%, var(--bg-card) 42%) !important;
}

.login-create-preview {
  border-color: color-mix(in srgb, var(--border-soft) 74%, var(--text-main) 26%);
  background: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%);
}

.login-create-remove {
  background-color: color-mix(in srgb, var(--bg-soft) 76%, transparent 24%);
  color: var(--text-main);
}

.login-create-remove:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 88%, transparent 12%);
}

.login-create-doc-selected {
  color: var(--brand-primary-strong);
}

:global(html.theme-light) .login-modal-muted,
:global(html.theme-light) .login-modal-label {
  color: color-mix(in srgb, var(--text-main) 82%, var(--bg-card) 18%) !important;
}

:global(html.theme-light) .login-modal-input {
  color: #1e293b !important;
  border-color: #b6c3d6 !important;
}

:global(html.theme-light) .login-modal-input::placeholder {
  color: #64748b !important;
}

:global(html.theme-dark) .login-modal-muted,
:global(html.theme-dark) .login-modal-label {
  color: color-mix(in srgb, var(--text-main) 86%, #ffffff 14%) !important;
}

:global(html.theme-dark) .login-modal-input {
  background-color: color-mix(in srgb, var(--bg-card) 84%, #0b1220 16%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 58%, var(--brand-primary) 42%) !important;
  color: #f8fafc !important;
}

:global(html.theme-dark) .login-modal-input::placeholder {
  color: #a7b7cb !important;
}

:global(html.theme-dark) .login-modal-cancel-btn {
  background-color: color-mix(in srgb, var(--bg-card) 76%, #020617 24%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 54%, var(--brand-primary) 46%) !important;
  color: #e2e8f0 !important;
}

:global(html.theme-dark) .login-create-dropzone,
:global(html.theme-dark) .login-create-doczone {
  border-color: color-mix(in srgb, var(--brand-primary) 46%, var(--border-soft) 54%);
  background: color-mix(in srgb, var(--bg-card) 82%, #0b1220 18%);
}

:global(html.theme-dark) .login-master-card {
  background: color-mix(in srgb, var(--bg-card) 82%, #2f2508 18%);
  border-color: color-mix(in srgb, #f59e0b 52%, var(--brand-primary) 48%);
}

:global(html.theme-dark) .login-master-footer {
  background: color-mix(in srgb, var(--bg-card) 64%, #020617 36%);
}

:global(html.theme-dark) .login-character-card {
  background: color-mix(in srgb, var(--bg-card) 80%, #020617 20%);
  border-color: color-mix(in srgb, var(--brand-primary) 42%, var(--border-soft) 58%);
}

:global(html.theme-dark) .login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 68%, #020617 32%);
}

:global(html.theme-dark) .login-create-card {
  background: color-mix(in srgb, var(--brand-primary-strong) 56%, #3a0c26 44%);
  border-color: color-mix(in srgb, var(--brand-primary) 58%, #fb7185 42%);
}

/* ── Notificação de sessão expirada ── */
.notificacao-sessao {
  background: color-mix(in srgb, var(--bg-card) 88%, #1e293b 12%);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, var(--border-soft) 72%);
}

.notificacao-label {
  color: color-mix(in srgb, #ef4444 76%, var(--text-muted) 24%);
}

.notificacao-titulo {
  color: var(--text-main);
}

.notificacao-corpo {
  color: var(--text-muted);
}

.notificacao-fechar {
  color: var(--text-muted);
}

.notificacao-fechar:hover {
  color: var(--text-main);
  background: color-mix(in srgb, var(--accent-soft) 80%, transparent 20%);
}

:global(html.theme-light) .notificacao-sessao {
  background: color-mix(in srgb, var(--bg-card) 94%, #fee2e2 6%);
  border-color: color-mix(in srgb, #ef4444 20%, var(--border-soft) 80%);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.08);
}

:global(html.theme-light) .notificacao-label {
  color: #dc2626;
}

/* ── Cards de personagem (light mode) ── */
:global(html.theme-light) .login-character-fallback {
  background: color-mix(in srgb, var(--bg-soft) 100%, transparent 0%);
}

:global(html.theme-light) .login-character-fallback-text {
  color: color-mix(in srgb, var(--text-muted) 70%, transparent 30%);
}

:global(html.theme-light) .login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 95%, var(--bg-soft) 5%);
  border-top: 1px solid var(--border-soft);
}
</style>
