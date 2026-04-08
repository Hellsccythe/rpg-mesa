<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <header
        class="h-16 border-b border-[#6B4E9E]/30 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between"
      >
        <button
          @click="goLogin"
          class="text-3xl text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
        >
          ‹ <span class="text-base font-medium">Sair do Painel</span>
        </button>

        <div class="text-2xl font-bold tracking-widest text-amber-300">Game Master</div>

        <button
          @click="logout"
          class="rounded-xl border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm text-red-200 hover:bg-red-900/70 transition-colors"
        >
          Logout
        </button>
      </header>

      <main class="flex-1 px-6 md:px-10 py-8 space-y-8">
        <section class="rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-6">
          <div class="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 class="text-3xl font-bold text-[#C8D0E0]">Pendências de Aprovação</h1>
              <p class="text-zinc-400 mt-1">
                Solicitações de jogadores para nome, avatar e história.
              </p>
            </div>
            <button
              @click="loadAll"
              :disabled="loading"
              class="rounded-xl border border-[#6B4E9E]/50 px-4 py-2 text-sm text-zinc-200 hover:bg-[#2A1B4A] transition-colors disabled:opacity-60"
            >
              {{ loading ? 'Atualizando...' : 'Atualizar' }}
            </button>
          </div>

          <div
            v-if="pendingApprovals.length === 0"
            class="rounded-2xl border border-zinc-700/50 p-4 text-zinc-400"
          >
            Nenhuma pendência no momento.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="request in pendingApprovals"
              :key="request.characterId"
              class="rounded-2xl border border-[#6B4E9E]/35 bg-[#0F1C3A]/70 p-4"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-lg font-semibold text-white">{{ request.currentName }}</p>
                  <p class="text-xs text-zinc-400">
                    Solicitado por: {{ request.requestedByEmail || 'desconhecido' }}
                  </p>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="review(request.characterId, true)"
                    class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
                  >
                    Aprovar
                  </button>
                  <button
                    @click="review(request.characterId, false)"
                    class="rounded-xl bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <article class="rounded-3xl border border-[#6B4E9E]/35 bg-[#111A2D]/80 p-5 space-y-4">
            <h2 class="text-xl font-semibold text-amber-300">Menu Deuses</h2>
            <input
              v-model="godName"
              type="text"
              placeholder="Nome do deus"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <textarea
              v-model="godLore"
              rows="4"
              placeholder="Descrição/lore"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <button
              @click="saveGod"
              class="rounded-xl bg-[#6B4E9E] px-5 py-2 font-semibold hover:brightness-110"
            >
              Salvar Deus
            </button>
          </article>

          <article class="rounded-3xl border border-[#6B4E9E]/35 bg-[#111A2D]/80 p-5 space-y-4">
            <h2 class="text-xl font-semibold text-amber-300">Menu Cidade (Mapas)</h2>
            <input
              v-model="cityName"
              type="text"
              placeholder="Nome da cidade"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <input
              v-model="cityMapReference"
              type="text"
              placeholder="Referência do mapa"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <button
              @click="saveCity"
              class="rounded-xl bg-[#6B4E9E] px-5 py-2 font-semibold hover:brightness-110"
            >
              Salvar Cidade
            </button>
          </article>

          <article class="rounded-3xl border border-[#6B4E9E]/35 bg-[#111A2D]/80 p-5 space-y-4">
            <h2 class="text-xl font-semibold text-amber-300">Skills e Títulos por Personagem</h2>
            <select
              v-model="selectedCharacterId"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            >
              <option value="">Selecione um personagem</option>
              <option v-for="char in characters" :key="char.characterId" :value="char.characterId">
                {{ char.name }}
              </option>
            </select>
            <input
              v-model="skillName"
              type="text"
              placeholder="Nova skill"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <input
              v-model="titleName"
              type="text"
              placeholder="Novo título"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <div class="flex gap-2">
              <button
                @click="addSkill"
                class="rounded-xl bg-[#6B4E9E] px-4 py-2 font-semibold hover:brightness-110"
              >
                Adicionar Skill
              </button>
              <button
                @click="addTitleToCharacter"
                class="rounded-xl bg-[#6B4E9E] px-4 py-2 font-semibold hover:brightness-110"
              >
                Adicionar Título
              </button>
            </div>
          </article>

          <article class="rounded-3xl border border-[#6B4E9E]/35 bg-[#111A2D]/80 p-5 space-y-4">
            <h2 class="text-xl font-semibold text-amber-300">Classes e Notas de Aventura</h2>
            <input
              v-model="className"
              type="text"
              placeholder="Nova classe"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <select
              v-model="classTier"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            >
              <option value="Base">Base</option>
              <option value="Híbrida">Híbrida</option>
              <option value="Hidden">Hidden</option>
            </select>
            <textarea
              v-model="classDescription"
              rows="3"
              placeholder="Descrição da classe"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <input
              v-model="titleTier"
              type="text"
              placeholder="Tier do título (Comum, Raro, Épico, Lendário)"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <textarea
              v-model="titleDescription"
              rows="2"
              placeholder="Descrição do título novo"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <textarea
              v-model="adventureNote"
              rows="4"
              placeholder="Nota de aventura para personagem selecionado"
              class="w-full rounded-xl border border-[#6B4E9E]/40 bg-[#0B1426] px-4 py-3"
            />
            <div class="flex flex-wrap gap-2">
              <button
                @click="saveClass"
                class="rounded-xl bg-[#6B4E9E] px-4 py-2 font-semibold hover:brightness-110"
              >
                Salvar Classe
              </button>
              <button
                @click="saveTitleCatalog"
                class="rounded-xl bg-[#6B4E9E] px-4 py-2 font-semibold hover:brightness-110"
              >
                Salvar Título (Catálogo)
              </button>
              <button
                @click="addAdventureNote"
                class="rounded-xl bg-[#6B4E9E] px-4 py-2 font-semibold hover:brightness-110"
              >
                Adicionar Nota
              </button>
            </div>
          </article>
        </section>

        <p
          v-if="feedback"
          class="text-sm"
          :class="feedbackError ? 'text-red-300' : 'text-emerald-300'"
        >
          {{ feedback }}
        </p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import { useMasterCatalogStore } from '@/stores/masterCatalog'

const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const masterApprovalsStore = useMasterApprovalsStore()
const masterCatalogStore = useMasterCatalogStore()

const loading = ref(false)
const feedback = ref('')
const feedbackError = ref(false)

const godName = ref('')
const godLore = ref('')
const cityName = ref('')
const cityMapReference = ref('')
const selectedCharacterId = ref('')
const skillName = ref('')
const titleName = ref('')
const className = ref('')
const classTier = ref('Base')
const classDescription = ref('')
const titleTier = ref('Comum')
const titleDescription = ref('')
const adventureNote = ref('')

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)
const characters = computed(() => charactersStore.publicCharacters)

async function loadAll() {
  loading.value = true
  feedback.value = ''
  try {
    await Promise.all([
      masterApprovalsStore.fetchPendingApprovals(),
      charactersStore.fetchPaginaInicial(),
    ])
  } catch {
    feedback.value = 'Não foi possível carregar os dados do painel mestre.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function review(characterId: string, approve: boolean) {
  loading.value = true
  feedback.value = ''
  try {
    await masterApprovalsStore.reviewPendingApproval(characterId, approve)
    feedback.value = approve ? 'Solicitação aprovada.' : 'Solicitação rejeitada.'
    feedbackError.value = false
  } catch {
    feedback.value = 'Erro ao revisar solicitação.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function saveGod() {
  try {
    await masterCatalogStore.createGod({ name: godName.value, description: godLore.value })
    feedback.value = 'Deus salvo com sucesso.'
    feedbackError.value = false
    godName.value = ''
    godLore.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar deus.'
    feedbackError.value = true
  }
}

async function saveCity() {
  try {
    await masterCatalogStore.createCityMap({
      name: cityName.value,
      mapReference: cityMapReference.value,
    })
    feedback.value = 'Cidade/mapa salvo com sucesso.'
    feedbackError.value = false
    cityName.value = ''
    cityMapReference.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar cidade.'
    feedbackError.value = true
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
    feedback.value = 'Selecione um personagem para adicionar título.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addTitleToCharacter(selectedCharacterId.value, titleName.value)
    feedback.value = 'Título adicionado ao personagem.'
    feedbackError.value = false
    titleName.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar título.'
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
    feedback.value = 'Classe salva com sucesso.'
    feedbackError.value = false
    className.value = ''
    classDescription.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar classe.'
    feedbackError.value = true
  }
}

async function saveTitleCatalog() {
  try {
    await masterCatalogStore.createTitle({
      name: titleName.value,
      tier: titleTier.value,
      description: titleDescription.value,
    })
    feedback.value = 'Título salvo no catálogo com sucesso.'
    feedbackError.value = false
    titleName.value = ''
    titleDescription.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar título no catálogo.'
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

function goLogin() {
  router.push({ name: 'login' })
}

async function logout() {
  await authStore.signOut()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await loadAll()
})
</script>
