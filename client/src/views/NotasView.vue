<template>
  <div class="notas-view min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="notas-header sticky top-0 z-20 h-14 border-b flex items-center justify-between px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <HamburgerDrawerMenu
            :items="navItems"
            active-item-id="notas"
            aria-label="Abrir menu de navegacao"
            @select="handleNavSelect"
          />
          <button
            v-if="viewMode === 'book'"
            @click="voltarParaPrateleira"
            class="back-btn flex items-center gap-1.5 text-sm text-amber-300/80 hover:text-amber-300 transition-colors"
            aria-label="Voltar para prateleira de notas"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Notas
          </button>
        </div>

        <h1 class="notas-title text-lg font-bold tracking-widest font-cinzel truncate px-3">
          {{ viewMode === 'book' && notaSelecionada ? notaSelecionada.titulo : 'Notas & Lore' }}
        </h1>

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
            <button @click="irParaPersonagem" class="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-200 hover:bg-[#2A1B4A] transition-colors">
              Personagem
            </button>
            <button @click="logout" class="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-300 hover:bg-red-950/60 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- ═══════════════════════════════ PRATELEIRA ═══════════════════════════════ -->
      <main
        v-if="viewMode === 'shelf'"
        class="flex-1 flex flex-col px-4 sm:px-6 py-6 gap-6"
      >
        <div v-if="loadingNotas" class="flex-1 flex items-center justify-center">
          <span class="text-zinc-500 text-sm animate-pulse">Carregando notas...</span>
        </div>

        <template v-else>
          <!-- Título da seção -->
          <div class="text-center">
            <p class="text-zinc-500 text-sm font-light tracking-widest uppercase">Biblioteca de Lore</p>
          </div>

          <!-- Grid de notas -->
          <div class="notes-grid">
            <button
              v-for="nota in todasAsNotas"
              :key="nota.id"
              class="note-card group"
              @click="abrirNota(nota)"
              :aria-label="`Abrir ${nota.titulo}`"
            >
              <div class="note-card-inner">
                <div class="note-icon">{{ nota.tipo === 'static' ? '📖' : '📜' }}</div>
                <div class="note-card-body">
                  <h3 class="note-card-title">{{ nota.titulo }}</h3>
                  <p v-if="nota.subtitulo" class="note-card-sub">{{ nota.subtitulo }}</p>
                  <p class="note-card-meta">{{ nota.totalPaginas }} páginas</p>
                </div>
                <svg class="note-card-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>

            <!-- Estado vazio -->
            <div v-if="todasAsNotas.length === 0" class="col-span-full text-center py-12">
              <p class="text-zinc-600 text-sm">Nenhuma nota disponível no momento.</p>
            </div>
          </div>
        </template>
      </main>

      <!-- ═══════════════════════════════ LEITOR ═══════════════════════════════ -->
      <main
        v-else
        class="flex-1 flex flex-col items-center justify-center py-4 px-2 gap-4"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <!-- ─── SPREAD (desktop) ─── -->
        <div
          class="book-wrapper hidden sm:block"
          ref="bookWrapperRef"
          :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }"
        >
          <div class="book-scene">

            <!-- Idle -->
            <template v-if="flipState === 'idle'">
              <div class="page-slot page-slot--left">
                <BookPageContent :page="currentLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div class="book-spine" />
              <div class="page-slot page-slot--right">
                <BookPageContent :page="currentRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
            </template>

            <!-- Virando para frente -->
            <template v-else-if="flipDir === 'forward'">
              <div class="page-slot page-slot--left" style="z-index:1">
                <BookPageContent :page="pendingLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div class="book-spine" style="z-index:1" />
              <div class="page-slot page-slot--right" style="z-index:1">
                <BookPageContent :page="pendingRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div class="page-slot page-slot--left" style="z-index:2">
                <BookPageContent :page="currentLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div
                class="flip-card flip-fwd"
                :class="{ 'is-flipping': flipAnimating }"
                style="z-index:3"
                @transitionend="onFlipTransitionEnd"
              >
                <div class="flip-face flip-face--front">
                  <BookPageContent :page="currentRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
                </div>
                <div class="flip-face flip-face--back">
                  <BookPageContent :page="pendingLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
                </div>
              </div>
            </template>

            <!-- Virando para trás -->
            <template v-else>
              <div class="page-slot page-slot--left" style="z-index:1">
                <BookPageContent :page="pendingLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div class="book-spine" style="z-index:1" />
              <div class="page-slot page-slot--right" style="z-index:1">
                <BookPageContent :page="pendingRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div class="page-slot page-slot--right" style="z-index:2">
                <BookPageContent :page="currentRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
              </div>
              <div
                class="flip-card flip-bwd"
                :class="{ 'is-flipping': flipAnimating }"
                style="z-index:3"
                @transitionend="onFlipTransitionEnd"
              >
                <div class="flip-face flip-face--front">
                  <BookPageContent :page="currentLeft" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
                </div>
                <div class="flip-face flip-face--back">
                  <BookPageContent :page="pendingRight" :note-titulo="notaSelecionada?.titulo" @jump-to-page="jumpToSpread" />
                </div>
              </div>
            </template>

          </div>
        </div>

        <!-- ─── PÁGINA ÚNICA (mobile) ─── -->
        <div class="mobile-book block sm:hidden">
          <Transition :name="mobileTransitionName" mode="out-in">
            <div :key="mobilePageIdx" class="mobile-page">
              <BookPageContent
                :page="paginasAtuais[mobilePageIdx]"
                :note-titulo="notaSelecionada?.titulo"
                @jump-to-page="jumpMobile"
              />
            </div>
          </Transition>
        </div>

        <!-- Controles de navegação -->
        <div class="nav-bar flex items-center gap-4">
          <button
            class="nav-btn"
            :disabled="isAtStart"
            @click="goBack"
            aria-label="Página anterior"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div class="spread-dots">
            <button
              v-for="i in totalSpreads"
              :key="i"
              class="spread-dot"
              :class="{ 'spread-dot--active': (i - 1) === activeSpreadForDot }"
              @click="jumpToSpread(i - 1)"
              :aria-label="`Ir para spread ${i}`"
            />
          </div>

          <button
            class="nav-btn"
            :disabled="isAtEnd"
            @click="goForward"
            aria-label="Próxima página"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <!-- Zoom (desktop) -->
          <div class="zoom-controls hidden sm:flex items-center gap-1 ml-2">
            <button
              class="zoom-btn"
              :disabled="zoomLevel <= ZOOM_MIN"
              @click="zoomOut"
              aria-label="Reduzir zoom"
              title="Reduzir"
            >−</button>
            <span class="zoom-label">{{ Math.round(zoomLevel * 100) }}%</span>
            <button
              class="zoom-btn"
              :disabled="zoomLevel >= ZOOM_MAX"
              @click="zoomIn"
              aria-label="Aumentar zoom"
              title="Aumentar"
            >+</button>
          </div>
        </div>

        <p class="kbd-hint hidden sm:block text-xs">
          Use as setas ← → do teclado para virar as páginas
        </p>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import BookPageContent from '@/components/book/BookPageContent.vue'
import { useAuthStore } from '@/stores/auth'
import { PANTEAO_PAGES } from '@/data/panteao'
import { listLoreNotes } from '@/lib/api/lore-notes.api'
import type { LoreNoteApi } from '@/lib/api/lore-notes.api'
import type { BookPage, LoreNoteItem } from '@/types/book'

function notaApiParaPaginas(nota: LoreNoteApi): BookPage[] {
  const partes = nota.content.split(/\n---+\n/)
  return partes.map((parte, idx) => ({
    pageNumber: idx + 1,
    type: 'text' as const,
    gods: [],
    textContent: parte.trim(),
    noteTitle: idx === 0 ? nota.title : undefined,
    noteSubtitle: idx === 0 ? (nota.subtitle ?? undefined) : undefined,
  }))
}

// ── State ────────────────────────────────────────────────────────────────────
type ViewMode  = 'shelf' | 'book'
type FlipState = 'idle'  | 'flipping'
type FlipDir   = 'forward' | 'back'

const viewMode        = ref<ViewMode>('shelf')
const loadingNotas    = ref(false)
const notasDinamicas  = ref<LoreNoteApi[]>([])
const notaSelecionada = ref<LoreNoteItem | null>(null)
const paginasAtuais   = ref<BookPage[]>([])

// ── Zoom ─────────────────────────────────────────────────────────────────────
const ZOOM_MIN  = 0.7
const ZOOM_MAX  = 1.4
const ZOOM_STEP = 0.1
const zoomLevel = ref(1.0)
function zoomIn()  { zoomLevel.value = Math.min(ZOOM_MAX, +(zoomLevel.value + ZOOM_STEP).toFixed(1)) }
function zoomOut() { zoomLevel.value = Math.max(ZOOM_MIN, +(zoomLevel.value - ZOOM_STEP).toFixed(1)) }

const currentSpreadIdx  = ref(0)
const flipState         = ref<FlipState>('idle')
const flipDir           = ref<FlipDir>('forward')
const flipAnimating     = ref(false)
const pendingSpreadIdx  = ref(0)
const mobilePageIdx     = ref(0)
const mobileTransitionName = ref('page-slide-fwd')
const showSettingsMenu  = ref(false)

// ── Computed ─────────────────────────────────────────────────────────────────
const totalPaginas  = computed(() => paginasAtuais.value.length)
const totalSpreads  = computed(() => Math.ceil(totalPaginas.value / 2))

const currentLeft  = computed(() => paginasAtuais.value[currentSpreadIdx.value * 2])
const currentRight = computed(() => paginasAtuais.value[currentSpreadIdx.value * 2 + 1])
const pendingLeft  = computed(() => paginasAtuais.value[pendingSpreadIdx.value * 2])
const pendingRight = computed(() => paginasAtuais.value[pendingSpreadIdx.value * 2 + 1])

const isAtStart = computed(() =>
  currentSpreadIdx.value === 0 && mobilePageIdx.value === 0
)
const isAtEnd = computed(() =>
  currentSpreadIdx.value === totalSpreads.value - 1 &&
  mobilePageIdx.value === totalPaginas.value - 1
)
const activeSpreadForDot = computed(() =>
  window.innerWidth < 640
    ? Math.floor(mobilePageIdx.value / 2)
    : currentSpreadIdx.value
)

// ── Prateleira: montar lista de notas ────────────────────────────────────────
const NOTA_PANTEAO: LoreNoteItem = {
  id: 'panteao',
  titulo: 'Panteão de Elyra',
  subtitulo: 'Conhecimento Comum dos Mortais',
  tipo: 'static',
  totalPaginas: PANTEAO_PAGES.length,
  pages: PANTEAO_PAGES,
}

const todasAsNotas = computed<LoreNoteItem[]>(() => [
  NOTA_PANTEAO,
  ...notasDinamicas.value.map<LoreNoteItem>((n) => ({
    id: n.id,
    titulo: n.title,
    subtitulo: n.subtitle ?? undefined,
    tipo: 'dynamic',
    totalPaginas: n.content.split(/\n---+\n/).length,
    apiId: n.id,
    rawContent: n.content,
  })),
])

// ── Abrir nota ───────────────────────────────────────────────────────────────
function abrirNota(nota: LoreNoteItem) {
  notaSelecionada.value = nota

  if (nota.tipo === 'static' && nota.pages) {
    paginasAtuais.value = nota.pages
  } else {
    const apiNota = notasDinamicas.value.find((n) => n.id === nota.apiId)
    paginasAtuais.value = apiNota ? notaApiParaPaginas(apiNota) : []
  }

  currentSpreadIdx.value = 0
  mobilePageIdx.value = 0
  flipState.value = 'idle'
  flipAnimating.value = false
  viewMode.value = 'book'
}

function voltarParaPrateleira() {
  viewMode.value = 'shelf'
  notaSelecionada.value = null
}

// ── Navegação desktop ─────────────────────────────────────────────────────────
async function goForward() {
  if (window.innerWidth < 640) {
    if (mobilePageIdx.value < totalPaginas.value - 1) {
      mobileTransitionName.value = 'page-slide-fwd'
      mobilePageIdx.value++
    }
    return
  }
  if (flipState.value !== 'idle' || currentSpreadIdx.value >= totalSpreads.value - 1) return
  pendingSpreadIdx.value = currentSpreadIdx.value + 1
  flipDir.value = 'forward'
  flipState.value = 'flipping'
  flipAnimating.value = false
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => { flipAnimating.value = true }))
}

async function goBack() {
  if (window.innerWidth < 640) {
    if (mobilePageIdx.value > 0) {
      mobileTransitionName.value = 'page-slide-bwd'
      mobilePageIdx.value--
    }
    return
  }
  if (flipState.value !== 'idle' || currentSpreadIdx.value <= 0) return
  pendingSpreadIdx.value = currentSpreadIdx.value - 1
  flipDir.value = 'back'
  flipState.value = 'flipping'
  flipAnimating.value = false
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => { flipAnimating.value = true }))
}

function onFlipTransitionEnd(e: TransitionEvent) {
  if (e.propertyName !== 'transform') return
  currentSpreadIdx.value = pendingSpreadIdx.value
  mobilePageIdx.value = currentSpreadIdx.value * 2
  flipState.value = 'idle'
  flipAnimating.value = false
}

function jumpToSpread(spreadIdx: number) {
  if (flipState.value !== 'idle') return
  currentSpreadIdx.value = Math.max(0, Math.min(totalSpreads.value - 1, spreadIdx))
  mobilePageIdx.value = currentSpreadIdx.value * 2
}

function jumpMobile(spreadIdx: number) {
  const page = Math.max(0, Math.min(totalPaginas.value - 1, spreadIdx * 2))
  mobileTransitionName.value = page > mobilePageIdx.value ? 'page-slide-fwd' : 'page-slide-bwd'
  mobilePageIdx.value = page
}

// ── Swipe ────────────────────────────────────────────────────────────────────
let touchStartX = 0, touchStartY = 0

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].clientX
  touchStartY = e.changedTouches[0].clientY
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48) {
    dx < 0 ? goForward() : goBack()
  }
}

// ── Teclado ──────────────────────────────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  if (viewMode.value !== 'book') return
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goForward() }
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); goBack() }
  if (e.key === 'Escape') voltarParaPrateleira()
}

// ── Navegação da app ──────────────────────────────────────────────────────────
const route    = useRoute()
const router   = useRouter()
const authStore = useAuthStore()

const navItems = [
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses',    label: 'Deuses' },
  { id: 'cidade',    label: 'Cidade' },
  { id: 'skills',    label: 'Skills' },
  { id: 'titulos',   label: 'Titulos' },
  { id: 'classes',   label: 'Classes' },
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas',        label: 'Notas de Aventura' },
]

function handleNavSelect(itemId: string) {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  const withChar = (path: string) => characterId ? { path, query: { characterId } } : { path }
  const map: Record<string, any> = {
    dashboard:    characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    deuses:       { path: '/deuses' },
    cidade:       withChar('/cidade'),
    skills:       withChar('/skills'),
    titulos:      withChar('/titulos'),
    classes:      withChar('/classes'),
    equipamentos: withChar('/equipamentos'),
    notas:        withChar('/notas'),
  }
  if (map[itemId]) router.push(map[itemId])
}

function irParaPersonagem() {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  router.push(characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' })
}

async function logout() {
  showSettingsMenu.value = false
  await authStore.sair()
  router.push({ name: 'login' })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('click', () => { showSettingsMenu.value = false })

  loadingNotas.value = true
  try {
    const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '') || undefined
    notasDinamicas.value = await listLoreNotes(characterId)
  } catch {
    // sem notas dinâmicas, continua com estáticas
  } finally {
    loadingNotas.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.font-cinzel { font-family: 'Cinzel', serif; }

/* ── Header ── */
.notas-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

:global(html.theme-dark) .notas-header {
  background: rgb(2 6 23 / 0.68);
}

.notas-title { color: #c8a050; text-shadow: 0 0 20px #c8a05040; }

.back-btn { font-family: 'Cinzel', serif; font-size: 0.75rem; letter-spacing: 0.04em; }

/* ── Prateleira ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.note-card {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px #c8a05030;
}

.note-card-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #f5e8ce 0%, #edddb0 100%);
  border: 1px solid #c9a87c60;
  border-radius: 12px;
  padding: 16px 14px;
  position: relative;
  overflow: hidden;
}

/* textura pergaminho sutil */
.note-card-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 10% 20%, rgba(180,130,60,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 90% 80%, rgba(140,90,30,0.06) 0%, transparent 50%);
  pointer-events: none;
}

.note-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
  line-height: 1;
}

.note-card-body {
  flex: 1;
  min-width: 0;
}

.note-card-title {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a0e08;
  line-height: 1.3;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-card-sub {
  font-family: 'EB Garamond', serif;
  font-size: 0.72rem;
  font-style: italic;
  color: #4a3520;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-card-meta {
  font-size: 0.62rem;
  color: #7a6040;
  margin: 0;
  letter-spacing: 0.04em;
}

.note-card-arrow {
  color: #9a7a3a;
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
}

.note-card:hover .note-card-arrow {
  opacity: 1;
  transform: translateX(3px);
}

/* ── Livro ── */
.book-wrapper {
  width: min(940px, 94vw);
  filter: drop-shadow(0 28px 56px rgba(0,0,0,0.75));
}

.book-scene {
  position: relative;
  display: flex;
  width: 100%;
  height: min(calc(100vh - 10rem), 820px);
  perspective: 1800px;
  perspective-origin: 50% 38%;
  background: #1a0e06;
  border-radius: 3px 3px 2px 2px;
  overflow: hidden;
}

/* ── Slots de página ── */
.page-slot {
  position: absolute;
  top: 0;
  width: calc(50% - 3px);
  height: 100%;
  overflow: hidden;
}

.page-slot--left  { left: 0; }
.page-slot--right { right: 0; }

.page-slot--left::after,
.page-slot--right::before {
  content: '';
  position: absolute;
  top: 0;
  width: 32px;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.page-slot--left::after {
  right: 0;
  background: linear-gradient(to right, transparent, rgba(0,0,0,0.15));
}

.page-slot--right::before {
  left: 0;
  background: linear-gradient(to left, transparent, rgba(0,0,0,0.15));
}

/* ── Lombada ── */
.book-spine {
  position: absolute;
  left: calc(50% - 3px);
  width: 6px;
  height: 100%;
  background: linear-gradient(to right, #080402, #1e1006, #2a1a0a, #1e1006, #080402);
  z-index: 20;
  flex-shrink: 0;
}

/* ── Flip card ── */
.flip-card {
  position: absolute;
  top: 0;
  height: 100%;
  width: calc(50% - 3px);
  transform-style: preserve-3d;
  transition: transform 860ms cubic-bezier(0.645, 0.045, 0.355, 1.000);
  will-change: transform;
}

.flip-fwd {
  right: 0;
  transform-origin: left center;
}

.flip-fwd.is-flipping { transform: rotateY(-180deg); }

.flip-bwd {
  left: 0;
  transform-origin: right center;
}

.flip-bwd.is-flipping { transform: rotateY(180deg); }

/* Faces do cartão */
.flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
}

.flip-face--back { transform: rotateY(180deg); }

/* Sombra dinâmica durante o flip */
.flip-fwd .flip-face--front { box-shadow: -4px 0 12px rgba(0,0,0,0.2); }
.flip-fwd.is-flipping .flip-face--front { box-shadow: -12px 0 28px rgba(0,0,0,0.45); }
.flip-bwd .flip-face--front { box-shadow: 4px 0 12px rgba(0,0,0,0.2); }
.flip-bwd.is-flipping .flip-face--front { box-shadow: 12px 0 28px rgba(0,0,0,0.45); }

/* ── Mobile ── */
.mobile-book {
  width: min(420px, 96vw);
  height: min(calc(100vh - 9rem), 680px);
  filter: drop-shadow(0 16px 32px rgba(0,0,0,0.6));
  border-radius: 2px;
  overflow: hidden;
}

.mobile-page { width: 100%; height: 100%; }

/* Transições mobile */
.page-slide-fwd-enter-active,
.page-slide-fwd-leave-active,
.page-slide-bwd-enter-active,
.page-slide-bwd-leave-active {
  transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

.page-slide-fwd-enter-from { opacity: 0; transform: translateX(36px); }
.page-slide-fwd-leave-to   { opacity: 0; transform: translateX(-36px); }
.page-slide-bwd-enter-from { opacity: 0; transform: translateX(-36px); }
.page-slide-bwd-leave-to   { opacity: 0; transform: translateX(36px); }

/* ── Nav bar ── */
.nav-bar {
  user-select: none;
  position: relative;
  z-index: 30;
  background: rgba(10, 15, 28, 0.65);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 160, 80, 0.18);
  border-radius: 999px;
  padding: 6px 14px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #c8a05040;
  background: #1a1408;
  color: #c8a050;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, opacity 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #2a2010;
  border-color: #c8a05080;
}

.nav-btn:disabled { opacity: 0.3; cursor: default; }

.spread-dots { display: flex; gap: 5px; align-items: center; }

.spread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3a2a10;
  border: 1px solid #c8a05025;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.spread-dot--active {
  background: #c8a050;
  border-color: #c8a050;
  width: 18px;
  border-radius: 3px;
}

.spread-dot:hover:not(.spread-dot--active) { background: #6a5030; }

/* ── Zoom ── */
.zoom-controls {
  border-left: 1px solid #c8a05020;
  padding-left: 10px;
  gap: 4px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid #c8a05040;
  background: #1a1408;
  color: #c8a050;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
  user-select: none;
}

.zoom-btn:hover:not(:disabled) {
  background: #2a2010;
  border-color: #c8a05080;
}

.zoom-btn:disabled { opacity: 0.3; cursor: default; }

.zoom-label {
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  color: #c8a050;
  min-width: 34px;
  text-align: center;
  letter-spacing: 0.03em;
}

/* Reserva espaço vertical para a escala do livro */
.book-wrapper {
  transition: transform 0.2s ease;
}

.kbd-hint {
  color: #4a3a20;
  font-style: italic;
  font-size: 0.62rem;
  letter-spacing: 0.03em;
  position: relative;
  z-index: 30;
}
</style>
