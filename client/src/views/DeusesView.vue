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
          <span class="header-title text-2xl font-bold tracking-widest">Caminho Sem Volta</span>
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
          <p class="deuses-subtitle text-lg mb-10">Conhecimento comum dos mortais de Arcadia</p>

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
import type { GodApi } from '@/types/supabase'


const roteador = useRouter()
const rota = useRoute()
const lojaAuth = useAuthStore()
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

const staticGods = [
  {
    name: 'Pharasma',
    title: 'A Senhora das Sepulturas',
    alinhamento: 'Neutro',
    icon: '⚖️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 14%',
    shortDescription:
      'Deusa do nascimento, morte, destino e tempo. Julga todas as almas com frieza.',
    description:
      'Conhecimento comum: Pharasma é a deusa do nascimento, morte, destino, profecia e tempo. Ela observa todo o fluxo do tempo e julga as almas recém-partidas de Elyra. Ao morrer, as almas viajam pelo Rio das Almas até o Boneyard, onde ela as julga do alto de uma torre impossivelmente alta que perfura o Plano Astral. Pharasma não se importa se uma morte foi justa ou injusta — ela vê todas com frieza e imparcialidade, decidindo apenas para qual dos Planos Exteriores cada alma seguirá pela eternidade. Ela também é a deusa do nascimento e da profecidesde o momento em que uma criatura nasce, ela já enxerga seu destino final, mas só dá o veredito quando a alma chega diante dela. Capaz de reter um julgamento, ela nunca o fez, enviando até mesmo almas que beneficiariam deuses que ela despreza. Como deusa da morte e do renascimento, ela abomina os mortos-vivos, considerando-os uma perversão do ciclo natural, e ordena que seus seguidores destruam todas as criaturas não-mortas. Entre os próprios deuses, Pharasma cumpre um papel único: ela é a balança. Fiscaliza os atos de todas as divindades, sejam do bem ou do mal, para que nenhum ultrapasse os limites que regem o multiverso. Como uma das três Deusas Pilares que construíram Elyra ao lado de Asmodeus, seus poderes são análogos em escala e profundidade. Asmodeus a respeita — não por hesitação ou medo, mas porque ambas sabem que um conflito direto entre elas traria o fim absoluto do universo que ajudaram a criar. Há boatos entre os seguidores de Liriel que a Guardiã da Misericórdia a visita frequentemente, buscando conselho e talvez um afeto silencioso que a própria Pharasma nunca confirma nem nega.',
    anatema:
      'Criar ou tolerar mortos-vivos, interferir diretamente no ciclo natural de uma alma, julgar com paixão ou favoritismo.',
    dogma:
      'Manter o equilíbrio do ciclo da vida e da morte, julgar com imparcialidade absoluta, respeitar o fluxo do destino e garantir que nenhum deus ou mortal escape das regras que regem toda a existência.',
    weapons: 'Katana e Cajado',
  },
  {
    name: 'Asmodeus',
    title: 'A Princesa das Trevas',
    alinhamento: 'Maligna',
    icon: '👑',
    cardImagePosition: '50% 34%',
    modalImagePosition: '50% 34%',
    shortDescription:
      'Líder dos deuses malignos, senhora dos pactos e da ordem infernal. Defende submissão total.',
    description:
      'Conhecimento comum: Asmodeus é a Senhora do Inferno, dos pactos, da lei infernal e do poder absoluto. Como uma das três Deusas Pilares que construíram Elyra ao lado de Pharasma, seus poderes são análogos em escala e profundidade, e ambas sabem que um conflito direto entre elas traria o fim absoluto do universo que ajudaram a criar. Mas é no triângulo que forma com Calistria e Vespera que sua verdadeira natureza se revela. Foi a habilidade delas em manipular, seduzir e controlar que primeiro chamou sua atenção. Hoje, Asmodeus possui o afeto incondicional das duas, um amor ardente e leal que ela usa com maestria quando lhe convém. Ela as manipula, as recompensa e as direciona como peças perfeitas em seu grande jogo de poder. Calistria oferece vingança elegante e prazer venenoso; Vespera oferece segredos e sombras invisíveis. Asmodeus aceita esse amor, mas nunca se prende a ele, afinal, ela é a maior manipuladora de todos. Seus textos sagrados afirmam que a existência só funciona sob submissão total e ordem implacável, e ela prova isso todos os dias, até mesmo com quem a ama.',
    anatema:
      'Perder o controle de uma situação, permitir que alguém escape de um pacto, demonstrar fraqueza emocional diante de inferiores.',
    dogma:
      'Exercer poder absoluto através de pactos e manipulação, usar o desejo e o medo como ferramentas, manter a ordem infernal e lembrar a todos que até o amor pode ser uma corrente.',
    weapons: 'Foice e Cajado',
  },
  {
    name: 'Zon-Kuthon',
    title: 'O Deus da Dor e da Escuridão ',
    alinhamento: 'Maligno',
    icon: '☠️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus da tortura, da mutilação voluntária, da escuridão eterna e do sofrimento como forma suprema de existência.',
    description:
      'Conhecimento comum: Zon-Kuthon é o deus da tortura, da mutilação voluntária, da escuridão eterna e do sofrimento como forma suprema de existência. Ele ensina que a carne é fraca e que só através da dor constante o espírito se torna puro e forte. Seus templos são câmaras subterrâneas onde o ar cheira a sangue seco e ferro quente. Seus seguidores se automutilam em rituais públicos, arrancam os próprios olhos para “ver a verdadeira escuridão”, costuram a boca para não gritar de prazer e marcam a pele com ferro em brasa para provar devoção. Em Elyra, cultos de Zon-Kuthon são responsáveis por massacres onde aldeias inteiras são mantidas vivas por meses apenas para serem torturadas lentamente, dia após dia, até implorarem pela morte que nunca chega. O próprio deus caminha entre os gritos como se fossem a mais bela das sinfonias.',
    anatema:
      'Mostrar misericórdia desnecessária, curar sem exigir um preço de sofrimento, morrer sem ter conhecido a dor verdadeira.',
    dogma:
      'Infligir dor para fortalecer o espírito, abraçar a escuridão absoluta, transformar o sofrimento alheio e próprio em êxtase e poder, e nunca permitir que o mundo conheça a paz.',
    weapons: 'Corrente com Espinhos e Cajado',
  },
  {
    name: 'Norgorber',
    title: 'O Deus dos Segredos, Veneno e Ladrões',
    alinhamento: 'Maligno',
    icon: '☠️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus dos assassinos, dos ladrões, dos alquimistas venenosos e dos segredos que matam',
    description:
      'Conhecimento comum: Norgorber é o deus dos assassinos, dos ladrões, dos alquimistas venenosos e dos segredos que matam. Ele possui quatro aspectos diferentes — o Pai, o Ceifador, o Veneno e o Sombra — e cada um serve a um tipo de maldade. Seus templos são escondidos atrás de tavernas, em porões de nobres e em becos onde o cheiro de morte é disfarçado por perfume caro. Seus seguidores envenenam poços de vilarejos inteiros para testar novas fórmulas, traem aliados por uma única moeda de ouro, roubam crianças para vendê-las a cultos e matam com um sorriso no rosto enquanto se divertem com a reação de suas vitimas. Em Elyra, a Igreja de Norgorber é responsável por incontáveis “acidentes” que derrubam reinos, epidemias que dizimam populações e traições que transformam irmãos em inimigos mortais. O deus ri quando vê mortais destruindo uns aos outros por segredos que ele mesmo plantou.',
    anatema:
      'Revelar segredos que foram confiados a você, falhar em uma missão por escrúpulos morais, deixar uma vítima morrer sem antes extrair dela um segredo valioso',
    dogma:
      'Guardar segredos como o maior dos tesouros, usar veneno com inteligência, obter poder através de traição calculada, e lembrar que o conhecimento escondido vale mais que qualquer vida.',
    weapons: 'Adaga e Cajado',
  },
  {
    name: 'Gorum ',
    title: 'Nosso Senhor de Ferro',
    alinhamento: 'Maligno',
    icon: '☠️',
    cardImagePosition: 'center 15%',
    modalImagePosition: 'center 10%',
    shortDescription: 'Deus da batalha, da força bruta, do sangue derramado e da guerra por si só',
    description:
      'Conhecimento comum: Gorum é o deus da batalha, da força bruta, do sangue derramado e da guerra por si só. Ele não se importa com causas, bandeiras ou justiça — quer apenas o clangor de aço, o cheiro de sangue quente e o grito de quem morre em combate. Seus templos são arenas encharcadas de sangue onde gladiadores lutam até a morte e onde perdedores são esquartejados vivos como oferenda. Seus seguidores invadem vilarejos pacíficos apenas para transformar a matança em um festival de violência, queimam templos com os fiéis dentro, e promovem guerras eternas entre reinos só para que o deus possa se banquetear com o sofrimento. Em Elyra, cultos de Gorum são responsáveis por massacres onde soldados bebem o sangue dos inimigos ainda quentes e decoram suas armaduras com ossos de crianças. O deus observa cada golpe, cada osso quebrado, cada vida ceifada e sorri, porque para ele a guerra nunca é cruel demais — ela é a única coisa que realmente importa. ',
    anatema:
      ' Recusar um desafio de combate, fugir de uma luta, buscar a paz quando a guerra é possível. ',
    dogma:
      'Lutar até o fim, respeitar apenas a força, morrer em batalha gloriosa, transformar o mundo em um campo de sangue e nunca permitir que a fraqueza da paz se espalhe',
    weapons: 'Machado de Guerra e Cajado',
  },
  {
    name: 'Urgathoa ',
    title: 'O Príncipe Pálido',
    alinhamento: 'Maligno',
    icon: '☠️',
    cardImagePosition: 'center 15%',
    modalImagePosition: 'center 10%',
    shortDescription: 'Deus da batalha, da força bruta, do sangue derramado e da guerra por si só',
    description:
      'Conhecimento comum: Urgathoa é o deus da gula insaciável, da doença, da não-morte e da imortalidade a qualquer custo. Alto, magro e de pele branca como osso, ele rejeitou a morte e se tornou o primeiro grande não-morto voluntário. Sua obsessão por Asmodeus é doentia e absoluta — ele a venera como a única criatura digna de seu desejo eterno, enviando presentes macabros (crânios dourados, corações ainda batendo dentro de caixas de joias) e ordenando que seus seguidores realizem massacres sangrentos em nome dela. Seus templos são necrópoles onde banquetes de carne viva são servidos, onde os fiéis bebem sangue misturado com vinho e devoram os fracos para prolongar a própria existência. Em Elyra, cultos de Urgathoa são responsáveis por epidemias criadas de propósito, vilarejos inteiros transformados em banquetes ambulantes e rituais onde famílias são devoradas vivas diante dos olhos umas das outras. Ele não busca apenas imortalidade — busca agradar Asmodeus com rios de sangue e montanhas de ossos.',
    anatema:
      ' Jejuar ou viver com moderação, destruir mortos-vivos, recusar um banquete de carne ou sangue oferecido em nome de Asmodeus.',
    dogma:
      'Indulgir em todos os prazeres da carne, espalhar doenças e não-morte, viver eternamente mesmo que como monstro, e oferecer todo o sofrimento e toda a gula como tributo à Princesa das Trevas',
    weapons: 'Foice e Cajado',
  },
  {
    name: 'Rovagug',
    title: 'A Destruidora de Mundos',
    alinhamento: 'Maligna',
    icon: '☠️',
    cardImagePosition: 'center 30%',
    modalImagePosition: 'center 25%',
    shortDescription: 'Deusa da destruição, do caos absoluto e do fim de tudo',
    description:
      'Conhecimento comum: Rovagug é a encarnação viva da destruição absoluta. Uma aranha colossal e disforme, de carapaça rachada que sangra um ichor negro e viscoso, com centenas de olhos que nunca piscam e pernas longas e serrilhadas que rasgam a própria realidade ao se mover. Sua boca é um abismo repleto de presas irregulares e mandíbulas que trituram matéria e alma com a mesma facilidade. Ela não possui um único texto sagrado — apenas um mandamento: destruir. Seus seguidores — os mais hediondos e sanguinários de toda Elyra — sussurram seus títulos em cavernas úmidas banhadas em sangue: Fera Bruta, Rainha Aprisionada, Maré de Presas, Desfazedora e Destruidora de Mundos. Eles contam que cada vítima que esquartejam viva, cada osso que partem, cada cidade que reduzem a cinzas e cada grito de agonia que arrancam abre mais uma rachadura na prisão que a mantém contida. Seus cultos não matam por prazer ou poder — eles tecem teias de carne e sombra, empalam corpos ainda vivos para que sirvam de casulos, dissolvem vilarejos inteiros em poças de veneno e deixam montanhas de ossos envoltos em seda negra como oferenda. Rovagug não oferece recompensa, não faz pactos, não promete nada — ela apenas deseja o fim de tudo, e seus servos são a ferramenta mais brutal para que isso aconteça. ',
    anatema:
      'Criar algo duradouro, mostrar piedade, permitir que algo bonito ou vivo continue existindo sem motivo. ',
    dogma:
      'Destruir tudo que existe, transformar ordem em caos, carne em sangue e cidades em ruínas, e nunca parar até que não reste nada para destruir.',
    weapons: 'Garras e Dentes (qualquer arma que cause destruição máxima) e Cajado',
  },
  {
    name: 'Calistria',
    title: 'A Deusa da Vingança e do Prazer',
    alinhamento: 'Neutro e Maligno',
    icon: '🦂',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deusa da vingança, do desejo e da traição calculada. Cobra cada ofensa com elegância.',
    description:
      'Conhecimento comum: Calistria é a deusa da vingança, do desejo e da traição calculada. Ela ensina que o prazer e a dor podem andar juntos, e que toda ofensa deve ser cobrada com elegância e precisão. Seu coração, no entanto, pertence inteiramente a Asmodeus. Foi a habilidade de Calistria em manipular emoções, plantar sementes de desejo e transformar dor em poder que primeiro chamou a atenção da Princesa das Trevas. Hoje, Calistria oferece a Asmodeus um afeto incondicional e ardente, uma lealdade que poucos deuses conhecem. Ela serve como lâmina afiada e companhia sedutora, sempre pronta a executar os planos mais sutis de sua amada. Mesmo quando Asmodeus usa esse amor para manipular situações ou outras divindades, Calistria sorri, porque sabe que faz parte do grande jogo que sua senhora conduz. Deuses não se prendem como mortais, mas Calistria escolheu se prender, e o faz com prazer.',
    anatema:
      'Perdoar uma ofensa sem vingança adequada, demonstrar fraqueza emocional diante de Asmodeus, deixar uma humilhação sem resposta.',
    dogma:
      'Buscar prazer em todas as suas formas, cobrar cada ofensa com vingança elegante, transformar dor em poder e saborear cada vitória como o mais doce dos vinhos.',
    weapons: 'Chicote e Cajado',
  },
  {
    name: 'Morthos',
    title: 'O Senhor da Decadência',
    alinhamento: 'Neutro e Maligno',
    icon: '☠️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus da decadência lenta, da corrupção sutil e do prazer egoísta. Saboreia o declínio.',
    description:
      'Conhecimento comum: Morthos é o deus da decadência lenta, da corrupção sutil e do prazer egoísta. Ele não busca a destruição rápida e caótica como Rovagug; prefere observar, com um sorriso paciente e quase carinhoso, enquanto o mundo se desfaz aos poucos: impérios que apodrecem por dentro, amizades que viram traição, corpos que envelhecem e mentes que se perdem em vícios silenciosos. Caminha entre o bem e o mal sem se comprometer com nenhum lado, pois para ele a verdadeira beleza está no lento declínio de tudo que um dia foi grandioso. Seus seguidores são cortesãos corruptos, hedonistas discretos, alquimistas que criam venenos lentos e nobres que deixam seus reinos ruírem por puro tédio. Mesmo Asmodeus o respeita, pois Morthos entende que a corrupção mais perigosa é aquela que ninguém percebe até ser tarde demais.',
    anatema: 'Acelerar a destruição sem propósito, destruir algo belo por raiva ou pressa.',
    dogma:
      'Deixar a corrupção crescer naturalmente, aproveitar os prazeres que a decadência oferece, saborear o lento declínio de tudo que é vivo e ensinar que o fim pode ser tão delicioso quanto o começo.',
    weapons: 'Foice e Cajado',
  },
  {
    name: 'Vespera',
    title: 'A Senhora das Sombras e Segredos',
    alinhamento: 'Neutro e Maligno',
    icon: '🕯️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deusa dos segredos, intrigas e sombras úteis. Manipula o conhecimento como poder.',
    description:
      'Conhecimento comum: Vespera é a deusa dos segredos, das intrigas e das sombras úteis. Ela caminha entre luz e trevas, guardando conhecimento escondido como o maior dos tesouros e usando a escuridão como ferramenta de poder. Foi sua maestria em manipular informações, plantar dúvidas e tecer redes invisíveis de influência que primeiro atraiu o olhar de Asmodeus. Hoje, Vespera entrega à Princesa das Trevas um afeto incondicional e silencioso, uma lealdade profunda que se manifesta em sussurros, segredos roubados e planos que ninguém mais vê. Ela serve como os olhos e ouvidos de Asmodeus, sempre pronta a manipular mortais e divindades quando sua amada assim desejar. Mesmo sabendo que Asmodeus a usa quando lhe convém, Vespera não se importa; para ela, ser útil à sua senhora é o maior dos prazeres. Vespera escolheu canalizar todo o seu desejo a uma única divindade.',
    anatema:
      'Revelar segredos confiados por Asmodeus, demonstrar fraqueza emocional diante de estranhos, deixar uma informação valiosa escapar sem ganho.',
    dogma:
      'Guardar segredos como tesouros, usar a escuridão com inteligência, obter poder através de conhecimento escondido e traição.',
    weapons: 'Adaga e Cajado',
  },
  {
    name: 'Sarenrae',
    title: 'A Heroína Ascendente',
    alinhamento: 'Boa',
    icon: '🔥',
    cardImagePosition: '50% 32%',
    modalImagePosition: '50% 25%',
    shortDescription: 'Deusa da justiça, honra e cavalaria. Lidera os deuses do bem com Iomedae.',
    description:
      'Conhecimento comum: Sarenrae é a deusa da justiça, honra e cavalaria. Outrora uma anja poderosa e fiel serva dos pilares, ela ascendeu à divindade após grandes feitos heroicos durante os tempos mais sombrios, quando o mundo de Elyra ainda sangrava. Foi ela quem primeiro ergueu a bandeira contra as trevas, reunindo paladinos e cavaleiros que juraram defender os inocentes mesmo quando o sol parecia prestes a se apagar. Hoje, Sarenrae lidera os deuses do bem, mas seu coração ainda pulsa forte junto de Desna e Shelyn — as três formam o Prisma Radiante, um laço de amor profundo e lealdade que brilha como o próprio sol nas noites mais escuras. Deuses não guardam exclusividade como mortais; Sarenrae ama com intensidade, mas não se importa se seus amados buscam outros afetos sinceros, desde que o amor permaneça verdadeiro. Seus templos são fortalezas douradas cheias de guerreiros que lutam não só com lâmina, mas com honra, compaixão e a certeza de que a justiça pode ser gentil e implacável ao mesmo tempo.',
    anatema:
      'Recuar diante do mal, quebrar juramentos de cavalaria, usar mentiras para o mal, negar redenção a quem verdadeiramente busca mudança.',
    dogma:
      'Lutar com honra, proteger os inocentes, manter a palavra dada, inspirar os outros através do exemplo e oferecer uma segunda chance a quem demonstra arrependimento sincero.',
    weapons: 'Espada Longa e Cajado',
  },
  {
    name: 'Desna',
    title: 'A Deusa dos Sonhos e das Estrelas',
    alinhamento: 'Boa',
    icon: '🌠',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deusa da sorte, das viagens, dos sonhos e das estrelas. Guia sonhadores e viajantes.',
    description:
      'Conhecimento comum: Desna é a deusa da sorte, das viagens, dos sonhos e das estrelas. Ela protege os viajantes, os sonhadores e todos que ousam seguir o coração pelo mundo, mesmo quando o caminho parece impossível. Faz parte do Prisma Radiante ao lado de Sarenrae e Shelyn, formando um triângulo de amor aberto e apaixonado — deuses não se prendem como mortais, e Desna incentiva as investidas encantadoras de Cayden Cailean com um sorriso provocativo, recompensando-as ocasionalmente. Dizem que ela e Cayden Cailean juntos elevaram Kurgess à divindade, e alguns sussurram que ele é seu filho meio-mortal secreto. Seus clérigos são bardos, exploradores e gente que acredita que a vida deve ser uma grande aventura cheia de esperança. Mesmo nas noites mais escuras, Desna ensina que um único sonho pode iluminar o caminho inteiro.',
    anatema:
      'Causar pesadelos intencionalmente, prender alguém contra a vontade, impedir alguém de seguir seu coração.',
    dogma:
      'Seguir seus sonhos, explorar o mundo, trazer esperança e alegria mesmo nas noites mais escuras, celebrar a liberdade e a sorte que a vida oferece.',
    weapons: 'Borboleta (adaga leve) e Cajado',
  },
  {
    name: 'Shelyn',
    title: 'A Senhora da Beleza Eterna',
    alinhamento: 'Boa',
    icon: '🎨',
    cardImagePosition: 'center 15%',
    modalImagePosition: 'center 10%',
    shortDescription:
      'Deusa da arte, da beleza, do amor e da música. Ensina que a beleza pode salvar o mundo.',
    description:
      'Conhecimento comum: Shelyn é a deusa da arte, da beleza, do amor e da música. Ela é a guardiã de tudo que é belo no mundo — das pinturas que contam histórias antigas aos laços de amor que unem mortais e divindades. Forma o Prisma Radiante com Sarenrae e Desna, um triângulo de amor profundo onde a beleza, a justiça e os sonhos se entrelaçam. Deuses não conhecem ciúmes mortais; Shelyn celebra todos os afetos sinceros e ensina que o amor verdadeiro só cresce quando é livre. Seus seguidores são artistas, músicos, amantes e todos que acreditam que a beleza pode salvar o mundo. Mesmo em tempos de guerra, Shelyn lembra que uma canção bem cantada ou uma obra de arte bem feita podem tocar corações que nenhuma espada jamais alcançaria.',
    anatema:
      'Destruir obras de arte por ódio, forçar o amor ou a beleza, ser cruel com quem cria com o coração.',
    dogma:
      'Criar beleza em todas as formas, amar com sinceridade, usar a arte para curar e inspirar, proteger o amor em todas as suas cores.',
    weapons: 'Espada Curta e Cajado',
  },
  {
    name: 'Iomedae',
    title: 'A Flor da Aurora',
    alinhamento: 'Boa',
    icon: '☀️',
    cardImagePosition: '50% 14%',
    modalImagePosition: '50% 24%',
    shortDescription:
      'Deusa do sol, da cura e da redenção. Ilumina o caminho de quem busca recomeçar.',
    description:
      'Conhecimento comum: Iomedae é uma das deusas mais amadas em Elyra graças à sua ligação profunda com o sol que dá vida e sua oferta constante de redenção a todos que caíram. Outrora uma mortal comum que ascendeu à divindade através de atos de coragem e compaixão extraordinários, ela representa o amor ilimitado, a bondade pura e a paciência verdadeira, iluminando o caminho mesmo nas trevas mais densas. Os mortais agradecem a ela pelo calor do sol que protege e sustenta a todos, e aos seus clérigos por canalizarem seu poder de cura para quem precisa. Seus seguidores aspiram imitá-la através da generosidade, do cuidado sincero e da coragem altruísta. Combatem o mal primeiro com palavras e, quando necessário, com lâmina e chama. O coração de Iomedae sempre brilha mais forte quando vê alguém escolher o caminho da redenção.',
    anatema:
      'Ser cruel com quem busca redenção, negar uma segunda chance justa, abandonar aqueles que lutam para mudar.',
    dogma:
      'Oferecer redenção a todos que demonstram arrependimento sincero, curar com compaixão, combater o mal com justiça e iluminar tanto a escuridão do mundo quanto a escuridão do espírito.',
    weapons: 'Espada Grande e Cajado',
  },
  {
    name: 'Erastil',
    title: 'O Velho Pai da Caça e da Comunidade',
    alinhamento: 'Bom',
    icon: '🏹',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus da família, das fazendas e da caça honrada. Defende união, trabalho honesto e tradição.',
    description:
      'Conhecimento comum: Erastil é o deus da família, das fazendas, da caça honrada e das comunidades rurais. Conhecido como o Velho Pai, ele protege os lares simples, as tradições antigas e a vida no campo, ensinando que a verdadeira força vem da união, do trabalho honesto e do respeito à terra. Seus seguidores são fazendeiros, caçadores e chefes de família que valorizam a estabilidade, a honestidade e o bem-estar coletivo acima de glórias individuais. Em Elyra, ele é invocado para abençoar colheitas, proteger vilarejos e manter as famílias unidas mesmo nos tempos mais difíceis. Embora seja um deus do bem, Erastil é tradicional e conservador, preferindo a ordem calma da vida rural à agitação das grandes cidades.',
    anatema:
      'Trair a própria família ou comunidade, caçar por esporte ou crueldade, abandonar os idosos e as crianças.',
    dogma:
      'Proteger os fracos, valorizar o trabalho honesto, ensinar as gerações mais novas, manter a unidade familiar e viver em harmonia com a terra.',
    weapons: 'Arco Longo e Cajado',
  },
  {
    name: 'Cayden Cailean',
    title: 'O Deus da Cerveja e da Liberdade',
    alinhamento: 'Bom',
    icon: '🍺',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus da liberdade, da coragem e das festas. Patrono de aventureiros, rebeldes e gente comum.',
    description:
      'Conhecimento comum: Cayden Cailean é o deus da liberdade, do vinho, da coragem e das festas. Era um mortal comum que ascendeu à divindade por acidente após uma noite de bebedeira lendária e feitos heroicos que ninguém esperava. Hoje ele é o patrono de aventureiros, rebeldes e gente comum que ama viver livre. Mantém um flerte constante e provocativo com Desna, a quem admira profundamente — algo que a deusa dos sonhos corresponde com sorrisos e recompensas ocasionais, como é comum entre os deuses que não se prendem a lealdades mortais. Juntos, eles elevaram Kurgess à divindade, e muitos sussurram que ele pode ser seu filho meio-mortal secreto. Seus templos são tavernas animadas onde se bebe, canta e planeja revoltas contra a opressão.',
    anatema:
      'Escravizar alguém, proibir a diversão alheia, recusar um duelo honesto, viver acorrentado por medo.',
    dogma:
      'Viver livre, proteger a liberdade dos oprimidos, beber com alegria (com moderação ou sem), ajudar os outros a se libertarem e enfrentar a vida com coragem e bom humor.',
    weapons: 'Rapier e Cajado',
  },
  {
    name: 'Kurgess',
    title: 'O Campeão Eterno',
    alinhamento: 'Neutra e Boa',
    icon: '🏅',
    cardImagePosition: 'center 15%',
    modalImagePosition: 'center 10%',
    shortDescription:
      'Deus do atletismo, das competições justas e do heroísmo mortal. Exalta força com honra.',
    description:
      'Conhecimento comum: Kurgess é o deus da força física, das competições justas, do atletismo e do heroísmo mortal. Dizem que era um guerreiro comum que foi elevado à divindade por Desna e Cayden Cailean após feitos lendários — muitos sussurram que ele é o filho meio-mortal secreto do casal, fruto de uma noite de paixão entre a deusa dos sonhos e o deus da liberdade. Embora caminhe ao lado dos deuses do bem, Kurgess não se prende totalmente ao grupo de Sarenrae; ele representa o equilíbrio entre a honra e a força bruta, ensinando que um mortal pode se tornar lendário mesmo sem nascer divino. Seus templos são arenas onde competições justas são celebradas, e seus seguidores — atletas, gladiadores honestos e guerreiros que buscam superar seus limites — invocam seu nome antes de qualquer prova de coragem.',
    anatema:
      'Trapacear em competições, usar força para oprimir os fracos, recusar um desafio honesto por medo.',
    dogma:
      'Buscar a excelência física e moral, competir com honra, proteger os mais fracos e celebrar a vitória dos justos, mostrando que a verdadeira força nasce do coração.',
    weapons: 'Manopla e Cajado',
  },
  {
    name: 'Torak',
    title: 'O Forjador das Montanhas',
    alinhamento: 'Neutra e Boa',
    icon: '⚒️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deus das forjas, da honestidade e da construção. Ensina que valor nasce de trabalho e integridade.',
    description:
      'Conhecimento comum: Torak é o deus das forjas, da honestidade e da construção. Conhecido como o Forjador das Montanhas, ele protege artesãos, ferreiros e comunidades que constroem com as próprias mãos, ensinando que o verdadeiro valor vem do suor e da integridade. Embora caminhe ao lado dos deuses do bem, Torak prefere a ordem calma do trabalho honesto à agitação das grandes batalhas ou intrigas divinas. Seus templos são forjas sagradas onde o ferro é moldado com orações, e seus seguidores constroem pontes, muralhas e lares que resistem ao tempo. Em Elyra, ele é invocado por mineiros, construtores e todos que acreditam que uma boa ferramenta pode mudar o destino de um povo.',
    anatema:
      'Destruir o trabalho honesto, usar artesanato para o mal, forjar armas com intenção de opressão.',
    dogma:
      'Construir com integridade, valorizar o suor do trabalho, proteger o que foi feito com esforço e ensinar que uma boa fundação sustenta tanto um império quanto uma família.',
    weapons: 'Martelo de Guerra e Cajado',
  },
  {
    name: 'Liriel',
    title: 'A Guardiã da Misericórdia',
    alinhamento: 'Neutro e Bom',
    icon: '🕊️',
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 15%',
    shortDescription:
      'Deusa da misericórdia e da cura compassiva. Defende segundas chances com sabedoria.',
    description:
      'Conhecimento comum: Liriel é a deusa da misericórdia, da cura compassiva e das segundas chances. Ela caminha no limite entre o bem e o equilíbrio, oferecendo alívio aos que sofrem mesmo quando o mundo os considera indignos. Não pertence totalmente ao panteão liderado por Sarenrae, pois acredita que a justiça rígida às vezes precisa ser temperada com compaixão. Seus seguidores são curandeiros, conselheiros e aqueles que escolhem perdoar quando a vingança seria mais fácil. Em Elyra, ela é invocada em hospitais improvisados durante guerras e em rituais de reconciliação entre famílias divididas. Embora ame a luz, Liriel entende que nem toda sombra precisa ser destruída — algumas apenas precisam ser acalmadas. Há boatos dentre seus seguidores que ela é uma das admiradoras de Pharasma, visitando-a frequentemente.',
    anatema:
      'Negar ajuda a quem sofre de verdade, julgar sem compaixão, endurecer o coração diante do arrependimento sincero.',
    dogma:
      'Oferecer misericórdia com sabedoria, curar o corpo e o espírito, ensinar que ninguém está além da redenção e que a gentileza pode ser uma forma de força.',
    weapons: 'Cajado e Cajado',
  },
  {
    name: 'Inari',
    title: 'A Raposa Eterna das Colheitas',
    icon: '🦊',
    cardImagePosition: 'center 22%',
    modalImagePosition: 'center 14%',
    alinhamento: 'Neutro',
    shortDescription:
      'Deusa das kitsunes e das colheitas. Morta na guerra do século perdido, mas ainda cultuada.',
    description:
      'Conhecimento comum: Inari era a deusa das kitsunes, das colheitas abundantes, das ilusões astutas e da prosperidade. Conhecida como a Raposa Dourada, ela trazia sorte, fertilidade dos campos e proteção aos espíritos da natureza. Foi morta durante a guerra do século perdido, mas seu culto nunca desapareceu. Até hoje, kitsunes (inclusive as yako) acendem incensos e realizam danças em sua honra, lamentando sua ausência e pedindo sua bênção. Muitos acreditam que fragmentos de seu poder ainda ecoam no mundo através das raposas e dos campos dourados.',
    anatema:
      'Destruir colheitas ou trair uma kitsune que lhe ajudou ou foi bondosa e gentil como você.',
    dogma:
      'Celebrar a vida, usar astúcia e ilusão para proteger os seus, honrar os espíritos da natureza.',
    weapons: 'Dual-Katana e Cajado',
  },
  {
    name: 'Zephyros',
    title: 'O Guardião dos Ventos e Mares',
    alinhamento: 'Neutro',
    icon: '🌊',
    shortDescription:
      'Deus dos ventos, oceanos e tempestades. Representa a natureza em equilíbrio entre calmaria e fúria.',
    description:
      'Conhecimento comum: Zephyros é o deus dos ventos, dos oceanos e das tempestades. Ele é a força imprevisível da natureza que não se importa com o bem nem com o mal dos mortais — apenas com o equilíbrio do mundo. Ora traz brisas gentis que enchem velas de navios e fertilizam plantações, ora ergue furacões e maremotos que lembram a todos que a natureza não pede permissão. Diferente dos deuses do bem ou do mal, Zephyros não participa de intrigas divinas; ele simplesmente existe, mantendo o fluxo constante entre calmaria e fúria. Seus seguidores são marinheiros, navegantes, pescadores e druidas que respeitam o mar e o vento como forças vivas. Mesmo Pharasma o observa com respeito, pois Zephyros é uma das poucas entidades que nunca tenta quebrar as regras do ciclo — ele apenas as carrega.',
    anatema:
      'Poluir os mares ou prender os ventos, tentar dominar ou acorrentar as forças da natureza.',
    dogma:
      'Aceitar o fluxo imprevisível da vida, respeitar a fúria e a calma da natureza, navegar com humildade e nunca esquecer que o vento e o mar são mais antigos e mais fortes que qualquer deus ou mortal.',
    weapons: 'Lança e Cajado',
  },
  // ... (os outros deuses seguem o mesmo padrão - posso adicionar todos se quiser)
]

const pickFirstText = (...values: Array<string | undefined | null>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

const findStaticGodByName = (name?: string) => {
  const normalizedName = normalizeText(name || '')
  if (!normalizedName) return null

  return staticGods.find((god) => normalizeText(god.name || '') === normalizedName) ?? null
}

const mapApiGodToDisplayGod = (god: Partial<GodApi> | null | undefined) => {
  const source = god && typeof god === 'object' ? god : {}
  const fallbackGod = findStaticGodByName(source.name)
  const fallbackDescription = pickFirstText(
    source.shortDescription,
    source.description,
    fallbackGod?.shortDescription,
    fallbackGod?.description,
    'Sem descricao cadastrada.',
  )

  return {
    godId: (source as any).id ?? null,
    name: pickFirstText(source.name, fallbackGod?.name, 'Sem nome'),
    title: pickFirstText(source.title, fallbackGod?.title),
    alinhamento: pickFirstText(source.indole, fallbackGod?.alinhamento, 'Neutro'),
    icon: pickFirstText(fallbackGod?.icon, '✦'),
    iconImage: source.imageUrl ?? '',
    cardImagePosition: pickFirstText(fallbackGod?.cardImagePosition, 'center 22%'),
    modalImagePosition: pickFirstText(fallbackGod?.modalImagePosition, 'center 16%'),
    shortDescription: fallbackDescription,
    description: pickFirstText(source.description, fallbackGod?.description, fallbackDescription),
    anatema: pickFirstText(source.anatema, fallbackGod?.anatema, 'Nao informado.'),
    dogma: pickFirstText(source.dogma, fallbackGod?.dogma, 'Nao informado.'),
    weapons: pickFirstText(source.weapons, fallbackGod?.weapons, 'Nao informado.'),
  }
}

const deuses = computed(() => {
  const nomesNormalizados = new Set<string>()
  const listaCombinada: any[] = []

  for (const deus of deusesApi.value) {
    const chave = normalizeText(deus.name || '')
    if (!chave) continue
    nomesNormalizados.add(chave)
    listaCombinada.push(deus)
  }

  for (const deus of staticGods) {
    const chave = normalizeText(deus.name || '')
    if (!chave || nomesNormalizados.has(chave)) continue
    listaCombinada.push(deus)
  }

  return listaCombinada
})

const dadosDeusSelecionado = computed(() => {
  const indice = deusSelecionado.value
  if (indice === null) return null
  return deuses.value[indice] ?? null
})

const buscarDeusesPublicos = async () => {
  erroDeuses.value = false
  try {
    const deusesBuscados = await listarDeusesPublicos()
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

onMounted(() => {
  sincronizarTemaHtml()
  observadorTema = new MutationObserver(sincronizarTemaHtml)
  observadorTema.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

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
