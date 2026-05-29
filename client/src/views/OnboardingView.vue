<template>
  <div class="onboarding-root min-h-screen overflow-x-hidden text-white">
    <!-- Ambient background -->
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0B1623] via-[#080D18] to-[#120A22]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(99_102_241/0.12),transparent)]" />

    <!-- Loading fullscreen -->
    <div v-if="carregando" class="flex min-h-screen items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p class="text-sm text-zinc-500">Carregando...</p>
      </div>
    </div>

    <!-- Confirmação -->
    <div v-else-if="confirmando" class="flex min-h-screen items-center justify-center px-4">
      <div class="max-w-lg w-full text-center space-y-6">
        <div class="mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-500/60 bg-black/30">
          <img
            v-if="racaSelecionada?.foto_url"
            :src="racaSelecionada.foto_url"
            :alt="racaSelecionada.nome"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full items-center justify-center text-3xl">⚔</div>
        </div>

        <div>
          <p class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400 mb-2">Você escolheu</p>
          <h2 class="text-3xl font-bold text-white mb-1">{{ racaSelecionada?.nome }}</h2>
          <p class="text-sm text-zinc-400">{{ racaSelecionada?.descricao }}</p>
        </div>

        <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300/80">
          ⚠ Esta escolha é <strong class="text-amber-300">permanente</strong>. Sua raça define quem você é no mundo — não poderá ser alterada depois.
        </div>

        <div class="flex gap-3 justify-center">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="confirmando = false"
          >
            Voltar
          </button>
          <button
            type="button"
            :disabled="salvando"
            class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            @click="confirmarEscolha"
          >
            {{ salvando ? 'Confirmando...' : 'Confirmar Raça' }}
          </button>
        </div>

        <p v-if="erroEscolha" class="text-sm text-red-400">{{ erroEscolha }}</p>
      </div>
    </div>

    <!-- Seleção de raça -->
    <div v-else class="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      <!-- Header do personagem -->
      <div class="mb-10 flex flex-col items-center gap-4 text-center">
        <div class="relative">
          <div
            class="h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 bg-black/40 ring-4 ring-indigo-500/20"
          >
            <img
              v-if="personagem?.avatarUrl"
              :src="personagem.avatarUrl"
              :alt="personagem.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center text-3xl text-zinc-600">
              {{ personagem?.name?.[0]?.toUpperCase() ?? '?' }}
            </div>
          </div>
          <div class="absolute -bottom-1 -right-1 rounded-full bg-indigo-500 p-1.5">
            <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </div>
        </div>

        <div>
          <p class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">Bem-vindo, aventureiro</p>
          <h1 class="mt-1 text-2xl font-bold text-white">{{ personagem?.name }}</h1>
          <p class="mt-1 text-sm text-zinc-500">Escolha a raça que define sua história</p>
        </div>

        <!-- Stepper -->
        <div class="mt-2 flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5">
            <div class="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[0.6rem] font-bold text-white">1</div>
            <span class="font-semibold text-indigo-300">Raça</span>
          </div>
          <div class="h-px w-6 bg-white/10" />
          <div class="flex items-center gap-1.5 opacity-40">
            <div class="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-[0.6rem] font-bold text-zinc-500">2</div>
            <span class="text-zinc-600">Passado</span>
          </div>
          <div class="h-px w-6 bg-white/10" />
          <div class="flex items-center gap-1.5 opacity-40">
            <div class="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-[0.6rem] font-bold text-zinc-500">3</div>
            <span class="text-zinc-600">Classe</span>
          </div>
          <div class="h-px w-6 bg-white/10" />
          <div class="flex items-center gap-1.5 opacity-40">
            <div class="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-[0.6rem] font-bold text-zinc-500">4</div>
            <span class="text-zinc-600">Atributos</span>
          </div>
        </div>
      </div>

      <!-- Grid de raças -->
      <div
        v-if="racas.length === 0"
        class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center"
      >
        <p class="text-zinc-500">Nenhuma raça cadastrada pelo mestre ainda.</p>
      </div>

      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="raca in racas"
          :key="raca.id"
          type="button"
          class="raca-card group relative overflow-hidden rounded-3xl border text-left transition-all duration-300"
          :class="racaHover === raca.id
            ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_40px_rgb(99_102_241/0.15)]'
            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'"
          @mouseenter="racaHover = raca.id"
          @mouseleave="racaHover = null"
          @click="selecionarRaca(raca)"
        >
          <!-- Image -->
          <div class="relative h-40 overflow-hidden">
            <img
              v-if="raca.foto_url"
              :src="raca.foto_url"
              :alt="raca.nome"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-violet-900/40 text-5xl"
            >
              ⚔
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <!-- Atributos bonus -->
            <div v-if="raca.atributos_bonus.length" class="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              <span
                v-for="ab in raca.atributos_bonus.slice(0, 3)"
                :key="ab.atributo"
                class="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-indigo-300"
              >
                +{{ ab.valor }} {{ ab.atributo }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5">
            <h3 class="mb-1.5 text-lg font-bold text-zinc-100 group-hover:text-white">{{ raca.nome }}</h3>

            <p v-if="raca.descricao" class="mb-4 line-clamp-3 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400">
              {{ raca.descricao }}
            </p>

            <!-- Habilidades -->
            <div v-if="raca.habilidades.length" class="space-y-1.5">
              <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-400/60">Habilidades</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="hab in raca.habilidades.slice(0, 4)"
                  :key="hab.nome"
                  class="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] text-zinc-400"
                >
                  {{ hab.nome }}
                </span>
                <span
                  v-if="raca.habilidades.length > 4"
                  class="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] text-zinc-600"
                >
                  +{{ raca.habilidades.length - 4 }} mais
                </span>
              </div>
            </div>

            <!-- Select CTA -->
            <div
              class="mt-4 flex items-center justify-between text-xs font-semibold transition-colors duration-200"
              :class="racaHover === raca.id ? 'text-indigo-300' : 'text-zinc-600'"
            >
              <span>Escolher esta raça</span>
              <svg class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listarRacasPublicas, type RacaApi } from '@/lib/api/racas.api'
import { escolherRaca, getCharacterById } from '@/lib/api/personagens.api'
import { obterMetaAuthLocal } from '@/stores/auth'
import type { PersonagemApi } from '@/types/supabase'

const router = useRouter()
const route = useRoute()

const racas = ref<RacaApi[]>([])
const personagem = ref<PersonagemApi | null>(null)
const carregando = ref(true)
const racaHover = ref<string | null>(null)
const confirmando = ref(false)
const racaSelecionada = ref<RacaApi | null>(null)
const salvando = ref(false)
const erroEscolha = ref('')

async function carregar() {
  carregando.value = true
  try {
    const meta = obterMetaAuthLocal()
    const characterId = String(route.query.characterId ?? meta?.idPersonagemAtivo ?? '')

    if (!characterId) {
      router.replace({ name: 'login' })
      return
    }

    const [racasData, personagemData] = await Promise.all([
      listarRacasPublicas(),
      getCharacterById(characterId, false),
    ])

    if ((personagemData as any).racaId != null) {
      router.replace({ name: 'dashboard', query: { characterId } })
      return
    }

    racas.value = racasData
    personagem.value = personagemData
  } catch {
    router.replace({ name: 'login' })
  } finally {
    carregando.value = false
  }
}

function selecionarRaca(raca: RacaApi) {
  racaSelecionada.value = raca
  confirmando.value = true
  erroEscolha.value = ''
}

async function confirmarEscolha() {
  if (!racaSelecionada.value || !personagem.value) return
  salvando.value = true
  erroEscolha.value = ''
  try {
    await escolherRaca((personagem.value as any).characterId, Number(racaSelecionada.value.id))
    const characterId = String((personagem.value as any).characterId)
    router.replace({ name: 'dashboard', query: { characterId } })
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao confirmar raça.'
    salvando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
.raca-card {
  cursor: pointer;
}

.raca-card:focus-visible {
  outline: 2px solid rgb(99 102 241 / 0.6);
  outline-offset: 2px;
}
</style>
