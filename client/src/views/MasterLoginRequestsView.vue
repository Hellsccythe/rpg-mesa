<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <header class="page-header sticky top-0 z-20 border-b backdrop-blur-xl">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <div class="flex-none">
            <HamburgerDrawerMenu
              :items="menuItems"
              active-item-id="logins"
              aria-label="Menu do painel"
              @select="handleMenu"
            />
          </div>
          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">⚔ Gerenciar Logins ⚔</span>
          </div>
          <div class="flex flex-none items-center gap-2">
            <button
              type="button"
              class="notification-bell"
              :aria-label="`${pendingCount} solicitações pendentes`"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"/>
                <path d="M9 17a3 3 0 0 0 6 0"/>
              </svg>
              <span v-if="pendingCount > 0" class="notification-badge">{{ pendingCount }}</span>
            </button>
            <button
              @click="router.push({ name: 'master-panel' })"
              class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.08]"
            >
              Painel
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6">

        <!-- Solicitações pendentes -->
        <section class="gm-card border-amber-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-7m0 0V5m0 10l-3 3m3-3l3 3"/><circle cx="12" cy="5" r="2"/></svg>
            </div>
            <div>
              <h2 class="gm-title">Solicitações de Criação de Personagem</h2>
              <p class="gm-subtitle">Pendentes de aprovação</p>
            </div>
            <button
              @click="carregarSolicitacoes"
              :disabled="carregando"
              class="ml-auto rounded-xl border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:border-white/20 disabled:opacity-50"
            >
              {{ carregando ? 'Carregando...' : 'Atualizar' }}
            </button>
          </div>

          <div v-if="erro" class="mx-4 mb-4 rounded-xl bg-red-900/30 border border-red-500/30 p-3 text-sm text-red-300">
            {{ erro }}
          </div>

          <div v-if="carregando" class="px-4 py-8 text-center text-sm text-zinc-500 animate-pulse">
            Carregando solicitações...
          </div>

          <div v-else-if="!solicitacoes.length" class="px-4 py-8 text-center text-sm text-zinc-500">
            Nenhuma solicitação pendente no momento.
          </div>

          <div v-else class="space-y-6 p-4">
            <article
              v-for="req in solicitacoes"
              :key="req.id"
              class="rounded-2xl border p-5 space-y-4"
              :class="req.status === 'pendente' ? 'border-amber-500/25 bg-amber-950/10' : req.status === 'aprovado' ? 'border-emerald-500/25 bg-emerald-950/10' : 'border-red-500/25 bg-red-950/10'"
            >
              <!-- Cabeçalho do card -->
              <div class="flex items-start gap-4">
                <div class="h-20 w-20 flex-none overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                  <img
                    v-if="req.avatar_url"
                    :src="req.avatar_url"
                    :alt="req.nome"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center text-2xl text-zinc-600">?</div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-lg font-bold text-white">{{ req.nome }}</h3>
                    <span class="text-sm text-zinc-400">(@{{ req.username }})</span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="{
                        'bg-amber-500/20 text-amber-300': req.status === 'pendente',
                        'bg-emerald-500/20 text-emerald-300': req.status === 'aprovado',
                        'bg-red-500/20 text-red-300': req.status === 'rejeitado',
                      }"
                    >
                      {{ req.status }}
                    </span>
                  </div>
                  <p class="text-sm text-zinc-400 mt-0.5">{{ req.email }}</p>
                  <div class="mt-1 flex flex-wrap gap-2 text-xs">
                    <span v-if="req.indole" class="rounded-full border border-[#6B4E9E]/50 px-2 py-0.5 text-zinc-300">
                      {{ req.indole.descricao ?? req.indole.codigo }}
                    </span>
                    <span v-if="req.genero" class="rounded-full border border-zinc-600/50 px-2 py-0.5 text-zinc-300">
                      {{ req.genero.descricao }}
                    </span>
                    <span class="text-zinc-500">{{ formatarData(req.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Aparência física -->
              <div v-if="req.aparencia_fisica" class="rounded-xl bg-white/[0.03] p-3">
                <p class="mb-1 text-xs uppercase tracking-wider text-zinc-500">Aparencia Fisica</p>
                <p class="text-sm leading-relaxed text-zinc-300">{{ req.aparencia_fisica }}</p>
              </div>

              <!-- História -->
              <div v-if="req.historia_texto || req.historia_doc_url" class="rounded-xl bg-white/[0.03] p-3">
                <p class="mb-1 text-xs uppercase tracking-wider text-zinc-500">Historia</p>
                <p v-if="req.historia_texto" class="text-sm leading-relaxed text-zinc-300 line-clamp-6">
                  {{ req.historia_texto }}
                </p>
                <a
                  v-if="req.historia_doc_url"
                  :href="req.historia_doc_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1 inline-flex items-center gap-1 text-xs text-[#A78BFA] hover:underline"
                >
                  Ver documento anexado
                </a>
              </div>

              <!-- Motivo de rejeição -->
              <div v-if="req.status === 'rejeitado' && req.rejeitado_motivo" class="rounded-xl bg-red-950/20 border border-red-500/20 p-3">
                <p class="mb-1 text-xs uppercase tracking-wider text-red-400">Motivo da Rejeição</p>
                <p class="text-sm text-red-300">{{ req.rejeitado_motivo }}</p>
              </div>

              <!-- Ações (só para pendentes) -->
              <div v-if="req.status === 'pendente'" class="flex flex-wrap items-center gap-3 pt-1">
                <button
                  @click="aprovar(req.id)"
                  :disabled="processando[req.id]"
                  class="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-wait"
                >
                  {{ processando[req.id] === 'aprovar' ? 'Aprovando...' : 'Aprovar' }}
                </button>
                <button
                  @click="abrirRejeicao(req.id)"
                  :disabled="!!processando[req.id]"
                  class="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition-all hover:border-red-500/70 disabled:opacity-50"
                >
                  Rejeitar
                </button>
                <span v-if="erroAcao[req.id]" class="text-xs text-red-400">{{ erroAcao[req.id] }}</span>
                <span v-if="sucessoAcao[req.id]" class="text-xs text-emerald-400">{{ sucessoAcao[req.id] }}</span>
              </div>
            </article>
          </div>
        </section>

      </main>
    </TemaDarkLight>

    <!-- Modal de rejeição -->
    <Modal
      v-if="modalRejeicaoId !== null"
      panel-class="max-w-md"
      body-class="space-y-4 p-6"
      :show-close-button="false"
      @close="fecharRejeicao"
    >
      <h3 class="text-lg font-bold text-white">Rejeitar Solicitação</h3>
      <p class="text-sm text-zinc-400">Informe o motivo da rejeição (será exibido ao jogador):</p>
      <textarea
        v-model="motivoRejeicao"
        rows="4"
        class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-white/20"
        placeholder="Ex: Avatar inadequado, historia muito curta, username inapropriado..."
      />
      <div class="flex gap-3">
        <button
          @click="fecharRejeicao"
          class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-300 hover:border-white/20"
        >
          Cancelar
        </button>
        <button
          @click="confirmarRejeicao"
          :disabled="processando[modalRejeicaoId!] === 'rejeitar'"
          class="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {{ processando[modalRejeicaoId!] === 'rejeitar' ? 'Rejeitando...' : 'Confirmar Rejeição' }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import {
  listarSolicitacoesPendentes,
  aprovarSolicitacao,
  rejeitarSolicitacao,
  contarSolicitacoesPendentes,
} from '@/lib/api/character-creation-requests.api'
import type { CharacterCreationRequestApi } from '@/types/supabase'

const router = useRouter()

const carregando = ref(false)
const erro = ref('')
const solicitacoes = ref<CharacterCreationRequestApi[]>([])
const processando = reactive<Record<number, string>>({})
const erroAcao = reactive<Record<number, string>>({})
const sucessoAcao = reactive<Record<number, string>>({})
const pendingCount = ref(0)
const modalRejeicaoId = ref<number | null>(null)
const motivoRejeicao = ref('')

const menuItems = [
  { id: 'panel', label: 'Painel Geral' },
  { id: 'logins', label: 'Gerenciar Logins' },
  { id: 'personagens', label: 'Personagens' },
]

function handleMenu(id: string) {
  if (id === 'panel') router.push({ name: 'master-panel' })
  if (id === 'personagens') router.push({ name: 'master-characters' })
}

function formatarData(iso: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function carregarSolicitacoes() {
  carregando.value = true
  erro.value = ''
  try {
    const [lista, count] = await Promise.all([
      listarSolicitacoesPendentes(),
      contarSolicitacoesPendentes(),
    ])
    solicitacoes.value = lista
    pendingCount.value = count
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err?.message ?? 'Erro ao carregar solicitações.'
  } finally {
    carregando.value = false
  }
}

async function aprovar(id: number) {
  processando[id] = 'aprovar'
  delete erroAcao[id]
  delete sucessoAcao[id]
  try {
    await aprovarSolicitacao(id)
    const req = solicitacoes.value.find((r) => r.id === id)
    if (req) req.status = 'aprovado'
    sucessoAcao[id] = 'Personagem criado com sucesso!'
    pendingCount.value = Math.max(0, pendingCount.value - 1)
  } catch (err: any) {
    erroAcao[id] = err?.response?.data?.message ?? 'Erro ao aprovar.'
  } finally {
    delete processando[id]
  }
}

function abrirRejeicao(id: number) {
  modalRejeicaoId.value = id
  motivoRejeicao.value = ''
}

function fecharRejeicao() {
  modalRejeicaoId.value = null
  motivoRejeicao.value = ''
}

async function confirmarRejeicao() {
  const id = modalRejeicaoId.value
  if (id === null) return
  processando[id] = 'rejeitar'
  try {
    await rejeitarSolicitacao(id, motivoRejeicao.value)
    const req = solicitacoes.value.find((r) => r.id === id)
    if (req) {
      req.status = 'rejeitado'
      req.rejeitado_motivo = motivoRejeicao.value
    }
    pendingCount.value = Math.max(0, pendingCount.value - 1)
    fecharRejeicao()
  } catch (err: any) {
    erroAcao[id] = err?.response?.data?.message ?? 'Erro ao rejeitar.'
  } finally {
    delete processando[id]
  }
}

onMounted(carregarSolicitacoes)
</script>

<style scoped>
.page-root {
  background: var(--bg-page, #0a0f1c);
  color: var(--text-main, #f4f4f5);
}

.page-header {
  background: color-mix(in srgb, #0b1426 94%, transparent 6%);
  border-color: rgba(255, 255, 255, 0.07);
}

.gm-card {
  border-radius: 1.5rem;
  border-width: 1px;
  background: rgba(255, 255, 255, 0.025);
  overflow: hidden;
}

.gm-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.gm-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.gm-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #e4e4e7;
}

.gm-subtitle {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.125rem;
}

.notification-bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #a1a1aa;
  transition: all 0.15s ease;
}

.notification-bell:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #e4e4e7;
}

.notification-badge {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  min-width: 1.1rem;
  height: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #f59e0b;
  color: #000;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0 0.2rem;
}
</style>
