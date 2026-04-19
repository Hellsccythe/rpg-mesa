<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0A0F1C] text-white">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <TemaDarkLight variante="contexto" class="relative z-10 flex min-h-screen flex-col">
      <header
        class="sticky top-0 z-20 h-16 border-b border-[#6B4E9E]/30 bg-black/55 px-4 backdrop-blur-md sm:px-6"
      >
        <div class="absolute left-4 top-1/2 -translate-y-1/2 sm:left-6">
          <HamburgerDrawerMenu
            :items="panelMenuItems"
            active-item-id="pendencias"
            aria-label="Abrir menu do painel"
            @select="handlePanelMenuSelect"
          />
        </div>

        <div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3">
          <div class="w-10" />

          <div class="flex-1 text-center text-xl font-bold tracking-widest text-amber-300">
            Game Master
          </div>

          <div class="flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              class="notification-bell"
              :title="`${pendingCount} pendencia(s)`"
              @click="goSection('pendencias')"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                />
                <path d="M9 17a3 3 0 0 0 6 0" />
              </svg>
              <span v-if="pendingCount > 0" class="notification-badge">
                {{ pendingCount }}
              </span>
            </button>

            <button
              @click="goLogin"
              class="flex items-center gap-2 rounded-xl border border-[#6B4E9E]/45 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-[#2A1B4A] sm:px-4 sm:text-sm"
            >
              <span class="font-medium">Sair do Painel</span>
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
        <section
          id="pendencias"
          class="panel-highlight rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6"
        >
          <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="title-main font-bold text-amber-300">Pendencias de Aprovacao</h1>
              <p class="mt-1 text-black">Solicitacoes de jogadores para nome, avatar e historia.</p>
            </div>
            <button
              @click="loadAll"
              :disabled="loading"
              class="rounded-xl border border-[#6B4E9E]/50 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-[#2A1B4A] disabled:opacity-60"
            >
              {{ loading ? 'Atualizando...' : 'Atualizar' }}
            </button>
          </div>

          <div
            v-if="pendingApprovals.length === 0"
            class="rounded-2xl border border-zinc-700/50 p-4 text-black"
          >
            Nenhuma pendencia no momento.
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="request in pendingApprovals"
              :key="request.characterId"
              class="rounded-2xl border border-[#6B4E9E]/35 bg-[#0F1C3A]/70 p-4"
            >
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold text-white">
                    {{ request.currentName }} abriu uma requisicao
                  </p>
                  <p class="text-xs text-black">
                    Solicitado por: {{ request.requestedByEmail || 'desconhecido' }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="review(request.characterId, true)"
                    class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    Aprovar
                  </button>
                  <button
                    @click="review(request.characterId, false)"
                    class="rounded-xl bg-red-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="rounded-xl border border-zinc-700/50 p-3 text-sm">
                  <p class="text-xs uppercase tracking-wide text-zinc-500">Nome atual</p>
                  <p class="mt-1 text-zinc-200">{{ request.currentName }}</p>
                </div>
                <div class="rounded-xl border border-zinc-700/50 p-3 text-sm">
                  <p class="text-xs uppercase tracking-wide text-zinc-500">Nome solicitado</p>
                  <p class="mt-1 text-zinc-200">{{ request.requestedName || 'Sem alteracao' }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section
          class="panel-highlight rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="title-section font-semibold text-amber-300">Deuses em Guia Separada</h2>
              <p class="mt-1 text-black">
                A criacao e edicao completa de deuses foi movida para a guia dedicada com cards e
                modal.
              </p>
            </div>
            <button
              @click="goMasterGods"
              class="rounded-xl border border-amber-500/50 px-4 py-2 text-sm text-amber-100 transition-colors hover:bg-amber-900/25"
            >
              Abrir Guia de Deuses
            </button>
          </div>
        </section>

        <section
          class="panel-highlight rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="title-section font-semibold text-amber-300">Mapas em Guia Separada</h2>
              <p class="mt-1 text-black">
                A criacao e edicao de mapas com pontos de interesse foi movida para a guia dedicada.
              </p>
            </div>
            <button
              @click="goMasterMaps"
              class="rounded-xl border border-amber-500/50 px-4 py-2 text-sm text-amber-100 transition-colors hover:bg-amber-900/25"
            >
              Abrir Guia de Mapas
            </button>
          </div>
        </section>

        <section
          class="panel-highlight rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6"
        >
          <div id="emails-cadastro" class="mb-5">
            <h2 class="title-section mb-2 font-semibold text-amber-300">
              Cadastro de Emails Liberados
            </h2>
            <p class="text-black">
              Adicione aqui os emails autorizados a criar personagem. Senha e cadastro ficam por
              conta do player.
            </p>

            <div class="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                v-model="novoEmailLiberado"
                type="email"
                placeholder="email-do-player@dominio.com"
                class="tdl-campo"
              />
              <button
                @click="adicionarEmailLiberado"
                :disabled="loadingEmailsLiberados || !novoEmailLiberado.trim()"
                class="tdl-botao-primario disabled:cursor-wait disabled:opacity-60"
              >
                {{ loadingEmailsLiberados ? 'Salvando...' : 'Liberar Email' }}
              </button>
            </div>

            <div class="mt-3 space-y-2">
              <div
                v-if="!emailsLiberadosCriacao.length"
                class="rounded-xl border border-zinc-700/50 p-3 text-sm text-black"
              >
                Nenhum email liberado no momento.
              </div>

              <div
                v-for="email in emailsLiberadosCriacao"
                :key="email"
                class="flex items-center justify-between gap-2 rounded-xl border border-zinc-700/50 p-3 text-sm"
              >
                <span class="text-zinc-200">{{ email }}</span>
                <button
                  @click="removerEmailLiberado(email)"
                  :disabled="loadingEmailsLiberados"
                  class="rounded-lg border border-red-500/60 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-900/30 disabled:cursor-wait disabled:opacity-60"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <h2 class="title-section mb-4 font-semibold text-amber-300">
            Ferramentas Rapidas de Personagem
          </h2>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <select v-model="selectedCharacterId" class="tdl-campo">
              <option value="">Selecione um personagem</option>
              <option v-for="char in characters" :key="char.characterId" :value="char.characterId">
                {{ char.name }}
              </option>
            </select>
            <input v-model="skillName" type="text" placeholder="Nova skill" class="tdl-campo" />
            <input v-model="titleName" type="text" placeholder="Novo titulo" class="tdl-campo" />
            <input v-model="className" type="text" placeholder="Nova classe" class="tdl-campo" />
            <textarea
              v-model="classDescription"
              rows="3"
              placeholder="Descricao da classe"
              class="tdl-campo"
            />
            <textarea
              v-model="adventureNote"
              rows="3"
              placeholder="Nota de aventura para personagem selecionado"
              class="tdl-campo"
            />
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button @click="addSkill" class="tdl-botao-primario">Adicionar Skill</button>
            <button @click="addTitleToCharacter" class="tdl-botao-primario">Adicionar Titulo</button>
            <button @click="saveClass" class="tdl-botao-primario">Salvar Classe</button>
            <button @click="addAdventureNote" class="tdl-botao-primario">Adicionar Nota</button>
          </div>
        </section>

        <section
          id="deletar-personagem"
          class="panel-highlight rounded-3xl border border-red-900/40 bg-[#111A2D]/80 p-5 sm:p-6"
        >
          <div class="mb-4">
            <h2 class="title-section font-semibold text-red-400">Deletar Personagem</h2>
            <p class="mt-1 text-sm text-zinc-400">
              Remove o registro do banco (soft delete) e apaga a imagem do storage permanentemente.
            </p>
          </div>

          <div class="space-y-3">
            <select v-model="deleteCharacterId" class="tdl-campo">
              <option value="">Selecione o personagem a deletar</option>
              <option v-for="char in characters" :key="char.characterId" :value="char.characterId">
                {{ char.name }}
              </option>
            </select>

            <template v-if="deleteCharacterId">
              <p class="text-sm text-zinc-300">
                Digite
                <span class="font-bold text-red-300">{{ deleteCharacterName }}</span>
                para confirmar:
              </p>
              <input
                v-model="deleteConfirmName"
                type="text"
                :placeholder="deleteCharacterName"
                class="tdl-campo border-red-800/60 focus:border-red-500"
              />
              <button
                @click="deletarPersonagem"
                :disabled="
                  loadingDelete ||
                  deleteConfirmName.trim().toLowerCase() !== deleteCharacterName.toLowerCase()
                "
                class="rounded-xl bg-red-800 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ loadingDelete ? 'Deletando...' : 'Deletar Permanentemente' }}
              </button>
            </template>
          </div>
        </section>

        <p
          v-if="feedback"
          class="text-sm"
          :class="feedbackError ? 'text-red-300' : 'text-emerald-300'"
        >
          {{ feedback }}
        </p>
      </main>
    </TemaDarkLight>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import { useMasterCatalogStore } from '@/stores/masterCatalog'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import {
  addCharacterCreationAllowedEmail,
  deleteCharacterAsMaster,
  listCharacterCreationAllowedEmails,
  removeCharacterCreationAllowedEmail,
} from '@/lib/api/personagens.api'

const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const masterApprovalsStore = useMasterApprovalsStore()
const masterCatalogStore = useMasterCatalogStore()

const loading = ref(false)
const feedback = ref('')
const feedbackError = ref(false)

const selectedCharacterId = ref('')
const skillName = ref('')
const titleName = ref('')
const className = ref('')
const classTier = ref('Base')
const classDescription = ref('')
const titleTier = ref('Comum')
const titleDescription = ref('')
const adventureNote = ref('')
const emailsLiberadosCriacao = ref<string[]>([])
const novoEmailLiberado = ref('')
const loadingEmailsLiberados = ref(false)

const deleteCharacterId = ref('')
const deleteConfirmName = ref('')
const loadingDelete = ref(false)
const deleteCharacterName = computed(
  () => characters.value.find((c) => c.characterId === deleteCharacterId.value)?.name ?? '',
)

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)
const pendingCount = computed(() => pendingApprovals.value.length)
const characters = computed(() => charactersStore.publicCharacters)
const panelMenuItems = [
  { id: 'pendencias', label: 'Pendencias' },
  { id: 'emails-cadastro', label: 'Cadastro Email' },
  { id: 'guia-deuses', label: 'Guia Deuses' },
  { id: 'mapas', label: 'Mapas' },
  { id: 'deletar-personagem', label: 'Deletar Personagem', danger: true },
  { id: 'logout', label: 'Logout', danger: true },
]

async function handlePanelMenuSelect(itemId: string) {
  if (itemId === 'pendencias') {
    goSection('pendencias')
    return
  }

  if (itemId === 'guia-deuses') {
    goMasterGods()
    return
  }

  if (itemId === 'emails-cadastro') {
    goSection('emails-cadastro')
    return
  }

  if (itemId === 'mapas') {
    goMasterMaps()
    return
  }

  if (itemId === 'deletar-personagem') {
    goSection('deletar-personagem')
    return
  }

  if (itemId === 'logout') {
    await logout()
  }
}

function goSection(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadAll() {
  loading.value = true
  feedback.value = ''
  try {
    await Promise.all([
      masterApprovalsStore.fetchPendingApprovals(),
      charactersStore.fetchPaginaInicial(),
      carregarEmailsLiberados(),
    ])
  } catch {
    feedback.value = 'Nao foi possivel carregar os dados do painel mestre.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function carregarEmailsLiberados() {
  const data = await listCharacterCreationAllowedEmails()
  emailsLiberadosCriacao.value = [...(data.emails ?? [])].sort((a, b) => a.localeCompare(b))
}

async function adicionarEmailLiberado() {
  const email = novoEmailLiberado.value.trim().toLowerCase()
  if (!email) return

  loadingEmailsLiberados.value = true
  try {
    await addCharacterCreationAllowedEmail(email)
    novoEmailLiberado.value = ''
    await carregarEmailsLiberados()
    feedback.value = 'Email liberado para criacao de personagem.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao liberar email.'
    feedbackError.value = true
  } finally {
    loadingEmailsLiberados.value = false
  }
}

async function removerEmailLiberado(email: string) {
  loadingEmailsLiberados.value = true
  try {
    await removeCharacterCreationAllowedEmail(email)
    await carregarEmailsLiberados()
    feedback.value = 'Email removido da lista de liberacao.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao remover email.'
    feedbackError.value = true
  } finally {
    loadingEmailsLiberados.value = false
  }
}

async function review(characterId: string, approve: boolean) {
  loading.value = true
  feedback.value = ''
  try {
    await masterApprovalsStore.reviewPendingApproval(characterId, approve)
    feedback.value = approve ? 'Solicitacao aprovada.' : 'Solicitacao rejeitada.'
    feedbackError.value = false
  } catch {
    feedback.value = 'Erro ao revisar solicitacao.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function addSkill() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar skill.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addSkillToCharacter(selectedCharacterId.value, skillName.value)
    feedback.value = 'Skill adicionada ao personagem.'
    feedbackError.value = false
    skillName.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar skill.'
    feedbackError.value = true
  }
}

async function addTitleToCharacter() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar titulo.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addTitleToCharacter(selectedCharacterId.value, titleName.value)
    feedback.value = 'Titulo adicionado ao personagem.'
    feedbackError.value = false
    titleName.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar titulo.'
    feedbackError.value = true
  }
}

async function saveClass() {
  try {
    await masterCatalogStore.createClass({
      name: className.value,
      tier: classTier.value,
      description: classDescription.value,
    })

    if (titleName.value.trim()) {
      await masterCatalogStore.createTitle({
        name: titleName.value,
        tier: titleTier.value,
        description: titleDescription.value,
      })
    }

    feedback.value = 'Classe/titulo salvos com sucesso.'
    feedbackError.value = false
    className.value = ''
    classDescription.value = ''
    titleDescription.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar classe/titulo.'
    feedbackError.value = true
  }
}

async function addAdventureNote() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar nota.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addAdventureNoteToCharacter(
      selectedCharacterId.value,
      adventureNote.value,
    )
    feedback.value = 'Nota de aventura adicionada ao personagem.'
    feedbackError.value = false
    adventureNote.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar nota.'
    feedbackError.value = true
  }
}

async function deletarPersonagem() {
  if (!deleteCharacterId.value) {
    feedback.value = 'Selecione um personagem para deletar.'
    feedbackError.value = true
    return
  }

  if (deleteConfirmName.value.trim().toLowerCase() !== deleteCharacterName.value.toLowerCase()) {
    feedback.value = 'Nome de confirmacao nao confere. Digite exatamente o nome do personagem.'
    feedbackError.value = true
    return
  }

  loadingDelete.value = true
  feedback.value = ''
  try {
    await deleteCharacterAsMaster(deleteCharacterId.value)
    feedback.value = `Personagem "${deleteCharacterName.value}" deletado. Imagem removida do storage.`
    feedbackError.value = false
    deleteCharacterId.value = ''
    deleteConfirmName.value = ''
    await charactersStore.fetchPaginaInicial()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao deletar personagem.'
    feedbackError.value = true
  } finally {
    loadingDelete.value = false
  }
}

function goLogin() {
  router.push({ name: 'login', query: { force: '1' } })
}

function goMasterGods() {
  router.push({ name: 'master-gods' })
}

function goMasterMaps() {
  router.push({ name: 'master-maps' })
}

async function logout() {
  await authStore.sair()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await loadAll()
})
</script>

<style scoped>
.title-main {
  font-size: clamp(2rem, 2.2vw, 2.35rem);
  line-height: 1.1;
}

.title-section {
  font-size: clamp(1.7rem, 1.8vw, 2rem);
  line-height: 1.15;
}

.panel-highlight {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-soft) !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 28px rgb(15 23 42 / 0.12);
}

.notification-bell {
  position: relative;
  display: inline-flex;
  height: 2.6rem;
  width: 2.6rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.95rem;
  border: 1px solid rgb(148 163 184 / 0.35);
  background: var(--bg-soft);
  color: var(--brand-primary);
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.08);
}

.notification-bell:hover {
  background: color-mix(in srgb, var(--accent-soft) 70%, var(--bg-card) 30%);
}

:global(html.theme-light) .notification-bell {
  border-color: var(--border-soft);
  background: var(--bg-soft);
  color: var(--brand-primary);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.06);
}

:global(html.theme-light) .notification-bell:hover {
  background: var(--accent-soft);
}

.notification-badge {
  position: absolute;
  right: -0.35rem;
  top: -0.35rem;
  min-width: 1.1rem;
  border-radius: 999px;
  background: #ef4444;
  padding: 0.12rem 0.3rem;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
}

</style>
