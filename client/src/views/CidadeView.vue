<template>
  <TemaDarkLight
    elemento="div"
    variante="contexto"
    tema="auto"
    preset="cidade"
    class="cidade-view min-h-screen relative overflow-hidden"
  >
    <div class="cidade-backdrop absolute inset-0" />

    <div class="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
    <div class="absolute top-28 -right-16 h-80 w-80 rounded-full bg-[#6B4E9E]/20 blur-3xl" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <header class="cidade-header h-16 px-6 flex items-center justify-between">
        <button
          @click="voltar"
          class="cidade-header-link text-3xl transition-colors flex items-center gap-2"
        >
          ‹ <span class="text-base font-medium">Voltar</span>
        </button>

        <div class="flex items-center gap-3">
          <span class="cidade-brand text-2xl font-bold tracking-widest">Caminho Sem Volta</span>
        </div>

        <div class="flex items-center gap-4 text-2xl">
          <button
            class="cidade-header-link hidden sm:inline rounded-lg px-2 py-1 text-sm transition-colors"
          >
            PERFIL
          </button>

          <div class="relative" @click.stop>
            <button
              @click="alternarMenuConfiguracoes"
              class="cidade-header-link transition-colors"
              title="Abrir menu"
              aria-label="Abrir menu de configuracoes"
            >
              ⚙️
            </button>

            <div
              v-if="mostrarMenuConfiguracoes"
              class="cidade-settings-menu absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-xl backdrop-blur-md"
            >
              <button
                @click="irParaDashboard"
                class="cidade-settings-item block w-full rounded-xl px-4 py-2 text-left text-base transition-colors"
              >
                Personagem
              </button>
              <button
                @click="sair"
                class="cidade-settings-item-danger block w-full rounded-xl px-4 py-2 text-left text-base transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-8 sm:px-6 md:px-10 lg:py-10">
        <section class="mx-auto max-w-7xl space-y-8">
          <div class="space-y-3 text-center lg:text-left">
            <p class="tdl-kicker text-sm uppercase tracking-[0.35em]">Cartografia de Arcadia</p>
            <h1 class="tdl-titulo text-4xl font-bold tracking-wide sm:text-5xl">
              {{ nomeCidadeAtiva }}
            </h1>
          </div>

          <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div class="lg:col-span-3">
              <label class="tdl-label mb-1 block text-xs uppercase tracking-wide">Cidade</label>
              <v-select
                id="filtro-cidade"
                v-model="slugCidadeSelecionada"
                :options="opcoesSelectCidade"
                aria-label="Selecionar cidade"
                root-class="w-full"
              />
            </div>
            <div class="lg:col-span-5">
              <label class="tdl-label mb-1 block text-xs uppercase tracking-wide"
                >Mapa da cidade</label
              >
              <v-select
                id="filtro-mapa-cidade"
                v-model="idMapaCidadeSelecionado"
                :options="opcoesSelectMapaCidade"
                aria-label="Selecionar mapa da cidade"
                root-class="w-full"
              />
            </div>
          </div>

          <TemaDarkLight v-if="carregando" variante="aviso" class="rounded-2xl p-4"
            >Carregando mapas...</TemaDarkLight
          >

          <TemaDarkLight v-else-if="!mapaCidadeExibido" variante="aviso" class="rounded-2xl p-4">
            Nenhum mapa principal encontrado para esta cidade.
          </TemaDarkLight>

          <div v-else class="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <TemaDarkLight
              elemento="article"
              variante="painel"
              class="xl:col-span-9 rounded-3xl p-3 sm:p-4 lg:p-5"
            >
              <div class="cidade-map-frame relative overflow-hidden rounded-2xl">
                <div class="relative mx-auto w-fit max-w-full">
                  <img
                    :src="mapaCidadeExibido.imageUrl || mapaCidadeExibido.mapReference"
                    :alt="`Mapa da cidade ${mapaCidadeExibido.name}`"
                    class="block h-auto max-h-[75vh] max-w-full object-contain"
                  />

                  <button
                    v-for="ponto in pontosInteresseCidade"
                    :key="ponto.id"
                    @click.stop="abrirPonto(ponto)"
                    class="cidade-hotspot absolute -translate-x-1/2 -translate-y-1/2 group"
                    :style="{ left: `${ponto.x}%`, top: `${ponto.y}%` }"
                    :title="ponto.name"
                    :aria-label="`Abrir ponto ${ponto.name}`"
                  >
                    <span
                      class="cidade-hotspot-dot flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-lg transition-all group-hover:scale-110"
                    >
                      <span class="cidade-hotspot-core h-2.5 w-2.5 rounded-full" />
                    </span>

                    <span
                      class="pointer-events-none absolute left-1/2 -top-6 -translate-x-1/2 whitespace-nowrap rounded-md border border-black/50 bg-black/70 px-2 py-0.5 text-[10px] text-zinc-100"
                    >
                      {{ ponto.name }}
                    </span>
                  </button>
                </div>

                <div
                  class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070B14]/70 via-transparent to-transparent"
                />

                <div
                  class="cidade-map-name-badge pointer-events-none absolute left-4 top-4 rounded-xl px-3 py-2 text-xs backdrop-blur-sm sm:text-sm"
                >
                  {{ nomeCidadeAtiva }}
                </div>

                <div
                  class="cidade-map-status-badge pointer-events-none absolute bottom-4 right-4 rounded-xl px-3 py-2 text-xs backdrop-blur-sm sm:text-sm"
                >
                  {{ pontosProntos }} ponto(s) pronto(s) / {{ pontosInteresseCidade.length }} total
                </div>
              </div>
            </TemaDarkLight>

            <aside class="xl:col-span-3 space-y-4">
              <TemaDarkLight elemento="article" variante="cartao" class="rounded-3xl p-5">
                <h2 class="tdl-subtitulo text-xl font-semibold">Status do mapa</h2>
                <p class="tdl-texto-suave mt-3 text-sm leading-relaxed">
                  Clique nos pontos para abrir mapas localizados vinculados no painel mestre.
                </p>
              </TemaDarkLight>

              <TemaDarkLight elemento="article" variante="cartao" class="rounded-3xl p-5">
                <h3 class="tdl-kicker text-sm font-semibold uppercase tracking-widest">
                  Mapas Localizados
                </h3>
                <div class="mt-3 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                  <TemaDarkLight
                    v-for="mapaLocalizado in mapasLocalizados"
                    elemento="button"
                    variante="item"
                    :clicavel="true"
                    :key="mapaLocalizado.id"
                    @click="abrirMapaLocalizado(mapaLocalizado)"
                    class="w-full rounded-xl p-2 text-left transition-colors"
                  >
                    <p class="tdl-subtitulo truncate text-sm font-semibold">
                      {{ mapaLocalizado.name }}
                    </p>
                    <p class="tdl-texto-suave truncate text-xs">
                      {{ mapaLocalizado.description || 'Sem descricao' }}
                    </p>
                  </TemaDarkLight>
                </div>
              </TemaDarkLight>
            </aside>
          </div>

          <TemaDarkLight elemento="article" variante="cartao" class="rounded-3xl p-5">
            <h3 class="tdl-kicker text-sm font-semibold uppercase tracking-widest">
              Todos os mapas do RPG
            </h3>
            <div class="mt-3 max-h-[42vh] overflow-y-auto pr-1">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <TemaDarkLight
                  v-for="mapa in mapasOrdenados"
                  elemento="div"
                  variante="item"
                  :key="mapa.id"
                  class="rounded-xl p-3"
                >
                  <p class="tdl-subtitulo text-sm font-semibold">{{ mapa.name }}</p>
                  <p class="tdl-texto-suave text-xs">
                    {{ mapa.cityName }} | {{ mapa.mapType === 'city' ? 'Cidade' : 'Localizado' }}
                  </p>
                  <p class="tdl-texto-suave mt-1 line-clamp-2 text-xs">
                    {{ mapa.description || 'Sem descricao' }}
                  </p>
                </TemaDarkLight>
              </div>
            </div>
          </TemaDarkLight>
        </section>
      </main>
    </div>

    <Modal
      v-if="pontoSelecionado"
      :show-close-button="false"
      overlay-class="bg-black/75 p-4"
      panel-class="w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl shadow-black/60"
      body-class="p-0"
      @close="fecharPonto"
    >
      <div>
        <header
          class="flex items-start justify-between gap-4 border-b border-[#6B4E9E]/30 px-6 py-4"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-amber-300">Ponto do mapa</p>
            <h2 class="mt-1 text-2xl font-bold text-[#F5E6C8]">{{ pontoSelecionado.name }}</h2>
            <p class="mt-2 text-sm text-zinc-300">{{ pontoSelecionado.description }}</p>
          </div>

          <button
            @click="fecharPonto"
            class="rounded-xl border border-zinc-700/70 px-3 py-1 text-zinc-300 hover:border-zinc-400 hover:text-white"
          >
            Fechar
          </button>
        </header>

        <div class="p-4 sm:p-6">
          <div
            v-if="pontoSelecionado.localizedMapUrl"
            class="overflow-hidden rounded-2xl border border-[#6B4E9E]/30 bg-[#0B1426]"
          >
            <img
              :src="pontoSelecionado.localizedMapUrl"
              :alt="`Mapa localizado de ${pontoSelecionado.name}`"
              class="h-auto max-h-[65vh] w-full object-contain"
            />
          </div>

          <div
            v-else
            class="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-zinc-600/60 bg-[#0B1426] text-center"
          >
            <div>
              <p class="text-base text-zinc-300">Mapa localizado ainda nao definido.</p>
              <p class="mt-2 text-sm text-zinc-500">
                Vincule um mapa localizado para este ponto no painel mestre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </TemaDarkLight>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { listCityMapsForCityView as listarMapasCidadeParaCidadeView } from '@/lib/api/city-maps.api'
import type { CityMapApi, PointOfInterestApi } from '@/types/supabase'
import hamletMap from '@/assets/maps/hamlet.png'

interface PontoInteresseCidade extends PointOfInterestApi {
  status: 'pronto' | 'pendente'
}

interface DetalhePonto {
  name: string
  description: string
  localizedMapUrl?: string
}

const roteador = useRouter()
const lojaAuth = useAuthStore()
const mostrarMenuConfiguracoes = ref(false)
const pontoSelecionado = ref<DetalhePonto | null>(null)

const carregando = ref(false)
const mapasCidade = ref<CityMapApi[]>([])
const slugCidadeSelecionada = ref('hamlet')
const idMapaCidadeSelecionado = ref('')

const opcoesCidade = computed(() => {
  const mapaPorSlug = new Map<string, string>()
  mapasCidade.value.forEach((item) => {
    const slug = (item.citySlug || 'hamlet').trim() || 'hamlet'
    const nome = (item.cityName || 'Hamlet').trim() || 'Hamlet'
    if (!mapaPorSlug.has(slug)) mapaPorSlug.set(slug, nome)
  })
  if (!mapaPorSlug.size) mapaPorSlug.set('hamlet', 'Hamlet')

  return Array.from(mapaPorSlug.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const opcoesSelectCidade = computed(() =>
  opcoesCidade.value.map((cidade) => ({ value: cidade.slug, label: cidade.name })),
)

const mapasBaseCidade = computed(() =>
  mapasCidade.value.filter(
    (item) => item.citySlug === slugCidadeSelecionada.value && item.mapType === 'city',
  ),
)

const opcoesSelectMapaCidade = computed(() => {
  if (mapasBaseCidade.value.length) {
    return mapasBaseCidade.value.map((mapaCidade) => ({
      value: mapaCidade.id,
      label: mapaCidade.name,
    }))
  }

  if (slugCidadeSelecionada.value === 'hamlet') {
    return [{ value: '', label: 'Hamlet (legado)' }]
  }

  return [{ value: '', label: 'Sem mapa principal' }]
})

const mapasLocalizados = computed(() =>
  mapasCidade.value.filter(
    (item) => item.citySlug === slugCidadeSelecionada.value && item.mapType === 'localized',
  ),
)

const mapaLocalizadoPorId = computed(() => {
  const mapa = new Map<string, CityMapApi>()
  mapasLocalizados.value.forEach((item) => mapa.set(item.id, item))
  return mapa
})

const mapaCidadeAtivo = computed(() => {
  if (!mapasBaseCidade.value.length) return null
  const selecionado = mapasBaseCidade.value.find(
    (item) => item.id === idMapaCidadeSelecionado.value,
  )
  return selecionado || mapasBaseCidade.value[0]
})

const mapaCidadeLegadoFallback = computed<CityMapApi | null>(() => {
  if (mapaCidadeAtivo.value) return null
  if (slugCidadeSelecionada.value !== 'hamlet') return null

  return {
    id: 'legacy-hamlet',
    name: 'Hamlet',
    mapReference: hamletMap,
    description: 'Mapa legado exibido quando nao ha configuracao dinamica no painel mestre.',
    imageUrl: hamletMap,
    citySlug: 'hamlet',
    cityName: 'Hamlet',
    cityDescription: '',
    cityCulture: '',
    mapType: 'city',
    parentCityMapId: '',
    pointsOfInterest: [],
  }
})

const mapaCidadeExibido = computed(() => mapaCidadeAtivo.value || mapaCidadeLegadoFallback.value)

const nomeCidadeAtiva = computed(() => {
  const cidade = opcoesCidade.value.find((item) => item.slug === slugCidadeSelecionada.value)
  return cidade?.name || 'Cidade'
})

const pontosInteresseCidade = computed<PontoInteresseCidade[]>(() => {
  if (!mapaCidadeExibido.value) return []

  return (mapaCidadeExibido.value.pointsOfInterest || []).map((ponto) => ({
    ...ponto,
    status:
      ponto.targetCityMapId && mapaLocalizadoPorId.value.get(ponto.targetCityMapId)
        ? 'pronto'
        : 'pendente',
  }))
})

const pontosProntos = computed(
  () => pontosInteresseCidade.value.filter((ponto) => ponto.status === 'pronto').length,
)

const mapasOrdenados = computed(() =>
  [...mapasCidade.value].sort((a, b) => {
    const cidade = a.cityName.localeCompare(b.cityName)
    if (cidade !== 0) return cidade
    return a.name.localeCompare(b.name)
  }),
)

async function buscarMapas() {
  carregando.value = true
  try {
    const dados = await listarMapasCidadeParaCidadeView()
    mapasCidade.value = dados

    if (!opcoesCidade.value.find((item) => item.slug === slugCidadeSelecionada.value)) {
      slugCidadeSelecionada.value = opcoesCidade.value[0]?.slug || 'hamlet'
    }
    if (!mapasBaseCidade.value.find((item) => item.id === idMapaCidadeSelecionado.value)) {
      idMapaCidadeSelecionado.value = mapasBaseCidade.value[0]?.id || ''
    }
  } finally {
    carregando.value = false
  }
}

const voltar = () => {
  roteador.push({
    name: 'dashboard',
    query: lojaAuth.activeCharacterId ? { characterId: lojaAuth.activeCharacterId } : undefined,
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
    query: lojaAuth.activeCharacterId ? { characterId: lojaAuth.activeCharacterId } : undefined,
  })
}

const sair = async () => {
  fecharMenuConfiguracoes()
  try {
    await lojaAuth.signOut()
  } finally {
    roteador.push({ name: 'login' })
  }
}

const aoClicarJanela = () => {
  fecharMenuConfiguracoes()
}

const aoPressionarTeclaJanela = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && pontoSelecionado.value) {
    pontoSelecionado.value = null
  }

  if (event.key === 'Escape' && mostrarMenuConfiguracoes.value) {
    fecharMenuConfiguracoes()
  }
}

const abrirPonto = (ponto: PointOfInterestApi) => {
  const mapaLocalizado = ponto.targetCityMapId
    ? mapaLocalizadoPorId.value.get(ponto.targetCityMapId)
    : undefined

  pontoSelecionado.value = {
    name: ponto.name,
    description: ponto.description || mapaLocalizado?.description || 'Sem descricao.',
    localizedMapUrl: mapaLocalizado
      ? mapaLocalizado.imageUrl || mapaLocalizado.mapReference
      : undefined,
  }
}

const abrirMapaLocalizado = (mapaLocalizado: CityMapApi) => {
  pontoSelecionado.value = {
    name: mapaLocalizado.name,
    description: mapaLocalizado.description || 'Sem descricao.',
    localizedMapUrl: mapaLocalizado.imageUrl || mapaLocalizado.mapReference,
  }
}

const fecharPonto = () => {
  pontoSelecionado.value = null
}

watch(slugCidadeSelecionada, () => {
  if (!mapasBaseCidade.value.find((item) => item.id === idMapaCidadeSelecionado.value)) {
    idMapaCidadeSelecionado.value = mapasBaseCidade.value[0]?.id || ''
  }
})

onMounted(async () => {
  await buscarMapas()
  window.addEventListener('click', aoClicarJanela)
  window.addEventListener('keydown', aoPressionarTeclaJanela)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', aoClicarJanela)
  window.removeEventListener('keydown', aoPressionarTeclaJanela)
})
</script>

<style scoped>
.cidade-view {
  --cidade-map-shell: color-mix(in srgb, var(--bg-card) 92%, #fff 8%);
  --cidade-map-bg: color-mix(in srgb, var(--bg-card) 78%, #0b1426 22%);
  --cidade-map-ring: color-mix(in srgb, var(--brand-primary) 32%, #f59e0b 18%);

  background: var(--bg-page);
  color: var(--text-main);
}

.cidade-backdrop {
  background: linear-gradient(
    145deg,
    rgb(148 163 184 / 0.14),
    rgb(79 70 229 / 0.08),
    rgb(30 41 59 / 0.1)
  );
}

.cidade-header {
  border-bottom: 1px solid var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

.cidade-header-link {
  color: var(--text-muted);
}

.cidade-header-link:hover {
  color: var(--text-main);
}

.cidade-brand {
  color: var(--brand-primary);
}

.cidade-kicker {
  color: color-mix(in srgb, var(--brand-primary) 72%, #4f46e5 28%);
}

.cidade-title {
  color: var(--brand-primary);
  text-shadow: 0 6px 20px rgb(30 41 59 / 0.16);
}

.cidade-label {
  color: var(--text-muted);
}

.cidade-settings-menu {
  border: 1px solid var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 96%, #0f1c3a 4%);
}

.cidade-settings-item {
  color: var(--text-main);
}

.cidade-settings-item:hover {
  background: color-mix(in srgb, var(--accent-soft) 84%, transparent 16%);
}

.cidade-settings-item-danger {
  color: #fca5a5;
}

.cidade-settings-item-danger:hover {
  background: rgb(127 29 29 / 0.25);
}

.cidade-map-frame {
  border: 1px solid var(--border-soft);
  background: var(--cidade-map-bg);
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
}

.cidade-side-title {
  color: var(--text-main);
}

.cidade-muted {
  color: var(--text-muted);
}

.cidade-map-item-title {
  color: var(--text-main);
}

.cidade-hotspot-dot {
  border-color: color-mix(in srgb, var(--text-main) 70%, transparent 30%);
  background: color-mix(in srgb, var(--cidade-map-bg) 40%, transparent 60%);
}

.cidade-hotspot:hover .cidade-hotspot-dot {
  background: var(--cidade-map-bg);
}

.cidade-hotspot-core {
  background: color-mix(in srgb, var(--text-main) 90%, #fff 10%);
}

.cidade-map-name-badge {
  border: 1px solid color-mix(in srgb, var(--border-soft) 70%, transparent 30%);
  background: color-mix(in srgb, var(--bg-card) 86%, #0b1426 14%);
  color: var(--text-main);
}

.cidade-map-status-badge {
  border: 1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent 70%);
  background: color-mix(in srgb, var(--bg-card) 75%, #0d1424 25%);
  color: color-mix(in srgb, var(--text-main) 88%, #f59e0b 12%);
}

:global(html.theme-light) .cidade-view {
  --cidade-map-shell: color-mix(in srgb, var(--bg-card) 95%, #fff 5%);
  --cidade-map-bg: #f8fafc;
}

:global(html.theme-light) .cidade-map-name-badge {
  border-color: rgb(148 163 184 / 0.55);
  background: rgb(248 250 252 / 0.95);
  color: #0f172a;
}

:global(html.theme-light) .cidade-map-status-badge {
  border-color: rgb(148 163 184 / 0.55);
  background: rgb(248 250 252 / 0.96);
  color: #0f172a;
}

:global(html.theme-light) .cidade-backdrop {
  background: linear-gradient(
    145deg,
    rgb(148 163 184 / 0.14),
    rgb(79 70 229 / 0.08),
    rgb(30 41 59 / 0.1)
  );
}

:global(html.theme-dark) .cidade-backdrop {
  background: linear-gradient(
    145deg,
    rgb(15 23 42 / 0.84),
    rgb(30 41 59 / 0.78),
    rgb(31 27 74 / 0.76)
  );
}

:global(html.theme-dark) .cidade-header {
  background: rgb(2 6 23 / 0.68);
}

:global(html.theme-dark) .cidade-header-link {
  color: #cbd5e1;
}

:global(html.theme-dark) .cidade-header-link:hover {
  color: #f8fafc;
}

:global(html.theme-dark) .cidade-settings-menu {
  border-color: rgb(107 78 158 / 0.5);
  background: rgb(15 28 58 / 0.95);
}

:global(html.theme-dark) .cidade-settings-item:hover {
  background: rgb(42 27 74 / 0.6);
}

:global(html.theme-dark) .cidade-map-frame {
  border-color: rgb(107 78 158 / 0.28);
  background: #0b1426;
}

:global(html.theme-dark) .cidade-map-status-badge {
  border-color: rgb(251 191 36 / 0.28);
  background: rgb(13 20 36 / 0.85);
  color: rgb(253 230 138 / 0.95);
}
</style>
