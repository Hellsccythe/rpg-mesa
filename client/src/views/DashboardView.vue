<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden">
    <!-- Fundo sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- HEADER MELHORADO -->
      <header
        class="h-16 border-b border-[#6B4E9E]/30 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between"
      >
        <!-- Botão Voltar -->
        <button
          @click="goBack"
          class="text-3xl text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
        >
          ‹ <span class="text-base font-medium">Voltar</span>
        </button>

        <!-- Título do RPG -->
        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold tracking-widest text-red-400">Caminho Sem Volta</span>
        </div>

        <!-- Abas de Navegação -->
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
            Títulos
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

        <!-- Ícones da direita -->
        <div class="flex items-center gap-6 text-2xl text-zinc-300">
          <button class="hover:text-[#C8D0E0] transition-colors">👤</button>
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
                Configurações
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

      <!-- Conteúdo principal (mantido igual) -->
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
          <!-- Card do Personagem -->
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
                  class="w-full h-full flex items-center justify-center bg-[#0F1C3A] text-8xl"
                >
                  🛡️
                </div>
              </div>

              <button
                class="mt-6 w-full py-5 bg-[#0F1C3A] hover:bg-[#2A1B4A] border border-[#6B4E9E]/50 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                🎒 <span class="font-medium">Inventário Rápido</span>
              </button>
            </div>
          </div>

          <!-- Centro -->
          <div class="lg:col-span-5 flex flex-col items-center justify-center gap-8">
            <div class="flex items-center gap-4">
              <div class="text-5xl font-bold tracking-wide text-[#C8D0E0]">
                {{ character.name }}
              </div>
              <button class="text-3xl text-[#6B4E9E] hover:text-white transition-colors">✏️</button>
            </div>

            <div class="flex gap-10 text-center">
              <div>
                <div class="text-sm text-zinc-400">Nível</div>
                <div class="text-6xl font-bold text-[#C8D0E0]">Lv {{ character.level }}</div>
              </div>
              <div>
                <div class="text-sm text-zinc-400">Índole</div>
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

          <!-- Notas da Campanha -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import { useAuthStore } from '@/stores/auth'
import type { PersonagemApi } from '@/types/supabase'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()

const loading = ref(true)
const error = ref<string>('')
const character = ref<PersonagemApi | null>(null)
const showSettingsMenu = ref(false)

const historyPreview = computed(() => {
  const txt = (character.value?.data?.history as string) || ''
  return txt.trim()
    ? txt.slice(0, 320) + (txt.length > 320 ? '...' : '')
    : 'Nenhuma anotação registrada ainda.'
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

const openSettings = () => {
  closeSettingsMenu()
  alert('Tela de configurações será implementada em breve!')
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
  alert('Modal de Gerenciamento será implementado em breve!')
}

onMounted(async () => {
  const characterId = String(route.query.characterId ?? '').trim()

  if (!characterId) {
    error.value = 'Personagem não informado. Faça login novamente.'
    loading.value = false
    return
  }

  try {
    character.value = await charactersStore.fetchCharacterById(characterId)
  } catch {
    error.value = 'Não foi possível carregar este personagem.'
  } finally {
    loading.value = false
  }
})

// TODO: Quando criar as outras páginas, só mudar os to="/deuses", to="/cidade", etc.
</script>
