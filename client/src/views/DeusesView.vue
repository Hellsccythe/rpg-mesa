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

          <div class="space-y-12">
            <section v-if="evilGods.length">
              <h2 class="mb-5 text-2xl font-bold tracking-wider text-red-300">Malignos</h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div
                  v-for="entry in evilGods"
                  :key="entry.index"
                  @click="showGodModal(entry.index)"
                  class="group bg-zinc-950/80 border border-[#6B4E9E]/40 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl"
                >
                  <div
                    class="relative h-64 overflow-hidden bg-gradient-to-br from-[#2A1B4A] to-[#1A2438]"
                  >
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      class="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div v-if="entry.god.iconImage" class="absolute inset-0 bg-black/25" />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3 class="text-2xl font-bold text-white">{{ entry.god.name }}</h3>
                      <p class="text-sm text-zinc-200/90">{{ entry.god.title }}</p>
                    </div>
                  </div>
                  <div class="p-6">
                    <p class="text-zinc-400 line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="neutralGods.length">
              <h2 class="mb-5 text-2xl font-bold tracking-wider text-zinc-200">Neutros</h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div
                  v-for="entry in neutralGods"
                  :key="entry.index"
                  @click="showGodModal(entry.index)"
                  class="group bg-zinc-950/80 border border-[#6B4E9E]/40 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl"
                >
                  <div
                    class="relative h-64 overflow-hidden bg-gradient-to-br from-[#2A1B4A] to-[#1A2438]"
                  >
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      class="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div v-if="entry.god.iconImage" class="absolute inset-0 bg-black/25" />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3 class="text-2xl font-bold text-white">{{ entry.god.name }}</h3>
                      <p class="text-sm text-zinc-200/90">{{ entry.god.title }}</p>
                    </div>
                  </div>
                  <div class="p-6">
                    <p class="text-zinc-400 line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="goodGods.length">
              <h2 class="mb-5 text-2xl font-bold tracking-wider text-blue-300">Bons</h2>
              <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div
                  v-for="entry in goodGods"
                  :key="entry.index"
                  @click="showGodModal(entry.index)"
                  class="group bg-zinc-950/80 border border-[#6B4E9E]/40 hover:border-red-500 rounded-3xl overflow-hidden cursor-pointer transition-all hover:-translate-y-3 hover:shadow-2xl"
                >
                  <div
                    class="relative h-64 overflow-hidden bg-gradient-to-br from-[#2A1B4A] to-[#1A2438]"
                  >
                    <img
                      v-if="entry.god.iconImage"
                      :src="entry.god.iconImage"
                      :alt="entry.god.name"
                      class="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                      :style="{ objectPosition: entry.god.cardImagePosition ?? 'center 22%' }"
                    />
                    <div v-if="entry.god.iconImage" class="absolute inset-0 bg-black/25" />
                    <div
                      class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75"
                    />
                    <span
                      v-if="!entry.god.iconImage"
                      class="absolute inset-0 flex items-center justify-center text-8xl opacity-40 transition-transform group-hover:scale-110"
                    >
                      {{ entry.god.icon }}
                    </span>
                    <div
                      class="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    >
                      <h3 class="text-2xl font-bold text-white">{{ entry.god.name }}</h3>
                      <p class="text-sm text-zinc-200/90">{{ entry.god.title }}</p>
                    </div>
                  </div>
                  <div class="p-6">
                    <p class="text-zinc-400 line-clamp-4 text-sm leading-relaxed">
                      {{ entry.god.shortDescription }}
                    </p>
                  </div>
                </div>
              </div>
            </section>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import pharasmaImage from '@/assets/images/pharasma.jpg'
import asmodeusImage from '@/assets/images/asmodeus.png'
import inariImage from '@/assets/images/Inari.png'
import iomedaeImage from '@/assets/images/iomedae.jpg'
import sarenraeImage from '@/assets/images/sarenrae.jpg'

const router = useRouter()
const authStore = useAuthStore()
const selectedGod = ref<number | null>(null)

const gods = [
  {
    name: 'Pharasma',
    title: 'A Senhora das Sepulturas',
    alinhamento: 'Neutro',
    icon: '⚖️',
    iconImage: pharasmaImage,
    cardImagePosition: 'center 20%',
    modalImagePosition: 'center 14%',
    shortDescription:
      'Deusa do nascimento, morte, destino e tempo. Julga todas as almas com frieza.',
    description:
      'Conhecimento comum: Pharasma é a deusa do nascimento, morte, destino, profecia e tempo. Ela observa todo o fluxo do tempo e julga as almas recém-partidas de Elyra. Ao morrer, as almas viajam pelo Rio das Almas até o Boneyard, onde ela as julga do alto de uma torre impossivelmente alta que perfura o Plano Astral. Pharasma não se importa se uma morte foi justa ou injusta — ela vê todas com frieza e imparcialidade, decidindo apenas para qual dos Planos Exteriores cada alma seguirá pela eternidade. Ela também é a deusa do nascimento e da profecia: desde o momento em que uma criatura nasce, ela já enxerga seu destino final, mas só dá o veredito quando a alma chega diante dela. Capaz de reter um julgamento, ela nunca o fez, enviando até mesmo almas que beneficiariam deuses que ela despreza. Como deusa da morte e do renascimento, ela abomina os mortos-vivos, considerando-os uma perversão do ciclo natural, e ordena que seus seguidores destruam todas as criaturas não-mortas. Entre os próprios deuses, Pharasma cumpre um papel único: ela é a balança. Fiscaliza os atos de todas as divindades, sejam do bem ou do mal, para que nenhum ultrapasse os limites que regem o multiverso. Como uma das três Deusas Pilares que construíram Elyra ao lado de Asmodeus, seus poderes são análogos em escala e profundidade. Asmodeus a respeita — não por hesitação ou medo, mas porque ambas sabem que um conflito direto entre elas traria o fim absoluto do universo que ajudaram a criar. Há boatos entre os seguidores de Liriel que a Guardiã da Misericórdia a visita frequentemente, buscando conselho e talvez um afeto silencioso que a própria Pharasma nunca confirma nem nega.',
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
    iconImage: asmodeusImage,
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
    iconImage: sarenraeImage,
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
    iconImage: iomedaeImage,
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
    iconImage: inariImage,
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

const normalizeAlignment = (alignment: string) =>
  alignment
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const godsWithIndex = computed(() => gods.map((god, index) => ({ god, index })))

const isNeutralAlignment = (alignment: string) => normalizeAlignment(alignment).includes('neutr')

const isEvilAlignment = (alignment: string) => {
  const normalized = normalizeAlignment(alignment)
  return normalized.includes('maligno') || normalized.includes('maligna')
}

const isGoodAlignment = (alignment: string) => {
  const normalized = normalizeAlignment(alignment)
  return normalized.includes('bom') || normalized.includes('boa')
}

const neutralPriority = (alignment: string) => {
  const normalized = normalizeAlignment(alignment)
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

const evilGods = computed(() =>
  godsWithIndex.value.filter(
    ({ god }) => isEvilAlignment(god.alinhamento) && !isNeutralAlignment(god.alinhamento),
  ),
)

const neutralGods = computed(() =>
  godsWithIndex.value
    .filter(({ god }) => isNeutralAlignment(god.alinhamento))
    .sort((a, b) => neutralPriority(a.god.alinhamento) - neutralPriority(b.god.alinhamento)),
)

const goodGods = computed(() =>
  godsWithIndex.value.filter(
    ({ god }) => isGoodAlignment(god.alinhamento) && !isNeutralAlignment(god.alinhamento),
  ),
)

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
})

const getAlignmentClass = (alignment: string) => {
  const normalized = normalizeAlignment(alignment)

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
