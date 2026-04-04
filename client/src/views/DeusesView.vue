<!-- src/views/DeusesView.vue -->
<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-hidden">
    <!-- Fundo sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header reutilizado -->
      <header
        class="h-16 border-b border-[#6B4E9E]/30 bg-black/50 backdrop-blur-md px-6 flex items-center justify-between"
      >
        <button
          @click="goBack"
          class="text-3xl text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
        >
          ‹ <span class="text-base font-medium">Voltar</span>
        </button>

        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold tracking-widest text-red-400">Caminho Sem Volta</span>
        </div>

        <nav class="flex items-center gap-8 text-lg font-medium">
          <router-link to="/dashboard" class="text-zinc-400 hover:text-white transition-colors"
            >Personagem</router-link
          >
          <span class="text-red-400 font-semibold">Deuses</span>
          <router-link to="/cidade" class="text-zinc-400 hover:text-white transition-colors"
            >Cidade</router-link
          >
          <router-link to="/skills" class="text-zinc-400 hover:text-white transition-colors"
            >Skills</router-link
          >
          <router-link to="/titulos" class="text-zinc-400 hover:text-white transition-colors"
            >Títulos</router-link
          >
          <router-link to="/classes" class="text-zinc-400 hover:text-white transition-colors"
            >Classes</router-link
          >
          <router-link to="/npcs" class="text-zinc-400 hover:text-white transition-colors"
            >NPCs</router-link
          >
          <router-link to="/notas" class="text-zinc-400 hover:text-white transition-colors"
            >Notas</router-link
          >
        </nav>

        <div class="flex items-center gap-6 text-2xl text-zinc-300">
          <button class="hover:text-[#C8D0E0] transition-colors">👤</button>
          <button class="hover:text-[#C8D0E0] transition-colors">⚙️</button>
        </div>
      </header>

      <!-- Conteúdo -->
      <main class="flex-1 px-6 md:px-12 py-10">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-5xl font-bold tracking-widest text-red-400 mb-2">Deuses & Cosmos</h1>
          <p class="text-zinc-400 text-lg mb-10">Conhecimento comum dos mortais de Arcadia</p>

          <!-- Grid de Deuses -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <div
              v-for="(god, index) in gods"
              :key="index"
              @click="showGodModal(index)"
              class="group bg-zinc-950/80 border border-[#6B4E9E]/40 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl"
            >
              <div
                class="relative h-64 overflow-hidden bg-gradient-to-br from-[#2A1B4A] to-[#1A2438]"
              >
                <img
                  v-if="god.iconImage"
                  :src="god.iconImage"
                  :alt="god.name"
                  class="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                  :style="{ objectPosition: god.cardImagePosition ?? 'center 22%' }"
                />
                <div v-if="god.iconImage" class="absolute inset-0 bg-black/25" />
                <div
                  class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75"
                />
                <span
                  v-if="!god.iconImage"
                  class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                >
                  {{ god.icon }}
                </span>
                <div
                  class="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center"
                >
                  <h3 class="text-2xl font-bold text-white">{{ god.name }}</h3>
                  <p class="text-sm text-zinc-200/90">{{ god.title }}</p>
                </div>
              </div>
              <div class="p-6">
                <p class="text-zinc-400 line-clamp-4 text-sm leading-relaxed">
                  {{ god.shortDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal -->
    <div
      v-if="selectedGod !== null"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 md:p-6"
      @click.self="closeGodModal"
    >
      <div
        class="mx-auto my-4 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#6B4E9E]/50 bg-[#1A2438] shadow-2xl shadow-black/40 md:max-h-[calc(100vh-3rem)]"
      >
        <div class="relative h-72 overflow-hidden border-b border-[#6B4E9E]/30 bg-[#111A2D]">
          <img
            v-if="gods[selectedGod].iconImage"
            :src="gods[selectedGod].iconImage"
            :alt="gods[selectedGod].name"
            class="absolute inset-0 h-full w-full object-cover"
            :style="{ objectPosition: gods[selectedGod].modalImagePosition ?? 'center 16%' }"
          />
          <div v-if="gods[selectedGod].iconImage" class="absolute inset-0 bg-black/35" />
          <div
            class="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#111A2D] via-[#111A2D]/70 to-transparent"
          />
          <div class="absolute inset-x-0 bottom-8 px-8 text-center">
            <span v-if="!gods[selectedGod].iconImage" class="mb-3 block text-6xl text-zinc-200">{{
              gods[selectedGod].icon
            }}</span>
            <div>
              <h2 class="text-4xl font-bold text-red-400">{{ gods[selectedGod].name }}</h2>
              <p class="text-zinc-400">{{ gods[selectedGod].title }}</p>
            </div>
          </div>
        </div>

        <div class="deuses-modal-scroll flex-1 overflow-y-auto p-8">
          <div class="space-y-8 text-zinc-300">
            <div>
              <h3 class="uppercase text-red-400 text-sm tracking-widest mb-3">
                Conhecimento Comum
              </h3>
              <p class="leading-relaxed">{{ gods[selectedGod].description }}</p>
            </div>

            <div>
              <h3 class="uppercase text-red-400 text-sm tracking-widest mb-3">Alinhamento</h3>
              <p class="leading-relaxed" :class="getAlignmentClass(gods[selectedGod].alinhamento)">
                {{ gods[selectedGod].alinhamento }}
              </p>
            </div>

            <div>
              <h3 class="uppercase text-red-400 text-sm tracking-widest mb-3">Anátema</h3>
              <p class="italic text-red-300">{{ gods[selectedGod].anatema }}</p>
            </div>

            <div>
              <h3 class="uppercase text-emerald-400 text-sm tracking-widest mb-3">Dogma</h3>
              <p class="italic text-emerald-300">{{ gods[selectedGod].dogma }}</p>
            </div>

            <div>
              <h3 class="uppercase text-amber-400 text-sm tracking-widest mb-3">
                Armas Favorecidas
              </h3>
              <p class="text-amber-300">{{ gods[selectedGod].weapons }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end border-t border-[#6B4E9E]/30 px-4 py-3 md:px-5 md:py-3">
          <button
            @click="closeGodModal"
            class="rounded-xl bg-zinc-900 px-6 py-2 text-base hover:bg-red-950 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import pharasmaImage from '@/assets/images/pharasma.jpg'
import asmodeusImage from '@/assets/images/asmodeus.jpg'
import inariImage from '@/assets/images/Inari.png'

const router = useRouter()
const authStore = useAuthStore()
const selectedGod = ref<number | null>(null)

const gods = [
  {
    name: 'Pharasma',
    title: 'A Senhora das Sepulturas',
    alinhamento: 'Neutra',
    icon: '⚖️',
    iconImage: pharasmaImage,
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 14%',
    shortDescription:
      'Deusa do nascimento, morte, destino e tempo. Julga todas as almas com frieza.',
    description:
      'Pharasma é a deusa do nascimento, morte, destino, profecia e tempo. Ela observa todo o fluxo do tempo e julga as almas recém-partidas do Mundo 2. Ao morrer, as almas viajam pelo Rio das Almas até o Boneyard, onde ela as julga do alto de uma torre impossivelmente alta que perfura o Plano Astral. Pharasma não se importa se uma morte foi justa ou injusta — ela vê todas com frieza e imparcialidade, decidindo apenas para qual dos Planos Exteriores cada alma seguirá pela eternidade. Ela também é a deusa do nascimento e da profecia: desde o momento em que uma criatura nasce, ela já enxerga seu destino final, mas só dá o veredito quando a alma chega diante dela. Capaz de reter um julgamento, ela nunca o fez, enviando até mesmo almas que beneficiariam deuses que ela despreza. Como deusa da morte e do renascimento, ela abomina os mortos-vivos, considerando-os uma perversão do ciclo natural, e ordena que seus seguidores destruam todas as criaturas não-mortas.',
    anatema:
      'Criar ou permitir a existência de mortos-vivos, pois são uma perversão do ciclo natural.',
    dogma:
      'Pharasma não julga se uma morte é justa ou não. Ela envia cada alma para o plano que lhe cabe, mesmo que beneficie deuses que ela despreza.',
    weapons: 'Katana e Cajado',
  },
  {
    name: 'Asmodeus',
    title: 'A Princesa das Trevas',
    alinhamento: 'Maligna',
    icon: '👑',
    iconImage: asmodeusImage,
    cardImagePosition: '50% 14%',
    modalImagePosition: '50% 34%',
    shortDescription: 'Senhora dos pactos e da ordem infernal. Defende a submissão absoluta.',
    description:
      'Asmodeus é a Senhora do Inferno, dos pactos, da lei infernal e do poder absoluto. Seus próprios textos sagrados — corroborados por alguns outros registros antigos, como o Livro dos Condenados — afirmam que ela é uma das entidades mais antigas do multiverso. Dizem que, antes mesmo do tempo existir, em um mundo ainda não criado, Asmodeus e sua irmã Pharasma estavam entre as primeiras divindades. Naquela era sem nome, as duas irmãs e Eremiel viviam um triângulo amoroso intenso. Durante eras sem nome, as duas discutiram o destino das almas de suas criações. Asmodeus matou o marido de sua irmã — que também era o seu próprio marido — convicta de que o ato de dar livre-arbítrio aos mortais era uma tolice. Ela defende que a existência só funciona sob submissão total e ordem implacável. Embora muitos teólogos duvidem de suas reivindicações, ninguém consegue provar que são falsas.  ',
    anatema:
      'Quebrar um contrato assinado de livre vontade ou demonstrar misericórdia desnecessária.',
    dogma:
      'Honrar todos os acordos, impor ordem mesmo que cruel, buscar poder através de inteligência e barganhas.',
    weapons: 'Foice e Cajado',
  },
  {
    name: 'Sarenrae',
    title: 'A Flor da Aurora',
    alinhamento: 'Boa',
    icon: '☀️',
    shortDescription: 'Deusa do sol, da cura e da redenção. Oferece uma segunda chance a todos.',
    description:
      'Conhecimento comum: Sarenrae é uma das deusas mais amadas no Mundo 2 graças à sua ligação com o sol que dá vida e sua oferta constante de redenção. A maioria das pessoas agradece a ela pelo calor do sol que protege e sustenta a todos, e aos seus clérigos por canalizarem seu poder de cura para quem precisa. Os mortais veem na Dawnflower um exemplo de amor ilimitado, bondade pura e paciência verdadeira. Eles oram a ela para curar os doentes, erguer os oprimidos e iluminar tanto a escuridão do mundo quanto a escuridão do espírito. Seus seguidores aspiram a imitá-la através da generosidade, do cuidado, da sinceridade e da coragem altruísta. Eles combatem o mal primeiro com palavras, e, quando necessário, com lâmina e chama.',
    anatema: 'Recusar uma chance sincera de redenção ou usar o perdão como arma de manipulação.',
    dogma:
      'Dar segundas chances merecidas, lutar contra a tirania com compaixão e proteger os inocentes.',
    weapons: 'Espada Grande e Cajado',
  },
  {
    name: 'Inari',
    title: 'A Raposa Eterna das Colheitas',
    icon: '🦊',
    iconImage: inariImage,
    cardImagePosition: 'center 22%',
    modalImagePosition: 'center 14%',
    alinhamento: 'Neutra e Boa',
    shortDescription:
      'Deusa das kitsunes e das colheitas. Morta na guerra do século perdido, mas ainda cultuada.',
    description:
      'Conhecimento comum: Inari era a deusa das kitsunes, das colheitas abundantes, das ilusões astutas e da prosperidade. Conhecida como a Raposa Dourada, ela trazia sorte, fertilidade dos campos e proteção aos espíritos da natureza. Foi morta durante a guerra do século perdido, mas seu culto nunca desapareceu. Até hoje, kitsunes (inclusive as yako) acendem incensos e realizam danças em sua honra, lamentando sua ausência e pedindo sua bênção. Muitos acreditam que fragmentos de seu poder ainda ecoam no mundo através das raposas e dos campos dourados.',
    anatema:
      'Destruir colheitas ou trair uma kitsune que lhe ajudou ou foi bondosa e gentil como você.',
    dogma:
      'Celebrar a vida, usar astúcia e ilusão para proteger os seus, honrar os espíritos da natureza.',
    weapons: 'Katana e Cajado',
  },
  // ... (os outros deuses seguem o mesmo padrão - posso adicionar todos se quiser)
]

const goBack = () => {
  router.push({
    name: 'dashboard',
    query: authStore.activeCharacterId ? { characterId: authStore.activeCharacterId } : undefined,
  })
}

const showGodModal = (index: number) => {
  selectedGod.value = index
}

const closeGodModal = () => {
  selectedGod.value = null
}

const handleWindowKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedGod.value !== null) {
    closeGodModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
})

const getAlignmentClass = (alignment: string) => {
  const normalized = alignment
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

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
.deuses-modal-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 78, 158, 0.9) rgba(10, 15, 28, 0.75);
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
</style>
