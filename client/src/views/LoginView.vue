<template>
  <div class="min-h-screen bg-zinc-950 overflow-hidden relative">
    <!-- Fundo mais visível -->
    <div class="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/90"></div>

    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <!-- Título -->
      <div class="text-center mb-16">
        <h1 class="text-6xl md:text-7xl font-bold text-red-400 tracking-wider drop-shadow-2xl">
          Caminho Sem Volta
        </h1>
        <p class="text-zinc-400 mt-4 text-xl">Escolha seu destino ou crie um novo herói</p>
      </div>

      <!-- Grid -->
      <div class="w-full max-w-6xl">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <!-- Cards dos Personagens -->
          <div
            v-for="char in characters"
            :key="char.id"
            @click="selectCharacter(char)"
            class="group relative bg-zinc-900 border border-red-900/50 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl aspect-[4/5] flex flex-col"
          >
            <div class="flex-1 relative overflow-hidden">
              <img
                v-if="char.data?.avatar_url"
                :src="char.data.avatar_url"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt="avatar"
              />
              <div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span class="text-7xl text-zinc-700">🛡️</span>
              </div>
            </div>

            <!-- Info -->
            <div class="p-4 bg-zinc-950/90">
              <h3 class="font-semibold text-white text-lg line-clamp-1">{{ char.name }}</h3>
              <p class="text-red-400 text-sm mt-1">
                Nv. {{ char.level }} • {{ char.data?.classes?.[0]?.name || 'Sem Classe' }}
              </p>
            </div>
          </div>

          <!-- Botão Criar Novo (vermelho como na referência) -->
          <div
            @click="showCreateModal = true"
            class="group relative bg-red-900/80 hover:bg-red-700 border border-red-500/50 hover:border-red-400 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl aspect-[4/5] flex flex-col items-center justify-center"
          >
            <div
              class="w-24 h-24 rounded-2xl border-4 border-red-400/50 group-hover:border-red-300 flex items-center justify-center transition-all"
            >
              <span class="text-7xl text-red-300">+</span>
            </div>
            <p class="mt-8 text-red-300 font-medium text-2xl tracking-wide">Criar Novo</p>
            <p class="text-red-400/70 text-sm mt-1">Personagem</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <CreateCharacterModal v-if="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCharactersStore } from '@/stores/characters'
import CreateCharacterModal from '@/components/CreateCharacterModal.vue'
import { useRouter } from 'vue-router'

const charactersStore = useCharactersStore()
const router = useRouter()
const showCreateModal = ref(false)

const characters = ref<
  Array<{
    id: string
    user_id: string
    campaign_id: string | null
    name: string
    level: number
    data: any
    created_at: string
    updated_at: string
  }>
>([])

onMounted(async () => {
  await charactersStore.fetchCharacters()
  characters.value = charactersStore.myCharacters
})

const selectCharacter = (char: any) => {
  router.push({
    name: 'dashboard',
    query: { characterId: char.id },
  })
}
</script>
