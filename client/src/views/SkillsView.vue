<template>
  <div class="sv-root min-h-screen text-white relative overflow-x-hidden">
    <!-- Ambient glow -->
    <div class="sv-bg absolute inset-0 pointer-events-none" />
    <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
    <div class="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- ══ Header ══════════════════════════════════════════════════════════ -->
      <header class="sv-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6 backdrop-blur-md">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="skills"
          aria-label="Abrir menu de navegacao"
          @select="handleNavSelect"
        />
        <span class="sv-title font-cinzel text-base font-bold tracking-widest uppercase">Skills</span>
        <div class="relative" @click.stop>
          <button
            @click="showSettingsMenu = !showSettingsMenu"
            class="h-9 w-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <Transition name="dropdown">
            <div v-if="showSettingsMenu" class="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10 bg-zinc-900/95 p-1.5 shadow-xl backdrop-blur-md z-50">
              <button @click="irParaPersonagem" class="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 transition-colors">Personagem</button>
              <button @click="logout" class="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/50 transition-colors">Logout</button>
            </div>
          </Transition>
        </div>
      </header>

      <main class="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center h-64 gap-3">
          <div class="w-8 h-8 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p class="text-zinc-500 text-sm">Carregando skills...</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex items-center justify-center h-64">
          <div class="text-center rounded-2xl border border-red-900/40 bg-red-950/20 px-8 py-6 max-w-sm">
            <p class="text-red-400 text-sm mb-4">{{ error }}</p>
            <button @click="init" class="px-5 py-2 rounded-xl bg-red-800/50 text-red-200 text-sm hover:bg-red-700/50 transition-colors">Tentar novamente</button>
          </div>
        </div>

        <template v-else>
          <!-- ══ Suas Skills ════════════════════════════════════════════════ -->
          <section v-if="character" class="mb-12">
            <div class="flex items-center gap-3 mb-5">
              <div class="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
              <h2 class="sv-section-title text-xs font-bold uppercase tracking-[0.3em] text-violet-400/80">Suas Skills</h2>
              <div class="h-px flex-1 bg-gradient-to-l from-violet-500/30 to-transparent" />
            </div>

            <!-- Vazio -->
            <div v-if="personagemSkills.length === 0" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
              <div class="text-3xl mb-3 opacity-30">✦</div>
              <p class="text-zinc-500 text-sm">Você ainda não possui nenhuma skill.</p>
              <p class="text-zinc-600 text-xs mt-1">Skills são concedidas pelo mestre ou ao escolher uma classe.</p>
            </div>

            <!-- Grid de skills possuídas -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="ps in personagemSkillsComDetalhes"
                :key="ps.name"
                class="sv-owned-card group relative rounded-2xl border border-violet-500/20 bg-violet-950/10 p-4 hover:border-violet-500/35 hover:bg-violet-950/20 transition-all"
              >
                <!-- Glow bar top -->
                <div class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

                <div class="flex items-start justify-between gap-2 mb-2.5">
                  <h3 class="text-sm font-bold text-white leading-tight">{{ ps.name }}</h3>
                  <span v-if="ps.type" :class="typeBadgeClass(String(ps.type))" class="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
                    {{ ps.type }}
                  </span>
                </div>

                <p v-if="ps.effect_description || ps.description" class="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-3">
                  {{ ps.effect_description || ps.description }}
                </p>

                <!-- Stats rápidos -->
                <div class="flex flex-wrap gap-1.5 mb-3">
                  <span v-if="ps.damage_base" class="sv-stat-chip sv-stat-red">⚔ {{ ps.damage_base }}</span>
                  <span v-if="ps.custo" class="sv-stat-chip sv-stat-blue">◆ {{ ps.custo }}</span>
                  <span v-if="ps.cooldown" class="sv-stat-chip sv-stat-amber">⏱ {{ ps.cooldown }}t</span>
                  <span v-if="ps.range" class="sv-stat-chip sv-stat-teal">◎ {{ ps.range }}</span>
                </div>

                <div class="flex items-center gap-1.5 pt-2 border-t border-white/[0.05]">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-600 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  <span class="text-[0.65rem] text-zinc-600">{{ formatDate(ps.addedAt) }}</span>
                  <span v-if="ps.addedBy" class="text-[0.65rem] text-zinc-700 truncate">· {{ ps.addedBy }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ══ Catálogo ═══════════════════════════════════════════════════ -->
          <div class="flex items-center gap-3 mb-5">
            <div class="h-px flex-1 bg-gradient-to-r from-indigo-500/30 to-transparent" />
            <h2 class="sv-section-title text-xs font-bold uppercase tracking-[0.3em] text-indigo-400/80">Catálogo de Skills</h2>
            <div class="h-px flex-1 bg-gradient-to-l from-indigo-500/30 to-transparent" />
          </div>

          <!-- Busca + filtros -->
          <div class="flex flex-col sm:flex-row gap-3 mb-5">
            <!-- Search -->
            <div class="relative flex-1 max-w-sm">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                id="skill-search"
                v-model="busca"
                type="search"
                placeholder="Buscar skill..."
                class="sv-search w-full rounded-xl border bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <!-- Tipo chips -->
            <div v-if="tipos.length > 1" class="flex flex-wrap gap-1.5">
              <button
                v-for="t in ['Todos', ...tipos]"
                :key="t"
                @click="filtroTipo = t === 'Todos' ? '' : t"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all border',
                  (t === 'Todos' && !filtroTipo) || filtroTipo === t
                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'border-white/10 text-zinc-500 hover:border-violet-500/40 hover:text-zinc-300'
                ]"
              >
                {{ t }}
              </button>
            </div>
          </div>

          <!-- Vazio catálogo -->
          <div v-if="catalogoFiltrado.length === 0" class="text-center text-zinc-600 py-16">
            <div class="text-3xl mb-3 opacity-20">🔍</div>
            <p class="text-sm">Nenhuma skill encontrada{{ busca ? ` para "${busca}"` : '' }}.</p>
          </div>

          <!-- Grid catálogo -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <div
              v-for="skill in catalogoFiltrado"
              :key="skill.id"
              @click="abrirModal(skill)"
              class="sv-catalog-card group relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              :class="playerTemSkill(skill.name) ? 'sv-card-owned' : 'sv-card-default'"
            >
              <!-- Owned indicator top bar -->
              <div v-if="playerTemSkill(skill.name)" class="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

              <div class="flex items-start justify-between gap-2 mb-2.5">
                <span v-if="skill.type" :class="typeBadgeClass(String(skill.type))" class="text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  {{ skill.type }}
                </span>
                <span v-if="playerTemSkill(skill.name)" class="ml-auto text-emerald-400 text-sm font-bold shrink-0">✓</span>
              </div>

              <h3 class="text-sm font-bold text-zinc-100 mb-1.5 leading-tight group-hover:text-white transition-colors">{{ skill.name }}</h3>
              <p class="text-xs text-zinc-500 leading-relaxed line-clamp-2 mb-3">
                {{ skill.effect_description || skill.description || '—' }}
              </p>

              <!-- Stats rápidos -->
              <div class="flex flex-wrap gap-1 mb-3">
                <span v-if="skill.damage_base" class="sv-stat-chip sv-stat-red">⚔ {{ skill.damage_base }}</span>
                <span v-if="skill.custo" class="sv-stat-chip sv-stat-blue">◆ {{ skill.custo }}</span>
                <span v-if="skill.cooldown" class="sv-stat-chip sv-stat-amber">⏱ {{ skill.cooldown }}t</span>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                <span v-if="skill.raca_vinculada?.length" class="text-[0.6rem] text-violet-400/70 truncate">{{ skill.raca_vinculada.join(', ') }}</span>
                <span v-else class="text-[0.6rem] text-transparent">_</span>
                <span class="text-[0.6rem] text-zinc-600 group-hover:text-violet-400 transition-colors font-semibold shrink-0">detalhes →</span>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- ══ Modal: Detalhes da skill ════════════════════════════════════════ -->
    <Modal
      v-if="modalSkill"
      panel-class="max-w-md"
      body-class="!p-0"
      :show-close-button="false"
      :close-on-backdrop="true"
      @close="fecharModal"
    >
      <!-- Header gradiente full-bleed — sem slot #header para evitar o wrapper flex do Modal.vue -->
      <div class="relative px-5 pt-5 pb-4 sv-modal-header">
        <div class="absolute inset-0 sv-modal-header-bg" />
        <div class="relative">
          <div class="flex items-center gap-2 mb-2">
            <span v-if="modalSkill.type" :class="typeBadgeClass(String(modalSkill.type))" class="text-[0.6rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
              {{ modalSkill.type }}
            </span>
            <span v-if="playerTemSkill(modalSkill.name)" class="text-emerald-400 text-xs font-semibold">✓ Adquirida</span>
          </div>
          <h2 class="font-cinzel font-bold text-white text-xl leading-tight">{{ modalSkill.name }}</h2>
        </div>
        <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/30 flex items-center justify-center text-zinc-300 text-xl hover:bg-black/50 hover:text-white transition-colors" @click="fecharModal">×</button>
      </div>

      <div class="px-5 py-5 space-y-4">
        <!-- Descrição principal -->
        <p v-if="modalSkill.description" class="text-sm text-zinc-300 leading-relaxed">
          {{ modalSkill.description }}
        </p>

        <!-- Efeito (se diferente da descrição) -->
        <div v-if="modalSkill.effect_description && modalSkill.effect_description !== modalSkill.description" class="rounded-xl border-l-2 border-violet-500/50 bg-violet-950/20 pl-3 pr-4 py-2.5">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-violet-400/60 mb-1">Efeito</p>
          <p class="text-xs text-zinc-300 leading-relaxed">{{ modalSkill.effect_description }}</p>
        </div>

        <!-- Grid de stats -->
        <div class="grid grid-cols-2 gap-2">
          <div v-if="modalSkill.damage_base" class="sv-stat-block sv-stat-block-red">
            <p class="sv-stat-label">Dano</p>
            <p class="sv-stat-value">{{ modalSkill.damage_base }}<span v-if="modalSkill.multiplicador_atributo?.length" class="sv-stat-suffix"> + {{ formatMultiplicador(modalSkill.multiplicador_atributo) }}</span></p>
          </div>
          <div v-if="modalSkill.custo" class="sv-stat-block sv-stat-block-blue">
            <p class="sv-stat-label">Custo</p>
            <p class="sv-stat-value">{{ modalSkill.custo }}</p>
          </div>
          <div v-if="modalSkill.cooldown" class="sv-stat-block sv-stat-block-amber">
            <p class="sv-stat-label">Cooldown</p>
            <p class="sv-stat-value">{{ modalSkill.cooldown }} turno{{ modalSkill.cooldown !== 1 ? 's' : '' }}</p>
          </div>
          <div v-if="modalSkill.range" class="sv-stat-block sv-stat-block-teal">
            <p class="sv-stat-label">Alcance</p>
            <p class="sv-stat-value">{{ modalSkill.range }}</p>
          </div>
        </div>

        <!-- Raça vinculada -->
        <div v-if="modalSkill.raca_vinculada?.length" class="flex flex-wrap items-center gap-2">
          <span class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Raça:</span>
          <span v-for="r in (modalSkill.raca_vinculada as string[])" :key="r" class="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-violet-900/30 border border-violet-700/40 text-violet-300">{{ r }}</span>
        </div>

        <!-- Classe requerida -->
        <div v-if="modalSkill.required_class" class="flex items-center gap-2">
          <span class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Classe:</span>
          <span class="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300">{{ modalSkill.required_class }}</span>
        </div>

        <!-- Bônus de status legado -->
        <div v-if="statBonusEntries(modalSkill).length">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500 mb-2">Bônus de Status</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="[stat, val] in statBonusEntries(modalSkill)"
              :key="stat"
              class="text-xs bg-emerald-900/25 border border-emerald-700/30 rounded-full px-3 py-1 text-emerald-300"
            >
              +{{ val }} {{ stat }}
            </span>
          </div>
        </div>

        <!-- Requisitos legado -->
        <div v-if="requirementEntries(modalSkill).length">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500 mb-2">Requisitos</p>
          <div class="space-y-1">
            <p v-for="[k, v] in requirementEntries(modalSkill)" :key="k" class="text-xs text-zinc-400">
              <span class="text-zinc-500">{{ k }}:</span> {{ v }}
            </p>
          </div>
        </div>

        <!-- Campos extras -->
        <div v-if="camposExtras(modalSkill).length" class="space-y-1.5">
          <div v-for="[k, v] in camposExtras(modalSkill)" :key="k" class="text-xs">
            <span class="text-zinc-500">{{ traduzirCampo(k) }}:</span>
            <span class="text-zinc-300 ml-1.5">{{ traduzirValor(k, v) }}</span>
          </div>
        </div>

        <!-- Auditoria -->
        <div v-if="modalSkill.created_by || modalSkill.updated_by" class="pt-3 border-t border-white/[0.05] space-y-0.5">
          <p v-if="modalSkill.created_by" class="text-[0.6rem] text-zinc-600">Criado por: <span class="text-zinc-500">{{ modalSkill.created_by }}</span></p>
          <p v-if="modalSkill.updated_by" class="text-[0.6rem] text-zinc-600">Atualizado por: <span class="text-zinc-500">{{ modalSkill.updated_by }}</span></p>
        </div>
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
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
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
    racas: withCharId('/racas'),
    equipamentos: withCharId('/equipamentos'),
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

// ── Type badge colors ──────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  'ativo':    'bg-blue-900/40 border border-blue-600/40 text-blue-300',
  'passivo':  'bg-emerald-900/40 border border-emerald-600/40 text-emerald-300',
  'suporte':  'bg-amber-900/40 border border-amber-600/40 text-amber-300',
  'ultimate': 'bg-red-900/40 border border-red-600/40 text-red-300',
  'racial':   'bg-violet-900/40 border border-violet-600/40 text-violet-300',
}

function typeBadgeClass(type: string): string {
  return TYPE_COLORS[type.toLowerCase()] ?? 'bg-indigo-900/40 border border-indigo-600/40 text-indigo-300'
}

function formatMultiplicador(m: string[][] | null | undefined): string {
  if (!m?.length) return ''
  return m.flat().join('/')
}

// ── Helpers ────────────────────────────────────────────────────────────────
const CAMPOS_RESERVADOS = new Set([
  'id', 'name', 'description', 'type', 'category', 'raca_vinculada', 'stat_bonuses',
  'requirements', 'class_id', 'created_at', 'updated_at', 'deleted_at',
  'deleted_by', 'created_by', 'updated_by', 'addedBy', 'addedAt', 'is_secret',
  'damage_base', 'effect_description', 'custo', 'cooldown', 'range',
  'required_class', 'multiplicador_atributo', 'nivel_minimo_classe',
  'skill_tipo_item', 'skill_categoria_item', 'skill_tipo_dano_item', 'skill_natureza_item',
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
.sv-root {
  background: #060b14;
}
.sv-bg {
  background: radial-gradient(ellipse at 30% 0%, #0f1c3a 0%, #060b14 55%, #0a0514 100%);
}

.sv-header {
  border-color: rgba(255,255,255,0.06);
  background: rgba(6,11,20,0.75);
}

.sv-title {
  background: linear-gradient(135deg, #c8a96e 0%, #f0d080 50%, #c8a96e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Search */
.sv-search {
  border-color: rgba(255,255,255,0.08);
}
.sv-search:focus {
  border-color: rgba(139,92,246,0.45);
}

/* Stat chips inline */
.sv-stat-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  border-width: 1px;
  border-style: solid;
}
.sv-stat-red   { background: rgba(153,27,27,0.25);  border-color: rgba(239,68,68,0.3);   color: #fca5a5; }
.sv-stat-blue  { background: rgba(29,78,216,0.2);   border-color: rgba(96,165,250,0.3);  color: #93c5fd; }
.sv-stat-amber { background: rgba(146,64,14,0.25);  border-color: rgba(251,191,36,0.3);  color: #fcd34d; }
.sv-stat-teal  { background: rgba(13,148,136,0.2);  border-color: rgba(45,212,191,0.3);  color: #5eead4; }

/* Owned skill cards */
.sv-owned-card {
  background: rgba(109,40,217,0.06);
}

/* Catalog cards */
.sv-catalog-card {
  background: rgba(255,255,255,0.02);
}
.sv-card-default {
  border-color: rgba(255,255,255,0.07);
}
.sv-card-default:hover {
  border-color: rgba(139,92,246,0.35);
  background: rgba(109,40,217,0.08);
  box-shadow: 0 8px 32px rgba(109,40,217,0.12);
}
.sv-card-owned {
  border-color: rgba(34,197,94,0.2);
  background: rgba(21,128,61,0.06);
}
.sv-card-owned:hover {
  border-color: rgba(34,197,94,0.35);
  box-shadow: 0 8px 32px rgba(21,128,61,0.1);
}

/* Modal header */
.sv-modal-header {
  min-height: 96px;
}
.sv-modal-header-bg {
  background: linear-gradient(135deg, #1a0a3e 0%, #1e1b4b 60%, #0f1c3a 100%);
}

/* Stat blocks in modal */
.sv-stat-block {
  border-radius: 0.75rem;
  border-width: 1px;
  border-style: solid;
  padding: 0.5rem 0.75rem;
}
.sv-stat-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.15rem;
  opacity: 0.6;
}
.sv-stat-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f1f5f9;
}
.sv-stat-suffix {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.7;
}
.sv-stat-block-red   { background: rgba(153,27,27,0.2);  border-color: rgba(239,68,68,0.25);  }
.sv-stat-block-red .sv-stat-label   { color: #f87171; }
.sv-stat-block-blue  { background: rgba(29,78,216,0.15); border-color: rgba(96,165,250,0.25); }
.sv-stat-block-blue .sv-stat-label  { color: #93c5fd; }
.sv-stat-block-amber { background: rgba(146,64,14,0.2);  border-color: rgba(251,191,36,0.25); }
.sv-stat-block-amber .sv-stat-label { color: #fcd34d; }
.sv-stat-block-teal  { background: rgba(13,148,136,0.15);border-color: rgba(45,212,191,0.25); }
.sv-stat-block-teal .sv-stat-label  { color: #5eead4; }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }

:global(html.theme-light) .sv-root { background: #f0f4ff; }
:global(html.theme-light) .sv-bg   { background: radial-gradient(ellipse at 30% 0%, #e0e8ff 0%, #f0f4ff 55%, #f5f0ff 100%); }
:global(html.theme-light) .sv-header { background: rgba(240,244,255,0.85); border-color: rgba(0,0,0,0.08); }
:global(html.theme-light) .sv-catalog-card { background: rgba(255,255,255,0.7); }
:global(html.theme-light) .sv-card-default { border-color: rgba(0,0,0,0.08); }
:global(html.theme-light) .sv-card-default:hover { border-color: rgba(109,40,217,0.3); background: rgba(109,40,217,0.04); }
:global(html.theme-light) .sv-search { background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.1); color: #1e1b4b; }
</style>
