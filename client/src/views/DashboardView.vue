<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden">
    <!-- Fundo com gradiente sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header
        class="h-16 border-b border-[#6B4E9E]/30 bg-black/40 backdrop-blur-md px-6 flex items-center justify-between"
      >
        <button @click="goBack" class="text-3xl text-zinc-300 hover:text-white transition-colors">
          ‹
        </button>

        <div class="flex items-center gap-10 text-lg font-medium">
          <span class="text-[#C8D0E0]">Caminho Sem Volta</span>
          <span class="text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >Inventário</span
          >
          <span class="text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >Notas de Campanha</span
          >
          <span class="text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >Cidade</span
          >
        </div>

        <div class="flex items-center gap-5 text-2xl">
          <button class="hover:text-[#C8D0E0] transition-colors">👤</button>
          <button class="hover:text-[#C8D0E0] transition-colors">⚙️</button>
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
          <!-- Card do Personagem (Esquerda) -->
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

              <!-- Inventário Rápido -->
              <button
                class="mt-6 w-full py-5 bg-[#0F1C3A] hover:bg-[#2A1B4A] border border-[#6B4E9E]/50 rounded-2xl flex items-center justify-center gap-3 transition-all"
              >
                🎒 <span class="font-medium">Inventário Rápido</span>
              </button>
            </div>
          </div>

          <!-- Centro - Nome, Level, Indole e Botão Principal -->
          <div class="lg:col-span-5 flex flex-col items-center justify-center gap-8">
            <!-- Nome -->
            <div class="flex items-center gap-4">
              <div class="text-5xl font-bold tracking-wide text-[#C8D0E0]">
                {{ character.name }}
              </div>
              <button class="text-3xl text-[#6B4E9E] hover:text-white transition-colors">✏️</button>
            </div>

            <!-- Level e Indole -->
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

            <!-- Botão Gerenciamento -->
            <button
              @click="openManagementModal"
              class="mt-4 w-full max-w-lg py-6 text-2xl font-semibold bg-gradient-to-r from-[#6B4E9E] to-[#4C2D7A] hover:brightness-110 rounded-3xl transition-all shadow-xl shadow-purple-950"
            >
              Gerenciamento de Personagem
            </button>
          </div>

          <!-- Notas da Campanha (Direita) -->
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import type { PersonagemApi } from '@/types/supabase'

const route = useRoute()
const router = useRouter()
const charactersStore = useCharactersStore()

const loading = ref(true)
const error = ref<string>('')
const character = ref<PersonagemApi | null>(null)

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

const openManagementModal = () => {
  // TODO: Abrir modal de gerenciamento completo
  alert('Modal de Gerenciamento de Personagem será implementado em breve!')
}

async function loadCharacter() {
  loading.value = true
  error.value = ''

  const characterId = route.query.characterId as string
  if (!characterId) {
    error.value = 'Personagem não encontrado.'
    loading.value = false
    return
  }

  await charactersStore.fetchCharacters()

  const found = charactersStore.myCharacters.find((c) => c.characterId === characterId)

  if (!found) {
    error.value = 'Personagem não encontrado ou sem permissão.'
    loading.value = false
    return
  }

  character.value = found
  loading.value = false
}

onMounted(loadCharacter)
</script>
