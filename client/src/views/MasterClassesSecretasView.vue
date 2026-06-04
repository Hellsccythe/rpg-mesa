<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#150A0A] via-[#0A0F1C] to-[#160B27]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-red-400">🔒 Classes Secretas 🔒</span>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 space-y-5">
      <div v-if="erro" class="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">{{ erro }}</div>

      <!-- Carregando -->
      <div v-if="carregando" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>

      <!-- Vazio -->
      <div v-else-if="!classes.length" class="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
        <p class="text-sm font-semibold text-zinc-300">Nenhuma classe secreta cadastrada</p>
        <p class="mt-1 text-xs text-zinc-600">Crie classes em /master/classes e marque como "Classe Secreta".</p>
        <button type="button" class="mt-5 rounded-xl bg-red-800 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="router.push({ name: 'master-classes' })">
          Ir para Classes
        </button>
      </div>

      <!-- Lista de classes secretas -->
      <div v-else class="space-y-4">
        <article
          v-for="cls in classes"
          :key="cls.id"
          class="rounded-2xl border bg-white/[0.025] p-5"
          :class="cls.revelada ? 'border-amber-500/30' : 'border-white/[0.07]'"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <!-- Info da classe -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[0.6rem] font-bold uppercase tracking-widest text-red-400 border border-red-500/30 rounded-full px-2 py-0.5">Secreta</span>
                <span class="text-xs text-zinc-500">{{ cls.tier }}</span>
              </div>
              <h3 class="text-base font-bold text-white">{{ cls.name }}</h3>
              <p v-if="cls.description" class="text-xs text-zinc-500 mt-0.5 line-clamp-2">{{ cls.description }}</p>

              <!-- Titular atual -->
              <div v-if="cls.revelada && cls.titular" class="mt-3 flex items-center gap-2.5">
                <div class="h-8 w-8 overflow-hidden rounded-full border border-amber-500/30 bg-black/30">
                  <img v-if="cls.titular.avatar_url" :src="cls.titular.avatar_url" class="h-full w-full object-cover" />
                  <div v-else class="flex h-full items-center justify-center text-xs text-zinc-600">{{ cls.titular.name?.[0] }}</div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-amber-300">{{ cls.titular.name }}</p>
                  <p class="text-[0.65rem] text-zinc-500">
                    Revelada em {{ formatarData(cls.revealed_at) }}
                    <span v-if="cls.titular.status === 'morto'" class="ml-1 text-red-400 font-semibold">· Morto</span>
                  </p>
                </div>
              </div>
              <div v-else-if="!cls.revelada" class="mt-2 text-xs text-zinc-600 italic">Não revelada a nenhum personagem.</div>
            </div>

            <!-- Ações -->
            <div class="flex flex-col gap-2 shrink-0">
              <button
                v-if="cls.revelada"
                type="button"
                :disabled="salvando === cls.id"
                class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50 transition-colors"
                @click="revogar(cls)"
              >
                {{ salvando === cls.id ? '...' : 'Revogar' }}
              </button>
              <button
                type="button"
                :disabled="salvando === cls.id"
                class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-colors"
                @click="abrirModalRevelar(cls)"
              >
                {{ cls.revelada ? 'Reatribuir' : 'Revelar para Player' }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- Modal Revelar -->
    <Modal
      v-if="modalRevelarAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalRevelarAberto = false"
    >
      <template #header>
        <div>
          <h3 class="text-base font-bold text-white">Revelar Classe Secreta</h3>
          <p class="text-xs text-zinc-500 mt-0.5">{{ classeParaRevelar?.name }}</p>
        </div>
        <button type="button" @click="modalRevelarAberto = false" class="ml-auto text-zinc-500 hover:text-white">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-5 space-y-3">
        <p class="text-xs text-zinc-400">Selecione o personagem que receberá acesso a esta classe.</p>
        <div v-if="!personagens.length" class="text-xs italic text-zinc-600">Nenhum personagem ativo encontrado.</div>
        <div v-else class="max-h-60 overflow-y-auto space-y-1">
          <button
            v-for="p in personagens"
            :key="p.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
            :class="personagemSelecionado === p.id ? 'bg-amber-950/30 border border-amber-500/20' : 'border border-transparent'"
            @click="personagemSelecionado = p.id"
          >
            <div class="h-8 w-8 overflow-hidden rounded-full border border-white/10 bg-black/30 shrink-0">
              <img v-if="p.avatar_url" :src="p.avatar_url" class="h-full w-full object-cover" />
              <div v-else class="flex h-full items-center justify-center text-xs text-zinc-600">{{ p.name?.[0] }}</div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" :class="personagemSelecionado === p.id ? 'text-amber-200' : 'text-zinc-300'">{{ p.name }}</p>
              <p class="text-[0.65rem] text-zinc-600">@{{ p.username ?? '—' }}</p>
            </div>
            <span v-if="personagemSelecionado === p.id" class="text-amber-400 text-sm">✓</span>
          </button>
        </div>
        <div v-if="erroRevelar" class="rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">{{ erroRevelar }}</div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white" @click="modalRevelarAberto = false">Cancelar</button>
          <button
            type="button"
            :disabled="!personagemSelecionado || salvandoRevelar"
            class="rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
            @click="confirmarRevelar"
          >{{ salvandoRevelar ? 'Revelando...' : 'Confirmar' }}</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import {
  listarClassesSecretasAdmin, revelarClasseSecreta, revogarClasseSecreta,
  type ClasseSecretaAdmin,
} from '@/lib/api/classes.api'
import { api } from '@/plugins/axios'

const router = useRouter()

const carregando = ref(true)
const erro       = ref('')
const classes    = ref<ClasseSecretaAdmin[]>([])
const salvando   = ref<number | string | null>(null)

type PersonagemSimples = { id: number; name: string; username: string | null; avatar_url: string | null }
const personagens = ref<PersonagemSimples[]>([])

const modalRevelarAberto  = ref(false)
const classeParaRevelar   = ref<ClasseSecretaAdmin | null>(null)
const personagemSelecionado = ref<number | null>(null)
const salvandoRevelar     = ref(false)
const erroRevelar         = ref('')

function formatarData(dt: string | null): string {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [classesData, personagensData] = await Promise.all([
      listarClassesSecretasAdmin(),
      api.get<PersonagemSimples[]>('/personagens').then(r => r.data),
    ])
    classes.value    = classesData
    personagens.value = personagensData.filter((p: any) => p.status !== 'morto')
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao carregar.'
  } finally {
    carregando.value = false
  }
}

function abrirModalRevelar(cls: ClasseSecretaAdmin) {
  classeParaRevelar.value    = cls
  personagemSelecionado.value = null
  erroRevelar.value           = ''
  modalRevelarAberto.value    = true
}

async function confirmarRevelar() {
  if (!classeParaRevelar.value || !personagemSelecionado.value) return
  salvandoRevelar.value = true
  erroRevelar.value     = ''
  try {
    await revelarClasseSecreta(Number(classeParaRevelar.value.id), personagemSelecionado.value)
    modalRevelarAberto.value = false
    await carregar()
  } catch (err: any) {
    erroRevelar.value = err?.response?.data?.message ?? err.message ?? 'Erro ao revelar.'
  } finally {
    salvandoRevelar.value = false
  }
}

async function revogar(cls: ClasseSecretaAdmin) {
  if (!confirm(`Revogar acesso à classe "${cls.name}"?`)) return
  salvando.value = cls.id
  try {
    await revogarClasseSecreta(Number(cls.id))
    await carregar()
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao revogar.'
  } finally {
    salvando.value = null
  }
}

onMounted(carregar)
</script>
