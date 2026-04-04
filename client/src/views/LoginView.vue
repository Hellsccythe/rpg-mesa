<template>
  <div class="min-h-screen overflow-hidden relative">
    <!-- Fundo dinâmico vindo do layout da API -->
    <div class="absolute inset-0 bg-cover bg-center" :style="backgroundStyle" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/65 to-black/95" />

    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <!-- Loading skeleton -->
      <div v-if="loading" class="text-zinc-500 text-lg animate-pulse">Carregando...</div>

      <template v-else>
        <!-- Título vindo da API -->
        <div class="text-center mb-16">
          <h1 class="text-6xl md:text-7xl font-bold text-red-400 tracking-wider drop-shadow-2xl">
            {{ layout?.titulo ?? 'Caminho Sem Volta' }}
          </h1>
          <p class="text-zinc-400 mt-4 text-xl">
            {{ layout?.subtitulo ?? 'Escolha seu destino ou crie um novo herói' }}
          </p>
        </div>

        <div
          v-if="sessionExpiredMessage"
          class="w-full max-w-4xl mb-10 rounded-3xl border border-[#6B4E9E]/40 bg-[#1A2438]/80 backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div class="h-1 w-full bg-gradient-to-r from-red-500 via-[#6B4E9E] to-[#C8D0E0]" />
          <div class="px-6 py-5 md:px-8 md:py-6">
            <p class="text-xs uppercase tracking-[0.35em] text-red-300/80 mb-2">Sessão expirada</p>
            <h2 class="text-2xl md:text-3xl font-bold text-[#C8D0E0]">Faça login novamente</h2>
            <p class="mt-3 text-zinc-300 leading-relaxed">
              Sua sessão ativa atingiu o limite de 24 horas. Escolha novamente o personagem e
              informe e-mail e senha para continuar.
            </p>
          </div>
        </div>

        <!-- Grid de personagens -->
        <div class="w-full max-w-6xl">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <!-- Cards dos Personagens -->
            <div
              v-for="char in characters"
              :key="char.characterId"
              @click="abrirLogin(char)"
              class="group relative bg-zinc-900 border border-red-900/50 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl aspect-[4/5] flex flex-col"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="char.avatarUrl"
                  :src="char.avatarUrl"
                  class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  :alt="char.name"
                />
                <div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center">
                  <span class="text-7xl text-zinc-700">🛡️</span>
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

            <!-- Card Criar Novo -->
            <div
              @click="showCreateModal = true"
              class="group relative bg-red-900/80 hover:bg-red-700 border border-red-500/50 hover:border-red-400 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl aspect-[4/5] flex flex-col items-center justify-center gap-4"
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

    <!-- Modal de seleção de personagem (login) -->
    <CharacterSelectModal
      v-if="selectedChar"
      :character="selectedChar"
      @close="selectedChar = null"
    />

    <!-- Modal de criação de personagem -->
    <CreateCharacterModal v-if="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import { useAuthStore } from '@/stores/auth'
import CreateCharacterModal from '@/components/CreateCharacterModal.vue'
import CharacterSelectModal from '@/components/CharacterSelectModal.vue'
import type { PersonagemPublicoApi } from '@/types/supabase'

const charactersStore = useCharactersStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const showCreateModal = ref(false)
const selectedChar = ref<PersonagemPublicoApi | null>(null)

const characters = computed(() => charactersStore.publicCharacters)
const layout = computed(() => charactersStore.layout)
const loading = computed(() => charactersStore.loading)
const sessionExpiredMessage = computed(() => route.query.reason === 'session-expired')

const backgroundStyle = computed(() => {
  const img = layout.value?.backgroundImage ?? '/login-bg.jpg'
  return { backgroundImage: `url('${img}')` }
})

onMounted(async () => {
  await charactersStore.fetchPaginaInicial()
})

function abrirLogin(char: PersonagemPublicoApi) {
  if (authStore.canReuseSessionForCharacter(char.characterId)) {
    router.push({ name: 'dashboard', query: { characterId: char.characterId } })
    return
  }

  selectedChar.value = char
}
</script>
