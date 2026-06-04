<template>
  <TemaDarkLight variante="contexto" class="min-h-screen overflow-x-hidden">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0B1623] via-[#080D18] to-[#120A22]" />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-black/40 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.back()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voltar
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">⚔ NPCs ⚔</span>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">

      <!-- Carregando -->
      <div v-if="carregando" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 6"
          :key="n"
          class="h-72 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
        />
      </div>

      <!-- Vazio -->
      <div
        v-else-if="!npcs.length"
        class="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-950/30 text-indigo-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <p class="text-sm font-semibold text-zinc-300">Nenhum NPC revelado</p>
        <p class="mt-1 text-xs text-zinc-600">O mestre ainda não revelou nenhum NPC para você.</p>
      </div>

      <!-- Grid de cards -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="npc in npcs"
          :key="npc.id"
          class="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
        >
          <!-- Imagem -->
          <div class="relative h-48 overflow-hidden">
            <img
              v-if="npc.foto_url"
              :src="npc.foto_url"
              :alt="npc.nome"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950/80 to-slate-900/80"
            >
              <svg class="h-14 w-14 text-indigo-800/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#080D18] via-[#080D18]/30 to-transparent" />

            <!-- Raça badge -->
            <div v-if="npc.raca_nome" class="absolute bottom-3 left-3">
              <span class="rounded-full border border-indigo-500/40 bg-indigo-950/70 px-2.5 py-0.5 text-[0.65rem] font-semibold text-indigo-300 backdrop-blur-sm">
                {{ npc.raca_nome }}
              </span>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="flex flex-1 flex-col gap-2 p-5">
            <h3 class="text-base font-bold text-white leading-tight">{{ npc.nome }}</h3>
            <p v-if="npc.descricao" class="text-xs leading-relaxed text-zinc-400">{{ npc.descricao }}</p>
            <p v-else class="text-xs italic text-zinc-600">Sem descrição.</p>
          </div>
        </article>
      </div>

    </main>
  </TemaDarkLight>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import { listarNpcsPlayer, type NpcApi } from '@/lib/api/npcs.api'
import { obterMetaAuthLocal } from '@/stores/auth'

const router = useRouter()
const route  = useRoute()

const npcs      = ref<NpcApi[]>([])
const carregando = ref(true)

async function carregar() {
  carregando.value = true
  try {
    const meta = obterMetaAuthLocal()
    const characterId = Number(route.query.characterId ?? meta?.idPersonagemAtivo ?? 0)
    if (!characterId) {
      router.replace({ name: 'login' })
      return
    }
    npcs.value = await listarNpcsPlayer(characterId)
  } catch {
    // silently — lista vazia na UI
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>
