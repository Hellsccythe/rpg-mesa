<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="titulos-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="titulos"
          aria-label="Abrir menu de navegacao"
          @select="handleNavSelect"
        />
        <h1 class="titulos-title text-xl font-bold tracking-widest">Títulos</h1>
        <div class="relative" @click.stop>
          <button
            @click="showSettingsMenu = !showSettingsMenu"
            class="text-zinc-400 hover:text-white transition-colors text-xl"
            aria-label="Abrir menu"
          >⚙️</button>
          <div
            v-if="showSettingsMenu"
            class="absolute right-0 mt-2 w-44 rounded-2xl border border-[#6B4E9E]/50 bg-[#0F1C3A]/95 p-2 shadow-xl backdrop-blur-md z-50"
          >
            <button
              @click="irParaPersonagem"
              class="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-200 hover:bg-[#2A1B4A] transition-colors"
            >
              Personagem
            </button>
            <button
              @click="logout"
              class="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-300 hover:bg-red-950/60 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64 text-zinc-400 text-lg animate-pulse">
          Carregando títulos...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex items-center justify-center h-64">
          <div class="text-center bg-black/40 border border-red-900/50 rounded-3xl p-8 max-w-md">
            <p class="text-red-300 text-lg">{{ error }}</p>
            <button @click="init" class="mt-4 px-6 py-2 bg-[#6B4E9E] rounded-2xl hover:brightness-110">
              Tentar novamente
            </button>
          </div>
        </div>

        <template v-else>
          <!-- Títulos do personagem -->
          <section v-if="character" class="mb-10">
            <h2 class="section-title text-2xl font-bold mb-4">Seus Títulos</h2>

            <div v-if="personagemTitulosComDetalhes.length === 0" class="titulos-empty-panel rounded-3xl border p-6 text-center text-zinc-400">
              Você ainda não possui nenhum título. Complete feitos notáveis para conquistá-los.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="pt in personagemTitulosComDetalhes"
                :key="pt.name"
                class="character-titulo-card rounded-3xl border p-5 cursor-pointer hover:-translate-y-0.5 transition-all"
                @click="abrirModal(pt)"
              >
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-base font-bold text-white leading-tight">{{ pt.name }}</h3>
                  <span v-if="pt.tier" class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ml-2 shrink-0" :class="tierBadgeClass(pt.tier)">
                    {{ pt.tier }}
                  </span>
                </div>

                <p v-if="pt.description" class="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                  {{ pt.description }}
                </p>

                <!-- Requisitos: visíveis apenas se não is_hidden ou se já possui -->
                <div v-if="mostrarRequisitos(pt) && requirementEntries(pt).length" class="mb-2">
                  <p class="text-xs text-zinc-500 mb-1">Requisitos:</p>
                  <div class="space-y-0.5">
                    <div v-for="[k, v] in requirementEntries(pt)" :key="k" class="text-xs text-zinc-400">
                      {{ k }}: {{ v }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-1 mt-2">
                  <span class="text-xs text-zinc-600">Conquistado em:</span>
                  <span class="text-xs text-zinc-500">{{ formatDate(pt.addedAt) }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Separador -->
          <div class="titulos-divider my-6 border-t" />

          <!-- Busca -->
          <div class="mb-6 flex items-center gap-3">
            <h2 class="section-title text-2xl font-bold shrink-0">Catálogo de Títulos</h2>
            <div class="flex-1 max-w-sm ml-auto">
              <label class="sr-only" for="titulo-search">Buscar título</label>
              <input
                id="titulo-search"
                v-model="busca"
                type="search"
                placeholder="Buscar título..."
                class="titulos-input w-full rounded-2xl border px-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <!-- Filtro por tier -->
          <div v-if="tiers.length > 1" class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="t in ['Todos', ...tiers]"
              :key="t"
              @click="filtroTier = t === 'Todos' ? '' : t"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
                (t === 'Todos' && !filtroTier) || filtroTier === t
                  ? 'bg-[#6B4E9E] border-[#6B4E9E] text-white'
                  : 'border-zinc-700/50 text-zinc-400 hover:border-[#6B4E9E]/50'
              ]"
            >
              {{ t }}
            </button>
          </div>

          <!-- Grid de títulos -->
          <div v-if="catalogoFiltrado.length === 0" class="text-center text-zinc-500 py-12">
            Nenhum título encontrado{{ busca ? ` para "${busca}"` : '' }}.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="titulo in catalogoFiltrado"
              :key="titulo.id"
              @click="abrirModal(titulo)"
              :class="[
                'titulo-card group cursor-pointer rounded-3xl border p-5 transition-all hover:-translate-y-1 hover:shadow-2xl',
                playerTemTitulo(titulo.name) ? 'titulo-card--owned' : 'titulo-card--available'
              ]"
            >
              <div class="flex items-start justify-between mb-2">
                <span v-if="titulo.tier" class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="tierBadgeClass(titulo.tier)">
                  {{ titulo.tier }}
                </span>
                <span v-if="playerTemTitulo(titulo.name)" class="text-amber-400 text-base ml-auto" title="Título conquistado">★</span>
                <span v-else-if="titulo.is_hidden && !playerTemTitulo(titulo.name)" class="text-zinc-600 text-base ml-auto" title="Requisitos ocultos">🔒</span>
              </div>

              <h3 class="text-base font-bold text-white mb-2 leading-tight">{{ titulo.name }}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">{{ titulo.description }}</p>

              <!-- Requisitos: ocultos se is_hidden e player não tem -->
              <div v-if="mostrarRequisitosCard(titulo) && requirementEntries(titulo).length" class="mt-3 space-y-0.5">
                <div v-for="[k, v] in requirementEntries(titulo)" :key="k" class="text-xs text-zinc-500">
                  {{ k }}: {{ v }}
                </div>
              </div>
              <div v-else-if="titulo.is_hidden && !playerTemTitulo(titulo.name)" class="mt-3 text-xs text-zinc-600 italic">
                Requisitos ocultos
              </div>

              <div class="mt-3 text-xs text-[#6B4E9E] group-hover:text-white transition-colors font-semibold">
                Ver detalhes →
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal: Detalhes do título -->
    <Modal
      v-if="modalTitulo"
      panel-class="max-w-md"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="fecharModal"
    >
      <template #header>
        <div class="flex items-center gap-3 flex-wrap">
          <span v-if="modalTitulo.tier" class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="tierBadgeClass(modalTitulo.tier)">
            {{ modalTitulo.tier }}
          </span>
          <h2 class="text-xl font-bold text-white">{{ modalTitulo.name }}</h2>
          <span v-if="playerTemTitulo(modalTitulo.name)" class="ml-auto text-amber-400 font-semibold text-sm">★ Conquistado</span>
        </div>
      </template>

      <p v-if="modalTitulo.description" class="text-zinc-300 text-sm leading-relaxed mb-5">
        {{ modalTitulo.description }}
      </p>

      <!-- Bônus -->
      <div v-if="bonusEntries(modalTitulo).length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Bônus</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="[stat, val] in bonusEntries(modalTitulo)"
            :key="stat"
            class="text-sm bg-amber-900/30 border border-amber-700/40 rounded-full px-3 py-1 text-amber-300"
          >
            +{{ val }} {{ stat }}
          </span>
        </div>
      </div>

      <!-- Requisitos -->
      <div v-if="mostrarRequisitos(modalTitulo) && requirementEntries(modalTitulo).length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Requisitos</p>
        <div class="space-y-1">
          <div v-for="[k, v] in requirementEntries(modalTitulo)" :key="k" class="text-sm text-zinc-300">
            {{ k }}: {{ v }}
          </div>
        </div>
      </div>

      <!-- Requisitos ocultos (is_hidden e não possui) -->
      <div v-else-if="modalTitulo.is_hidden && !playerTemTitulo(modalTitulo.name)" class="mb-5 rounded-2xl border border-zinc-700/40 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-500 italic">
        Os requisitos deste título são desconhecidos. Descubra como conquistá-lo.
      </div>

      <div class="flex justify-end">
        <button @click="fecharModal" class="px-6 py-3 rounded-2xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors">
          Fechar
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useTitulosStore } from '@/stores/titulos'
import type { TituloApi } from '@/lib/api/titulos.api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const titulosStore = useTitulosStore()

const loading = ref(true)
const error = ref<string | null>(null)
const busca = ref('')
const filtroTier = ref('')
const modalTitulo = ref<TituloApi | null>(null)
const showSettingsMenu = ref(false)

function irParaPersonagem() {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  if (characterId) router.push({ name: 'dashboard', query: { characterId } })
  else router.push({ name: 'dashboard' })
}

async function logout() {
  showSettingsMenu.value = false
  await authStore.sair()
  router.push({ name: 'login' })
}

// ── Navegação ──────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Títulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'notas', label: 'Notas de Aventura' },
]

function handleNavSelect(itemId: string) {
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  const withCharId = (path: string) =>
    characterId ? { path, query: { characterId } } : { path }

  const routeMap: Record<string, any> = {
    dashboard: characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    deuses: { path: '/deuses' },
    cidade: { path: '/cidade' },
    skills: withCharId('/skills'),
    titulos: withCharId('/titulos'),
    classes: withCharId('/classes'),
    npcs: withCharId('/npcs'),
    notas: withCharId('/notas'),
  }

  const target = routeMap[itemId]
  if (target) router.push(target)
}

// ── Personagem ─────────────────────────────────────────────────────────────
const character = computed(() => {
  const id = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  return charactersStore.myCharacters.find((c) => c.characterId === id) ?? null
})

const personagemTitulos = computed<any[]>(() => {
  const raw = character.value?.data?.titles
  return Array.isArray(raw) ? raw : []
})

// Enriquece com dados do catálogo
const personagemTitulosComDetalhes = computed(() => {
  return personagemTitulos.value.map((pt) => {
    const catalogo = titulosStore.catalogo.find(
      (t) => t.name?.toLowerCase() === String(pt.name ?? '').toLowerCase(),
    )
    return { ...catalogo, ...pt }
  })
})

function playerTemTitulo(name: string): boolean {
  return personagemTitulos.value.some(
    (t) => String(t.name ?? '').toLowerCase() === name.toLowerCase(),
  )
}

// ── Visibilidade de requisitos ──────────────────────────────────────────────
// linked_hidden_class → requisitos NUNCA visíveis
// is_hidden → visível apenas quando o player tem o título
function mostrarRequisitos(titulo: any): boolean {
  if (titulo.linked_hidden_class) return false
  if (titulo.is_hidden && !playerTemTitulo(titulo.name)) return false
  return true
}

function mostrarRequisitosCard(titulo: TituloApi): boolean {
  return mostrarRequisitos(titulo)
}

// ── Catálogo ───────────────────────────────────────────────────────────────
// linked_hidden_class só aparece se o player JÁ tem o título
const catalogoVisivelParaPlayer = computed(() => {
  return titulosStore.catalogo.filter((t) => {
    if (t.linked_hidden_class) return playerTemTitulo(t.name)
    return true
  })
})

const tiers = computed(() => {
  const set = new Set<string>()
  for (const t of catalogoVisivelParaPlayer.value) {
    if (t.tier) set.add(String(t.tier))
  }
  return [...set].sort()
})

const catalogoFiltrado = computed(() => {
  let lista = catalogoVisivelParaPlayer.value
  if (filtroTier.value) {
    lista = lista.filter((t) => String(t.tier ?? '') === filtroTier.value)
  }
  if (busca.value.trim()) {
    const q = busca.value.toLowerCase()
    lista = lista.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        (t.description as string)?.toLowerCase().includes(q),
    )
  }
  return lista
})

// ── Helpers ────────────────────────────────────────────────────────────────
function requirementEntries(titulo: any): [string, unknown][] {
  const raw = titulo.requirements
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
  return Object.entries(raw).filter(([, v]) => v != null)
}

function bonusEntries(titulo: any): [string, unknown][] {
  const raw = titulo.bonuses
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
  return Object.entries(raw).filter(([, v]) => v != null)
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

function tierBadgeClass(tier: string): string {
  if (tier === 'Lendário') return 'tier-badge--lendario'
  if (tier === 'Épico') return 'tier-badge--epico'
  if (tier === 'Raro') return 'tier-badge--raro'
  return 'tier-badge--comum'
}

// ── Modal ──────────────────────────────────────────────────────────────────
function abrirModal(titulo: TituloApi) {
  modalTitulo.value = titulo
}

function fecharModal() {
  modalTitulo.value = null
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  loading.value = true
  error.value = null
  try {
    const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
    await Promise.all([
      titulosStore.fetchCatalogo(),
      characterId && !character.value
        ? charactersStore.fetchCharacterById(characterId)
        : Promise.resolve(),
    ])
  } catch (err: any) {
    error.value = err?.message ?? 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

const onGlobalClick = () => { showSettingsMenu.value = false }

onMounted(() => {
  init()
  window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onGlobalClick)
})
</script>

<style scoped>
.titulos-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

:global(html.theme-dark) .titulos-header {
  background: rgb(2 6 23 / 0.68);
}

.titulos-title {
  color: var(--brand-primary);
}

.titulos-divider {
  border-color: var(--border-soft);
}

.section-title {
  color: var(--text-main);
}

.titulos-empty-panel {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-muted);
}

.titulos-input {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-main);
}

.titulos-input:focus {
  border-color: #b4882080;
}

.character-titulo-card {
  background: color-mix(in srgb, var(--bg-card) 88%, #b48820 12%);
  border-color: #b4882040;
}

:global(html.theme-dark) .character-titulo-card {
  background: #12180a;
}

.titulo-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}

:global(html.theme-dark) .titulo-card {
  background: #0f1c3a;
}

.titulo-card--available:hover {
  border-color: #b4882060;
  background: color-mix(in srgb, var(--bg-card) 85%, #b48820 15%);
}

.titulo-card--owned {
  border-color: #b4882040;
  background: color-mix(in srgb, var(--bg-card) 88%, #b48820 12%);
}

/* Tier badges */
.tier-badge--lendario {
  background: #3d1c02;
  color: #fb923c;
  border: 1px solid #c2410c40;
}

.tier-badge--epico {
  background: #2e1065;
  color: #c084fc;
  border: 1px solid #7c3aed40;
}

.tier-badge--raro {
  background: #1e3a5f;
  color: #60a5fa;
  border: 1px solid #3b82f640;
}

.tier-badge--incomum {
  background: #14532d;
  color: #86efac;
  border: 1px solid #16a34a40;
}

.tier-badge--comum {
  background: #292524;
  color: #a8a29e;
  border: 1px solid #44403c40;
}
</style>
