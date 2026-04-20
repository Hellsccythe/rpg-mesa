<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="skills-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="skills"
          aria-label="Abrir menu de navegacao"
          @select="handleNavSelect"
        />
        <h1 class="skills-title text-xl font-bold tracking-widest">Skills</h1>
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
          Carregando skills...
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
          <!-- Skills do personagem -->
          <section v-if="character" class="mb-10">
            <h2 class="section-title text-2xl font-bold mb-4">Suas Skills</h2>

            <div v-if="personagemSkills.length === 0" class="skills-empty-panel rounded-3xl border p-6 text-center text-zinc-400">
              Você ainda não possui nenhuma skill. Skills são concedidas pelo mestre ou ao escolher uma classe.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="ps in personagemSkillsComDetalhes"
                :key="ps.name"
                class="character-skill-card rounded-3xl border p-5"
              >
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-base font-bold text-white leading-tight">{{ ps.name }}</h3>
                  <span v-if="ps.type" class="type-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full ml-2 shrink-0">
                    {{ ps.type }}
                  </span>
                </div>

                <p v-if="ps.description" class="text-xs text-zinc-400 leading-relaxed mb-3">
                  {{ ps.description }}
                </p>

                <!-- Bônus de status -->
                <div v-if="statBonusEntries(ps).length" class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="[stat, val] in statBonusEntries(ps)"
                    :key="stat"
                    class="stat-bonus-badge text-xs rounded-full px-2 py-0.5"
                  >
                    +{{ val }} {{ stat }}
                  </span>
                </div>

                <!-- Origem -->
                <div class="flex items-center gap-1 mt-2">
                  <span class="text-xs text-zinc-600">Obtida em:</span>
                  <span class="text-xs text-zinc-500">{{ formatDate(ps.addedAt) }}</span>
                </div>
                <div v-if="ps.addedBy" class="text-xs text-zinc-600 truncate">
                  por {{ ps.addedBy }}
                </div>
              </div>
            </div>
          </section>

          <!-- Separador -->
          <div class="skills-divider my-6 border-t" />

          <!-- Busca -->
          <div class="mb-6 flex items-center gap-3">
            <h2 class="section-title text-2xl font-bold shrink-0">Catálogo de Skills</h2>
            <div class="flex-1 max-w-sm ml-auto">
              <label class="sr-only" for="skill-search">Buscar skill</label>
              <input
                id="skill-search"
                v-model="busca"
                type="search"
                placeholder="Buscar skill..."
                class="skills-input w-full rounded-2xl border px-4 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <!-- Filtro por tipo -->
          <div v-if="tipos.length > 1" class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="t in ['Todos', ...tipos]"
              :key="t"
              @click="filtroTipo = t === 'Todos' ? '' : t"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
                (t === 'Todos' && !filtroTipo) || filtroTipo === t
                  ? 'bg-[#6B4E9E] border-[#6B4E9E] text-white'
                  : 'border-zinc-700/50 text-zinc-400 hover:border-[#6B4E9E]/50'
              ]"
            >
              {{ t }}
            </button>
          </div>

          <!-- Grid de skills -->
          <div v-if="catalogoFiltrado.length === 0" class="text-center text-zinc-500 py-12">
            Nenhuma skill encontrada{{ busca ? ` para "${busca}"` : '' }}.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="skill in catalogoFiltrado"
              :key="skill.id"
              @click="abrirModal(skill)"
              :class="[
                'skill-card group cursor-pointer rounded-3xl border p-5 transition-all hover:-translate-y-1 hover:shadow-2xl',
                playerTemSkill(skill.name) ? 'skill-card--owned' : 'skill-card--available'
              ]"
            >
              <div class="flex items-start justify-between mb-2">
                <span v-if="skill.type" class="type-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  {{ skill.type }}
                </span>
                <span v-if="playerTemSkill(skill.name)" class="text-emerald-400 text-base ml-auto" title="Você já possui esta skill">✓</span>
              </div>

              <h3 class="text-base font-bold text-white mb-2 leading-tight">{{ skill.name }}</h3>
              <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">{{ skill.description }}</p>

              <!-- Bônus preview -->
              <div v-if="statBonusEntries(skill).length" class="mt-3 flex flex-wrap gap-1">
                <span
                  v-for="[stat, val] in statBonusEntries(skill)"
                  :key="stat"
                  class="stat-bonus-badge text-xs rounded-full px-2 py-0.5"
                >
                  +{{ val }} {{ stat }}
                </span>
              </div>

              <div class="mt-3 text-xs text-[#6B4E9E] group-hover:text-white transition-colors font-semibold">
                Ver detalhes →
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal: Detalhes da skill -->
    <Modal
      v-if="modalSkill"
      panel-class="max-w-md"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="fecharModal"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span v-if="modalSkill.type" class="type-badge text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
            {{ modalSkill.type }}
          </span>
          <h2 class="text-xl font-bold text-white">{{ modalSkill.name }}</h2>
          <span v-if="playerTemSkill(modalSkill.name)" class="ml-auto text-emerald-400 font-semibold text-sm">✓ Adquirida</span>
        </div>
      </template>

      <p v-if="modalSkill.description" class="text-zinc-300 text-sm leading-relaxed mb-5">
        {{ modalSkill.description }}
      </p>

      <!-- Bônus de status -->
      <div v-if="statBonusEntries(modalSkill).length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Bônus de Status</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="[stat, val] in statBonusEntries(modalSkill)"
            :key="stat"
            class="text-sm bg-emerald-900/30 border border-emerald-700/40 rounded-full px-3 py-1 text-emerald-300"
          >
            +{{ val }} {{ stat }}
          </span>
        </div>
      </div>

      <!-- Requisitos -->
      <div v-if="requirementEntries(modalSkill).length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Requisitos</p>
        <div class="space-y-1">
          <div
            v-for="[k, v] in requirementEntries(modalSkill)"
            :key="k"
            class="text-sm text-zinc-300"
          >
            {{ k }}: {{ v }}
          </div>
        </div>
      </div>

      <!-- Campos extras desconhecidos -->
      <div v-if="camposExtras(modalSkill).length" class="mb-5 space-y-2">
        <div v-for="[k, v] in camposExtras(modalSkill)" :key="k" class="text-sm">
          <span class="text-zinc-500">{{ traduzirCampo(k) }}:</span>
          <span class="text-zinc-300 ml-2">{{ traduzirValor(k, v) }}</span>
        </div>
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
import { useSkillsStore } from '@/stores/skills'
import type { SkillApi } from '@/lib/api/skills.api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const skillsStore = useSkillsStore()

const loading = ref(true)
const error = ref<string | null>(null)
const busca = ref('')
const filtroTipo = ref('')
const modalSkill = ref<SkillApi | null>(null)
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
  { id: 'titulos', label: 'Titulos' },
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

const personagemSkills = computed<any[]>(() => {
  const raw = character.value?.data?.skills
  return Array.isArray(raw) ? raw : []
})

// Enriquece as skills do personagem com dados do catálogo
const personagemSkillsComDetalhes = computed(() => {
  return personagemSkills.value.map((ps) => {
    const catalogo = skillsStore.catalogo.find(
      (s) => s.name?.toLowerCase() === String(ps.name ?? '').toLowerCase(),
    )
    return { ...catalogo, ...ps }
  })
})

function playerTemSkill(skillName: string): boolean {
  return personagemSkills.value.some(
    (s) => String(s.name ?? '').toLowerCase() === skillName.toLowerCase(),
  )
}

// ── Catálogo ───────────────────────────────────────────────────────────────
const catalogo = computed(() => skillsStore.catalogo)

const tipos = computed(() => {
  const set = new Set<string>()
  for (const s of catalogo.value) {
    if (s.type) set.add(String(s.type))
  }
  return [...set].sort()
})

const catalogoFiltrado = computed(() => {
  let lista = catalogo.value
  if (filtroTipo.value) {
    lista = lista.filter((s) => String(s.type ?? '') === filtroTipo.value)
  }
  if (busca.value.trim()) {
    const q = busca.value.toLowerCase()
    lista = lista.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        (s.description as string)?.toLowerCase().includes(q),
    )
  }
  return lista
})

// ── Helpers ────────────────────────────────────────────────────────────────
const CAMPOS_RESERVADOS = new Set([
  'id', 'name', 'description', 'type', 'category', 'stat_bonuses',
  'requirements', 'class_id', 'created_at', 'updated_at', 'deleted_at',
  'deleted_by', 'addedBy', 'addedAt', 'is_secret',
])

function statBonusEntries(skill: any): [string, unknown][] {
  const raw = skill.stat_bonuses
  if (!raw) return []
  const obj = typeof raw === 'string' ? tryParse(raw) : raw
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) return Object.entries(obj)
  return []
}

function requirementEntries(skill: any): [string, unknown][] {
  const raw = skill.requirements
  if (!raw) return []
  const obj = typeof raw === 'string' ? tryParse(raw) : raw
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) return Object.entries(obj)
  return []
}

function camposExtras(skill: any): [string, unknown][] {
  return Object.entries(skill).filter(
    ([k, v]) =>
      !CAMPOS_RESERVADOS.has(k) &&
      v != null &&
      typeof v !== 'object' &&
      !Array.isArray(v),
  ) as [string, unknown][]
}

const TRADUCAO_CAMPOS: Record<string, string> = {
  effect_description: 'Descrição do Efeito',
  cooldown: 'Tempo de Recarga',
  range: 'Alcance',
  class_id: 'Classe',
  mana_cost: 'Custo de Mana',
  stamina_cost: 'Custo de Stamina',
  cast_time: 'Tempo de Conjuração',
  duration: 'Duração',
  level_required: 'Nível Mínimo',
  damage: 'Dano',
  damage_display: 'Dano',
  damage_type: 'Tipo de Dano',
  healing: 'Cura',
  target: 'Alvo',
}

const TRADUCAO_VALORES: Record<string, string> = {
  self: 'a si mesmo',
  melee: 'corpo a corpo',
  ranged: 'à distância',
  touch: 'toque',
  aoe: 'área',
  line: 'linha',
  cone: 'cone',
  short: 'curto',
  medium: 'médio',
  long: 'longo',
}

function traduzirCampo(key: string): string {
  return TRADUCAO_CAMPOS[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

function traduzirValor(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value
  return TRADUCAO_VALORES[value.toLowerCase()] ?? value
}

function tryParse(str: string): unknown {
  try { return JSON.parse(str) } catch { return null }
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}

// ── Modal ──────────────────────────────────────────────────────────────────
function abrirModal(skill: SkillApi) {
  modalSkill.value = skill
}

function fecharModal() {
  modalSkill.value = null
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  loading.value = true
  error.value = null
  try {
    const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
    await Promise.all([
      skillsStore.fetchCatalogo(),
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

onMounted(() => {
  init()
  window.addEventListener('click', () => { showSettingsMenu.value = false })
})

onBeforeUnmount(() => {
  window.removeEventListener('click', () => { showSettingsMenu.value = false })
})
</script>

<style scoped>
.skills-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

:global(html.theme-dark) .skills-header {
  background: rgb(2 6 23 / 0.68);
}

.skills-title {
  color: var(--brand-primary);
}

.skills-divider {
  border-color: var(--border-soft);
}

.section-title {
  color: var(--text-main);
}

.skills-empty-panel {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-muted);
}

.skills-input {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-main);
}

.skills-input:focus {
  border-color: #6B4E9E80;
}

.character-skill-card {
  background: color-mix(in srgb, var(--bg-card) 90%, #6B4E9E 10%);
  border-color: #6B4E9E40;
}

:global(html.theme-dark) .character-skill-card {
  background: #111a2d;
}

.skill-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}

:global(html.theme-dark) .skill-card {
  background: #0f1c3a;
}

.skill-card--available:hover {
  border-color: #6B4E9E80;
  background: color-mix(in srgb, var(--bg-card) 85%, #6B4E9E 15%);
}

.skill-card--owned {
  border-color: #22c55e30;
  background: color-mix(in srgb, var(--bg-card) 90%, #22c55e 10%);
}

.type-badge {
  background: #1e3a5f;
  color: #93c5fd;
  border: 1px solid #3b82f640;
}

:global(html.theme-light) .type-badge {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #3b82f640;
}

.stat-bonus-badge {
  background: #14532d40;
  border: 1px solid #15803d40;
  color: #86efac;
}

:global(html.theme-light) .stat-bonus-badge {
  background: #dcfce7;
  border: 1px solid #16a34a40;
  color: #15803d;
}
</style>
