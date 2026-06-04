<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-violet-400">⚔ Controle de Telas ⚔</span>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

      <!-- Legenda das telas -->
      <div class="mb-6 flex flex-wrap gap-2">
        <span
          v-for="tela in TELAS_DISPONIVEIS"
          :key="tela.id"
          class="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-medium text-zinc-500"
        >
          {{ tela.label }}
        </span>
      </div>
      <p class="mb-8 text-xs text-zinc-600">Clique em "Telas" para configurar o acesso de cada player.</p>

      <!-- Carregando -->
      <div v-if="carregando" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>

      <!-- Vazio -->
      <div
        v-else-if="!players.length"
        class="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] py-16 text-center"
      >
        <p class="text-sm font-semibold text-zinc-300">Nenhum player com personagem ativo</p>
        <p class="mt-1 text-xs text-zinc-600">Aprove solicitações de criação primeiro.</p>
      </div>

      <!-- Lista de players -->
      <div v-else class="space-y-3">
        <article
          v-for="u in players"
          :key="u.id"
          class="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all hover:border-white/[0.12]"
        >
          <!-- Avatar -->
          <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-black/30">
            <img
              v-if="u.personagem?.avatar_url"
              :src="u.personagem.avatar_url"
              :alt="u.personagem.name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center text-lg font-bold text-zinc-600">
              {{ u.personagem?.name?.[0]?.toUpperCase() ?? '?' }}
            </div>
          </div>

          <!-- Infos -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <p class="text-sm font-semibold text-white">{{ u.personagem?.name ?? u.username ?? u.real_email }}</p>
              <span v-if="u.username" class="text-xs text-zinc-600">@{{ u.username }}</span>
              <span v-if="!u.ativo" class="rounded-full bg-red-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-red-400">Inativo</span>
            </div>

            <!-- Telas habilitadas -->
            <div v-if="telasCache[u.personagem!.id] === undefined" class="text-xs text-zinc-600 italic">
              Clique em "Telas" para ver a configuração.
            </div>
            <div v-else-if="!telasCache[u.personagem!.id].length" class="text-xs text-zinc-600 italic">
              Nenhuma tela habilitada.
            </div>
            <div v-else class="flex flex-wrap gap-1.5">
              <span
                v-for="telaId in telasCache[u.personagem!.id]"
                :key="telaId"
                class="rounded-full border border-violet-500/30 bg-violet-950/30 px-2.5 py-0.5 text-[0.65rem] font-medium text-violet-300"
              >
                {{ labelTela(telaId) }}
              </span>
            </div>
          </div>

          <!-- Ação -->
          <button
            type="button"
            class="shrink-0 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
            @click="abrirModalTelas(u)"
          >
            Telas
          </button>
        </article>
      </div>
    </main>

    <!-- Modal Gerenciar Telas -->
    <Modal
      v-if="modalAberto"
      tema="escuro"
      panel-class="max-w-sm"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalAberto = false"
    >
      <template #header>
        <div>
          <h3 class="text-base font-bold text-white">Telas do Player</h3>
          <p class="text-xs text-zinc-500 mt-0.5">{{ usuarioAtual?.personagem?.name ?? usuarioAtual?.username }}</p>
        </div>
        <button type="button" @click="modalAberto = false" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-5">
        <div v-if="carregandoTelas" class="py-6 text-center text-xs text-zinc-500">Carregando...</div>
        <div v-else class="space-y-1">
          <label
            v-for="tela in TELAS_DISPONIVEIS"
            :key="tela.id"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            :class="telasForm.includes(tela.id) ? 'bg-violet-950/30' : ''"
          >
            <input
              type="checkbox"
              :value="tela.id"
              v-model="telasForm"
              class="h-4 w-4 rounded accent-violet-500"
            />
            <span class="text-sm" :class="telasForm.includes(tela.id) ? 'text-violet-200 font-medium' : 'text-zinc-300'">
              {{ tela.label }}
            </span>
          </label>
        </div>
        <div v-if="erroTelas" class="mt-3 rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">{{ erroTelas }}</div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center gap-3 px-5 py-4 border-t border-white/[0.06]">
          <div class="flex gap-2">
            <button type="button" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" @click="telasForm = TELAS_DISPONIVEIS.map(t => t.id) as any">Tudo</button>
            <span class="text-zinc-700">|</span>
            <button type="button" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors" @click="telasForm = []">Nada</button>
          </div>
          <div class="flex gap-3">
            <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white" @click="modalAberto = false">
              Cancelar
            </button>
            <button
              type="button"
              :disabled="salvandoTelas"
              class="rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600 disabled:opacity-50"
              @click="salvarTelas"
            >
              {{ salvandoTelas ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import { listarUsuarios, type Usuario } from '@/lib/api/usuarios.api'
import {
  listarTelasPlayer, definirTelasPlayer,
  TELAS_DISPONIVEIS, type TelaId,
} from '@/lib/api/player-telas.api'

const router = useRouter()

const carregando = ref(true)
const usuarios   = ref<Usuario[]>([])
const players    = computed(() => usuarios.value.filter(u => u.tipo === 'player' && u.ativo && u.personagem))

// Cache de telas por character_id
const telasCache = ref<Record<number, TelaId[]>>({})

function labelTela(id: string): string {
  return TELAS_DISPONIVEIS.find(t => t.id === id)?.label ?? id
}

async function carregar() {
  carregando.value = true
  try {
    usuarios.value = await listarUsuarios()
    // Pré-carregar telas de todos os players de uma vez
    await Promise.all(
      players.value.map(async u => {
        if (!u.personagem) return
        try {
          telasCache.value[u.personagem.id] = await listarTelasPlayer(u.personagem.id)
        } catch {
          telasCache.value[u.personagem.id] = []
        }
      })
    )
  } catch {
    // silently
  } finally {
    carregando.value = false
  }
}

// Modal
const modalAberto      = ref(false)
const usuarioAtual     = ref<Usuario | null>(null)
const telasForm        = ref<TelaId[]>([])
const carregandoTelas  = ref(false)
const salvandoTelas    = ref(false)
const erroTelas        = ref('')

async function abrirModalTelas(u: Usuario) {
  usuarioAtual.value = u
  erroTelas.value    = ''
  telasForm.value    = []
  modalAberto.value  = true
  carregandoTelas.value = true
  try {
    if (u.personagem) {
      telasForm.value = await listarTelasPlayer(u.personagem.id)
    }
  } catch {
    // inicia vazio
  } finally {
    carregandoTelas.value = false
  }
}

async function salvarTelas() {
  if (!usuarioAtual.value?.personagem) return
  salvandoTelas.value = true
  erroTelas.value     = ''
  try {
    const salvas = await definirTelasPlayer(usuarioAtual.value.personagem.id, telasForm.value)
    telasCache.value[usuarioAtual.value.personagem.id] = salvas
    modalAberto.value = false
  } catch (err: any) {
    erroTelas.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvandoTelas.value = false
  }
}

onMounted(carregar)
</script>
