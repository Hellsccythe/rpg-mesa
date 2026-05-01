<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="raca-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="racas"
          aria-label="Abrir menu de navegação"
          @select="handleNavSelect"
        />
        <h1 class="raca-title text-xl font-bold tracking-widest font-cinzel">Raças</h1>
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

      <main class="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
        <div class="mb-8">
          <h2 class="raca-section-title text-3xl font-bold tracking-wide mb-1 font-cinzel">Raças do Mundo</h2>
          <p class="text-zinc-400 text-sm">Conheça as raças que habitam a campanha</p>
        </div>

        <!-- Filtro -->
        <div class="mb-6">
          <input
            v-model="filtroNome"
            type="text"
            placeholder="Buscar por nome..."
            class="raca-input w-full max-w-sm rounded-2xl border px-4 py-2.5 text-sm outline-none transition-colors"
          />
        </div>

        <!-- Loading -->
        <div v-if="carregando" class="flex items-center justify-center h-64 text-zinc-400 animate-pulse">
          Carregando raças...
        </div>

        <!-- Erro -->
        <div v-else-if="erro" class="flex items-center justify-center h-64">
          <div class="text-center bg-black/40 border border-red-900/50 rounded-3xl p-8 max-w-md">
            <p class="text-red-300 text-lg">Não foi possível carregar as raças.</p>
            <button @click="carregar" class="mt-4 px-6 py-2 bg-[#6B4E9E] rounded-2xl hover:brightness-110 text-sm">
              Tentar novamente
            </button>
          </div>
        </div>

        <!-- Grid -->
        <template v-else>
          <div v-if="racasFiltradas.length === 0" class="raca-empty rounded-3xl border p-8 text-center text-zinc-400">
            Nenhuma raça encontrada.
          </div>

          <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <button
              v-for="raca in racasFiltradas"
              :key="raca.id"
              @click="selecionado = raca"
              class="raca-card rounded-3xl border overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <!-- Imagem -->
              <div class="relative h-40 bg-cover bg-center raca-img-bg"
                :style="raca.foto_url ? `background-image: url('${raca.foto_url}')` : ''">
                <div v-if="!raca.foto_url" class="absolute inset-0 flex items-center justify-center">
                  <span class="text-5xl opacity-20">🧬</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <h3 class="absolute bottom-3 left-4 text-white font-bold text-lg font-cinzel">{{ raca.nome }}</h3>
              </div>

              <!-- Info -->
              <div class="px-4 py-4 space-y-2">
                <!-- Atributos bônus -->
                <div v-if="raca.atributos_bonus.length" class="flex flex-wrap gap-1.5">
                  <span v-for="ab in raca.atributos_bonus" :key="ab.atributo"
                    class="attr-badge text-xs rounded-full px-2.5 py-0.5">
                    {{ ab.atributo }} {{ ab.valor.startsWith('-') ? '' : '+' }}{{ ab.valor }}
                  </span>
                </div>

                <!-- Habilidades preview -->
                <p v-if="raca.habilidades.length" class="raca-hab-preview text-xs">
                  {{ raca.habilidades.map(h => h.nome).join(' · ') }}
                </p>

                <!-- Descrição truncada -->
                <p v-if="raca.descricao" class="raca-desc text-sm leading-relaxed line-clamp-2">
                  {{ raca.descricao }}
                </p>

                <p class="mt-2 text-xs raca-ver-mais">Ver detalhes →</p>
              </div>
            </button>
          </div>
        </template>
      </main>
    </div>

    <!-- Modal de detalhes -->
    <Transition name="raca-modal">
      <div
        v-if="selecionado"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/70"
        @click.self="selecionado = null"
      >
        <div class="raca-modal-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border overflow-hidden">
          <!-- Imagem do modal -->
          <div v-if="selecionado.foto_url" class="relative h-48 bg-cover bg-center"
            :style="`background-image: url('${selecionado.foto_url}')`">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <h2 class="absolute bottom-4 left-6 text-white text-2xl font-bold font-cinzel">{{ selecionado.nome }}</h2>
          </div>

          <!-- Header modal sem imagem -->
          <div v-else class="raca-modal-header flex items-center justify-between border-b px-6 py-5">
            <h2 class="raca-modal-name text-2xl font-bold font-cinzel">{{ selecionado.nome }}</h2>
          </div>

          <!-- Com imagem, o close fica no topo -->
          <button
            @click="selecionado = null"
            class="raca-close-btn absolute top-4 right-4 z-10 rounded-xl px-3 py-1.5 text-sm transition-colors"
            v-if="selecionado.foto_url"
          >Fechar</button>

          <!-- Corpo -->
          <div class="raca-modal-body max-h-[55vh] overflow-y-auto px-6 py-5 space-y-5">
            <!-- Atributos bônus -->
            <div v-if="selecionado.atributos_bonus.length">
              <p class="raca-modal-label mb-2 text-xs uppercase tracking-widest">Atributos Bônus</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="ab in selecionado.atributos_bonus" :key="ab.atributo"
                  class="attr-badge text-sm rounded-full px-3 py-1">
                  {{ ab.atributo }} {{ ab.valor.startsWith('-') ? '' : '+' }}{{ ab.valor }}
                </span>
              </div>
            </div>

            <!-- Habilidades -->
            <div v-if="selecionado.habilidades.length">
              <p class="raca-modal-label mb-2 text-xs uppercase tracking-widest">Habilidades</p>
              <div class="space-y-3">
                <div v-for="h in selecionado.habilidades" :key="h.nome" class="habilidade-item rounded-2xl p-3">
                  <p class="text-sm font-semibold text-zinc-200 mb-0.5">{{ h.nome }}</p>
                  <p class="text-sm raca-modal-text leading-relaxed">{{ h.descricao }}</p>
                </div>
              </div>
            </div>

            <!-- Descrição -->
            <div v-if="selecionado.descricao">
              <p class="raca-modal-label mb-1 text-xs uppercase tracking-widest">Descrição</p>
              <p class="raca-modal-text text-sm leading-relaxed">{{ selecionado.descricao }}</p>
            </div>

            <!-- Lore (sempre bloqueado para players por ora) -->
            <div class="lore-locked rounded-2xl border p-4 flex items-center gap-3">
              <span class="text-2xl">🔒</span>
              <div>
                <p class="text-sm font-semibold text-zinc-400">Lore bloqueado</p>
                <p class="text-xs text-zinc-500 mt-0.5">O lore desta raça está disponível apenas para quem a escolheu como sua origem.</p>
              </div>
            </div>
          </div>

          <!-- Footer sem imagem (tem o close no header) -->
          <div v-if="!selecionado.foto_url" class="raca-modal-footer border-t px-6 py-4 flex justify-end">
            <button @click="selecionado = null" class="raca-modal-close-btn rounded-xl px-6 py-2 text-sm transition-colors">
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
import { listarRacasPublicas } from '@/lib/api/racas.api'
import type { RacaApi } from '@/lib/api/racas.api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const racas = ref<RacaApi[]>([])
const carregando = ref(false)
const erro = ref(false)
const filtroNome = ref('')
const selecionado = ref<RacaApi | null>(null)
const showSettingsMenu = ref(false)

const navItems = [
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Títulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas', label: 'Notas de Aventura' },
]

function handleNavSelect(itemId: string) {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  const withCharId = (path: string) => characterId ? { path, query: { characterId } } : { path }
  const routeMap: Record<string, any> = {
    dashboard:    characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    deuses:       { path: '/deuses' },
    cidade:       { path: '/cidade' },
    skills:       withCharId('/skills'),
    titulos:      withCharId('/titulos'),
    classes:      withCharId('/classes'),
    racas:        withCharId('/racas'),
    equipamentos: withCharId('/equipamentos'),
    notas:        withCharId('/notas'),
  }
  const target = routeMap[itemId]
  if (target) router.push(target)
}

const racasFiltradas = computed(() => {
  const nome = filtroNome.value.trim().toLowerCase()
  return nome ? racas.value.filter(r => r.nome.toLowerCase().includes(nome)) : racas.value
})

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
  try { racas.value = await listarRacasPublicas() }
  catch { erro.value = true }
  finally { carregando.value = false }
}

onMounted(carregar)
</script>

<style scoped>
.font-cinzel { font-family: 'Cinzel', serif; }

.raca-header {
  background: rgb(10 15 28 / 0.88);
  border-color: rgb(107 78 158 / 0.3);
  backdrop-filter: blur(12px);
}
.raca-title        { color: #c4b5fd; }
.raca-section-title{ color: #c4b5fd; }

.raca-input {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.raca-input::placeholder { color: #475569; }
.raca-input:focus { border-color: rgb(107 78 158 / 0.5); }

.raca-empty { border-color: rgb(255 255 255 / 0.07); }

/* ── Cards ── */
.raca-card {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(255 255 255 / 0.08);
  cursor: pointer;
}
.raca-card:hover {
  border-color: rgb(139 92 246 / 0.4);
  background: rgb(139 92 246 / 0.05);
}
.raca-img-bg      { background-color: #111a2d; }
.attr-badge {
  background: rgb(139 92 246 / 0.15);
  border: 1px solid rgb(139 92 246 / 0.3);
  color: #c4b5fd;
}
.raca-hab-preview { color: #a78bfa; }
.raca-desc        { color: #94a3b8; }
.raca-ver-mais    { color: #a78bfa; }

/* ── Modal ── */
.raca-modal-card {
  background: #0b1426;
  border-color: rgb(139 92 246 / 0.3);
  position: relative;
}
.raca-modal-header { border-color: rgb(255 255 255 / 0.07); }
.raca-modal-name   { color: #e2e8f0; }
.raca-close-btn {
  background: rgb(0 0 0 / 0.5);
  color: #e2e8f0;
  border: 1px solid rgb(255 255 255 / 0.15);
  backdrop-filter: blur(4px);
}
.raca-close-btn:hover { background: rgb(0 0 0 / 0.7); }
.raca-modal-label  { color: #a78bfa; }
.raca-modal-text   { color: #cbd5e1; }

.habilidade-item {
  background: rgb(139 92 246 / 0.08);
  border: 1px solid rgb(139 92 246 / 0.15);
}

.lore-locked {
  border-color: rgb(255 255 255 / 0.06);
  background: rgb(255 255 255 / 0.02);
}

.raca-modal-footer { border-color: rgb(255 255 255 / 0.07); }
.raca-modal-close-btn {
  background: #6B4E9E;
  color: #fff;
}
.raca-modal-close-btn:hover { background: #5a3d8a; }

/* ── Transições ── */
.raca-modal-enter-active, .raca-modal-leave-active { transition: opacity 0.2s ease; }
.raca-modal-enter-from,   .raca-modal-leave-to     { opacity: 0; }
.raca-modal-enter-active .raca-modal-card,
.raca-modal-leave-active .raca-modal-card          { transition: transform 0.2s ease; }
.raca-modal-enter-from .raca-modal-card,
.raca-modal-leave-to .raca-modal-card              { transform: translateY(20px); }
</style>
