<!-- src/views/DeusesView.vue -->
<template>
  <div class="deuses-view min-h-screen relative overflow-hidden">
    <!-- Fundo sutil -->
    <div class="deuses-backdrop absolute inset-0" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header reutilizado -->
      <header class="deuses-header h-16 border-b px-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <HamburgerDrawerMenu
            :items="itensMenuCabecalhoDeuses"
            :active-item-id="itemCabecalhoDeusesAtivo"
            aria-label="Abrir menu de navegacao"
            @select="aoSelecionarMenuCabecalho"
          />
        </div>

        <div class="flex items-center gap-3">
          <span class="header-title truncate text-lg font-bold tracking-widest sm:text-2xl">Caminho Sem Volta</span>
        </div>

        <div class="flex items-center gap-6 text-2xl">
          <button class="header-link rounded-lg px-2 py-1 text-sm transition-colors">PERFIL</button>
          <div class="relative" @click.stop>
            <button
              @click="alternarMenuConfiguracoes"
              class="header-link transition-colors"
              title="Abrir menu"
              aria-label="Abrir menu de configuracoes"
            >
              ⚙️
            </button>

            <TemaDarkLight
              v-if="mostrarMenuConfiguracoes"
              elemento="div"
              variante="cartao"
              :tema="temaClaroAtivo ? 'claro' : 'escuro'"
              preset="deuses"
              class="absolute right-0 mt-2 w-52 rounded-2xl p-2 text-base shadow-xl backdrop-blur-md"
            >
              <button
                @click="irParaDashboard"
                class="block w-full rounded-xl px-4 py-2 text-left text-zinc-200 transition-colors hover:bg-[#2A1B4A]"
              >
                Personagem
              </button>
              <button
                v-if="lojaAuth.eMestre"
                @click="irParaPainel"
                class="block w-full rounded-xl px-4 py-2 text-left text-amber-300 transition-colors hover:bg-amber-950/40"
              >
                Painel do Mestre
              </button>
              <button
                @click="sair"
                class="block w-full rounded-xl px-4 py-2 text-left text-red-300 transition-colors hover:bg-red-950/60"
              >
                Logout
              </button>
            </TemaDarkLight>
          </div>
        </div>
      </header>

      <!-- Conteúdo -->
      <main class="flex-1 px-6 md:px-12 py-10">
        <div class="max-w-7xl mx-auto">
          <h1 class="deuses-title text-5xl font-bold tracking-widest mb-2">Deuses & Cosmos</h1>
          <p class="deuses-subtitle text-lg mb-10">Conhecimento comum dos mortais{{ mundoStore.mundo ? ` de ${mundoStore.mundo.name}` : '' }}</p>

          <div class="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div class="md:col-span-2">
              <label
                for="god-name-filter"
                class="deuses-filter-label mb-2 block text-sm uppercase tracking-wider"
                >Filtrar por nome</label
              >
              <div class="relative">
                <input
                  id="god-name-filter"
                  v-model="filtroNome"
                  type="text"
                  placeholder="Digite o nome do deus..."
                  class="deuses-input w-full rounded-2xl border px-4 py-3 pr-12 outline-none transition-colors"
                />

                <button
                  v-if="filtroNome"
                  @click="limparFiltroNome"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm deuses-filter-label transition-colors hover:bg-black/10 hover:text-[var(--text-main)]"
                  title="Limpar busca"
                  aria-label="Limpar busca por nome"
                >
                  ✕
                </button>
              </div>
            </div>

            <div>
              <label
                for="god-alignment-filter"
                class="deuses-filter-label mb-2 block text-sm uppercase tracking-wider"
                >Filtrar por alinhamento</label
              >
              <v-select
                id="god-alignment-filter"
                v-model="filtroAlinhamento"
                :options="opcoesAlinhamento"
                aria-label="Filtrar por alinhamento"
                root-class="w-full"
              />
            </div>
          </div>

          <div class="space-y-12">
            <section v-if="deusesMalignos.length">
              <h2
                class="deuses-section-title deuses-section-evil mb-5 text-2xl font-bold tracking-wider"
              >
                Malignos
              </h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  v-for="entry in deusesMalignos"
                  :key="entry.index"
                  @click="abrirModalDeus(entry.index)"
                  :aria-label="`Ver detalhes de ${entry.god.name}`"
                  class="deuses-card group border rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl text-left w-full"
                >
                  <div class="deuses-card-image relative h-64 overflow-hidden">
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      loading="lazy"
                      class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div
                      v-if="entry.god.iconImage"
                      class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45 transition-all duration-300 group-hover:from-black/20 group-hover:via-black/35 group-hover:to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="god-overlay-content absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3
                        class="god-overlay-name text-2xl font-bold"
                        :class="getAlignmentClass(entry.god.alinhamento)"
                      >
                        {{ entry.god.name }}
                      </h3>
                      <p v-if="entry.god.title" class="god-overlay-title text-sm">
                        {{ entry.god.title }}
                      </p>
                    </div>
                  </div>
                  <div class="p-6">
                    <!-- Nome fora do overlay: o overlay só aparece no hover, e no
                         celular não há hover — o jogador via a arte e a descrição
                         sem nunca saber de quem era. -->
                    <h3 class="mb-0.5 text-lg font-bold" :class="getAlignmentClass(entry.god.alinhamento)">{{ entry.god.name }}</h3>
                    <p v-if="entry.god.title" class="deuses-card-text mb-2 text-xs italic opacity-80">{{ entry.god.title }}</p>
                    <p class="deuses-card-text line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <section v-if="deusesNeutros.length">
              <h2 class="deuses-section-title mb-5 text-2xl font-bold tracking-wider">Neutros</h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  v-for="entry in deusesNeutros"
                  :key="entry.index"
                  @click="abrirModalDeus(entry.index)"
                  :aria-label="`Ver detalhes de ${entry.god.name}`"
                  class="deuses-card group border rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl text-left w-full"
                >
                  <div class="deuses-card-image relative h-64 overflow-hidden">
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      loading="lazy"
                      class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div
                      v-if="entry.god.iconImage"
                      class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45 transition-all duration-300 group-hover:from-black/20 group-hover:via-black/35 group-hover:to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="god-overlay-content absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3
                        class="god-overlay-name text-2xl font-bold"
                        :class="getAlignmentClass(entry.god.alinhamento)"
                      >
                        {{ entry.god.name }}
                      </h3>
                      <p v-if="entry.god.title" class="god-overlay-title text-sm">
                        {{ entry.god.title }}
                      </p>
                    </div>
                  </div>
                  <div class="p-6">
                    <!-- Nome fora do overlay: o overlay só aparece no hover, e no
                         celular não há hover — o jogador via a arte e a descrição
                         sem nunca saber de quem era. -->
                    <h3 class="mb-0.5 text-lg font-bold" :class="getAlignmentClass(entry.god.alinhamento)">{{ entry.god.name }}</h3>
                    <p v-if="entry.god.title" class="deuses-card-text mb-2 text-xs italic opacity-80">{{ entry.god.title }}</p>
                    <p class="deuses-card-text line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <section v-if="deusesBons.length">
              <h2
                class="deuses-section-title deuses-section-good mb-5 text-2xl font-bold tracking-wider"
              >
                Bons
              </h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <button
                  v-for="entry in deusesBons"
                  :key="entry.index"
                  @click="abrirModalDeus(entry.index)"
                  :aria-label="`Ver detalhes de ${entry.god.name}`"
                  class="deuses-card group border rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl text-left w-full"
                >
                  <div class="deuses-card-image relative h-64 overflow-hidden">
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      loading="lazy"
                      class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div
                      v-if="entry.god.iconImage"
                      class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40"
                    />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45 transition-all duration-300 group-hover:from-black/20 group-hover:via-black/35 group-hover:to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="god-overlay-content absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3
                        class="god-overlay-name text-2xl font-bold"
                        :class="getAlignmentClass(entry.god.alinhamento)"
                      >
                        {{ entry.god.name }}
                      </h3>
                      <p v-if="entry.god.title" class="god-overlay-title text-sm">
                        {{ entry.god.title }}
                      </p>
                    </div>
                  </div>
                  <div class="p-6">
                    <!-- Nome fora do overlay: o overlay só aparece no hover, e no
                         celular não há hover — o jogador via a arte e a descrição
                         sem nunca saber de quem era. -->
                    <h3 class="mb-0.5 text-lg font-bold" :class="getAlignmentClass(entry.god.alinhamento)">{{ entry.god.name }}</h3>
                    <p v-if="entry.god.title" class="deuses-card-text mb-2 text-xs italic opacity-80">{{ entry.god.title }}</p>
                    <p class="deuses-card-text line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </button>
              </div>
            </section>

            <section v-if="erroDeuses">
              <TemaDarkLight
                elemento="div"
                variante="aviso"
                :tema="temaClaroAtivo ? 'claro' : 'escuro'"
                preset="deuses"
                class="rounded-2xl p-6 text-center"
              >
                Nao foi possivel carregar os deuses do servidor. Exibindo dados locais.
              </TemaDarkLight>
            </section>

            <section v-if="haFiltroAtivo && !haResultadosFiltrados">
              <TemaDarkLight
                elemento="div"
                variante="aviso"
                :tema="temaClaroAtivo ? 'claro' : 'escuro'"
                preset="deuses"
                class="rounded-2xl p-6 text-center"
              >
                Nenhum deus encontrado com esse nome.
              </TemaDarkLight>
            </section>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal -->
    <Modal
      v-if="dadosDeusSelecionado"
      :show-close-button="false"
      overlay-class="bg-black/90 p-4 md:p-6"
      panel-class="deuses-modal-panel mx-auto flex h-[calc(100dvh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl shadow-2xl md:h-[calc(100dvh-4rem)]"
      body-class="flex min-h-0 flex-1 p-0"
      @close="fecharModalDeus"
    >
      <div class="flex h-full flex-col">
        <div class="deuses-modal-media relative h-72 overflow-hidden border-b">
          <img
            v-if="dadosDeusSelecionado.iconImage"
            :src="dadosDeusSelecionado.iconImage"
            :alt="dadosDeusSelecionado.name"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover"
            :style="{ objectPosition: dadosDeusSelecionado.modalImagePosition ?? 'center 16%' }"
          />
          <div
            v-if="dadosDeusSelecionado.iconImage"
            class="deuses-modal-media-mask absolute inset-0"
          />
          <div
            class="deuses-modal-media-gradient absolute inset-x-0 bottom-0 h-44"
            :class="{ 'deuses-modal-media-gradient-hidden': temaClaroAtivo }"
          />
          <div class="absolute inset-x-0 bottom-7 px-8 text-center">
            <span
              v-if="!dadosDeusSelecionado.iconImage"
              class="mb-3 block text-6xl text-zinc-200"
              >{{ dadosDeusSelecionado.icon }}</span
            >
            <div>
              <h2
                class="deuses-modal-name text-4xl font-bold"
                :class="getAlignmentClass(dadosDeusSelecionado.alinhamento)"
              >
                {{ dadosDeusSelecionado.name }}
              </h2>
              <p v-if="dadosDeusSelecionado.title" class="deuses-modal-subtitle">
                {{ dadosDeusSelecionado.title }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="deuses-modal-scroll min-h-0 flex-1 overflow-y-auto"
          :class="{ 'deuses-modal-scroll-light': temaClaroAtivo }"
        >
          <div class="deuses-modal-content space-y-8 p-8">
            <div>
              <h3 class="deuses-modal-section-title uppercase text-sm tracking-widest mb-3">
                Conhecimento Comum
              </h3>
              <p class="leading-relaxed">{{ dadosDeusSelecionado.description }}</p>
            </div>

            <div>
              <h3 class="deuses-modal-section-title uppercase text-sm tracking-widest mb-3">
                Alinhamento
              </h3>
              <p
                class="leading-relaxed"
                :class="getAlignmentClass(dadosDeusSelecionado.alinhamento)"
              >
                {{ dadosDeusSelecionado.alinhamento }}
              </p>
            </div>

            <div>
              <h3 class="deuses-modal-section-title uppercase text-sm tracking-widest mb-3">
                Anátema
              </h3>
              <p class="italic text-red-300">{{ dadosDeusSelecionado.anatema }}</p>
            </div>

            <div>
              <h3 class="uppercase text-emerald-400 text-sm tracking-widest mb-3">Dogma</h3>
              <p class="italic text-emerald-300">{{ dadosDeusSelecionado.dogma }}</p>
            </div>

            <div>
              <h3 class="uppercase texmber-400 text-sm tracking-widest mb-3">Armas Favorecidas</h3>
              <p class="text-amber-300">{{ dadosDeusSelecionado.weapons }}</p>
            </div>

            <div v-if="infoAdicionalDeusSelecionado" class="rounded-2xl border border-amber-600/30 bg-amber-950/20 p-4">
              <h3 class="uppercase text-amber-400 text-xs tracking-widest mb-2">Informações Adicionais</h3>
              <p class="text-amber-200 text-sm leading-relaxed whitespace-pre-wrap">{{ infoAdicionalDeusSelecionado }}</p>
            </div>
          </div>
        </div>

        <div class="deuses-modal-footer flex justify-end border-t px-4 py-3 md:px-5 md:py-3">
          <button
            @click="fecharModalDeus"
            class="deuses-modal-close-btn rounded-xl px-6 py-2 text-base transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { listPublicGods as listarDeusesPublicos } from '@/lib/api/gods.api'
import { buscarCampanhaPorSlug } from '@/lib/api/campanhas.api'
import { useMundoStore } from '@/stores/mundo'
import type { GodApi } from '@/types/api'


const roteador = useRouter()
const rota = useRoute()
const lojaAuth = useAuthStore()
const mundoStore = useMundoStore()
const lojaPersonagens = useCharactersStore()
const deusSelecionado = ref<number | null>(null)
const mostrarMenuConfiguracoes = ref(false)
const temaClaroAtivo = ref(false)
const godInfoPersonagem = ref<Record<string, { text: string; addedAt: string }>>({})

const infoAdicionalDeusSelecionado = computed(() => {
  const god = dadosDeusSelecionado.value as any
  if (!god?.godId) return null
  return godInfoPersonagem.value[god.godId]?.text ?? null
})
const filtroNome = ref('')
type AlignmentFilter = 'all' | 'good' | 'neutral' | 'evil' | 'neutral-good' | 'neutral-evil'

const filtroAlinhamento = ref<AlignmentFilter>('all')
const deusesApi = ref<any[]>([])
const erroDeuses = ref(false)

const opcoesAlinhamento: Array<{ value: AlignmentFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'good', label: 'Bom' },
  { value: 'evil', label: 'Maligno' },
  { value: 'neutral', label: 'Neutro' },
  { value: 'neutral-good', label: 'Neutro Bom' },
  { value: 'neutral-evil', label: 'Neutro Maligno' },
]

const itensMenuCabecalhoDeuses = [
  { id: 'back', label: 'Voltar' },
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Titulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'notas', label: 'Notas' },
]

const itemCabecalhoDeusesAtivo = computed(() => {
  if (rota.name === 'deuses') return 'deuses'
  if (rota.name === 'dashboard') return 'dashboard'
  if (rota.name === 'cidade') return 'cidade'

  const path = rota.path || ''
  if (path.startsWith('/skills')) return 'skills'
  if (path.startsWith('/titulos')) return 'titulos'
  if (path.startsWith('/classes')) return 'classes'
  if (path.startsWith('/npcs')) return 'npcs'
  if (path.startsWith('/notas')) return 'notas'

  return null
})

/**
 * Ajustes visuais por nome — ícone e enquadramento das artes dos deuses de
 * Elyra. É só um fallback de campo: os deuses VÊM do banco, do mundo do
 * personagem; nada aqui vira uma linha na tela. Um deus de outro mundo (ou
 * um novo) usa os padrões.
 */
const AJUSTES_VISUAIS_POR_NOME: Record<string, { icon: string; cardImagePosition: string; modalImagePosition: string }> = {
  'Pharasma': { icon: '⚖️', cardImagePosition: 'center 20%', modalImagePosition: 'center 14%' },
  'Asmodeus': { icon: '👑', cardImagePosition: '50% 34%', modalImagePosition: '50% 34%' },
  'Zon-Kuthon': { icon: '☠️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Norgorber': { icon: '☠️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Gorum': { icon: '☠️', cardImagePosition: 'center 15%', modalImagePosition: 'center 10%' },
  'Urgathoa': { icon: '☠️', cardImagePosition: 'center 15%', modalImagePosition: 'center 10%' },
  'Rovagug': { icon: '☠️', cardImagePosition: 'center 30%', modalImagePosition: 'center 25%' },
  'Calistria': { icon: '🦂', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Morthos': { icon: '☠️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Vespera': { icon: '🕯️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Sarenrae': { icon: '🔥', cardImagePosition: '50% 32%', modalImagePosition: '50% 25%' },
  'Desna': { icon: '🌠', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Shelyn': { icon: '🎨', cardImagePosition: 'center 15%', modalImagePosition: 'center 10%' },
  'Iomedae': { icon: '☀️', cardImagePosition: '50% 14%', modalImagePosition: '50% 24%' },
  'Erastil': { icon: '🏹', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Cayden Cailean': { icon: '🍺', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Kurgess': { icon: '🏅', cardImagePosition: 'center 15%', modalImagePosition: 'center 10%' },
  'Torak': { icon: '⚒️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Liriel': { icon: '🕊️', cardImagePosition: 'center 20%', modalImagePosition: 'center 15%' },
  'Inari': { icon: '🦊', cardImagePosition: 'center 22%', modalImagePosition: 'center 14%' },
  'Zephyros': { icon: '🌊', cardImagePosition: 'center 22%', modalImagePosition: 'center 16%' },
}

const pickFirstText = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

const findStaticGodByName = (name?: string) => {
  const normalizedName = normalizeText(name || '')
  if (!normalizedName) return null

  const nome = Object.keys(AJUSTES_VISUAIS_POR_NOME).find((chave) => normalizeText(chave) === normalizedName)
  return nome ? AJUSTES_VISUAIS_POR_NOME[nome] ?? null : null
}

const INDOLE_CODIGO_PT: Record<string, string> = {
  bom: 'Bom',
  'neutro-bom': 'Neutro e Bom',
  neutro: 'Neutro',
  'neutro-ruim': 'Neutro e Maligno',
  ruim: 'Maligno',
}

function traduzirCodigoIndole(codigo: string | undefined | null): string {
  if (!codigo) return ''
  return INDOLE_CODIGO_PT[codigo.toLowerCase()] ?? codigo
}

const mapApiGodToDisplayGod = (god: Partial<GodApi> | null | undefined) => {
  const source = god && typeof god === 'object' ? god : {}
  const fallbackGod = findStaticGodByName(source.name)
  const fallbackDescription = pickFirstText(
    source.shortDescription,
    source.description,
    'Sem descricao cadastrada.',
  )

  return {
    godId: (source as any).id ?? null,
    name: pickFirstText(source.name, 'Sem nome'),
    title: pickFirstText(source.title),
    alinhamento: traduzirCodigoIndole(source.indole) || 'Neutro',
    icon: pickFirstText(fallbackGod?.icon, '✦'),
    iconImage: source.imageUrl ?? '',
    cardImagePosition: pickFirstText(fallbackGod?.cardImagePosition, 'center 22%'),
    modalImagePosition: pickFirstText(fallbackGod?.modalImagePosition, 'center 16%'),
    shortDescription: fallbackDescription,
    description: pickFirstText(source.description, fallbackDescription),
    anatema: pickFirstText(source.anatema, 'Nao informado.'),
    dogma: pickFirstText(source.dogma, 'Nao informado.'),
    weapons: pickFirstText(source.weapons, 'Nao informado.'),
  }
}

// Só o que veio do banco: um mundo sem deuses mostra a tela vazia, não o panteão de outro.
const deuses = computed(() => deusesApi.value.filter((deus) => normalizeText(deus.name || '')))

const dadosDeusSelecionado = computed(() => {
  const indice = deusSelecionado.value
  if (indice === null) return null
  return deuses.value[indice] ?? null
})

const buscarDeusesPublicos = async () => {
  erroDeuses.value = false
  try {
    const deusesBuscados = await listarDeusesPublicos(String(rota.query.characterId ?? lojaAuth.idPersonagemAtivo ?? ''))
    deusesApi.value = (Array.isArray(deusesBuscados) ? deusesBuscados : []).map(
      mapApiGodToDisplayGod,
    )
  } catch {
    deusesApi.value = []
    erroDeuses.value = true
  }
}

const voltar = () => {
  roteador.push({
    name: 'dashboard',
    query: lojaAuth.idPersonagemAtivo ? { characterId: lojaAuth.idPersonagemAtivo } : undefined,
  })
}

const alternarMenuConfiguracoes = () => {
  mostrarMenuConfiguracoes.value = !mostrarMenuConfiguracoes.value
}

const fecharMenuConfiguracoes = () => {
  mostrarMenuConfiguracoes.value = false
}

const irParaDashboard = () => {
  fecharMenuConfiguracoes()
  roteador.push({
    name: 'dashboard',
    query: lojaAuth.idPersonagemAtivo ? { characterId: lojaAuth.idPersonagemAtivo } : undefined,
  })
}

const irParaPainel = () => {
  fecharMenuConfiguracoes()
  roteador.push({ name: 'master-panel' })
}

async function aoSelecionarMenuCabecalho(itemId: string) {
  fecharMenuConfiguracoes()

  if (itemId === 'back') {
    voltar()
    return
  }

  if (itemId === 'dashboard') {
    irParaDashboard()
    return
  }

  if (itemId === 'deuses') {
    await roteador.push('/deuses')
    return
  }

  const routeMap: Record<string, string> = {
    cidade: '/cidade',
    skills: '/skills',
    titulos: '/titulos',
    classes: '/classes',
    npcs: '/npcs',
    racas: '/racas',
    equipamentos: '/equipamentos',
    notas: '/notas',
  }

  const target = routeMap[itemId]
  if (!target) return

  await roteador.push(target)
}

const sair = async () => {
  fecharMenuConfiguracoes()
  try {
    await lojaAuth.sair()
  } finally {
    roteador.push({ name: 'login' })
  }
}

const abrirModalDeus = (index: number) => {
  if (index < 0 || index >= deuses.value.length) return
  deusSelecionado.value = index
}

const fecharModalDeus = () => {
  deusSelecionado.value = null
}

const limparFiltroNome = () => {
  filtroNome.value = ''
}

const aoPressionarTeclaJanela = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && deusSelecionado.value !== null) {
    fecharModalDeus()
  }

  if (event.key === 'Escape' && mostrarMenuConfiguracoes.value) {
    fecharMenuConfiguracoes()
  }
}

const aoClicarJanela = () => {
  fecharMenuConfiguracoes()
}

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') return ''

  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const normalizarAlinhamento = (alignment: string) => normalizeText(alignment)

const ehAlinhamentoNeutro = (alignment: string) =>
  normalizarAlinhamento(alignment).includes('neutr')

const ehAlinhamentoMaligno = (alignment: string) => {
  const normalized = normalizarAlinhamento(alignment)
  return normalized.includes('maligno') || normalized.includes('maligna')
}

const ehAlinhamentoBom = (alignment: string) => {
  const normalized = normalizarAlinhamento(alignment)
  return normalized.includes('bom') || normalized.includes('boa')
}

const ehAlinhamentoNeutroBom = (alignment: string) =>
  ehAlinhamentoNeutro(alignment) && ehAlinhamentoBom(alignment)

const ehAlinhamentoNeutroMaligno = (alignment: string) =>
  ehAlinhamentoNeutro(alignment) && ehAlinhamentoMaligno(alignment)

const ehAlinhamentoBomEstrito = (alignment: string) =>
  ehAlinhamentoBom(alignment) && !ehAlinhamentoNeutro(alignment)

const ehAlinhamentoMalignoEstrito = (alignment: string) =>
  ehAlinhamentoMaligno(alignment) && !ehAlinhamentoNeutro(alignment)

const deusesComIndice = computed(() => deuses.value.map((god, index) => ({ god, index })))

const correspondeFiltroAlinhamento = (alignment: string) => {
  if (filtroAlinhamento.value === 'all') return true
  if (filtroAlinhamento.value === 'good') return ehAlinhamentoBomEstrito(alignment)
  if (filtroAlinhamento.value === 'neutral') return ehAlinhamentoNeutro(alignment)
  if (filtroAlinhamento.value === 'evil') return ehAlinhamentoMalignoEstrito(alignment)
  if (filtroAlinhamento.value === 'neutral-good') return ehAlinhamentoNeutroBom(alignment)
  if (filtroAlinhamento.value === 'neutral-evil') return ehAlinhamentoNeutroMaligno(alignment)
  return true
}

const deusesFiltradosComIndice = computed(() => {
  const filtro = normalizeText(filtroNome.value)
  if (!filtro && filtroAlinhamento.value === 'all') return deusesComIndice.value

  return deusesComIndice.value.filter(
    ({ god }) =>
      normalizeText(god.name || '').includes(filtro) &&
      correspondeFiltroAlinhamento(god.alinhamento),
  )
})

const haFiltroAtivo = computed(
  () => normalizeText(filtroNome.value).length > 0 || filtroAlinhamento.value !== 'all',
)
const haResultadosFiltrados = computed(() => deusesFiltradosComIndice.value.length > 0)

const prioridadeNeutra = (alignment: string) => {
  const normalized = normalizarAlinhamento(alignment)
  const isNeutralEvil =
    normalized.includes('neutr') &&
    (normalized.includes('maligno') || normalized.includes('maligna'))
  if (isNeutralEvil) return 0

  const isNeutralOnly =
    normalized.includes('neutr') &&
    !normalized.includes('bom') &&
    !normalized.includes('boa') &&
    !normalized.includes('maligno') &&
    !normalized.includes('maligna')
  if (isNeutralOnly) return 1

  const isNeutralGood =
    normalized.includes('neutr') && (normalized.includes('bom') || normalized.includes('boa'))
  if (isNeutralGood) return 2

  return 3
}

const ordenarPorNomeDeus = (a: { god: { name?: string } }, b: { god: { name?: string } }) =>
  (a.god.name || '').localeCompare(b.god.name || '', 'pt-BR', { sensitivity: 'base' })

const deusesMalignos = computed(() =>
  deusesFiltradosComIndice.value
    .filter(
      ({ god }) => ehAlinhamentoMaligno(god.alinhamento) && !ehAlinhamentoNeutro(god.alinhamento),
    )
    .sort(ordenarPorNomeDeus),
)

const deusesNeutros = computed(() =>
  deusesFiltradosComIndice.value
    .filter(({ god }) => ehAlinhamentoNeutro(god.alinhamento))
    .sort(
      (a, b) =>
        prioridadeNeutra(a.god.alinhamento) - prioridadeNeutra(b.god.alinhamento) ||
        ordenarPorNomeDeus(a, b),
    ),
)

const deusesBons = computed(() =>
  deusesFiltradosComIndice.value
    .filter(({ god }) => ehAlinhamentoBom(god.alinhamento) && !ehAlinhamentoNeutro(god.alinhamento))
    .sort(ordenarPorNomeDeus),
)

let observadorTema: MutationObserver | null = null

function sincronizarTemaHtml() {
  temaClaroAtivo.value = document.documentElement.classList.contains('theme-light')
}

async function carregarInfoDeusPersonagem() {
  const charId = lojaAuth.idPersonagemAtivo
  if (!charId) return
  try {
    const char = await lojaPersonagens.fetchCharacterById(charId)
    const info = (char as any)?.data?.godAdditionalInfo
    if (info && typeof info === 'object') {
      godInfoPersonagem.value = info
    }
  } catch {
    // silently ignore — additional info is optional
  }
}

onMounted(async () => {
  sincronizarTemaHtml()
  observadorTema = new MutationObserver(sincronizarTemaHtml)
  observadorTema.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  // /mundo/:slug/deuses: o slug da rota vira o mundo ativo antes de buscar —
  // é assim que um visitante anônimo diz de qual mundo quer os deuses.
  const slugDaRota = typeof rota.params.slug === 'string' ? rota.params.slug : ''
  if (slugDaRota && mundoStore.mundo?.slug !== slugDaRota) {
    try { mundoStore.selecionar(await buscarCampanhaPorSlug(slugDaRota)) } catch { /* mundo inexistente: a busca abaixo decide */ }
  }

  buscarDeusesPublicos()
  carregarInfoDeusPersonagem()
  window.addEventListener('keydown', aoPressionarTeclaJanela)
  window.addEventListener('click', aoClicarJanela)
})

onBeforeUnmount(() => {
  observadorTema?.disconnect()
  observadorTema = null

  window.removeEventListener('keydown', aoPressionarTeclaJanela)
  window.removeEventListener('click', aoClicarJanela)
})

const getAlignmentClass = (alignment: string) => {
  const normalized = normalizarAlinhamento(alignment)

  const isNeutralGood =
    (normalized.includes('neutr') && normalized.includes('bom')) ||
    (normalized.includes('neutr') && normalized.includes('boa'))
  if (isNeutralGood) return 'text-sky-300'

  const isNeutralEvil =
    (normalized.includes('neutr') && normalized.includes('maligno')) ||
    (normalized.includes('neutr') && normalized.includes('maligna'))
  if (isNeutralEvil) return 'text-rose-300'

  const isNeutralOnly =
    normalized.includes('neutr') &&
    !normalized.includes('bom') &&
    !normalized.includes('boa') &&
    !normalized.includes('maligno') &&
    !normalized.includes('maligna')
  if (isNeutralOnly) return 'text-zinc-400'

  if (normalized.includes('bom') || normalized.includes('boa')) return 'text-blue-300'
  if (normalized.includes('maligno') || normalized.includes('maligna')) return 'text-red-300'

  return 'text-zinc-400'
}
</script>

<style scoped>
.deuses-view {
  background: var(--bg-page);
  color: var(--text-main);
}

.deuses-backdrop {
  background: linear-gradient(
    145deg,
    rgb(148 163 184 / 0.14),
    rgb(79 70 229 / 0.08),
    rgb(30 41 59 / 0.1)
  );
}

.deuses-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

.header-title {
  color: var(--brand-primary);
}

.header-link {
  color: var(--text-muted);
}

.header-link:hover {
  color: var(--text-main);
}

.deuses-title {
  color: var(--brand-primary);
  text-shadow: 0 6px 20px rgb(30 41 59 / 0.16);
}

.deuses-subtitle {
  color: var(--text-muted);
}

.deuses-filter-label {
  color: var(--text-muted);
}

.deuses-input {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
  color: var(--text-main);
}

.deuses-input:focus {
  border-color: var(--brand-primary);
}

.deuses-section-title {
  color: color-mix(in srgb, var(--text-main) 85%, var(--brand-primary) 15%);
}

.deuses-section-evil {
  color: color-mix(in srgb, var(--brand-primary-strong) 70%, #f97316 30%);
}

.deuses-section-good {
  color: color-mix(in srgb, var(--brand-primary) 70%, #0ea5e9 30%);
}

.deuses-card {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
}

.deuses-card {
  background: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.deuses-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 70%, #f59e0b 30%);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--brand-primary) 50%, #f59e0b 50%), 0 20px 40px color-mix(in srgb, var(--brand-primary) 18%, transparent 82%);
}

.deuses-card:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}

.deuses-card-image {
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--brand-primary) 30%, #1e293b 70%),
    #1e293b
  );
}

.deuses-card-text {
  color: color-mix(in srgb, var(--text-main) 85%, #64748b 15%);
}

:deep(.deuses-modal-panel) {
  border: 1px solid var(--border-soft);
  background: var(--bg-card) !important;
  box-shadow: 0 24px 50px rgb(15 23 42 / 0.22);
}

.deuses-modal-media {
  border-color: var(--border-soft);
  background: linear-gradient(180deg, #fff, color-mix(in srgb, var(--bg-soft) 82%, #fff 18%));
}

.deuses-modal-media-mask {
  background: rgb(0 0 0 / 0.18);
}

.deuses-modal-media-gradient {
  background: linear-gradient(
    to top,
    color-mix(in srgb, var(--bg-card) 96%, #fff 4%),
    color-mix(in srgb, var(--bg-card) 54%, transparent 46%),
    transparent
  );
}

.deuses-modal-media-gradient-hidden {
  display: none;
}

.deuses-modal-name {
  line-height: 1.08;
  text-shadow: 0 6px 16px rgb(15 23 42 / 0.28);
}

.deuses-modal-subtitle {
  margin-top: 0.45rem;
  font-size: 1.6rem;
  line-height: 1.35;
  color: var(--text-muted);
}

.deuses-modal-content {
  background: var(--bg-card);
  color: var(--text-main);
}

.deuses-modal-section-title {
  color: color-mix(in srgb, var(--brand-primary) 70%, #f97316 30%);
}

.deuses-modal-footer {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-soft) 70%, #fff 30%);
}

.deuses-modal-close-btn {
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  color: var(--text-main);
}

.deuses-modal-close-btn:hover {
  background: var(--accent-soft);
}

.god-overlay-content {
  z-index: 2;
}

.god-overlay-name {
  line-height: 1.15;
  text-shadow: 0 10px 24px rgb(15 23 42 / 0.45);
}

.god-overlay-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 0.3rem 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 999px;
  background: rgb(15 23 42 / 0.42);
  color: rgb(248 250 252 / 0.98);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.35;
  text-shadow: 0 8px 22px rgb(15 23 42 / 0.45);
  backdrop-filter: blur(3px);
}

.deuses-modal-scroll {
  background: var(--bg-card);
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 78, 158, 0.9) rgba(10, 15, 28, 0.75);
}

.deuses-modal-scroll-light {
  background: #ffffff;
  scrollbar-color: rgba(107, 78, 158, 0.95) #ffffff;
}

.deuses-modal-scroll::-webkit-scrollbar {
  width: 10px;
}

.deuses-modal-scroll::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(10, 15, 28, 0.95), rgba(26, 36, 56, 0.92));
  border-left: 1px solid rgba(107, 78, 158, 0.18);
}

.deuses-modal-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(200, 208, 224, 0.75), rgba(107, 78, 158, 0.9));
  border-radius: 999px;
  border: 2px solid rgba(26, 36, 56, 0.95);
}

.deuses-modal-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(248, 113, 113, 0.9), rgba(107, 78, 158, 1));
}

.deuses-modal-scroll-light::-webkit-scrollbar-track {
  background: #ffffff;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
}

.deuses-modal-scroll-light::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.78), rgba(107, 78, 158, 0.95));
  border: 2px solid #ffffff;
}

:global(html.theme-dark) .deuses-backdrop {
  background: linear-gradient(
    145deg,
    rgb(15 23 42 / 0.84),
    rgb(30 41 59 / 0.78),
    rgb(31 27 74 / 0.76)
  );
}

:global(html.theme-dark) .deuses-header {
  background: rgb(2 6 23 / 0.68);
}

:global(html.theme-dark) .header-link {
  color: #cbd5e1;
}

:global(html.theme-dark) .header-link:hover {
  color: #f8fafc;
}

:global(html.theme-dark) .deuses-input {
  border-color: rgb(107 78 158 / 0.4);
  background: rgb(2 6 23 / 0.6);
  color: #e2e8f0;
}

:global(html.theme-dark) .deuses-card {
  border-color: rgb(107 78 158 / 0.4);
  background: rgb(2 6 23 / 0.72);
}

:global(html.theme-dark) .deuses-card-text {
  color: #94a3b8;
}

:global(html.theme-dark) :deep(.deuses-modal-panel) {
  border-color: rgb(107 78 158 / 0.5);
  background: #1a2438 !important;
  box-shadow: 0 28px 56px rgb(0 0 0 / 0.45);
}

:global(html.theme-dark) .deuses-modal-scroll {
  background: #0b1220;
}

:global(html.theme-dark) .deuses-modal-media {
  border-color: rgb(107 78 158 / 0.3);
  background: #111a2d;
}

:global(html.theme-dark) .deuses-modal-media-mask {
  background: rgb(0 0 0 / 0.35);
}

:global(html.theme-dark) .deuses-modal-media-gradient {
  background: linear-gradient(to top, #111a2d, rgb(17 26 45 / 0.7), transparent);
}

:global(html.theme-dark) .deuses-modal-subtitle {
  color: #94a3b8;
}

:global(html.theme-dark) .deuses-modal-content {
  background: #0b1220;
  color: #cbd5e1;
}

:global(html.theme-dark) .deuses-modal-footer {
  border-color: rgb(107 78 158 / 0.3);
  background: #0b1426;
}

:global(html.theme-dark) .deuses-modal-close-btn {
  border-color: #334155;
  background: #111827;
  color: #e2e8f0;
}

:global(html.theme-dark) .deuses-modal-close-btn:hover {
  background: #1f2937;
}

:global(html.theme-light) .deuses-modal-name.text-red-300 {
  color: #b91c1c;
}

:global(html.theme-light) .deuses-modal-name.text-blue-300 {
  color: #1d4ed8;
}

:global(html.theme-light) .deuses-modal-name.text-sky-300 {
  color: #0369a1;
}

:global(html.theme-light) .deuses-modal-name.text-rose-300 {
  color: #be123c;
}

:global(html.theme-light) .deuses-modal-name.text-zinc-400 {
  color: #475569;
}
</style>
