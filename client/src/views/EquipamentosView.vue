<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="eq-bg absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="eq-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="equipamentos"
          aria-label="Abrir menu de navegação"
          @select="handleNavSelect"
        />
        <h1 class="eq-title text-xl font-bold tracking-widest">Equipamentos</h1>
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

        <!-- Título -->
        <div class="mb-8">
          <h2 class="eq-section-title text-3xl font-bold tracking-wide mb-1">Arsenal de Equipamentos</h2>
          <p class="text-zinc-400 text-sm">Itens, armaduras, ferramentas e acessórios disponíveis na campanha</p>
        </div>

        <!-- Filtros -->
        <div class="mb-6 flex flex-wrap gap-3">
          <div class="flex-1 min-w-[180px]">
            <input
              v-model="filtroNome"
              type="text"
              placeholder="Buscar por nome..."
              class="eq-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>
          <div class="min-w-[140px]">
            <div class="relative">
              <select
                v-model="filtroCategoria"
                class="eq-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition-colors appearance-none pr-8"
              >
                <option value="">Todas as categorias</option>
                <option v-for="cat in categoriasUnicas" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">˅</span>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="carregando" class="flex items-center justify-center h-64 text-zinc-400 animate-pulse">
          Carregando equipamentos...
        </div>

        <!-- Erro -->
        <div v-else-if="erro" class="flex items-center justify-center h-64">
          <div class="text-center bg-black/40 border border-red-900/50 rounded-3xl p-8 max-w-md">
            <p class="text-red-300 text-lg">Não foi possível carregar os equipamentos.</p>
            <button @click="carregar" class="mt-4 px-6 py-2 bg-[#6B4E9E] rounded-2xl hover:brightness-110 text-sm">
              Tentar novamente
            </button>
          </div>
        </div>

        <!-- Grid de cards -->
        <template v-else>
          <div v-if="equipamentosFiltrados.length === 0" class="eq-empty rounded-3xl border p-8 text-center text-zinc-400">
            Nenhum equipamento encontrado.
          </div>

          <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <button
              v-for="eq in equipamentosFiltrados"
              :key="eq.id"
              @click="selecionado = eq"
              class="eq-card rounded-3xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
            >
              <!-- Cabeçalho do card -->
              <div class="flex items-start justify-between gap-2 mb-3">
                <h3 class="eq-card-name text-base font-bold leading-tight">{{ eq.nome }}</h3>
                <span class="eq-tipo-badge shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="tipoBadgeClass(eq.tipo)">
                  {{ eq.tipo }}
                </span>
              </div>

              <!-- Categoria -->
              <p v-if="eq.categoria_equipamento" class="eq-categoria mb-2 text-xs uppercase tracking-widest">
                {{ eq.categoria_equipamento }}
              </p>

              <!-- Descrição -->
              <p class="eq-desc line-clamp-3 text-sm leading-relaxed mb-3">
                {{ eq.descricao_equipamento || 'Sem descrição cadastrada.' }}
              </p>

              <!-- Rodapé: peso e valor -->
              <div class="flex items-center gap-3 text-xs eq-footer-text">
                <span v-if="eq.peso !== null">⚖ {{ eq.peso.toFixed(2) }} kg</span>
                <span v-if="eq.valor !== null">◈ {{ eq.valor.toFixed(2) }}</span>
              </div>

              <p class="mt-3 text-xs eq-ver-mais">Ver detalhes →</p>
            </button>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal de detalhes -->
    <Transition name="eq-modal">
      <div
        v-if="selecionado"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/70"
        @click.self="selecionado = null"
      >
        <div class="eq-modal-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border overflow-hidden">
          <!-- Header modal -->
          <div class="eq-modal-header flex items-start justify-between border-b px-6 py-5">
            <div class="flex-1 min-w-0">
              <h2 class="eq-modal-name text-2xl font-bold">{{ selecionado.nome }}</h2>
              <div class="flex flex-wrap items-center gap-2 mt-1">
                <span class="eq-tipo-badge rounded-full px-2.5 py-0.5 text-xs font-semibold" :class="tipoBadgeClass(selecionado.tipo)">
                  {{ selecionado.tipo }}
                </span>
                <span v-if="selecionado.categoria_equipamento" class="eq-categoria text-xs uppercase tracking-widest">
                  {{ selecionado.categoria_equipamento }}
                </span>
              </div>
            </div>
            <button
              @click="selecionado = null"
              class="eq-close-btn ml-4 shrink-0 rounded-xl px-3 py-1.5 text-sm transition-colors"
            >
              Fechar
            </button>
          </div>

          <!-- Corpo modal -->
          <div class="eq-modal-body max-h-[60vh] overflow-y-auto px-6 py-5 space-y-4">
            <div v-if="selecionado.descricao_equipamento">
              <p class="eq-modal-label mb-1 text-xs uppercase tracking-widest">Descrição</p>
              <p class="eq-modal-text text-sm leading-relaxed">{{ selecionado.descricao_equipamento }}</p>
            </div>

            <div v-if="selecionado.pre_requisitos">
              <p class="eq-modal-label mb-1 text-xs uppercase tracking-widest">Pré-requisitos</p>
              <p class="eq-modal-text text-sm leading-relaxed">{{ selecionado.pre_requisitos }}</p>
            </div>

            <div v-if="selecionado.propriedades">
              <p class="eq-modal-label mb-1 text-xs uppercase tracking-widest">Propriedades</p>
              <p class="eq-modal-text text-sm leading-relaxed">{{ selecionado.propriedades }}</p>
            </div>

            <div class="flex flex-wrap gap-4">
              <div v-if="selecionado.peso !== null">
                <p class="eq-modal-label mb-0.5 text-xs uppercase tracking-widest">Peso</p>
                <p class="eq-modal-text text-sm font-semibold">{{ selecionado.peso.toFixed(2) }} kg</p>
              </div>
              <div v-if="selecionado.valor !== null">
                <p class="eq-modal-label mb-0.5 text-xs uppercase tracking-widest">Valor</p>
                <p class="eq-modal-text text-sm font-semibold">{{ selecionado.valor.toFixed(2) }} moedas</p>
              </div>
            </div>
          </div>

          <!-- Footer modal -->
          <div class="eq-modal-footer border-t px-6 py-4 flex justify-end">
            <button
              @click="selecionado = null"
              class="eq-modal-close-btn rounded-xl px-6 py-2 text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { useAuthStore } from '@/stores/auth'
import { listarArmasPublicas } from '@/lib/api/armas.api'
import type { ArmaApi } from '@/lib/api/armas.api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const equipamentos = ref<ArmaApi[]>([])
const carregando = ref(false)
const erro = ref(false)
const filtroNome = ref('')
const filtroCategoria = ref('')
const selecionado = ref<ArmaApi | null>(null)
const showSettingsMenu = ref(false)

const navItems = [
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Títulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas', label: 'Notas de Aventura' },
]

function handleNavSelect(itemId: string) {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  const withCharId = (path: string) => characterId ? { path, query: { characterId } } : { path }

  const routeMap: Record<string, any> = {
    dashboard: characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    deuses:        { path: '/deuses' },
    cidade:        { path: '/cidade' },
    skills:        withCharId('/skills'),
    titulos:       withCharId('/titulos'),
    classes:       withCharId('/classes'),
    npcs:          withCharId('/npcs'),
    equipamentos:  withCharId('/equipamentos'),
    notas:         withCharId('/notas'),
  }
  const target = routeMap[itemId]
  if (target) router.push(target)
}

const categoriasUnicas = computed(() => {
  const cats = equipamentos.value
    .map((e) => e.categoria_equipamento)
    .filter((c): c is string => !!c)
  return [...new Set(cats)].sort()
})

const equipamentosFiltrados = computed(() => {
  const nome = filtroNome.value.trim().toLowerCase()
  const cat = filtroCategoria.value
  return equipamentos.value.filter((e) => {
    const matchNome = !nome || e.nome.toLowerCase().includes(nome)
    const matchCat = !cat || e.categoria_equipamento === cat
    return matchNome && matchCat
  })
})

function tipoBadgeClass(tipo: string): string {
  const t = (tipo || '').toLowerCase()
  if (t.includes('armadura') || t.includes('armor')) return 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
  if (t.includes('escudo') || t.includes('shield')) return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
  if (t.includes('ferramenta') || t.includes('tool')) return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  if (t.includes('vestuario') || t.includes('roupa') || t.includes('cloth')) return 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
  if (t.includes('acessorio') || t.includes('anel') || t.includes('colar')) return 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
  return 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30'
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

async function carregar() {
  carregando.value = true
  erro.value = false
  try {
    equipamentos.value = await listarArmasPublicas()
  } catch {
    erro.value = true
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
/* ── Header ──────────────────────────────────────────────────────────────── */
.eq-header {
  background: rgb(10 15 28 / 0.88);
  border-color: rgb(107 78 158 / 0.3);
  backdrop-filter: blur(12px);
}
.eq-title { color: #a78bfa; }

/* ── Filtros ─────────────────────────────────────────────────────────────── */
.eq-input {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.eq-input::placeholder { color: #475569; }
.eq-input:focus { border-color: rgb(107 78 158 / 0.6); outline: none; }

/* ── Seção ───────────────────────────────────────────────────────────────── */
.eq-section-title { color: #a78bfa; }
.eq-empty {
  border-color: rgb(255 255 255 / 0.07);
}

/* ── Cards ───────────────────────────────────────────────────────────────── */
.eq-card {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(255 255 255 / 0.08);
}
.eq-card:hover {
  border-color: rgb(107 78 158 / 0.4);
  background: rgb(107 78 158 / 0.06);
}
.eq-card-name  { color: #e2e8f0; }
.eq-categoria  { color: #c4b5fd; }
.eq-desc       { color: #94a3b8; }
.eq-footer-text { color: #64748b; }
.eq-ver-mais   { color: #a78bfa; }

/* ── Modal ───────────────────────────────────────────────────────────────── */
.eq-modal-card {
  background: #0b1426;
  border-color: rgb(107 78 158 / 0.3);
}
.eq-modal-header { border-color: rgb(255 255 255 / 0.07); }
.eq-modal-name   { color: #e2e8f0; }
.eq-close-btn {
  color: #64748b;
  border: 1px solid rgb(255 255 255 / 0.1);
}
.eq-close-btn:hover { background: rgb(255 255 255 / 0.06); color: #e2e8f0; }
.eq-modal-label  { color: #c4b5fd; }
.eq-modal-text   { color: #cbd5e1; }
.eq-modal-footer { border-color: rgb(255 255 255 / 0.07); }
.eq-modal-close-btn {
  background: #6B4E9E;
  color: #fff;
}
.eq-modal-close-btn:hover { background: #5a3d8a; }

/* ── Transições ──────────────────────────────────────────────────────────── */
.eq-modal-enter-active,
.eq-modal-leave-active { transition: opacity 0.2s ease; }
.eq-modal-enter-from,
.eq-modal-leave-to { opacity: 0; }
.eq-modal-enter-active .eq-modal-card,
.eq-modal-leave-active .eq-modal-card { transition: transform 0.2s ease; }
.eq-modal-enter-from .eq-modal-card,
.eq-modal-leave-to .eq-modal-card { transform: translateY(20px); }

/* ── Light mode ──────────────────────────────────────────────────────────── */
:global(html.theme-light) .eq-bg { display: none; }
:global(html.theme-light) .eq-header {
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  border-color: var(--border-soft);
}
:global(html.theme-light) .eq-title { color: var(--brand-primary); }
:global(html.theme-light) .eq-section-title { color: var(--brand-primary); }
:global(html.theme-light) .eq-input {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-main);
}
:global(html.theme-light) .eq-input::placeholder { color: var(--text-muted); }
:global(html.theme-light) .eq-input:focus { border-color: var(--brand-primary); }
:global(html.theme-light) .eq-empty { border-color: var(--border-soft); color: var(--text-muted); }
:global(html.theme-light) .eq-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}
:global(html.theme-light) .eq-card:hover {
  border-color: var(--brand-primary);
  background: var(--bg-soft);
}
:global(html.theme-light) .eq-card-name { color: var(--text-main); }
:global(html.theme-light) .eq-categoria { color: var(--brand-primary); }
:global(html.theme-light) .eq-desc { color: var(--text-muted); }
:global(html.theme-light) .eq-footer-text { color: var(--text-muted); }
:global(html.theme-light) .eq-ver-mais { color: var(--brand-primary); }
:global(html.theme-light) .eq-modal-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}
:global(html.theme-light) .eq-modal-header { border-color: var(--border-soft); }
:global(html.theme-light) .eq-modal-name { color: var(--text-main); }
:global(html.theme-light) .eq-close-btn { color: var(--text-muted); border-color: var(--border-soft); }
:global(html.theme-light) .eq-close-btn:hover { background: var(--bg-soft); color: var(--text-main); }
:global(html.theme-light) .eq-modal-label { color: var(--brand-primary); }
:global(html.theme-light) .eq-modal-text { color: var(--text-main); }
:global(html.theme-light) .eq-modal-footer { border-color: var(--border-soft); }
:global(html.theme-light) .eq-modal-close-btn { background: var(--brand-primary); color: #fff; }
:global(html.theme-light) .eq-modal-close-btn:hover { background: var(--brand-primary-strong); }
</style>
