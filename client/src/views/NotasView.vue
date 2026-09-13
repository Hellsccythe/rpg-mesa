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
                <!-- Capa personalizada vira miniatura; sem ela, o ícone do formato. -->
                <img v-if="nota.capaUrl" :src="nota.capaUrl" alt="" class="note-capa" />
                <div v-else class="note-icon">{{ ICONE_DO_FORMATO[nota.formato] }}</div>
                <div class="note-card-body">
                  <h3 class="note-card-title">{{ nota.titulo }}</h3>
                  <p v-if="nota.subtitulo" class="note-card-sub">{{ nota.subtitulo }}</p>
                  <p class="note-card-meta">{{ nota.formato !== 'livro' ? 'uma folha' : `${nota.totalPaginas} ${nota.totalPaginas === 1 ? 'página' : 'páginas'}` }}</p>
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
      <main v-else class="flex-1 flex flex-col items-center justify-center py-4 px-2">
        <PergaminhoLeitor
          v-if="notaSelecionada && notaSelecionada.formato !== 'livro'"
          :key="notaSelecionada.id"
          :paginas="paginasAtuais"
          :titulo="notaSelecionada.titulo"
          :subtitulo="notaSelecionada.subtitulo"
          :formato="notaSelecionada.formato"
        />
        <LivroLeitor
          v-else-if="notaSelecionada"
          :key="notaSelecionada.id"
          :paginas="paginasAtuais"
          :titulo="notaSelecionada.titulo"
          :subtitulo="notaSelecionada.subtitulo"
          :note-titulo="notaSelecionada.titulo"
          :imagem-da-capa="notaSelecionada.capaUrl ?? undefined"
          :imagem-da-contracapa="notaSelecionada.contracapaUrl ?? undefined"
          @fechar="voltarParaPrateleira"
        />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import LivroLeitor from '@/components/book/LivroLeitor.vue'
import PergaminhoLeitor from '@/components/book/PergaminhoLeitor.vue'
import { useAuthStore } from '@/stores/auth'
import { PANTEAO_PAGES } from '@/data/panteao'
import { listLoreNotes, ICONE_DO_FORMATO } from '@/lib/api/lore-notes.api'
import type { LoreNoteApi } from '@/lib/api/lore-notes.api'
import { useCharactersStore } from '@/stores/characters'
import type { NotaDeAventura } from '@/lib/api/personagens.api'
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

const viewMode        = ref<ViewMode>('shelf')
const loadingNotas    = ref(false)
const notasDinamicas  = ref<LoreNoteApi[]>([])
const notaSelecionada = ref<LoreNoteItem | null>(null)
const paginasAtuais   = ref<BookPage[]>([])

const showSettingsMenu  = ref(false)

// ── Prateleira: montar lista de notas ────────────────────────────────────────
const NOTA_PANTEAO: LoreNoteItem = {
  id: 'panteao',
  titulo: 'Panteão de Elyra',
  subtitulo: 'Conhecimento Comum dos Mortais',
  tipo: 'static',
  formato: 'livro',
  totalPaginas: PANTEAO_PAGES.length,
  pages: PANTEAO_PAGES,
}

// ── Diário de aventura ───────────────────────────────────────────────────────
// As notas que o mestre escreve sobre o personagem (data.adventureNotes). O
// dashboard mostra as três últimas; o livro tem todas, uma por página. A API
// do jogador já vem sem as ocultas; o mestre vê todas, com o aviso.
const notasDeAventura = ref<NotaDeAventura[]>([])

function formatarDataDaNota(iso?: string): string {
  if (!iso) return ''
  const data = new Date(iso)
  return Number.isNaN(data.getTime()) ? '' : data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

const paginasDoDiario = computed<BookPage[]>(() =>
  notasDeAventura.value.map((nota, idx) => ({
    pageNumber: idx + 1,
    type: 'text' as const,
    gods: [],
    textContent: nota.text,
    noteTitle: idx === 0 ? 'Diário de Aventura' : undefined,
    noteSubtitle: [formatarDataDaNota(nota.addedAt), nota.oculta ? 'oculta do jogador' : ''].filter(Boolean).join(' · ') || undefined,
  })),
)

const NOTA_DIARIO = computed<LoreNoteItem | null>(() =>
  paginasDoDiario.value.length
    ? { id: 'diario', titulo: 'Diário de Aventura', subtitulo: 'O que o mestre anotou sobre você', tipo: 'static', formato: 'livro', totalPaginas: paginasDoDiario.value.length, pages: paginasDoDiario.value }
    : null,
)

const todasAsNotas = computed<LoreNoteItem[]>(() => [
  ...(NOTA_DIARIO.value ? [NOTA_DIARIO.value] : []),
  NOTA_PANTEAO,
  ...notasDinamicas.value.map<LoreNoteItem>((n) => ({
    id: String(n.id),
    titulo: n.title,
    subtitulo: n.subtitle ?? undefined,
    tipo: 'dynamic',
    formato: n.formato ?? 'livro',
    capaUrl: n.capa_url,
    contracapaUrl: n.contracapa_url,
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

  viewMode.value = 'book'
}

function voltarParaPrateleira() {
  viewMode.value = 'shelf'
  notaSelecionada.value = null
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
  window.addEventListener('click', () => { showSettingsMenu.value = false })

  loadingNotas.value = true
  try {
    const characterId = Number(route.query.characterId ?? authStore.idPersonagemAtivo ?? 0) || undefined
    const [lore, personagem] = await Promise.all([
      listLoreNotes(characterId),
      characterId ? useCharactersStore().fetchCharacterById(characterId).catch(() => null) : Promise.resolve(null),
    ])
    notasDinamicas.value = lore
    const notas = (personagem as any)?.data?.adventureNotes
    notasDeAventura.value = Array.isArray(notas) ? notas : []
  } catch {
    // sem notas dinâmicas, continua com estáticas
  } finally {
    loadingNotas.value = false
  }
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
.note-capa {
  width: 2.4rem;
  height: 3.3rem;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
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

</style>
