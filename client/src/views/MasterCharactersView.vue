<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0A0F1C] text-white">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 flex min-h-screen flex-col">
      <header class="sticky top-0 z-20 h-16 border-b border-[#6B4E9E]/30 bg-black/55 backdrop-blur-md px-4 sm:px-6 flex items-center gap-3">
        <button
          @click="router.push({ name: 'master-panel' })"
          class="flex items-center gap-1.5 text-sm text-amber-300/80 hover:text-amber-300 transition-colors font-cinzel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Painel
        </button>
        <h1 class="flex-1 text-center text-lg font-bold tracking-widest text-amber-300 font-cinzel">
          Imagem do Modal de Login
        </h1>
        <div class="w-16" />
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <p class="mb-6 text-sm text-zinc-400">
          Ajuste como a imagem de cada personagem aparece no modal de login. Se não configurado, a posição é detectada automaticamente.
        </p>

        <div v-if="loading" class="text-zinc-500 text-sm animate-pulse">Carregando personagens...</div>

        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="char in characters"
            :key="char.characterId"
            class="rounded-2xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 overflow-hidden"
          >
            <!-- Nome -->
            <div class="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
              <p class="font-semibold text-amber-200 text-sm truncate">{{ char.name }}</p>
              <span
                v-if="posicoesPendentes[char.characterId]"
                class="text-xs text-amber-400 bg-amber-900/30 border border-amber-600/30 rounded-full px-2 py-0.5 flex-shrink-0"
              >não salvo</span>
            </div>

            <!-- Preview modal hero -->
            <div class="relative mx-4 h-48 overflow-hidden rounded-xl border border-[#6B4E9E]/30 bg-[#0A0F1C]">
              <img
                v-if="char.avatarUrl"
                :src="char.avatarUrl"
                class="h-full w-full object-cover"
                :style="{ objectPosition: posicoesPendentes[char.characterId] ?? char.modalHeroPosition ?? 'center 20%' }"
                :alt="char.name"
              />
              <div
                v-else
                class="h-full w-full flex items-center justify-center text-zinc-600 text-sm"
              >Sem avatar</div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
              <p class="absolute bottom-2 left-3 text-xs text-zinc-300 font-semibold">{{ char.name }}</p>
            </div>

            <!-- Controles X/Y -->
            <div class="px-4 pt-3 pb-4 space-y-3">
              <div class="space-y-1">
                <div class="flex justify-between text-xs text-zinc-400">
                  <span>Horizontal</span>
                  <span>{{ xSlider[char.characterId] ?? 50 }}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  :value="xSlider[char.characterId] ?? 50"
                  @input="onSliderChange(char.characterId, 'x', ($event.target as HTMLInputElement).valueAsNumber)"
                  class="pos-slider w-full"
                />
              </div>
              <div class="space-y-1">
                <div class="flex justify-between text-xs text-zinc-400">
                  <span>Vertical</span>
                  <span>{{ ySlider[char.characterId] ?? 20 }}%</span>
                </div>
                <input
                  type="range" min="0" max="100"
                  :value="ySlider[char.characterId] ?? 20"
                  @input="onSliderChange(char.characterId, 'y', ($event.target as HTMLInputElement).valueAsNumber)"
                  class="pos-slider w-full"
                />
              </div>

              <div class="flex gap-2 pt-1">
                <button
                  @click="centralizar(char.characterId)"
                  class="flex-1 rounded-xl border border-[#6B4E9E]/50 py-2 text-xs text-zinc-300 hover:bg-[#2A1B4A] transition-colors"
                >Centralizar</button>
                <button
                  @click="resetarAuto(char.characterId)"
                  class="flex-1 rounded-xl border border-zinc-700/50 py-2 text-xs text-zinc-500 hover:bg-zinc-900/30 transition-colors"
                >Auto (limpar)</button>
                <button
                  @click="salvar(char.characterId)"
                  :disabled="salvando[char.characterId]"
                  class="flex-1 rounded-xl bg-amber-700/80 hover:bg-amber-600/80 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >{{ salvando[char.characterId] ? '...' : 'Salvar' }}</button>
              </div>

              <p v-if="erros[char.characterId]" class="text-xs text-red-400 text-center">{{ erros[char.characterId] }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCharactersStore } from '@/stores/characters'
import { setModalHeroPosition } from '@/lib/api/personagens.api'
import type { PersonagemPublicoApi } from '@/types/supabase'

const router = useRouter()
const store = useCharactersStore()

const loading = ref(false)
const characters = ref<PersonagemPublicoApi[]>([])
const xSlider = reactive<Record<string, number>>({})
const ySlider = reactive<Record<string, number>>({})
const posicoesPendentes = reactive<Record<string, string>>({})
const salvando = reactive<Record<string, boolean>>({})
const erros = reactive<Record<string, string>>({})

function parsePosition(pos: string | null): { x: number; y: number } {
  if (!pos) return { x: 50, y: 20 }
  const parts = pos.trim().split(/\s+/)
  const x = parseInt(parts[0]) ?? 50
  const y = parseInt(parts[1]) ?? 20
  return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 20 : y }
}

function onSliderChange(id: string, axis: 'x' | 'y', value: number) {
  if (axis === 'x') xSlider[id] = value
  else ySlider[id] = value
  posicoesPendentes[id] = `${xSlider[id] ?? 50}% ${ySlider[id] ?? 20}%`
}

function centralizar(id: string) {
  xSlider[id] = 50
  ySlider[id] = 50
  posicoesPendentes[id] = '50% 50%'
}

function resetarAuto(id: string) {
  xSlider[id] = 50
  ySlider[id] = 20
  delete posicoesPendentes[id]
}

async function salvar(id: string) {
  salvando[id] = true
  erros[id] = ''
  try {
    const pos = posicoesPendentes[id] ?? ''
    await setModalHeroPosition(id, pos)
    const char = characters.value.find(c => c.characterId === id)
    if (char) char.modalHeroPosition = pos || null
    delete posicoesPendentes[id]
  } catch (e: any) {
    erros[id] = e?.message ?? 'Erro ao salvar'
  } finally {
    salvando[id] = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await store.fetchPaginaInicial()
    characters.value = store.publicCharacters
    for (const c of characters.value) {
      const { x, y } = parsePosition(c.modalHeroPosition)
      xSlider[c.characterId] = x
      ySlider[c.characterId] = y
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.font-cinzel { font-family: 'Cinzel', serif; }

.pos-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background: #2a1b4a;
  outline: none;
}
.pos-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c8a050;
  cursor: pointer;
}
.pos-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #c8a050;
  cursor: pointer;
  border: none;
}
</style>
