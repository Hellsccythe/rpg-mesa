<script setup lang="ts">
/**
 * O seletor de mundo do mestre. Montado uma vez em app.vue para toda rota
 * /master (como o TrocaDeSenhaObrigatoria), em vez de mexer no header das
 * 26 telas: uma pílula fixa no canto, "Mundo 2 — Elyra ▾", que abre a lista.
 *
 * Na primeira entrada sem mundo guardado: com uma campanha ativa só, entra
 * nela sem perguntar; com duas ou mais, o modal abre e não fecha sem escolha.
 * Trocar de mundo recarrega a página — toda tela do mestre carrega o que
 * mostra ao montar, e é mais seguro do que cada uma tentar refazer as
 * listas por conta própria.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { useMundoStore } from '@/stores/mundo'
import type { CampanhaApi } from '@/lib/api/campanhas.api'

const router = useRouter()
const mundoStore = useMundoStore()

const modalAberto = ref(false)
/** Verdadeiro quando não há mundo escolhido e há mais de um: o modal não fecha sem escolha. */
const escolhaObrigatoria = computed(() => !mundoStore.mundo && mundoStore.ativas.length > 1)

const campanhasOrdenadas = computed(() => [...mundoStore.campanhas].sort((a, b) => a.numero - b.numero))

onMounted(async () => {
  try {
    await mundoStore.carregarCampanhas(true)
  } catch {
    return
  }
  if (mundoStore.mundo) return
  if (mundoStore.ativas.length === 1) mundoStore.selecionar(mundoStore.ativas[0]!)
  else if (mundoStore.ativas.length > 1) modalAberto.value = true
})

function escolher(campanha: CampanhaApi) {
  const mudou = mundoStore.mundo?.id !== campanha.id
  mundoStore.selecionar(campanha)
  modalAberto.value = false
  if (mudou) window.location.reload()
}

function fechar() {
  if (!escolhaObrigatoria.value) modalAberto.value = false
}

function irParaCampanhas() {
  modalAberto.value = false
  router.push({ name: 'master-campanhas' })
}
</script>

<template>
  <button
    type="button"
    class="seletor-mundo fixed bottom-4 right-4 z-40 flex max-w-[70vw] items-center gap-2 rounded-full border border-amber-500/30 bg-[#0d1020]/95 px-3.5 py-2 text-xs font-semibold text-amber-200 shadow-lg shadow-black/50 backdrop-blur transition-colors hover:border-amber-400/60 hover:text-amber-100"
    :title="mundoStore.mundo ? 'Trocar de mundo' : 'Escolher o mundo'"
    @click="modalAberto = true"
  >
    <span aria-hidden="true">🌍</span>
    <span class="truncate">{{ mundoStore.mundo ? mundoStore.rotulo : (mundoStore.campanhas.length ? 'Escolher mundo' : 'Nenhum mundo') }}</span>
    <svg class="h-3 w-3 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
  </button>

  <Modal
    v-if="modalAberto"
    panel-class="max-w-sm"
    tema="escuro"
    :show-close-button="!escolhaObrigatoria"
    :close-on-backdrop="false"
    @close="fechar"
  >
    <template #header>
      <div class="w-full">
        <p class="text-base font-bold text-white">{{ escolhaObrigatoria ? 'Em qual mundo você vai mestrar?' : 'Trocar de mundo' }}</p>
        <p class="mt-0.5 text-xs text-zinc-500">Tudo que você abrir no painel é deste mundo: deuses, mapas, NPCs, livros.</p>
      </div>
    </template>

    <div class="space-y-2 p-6">
      <p v-if="mundoStore.carregando" class="animate-pulse text-xs text-zinc-500">Carregando mundos...</p>
      <p v-else-if="campanhasOrdenadas.length === 0" class="text-sm text-zinc-400">
        Nenhum mundo cadastrado ainda.
      </p>
      <button
        v-for="campanha in campanhasOrdenadas"
        :key="campanha.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors"
        :class="mundoStore.mundo?.id === campanha.id
          ? 'border-amber-500/60 bg-amber-900/25 text-amber-100'
          : 'border-white/[0.08] bg-black/10 text-zinc-300 hover:border-amber-600/40'"
        @click="escolher(campanha)"
      >
        <span class="shrink-0 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-amber-300">Mundo {{ campanha.numero }}</span>
        <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{ campanha.name }}</span>
        <span v-if="!campanha.is_active" class="shrink-0 text-[0.65rem] text-zinc-500">inativo</span>
        <span v-else-if="mundoStore.mundo?.id === campanha.id" class="shrink-0 text-[0.65rem] text-amber-400">atual</span>
      </button>
    </div>

    <template #footer>
      <div class="flex gap-3 p-6 pt-0">
        <button
          v-if="!escolhaObrigatoria"
          type="button"
          class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
          @click="fechar"
        >
          Fechar
        </button>
        <button
          type="button"
          class="flex-1 rounded-2xl border border-amber-500/30 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-900/20"
          @click="irParaCampanhas"
        >
          Gerenciar mundos
        </button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
/* No celular a pílula fica acima da barra do sistema, sem cobrir o canto inteiro. */
.seletor-mundo {
  bottom: max(1rem, env(safe-area-inset-bottom));
}
</style>
