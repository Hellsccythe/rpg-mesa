<template>
  <div class="worlds-shell min-h-screen relative overflow-hidden">
    <!-- Fundo -->
    <div class="absolute inset-0 worlds-bg" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/95" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-5 sm:px-10">
        <h1 class="worlds-title text-2xl font-bold tracking-[0.25em] uppercase">
          Caminho Sem Volta
        </h1>
        <button
          type="button"
          class="worlds-master-btn text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-xl border transition-all"
          @click="router.push({ name: 'login' })"
        >
          ⚔ Painel GM
        </button>
      </header>

      <!-- Hero -->
      <div class="text-center pt-10 pb-14 px-6">
        <p class="worlds-label text-xs tracking-[0.4em] uppercase mb-4">Escolha seu mundo</p>
        <h2 class="text-5xl sm:text-6xl font-bold tracking-wider drop-shadow-2xl worlds-hero-title">
          Mundos
        </h2>
        <p class="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
          Cada mundo é uma campanha independente com seus próprios heróis e histórias.
        </p>
      </div>

      <!-- Carregando -->
      <div v-if="carregando" class="flex-1 flex items-center justify-center">
        <div class="text-zinc-500 animate-pulse text-lg">Carregando mundos...</div>
      </div>

      <!-- Erro -->
      <div v-else-if="erro" class="flex-1 flex items-center justify-center px-6">
        <div class="rounded-2xl border border-red-500/30 bg-red-950/20 px-8 py-6 text-center max-w-sm">
          <p class="text-red-400 text-sm">{{ erro }}</p>
          <button
            class="mt-4 text-xs text-zinc-400 hover:text-white underline"
            @click="carregar"
          >Tentar novamente</button>
        </div>
      </div>

      <!-- Sem campanhas -->
      <div v-else-if="!campanhas.length" class="flex-1 flex items-center justify-center px-6">
        <div class="text-center max-w-sm">
          <div class="text-5xl mb-4">🌍</div>
          <p class="text-zinc-400">Nenhum mundo disponível no momento.</p>
          <p class="text-zinc-600 text-sm mt-2">Aguarde o mestre criar uma campanha.</p>
        </div>
      </div>

      <!-- Grid de campanhas -->
      <div v-else class="flex-1 px-6 pb-16 sm:px-10">
        <div class="mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="campanha in campanhas"
            :key="campanha.id"
            class="worlds-card group relative rounded-3xl overflow-hidden cursor-pointer border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98]"
            @click="entrar(campanha)"
          >
            <!-- Imagem de capa -->
            <div class="aspect-[16/9] relative overflow-hidden">
              <img
                v-if="campanha.cover_image_url"
                :src="campanha.cover_image_url"
                :alt="campanha.name"
                class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div
                v-else
                class="w-full h-full worlds-card-placeholder flex items-center justify-center"
              >
                <span class="text-5xl worlds-card-placeholder-icon">🌍</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </div>

            <!-- Info -->
            <div class="p-6 worlds-card-body">
              <h3 class="text-xl font-bold worlds-card-name mb-2 line-clamp-1">
                {{ campanha.name }}
              </h3>
              <p
                v-if="campanha.description"
                class="text-sm worlds-card-desc line-clamp-2 leading-relaxed"
              >
                {{ campanha.description }}
              </p>

              <div class="mt-5 flex items-center justify-between">
                <span class="worlds-card-badge text-[0.65rem] font-bold tracking-widest uppercase px-3 py-1 rounded-full border">
                  Ativo
                </span>
                <span class="worlds-card-enter text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Entrar
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listarCampanhas, type CampanhaApi } from '@/lib/api/campanhas.api'

const router  = useRouter()
const campanhas = ref<CampanhaApi[]>([])
const carregando = ref(true)
const erro = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    campanhas.value = await listarCampanhas()
  } catch (e: any) {
    erro.value = e?.response?.data?.error ?? e.message ?? 'Erro ao carregar campanhas.'
  } finally {
    carregando.value = false
  }
}

function entrar(campanha: CampanhaApi) {
  router.push({ name: 'campaign-login', params: { slug: campanha.slug } })
}

onMounted(carregar)
</script>

<style scoped>
.worlds-shell {
  font-family: inherit;
}
.worlds-bg {
  background: radial-gradient(ellipse at 50% 0%, #1a0a2e 0%, #070818 60%, #020408 100%);
}

.worlds-title {
  background: linear-gradient(135deg, #c8a96e 0%, #f0d080 50%, #c8a96e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  letter-spacing: 0.3em;
}

.worlds-label {
  color: #8b7355;
  letter-spacing: 0.4em;
}

.worlds-hero-title {
  background: linear-gradient(180deg, #ffffff 0%, #c8a96e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.worlds-master-btn {
  color: #8b7355;
  border-color: rgba(139, 115, 85, 0.3);
  background: rgba(139, 115, 85, 0.06);
}
.worlds-master-btn:hover {
  color: #c8a96e;
  border-color: rgba(200, 169, 110, 0.5);
  background: rgba(200, 169, 110, 0.1);
}

.worlds-card {
  background: rgba(10, 6, 20, 0.85);
  border-color: rgba(200, 169, 110, 0.15);
}
.worlds-card:hover {
  border-color: rgba(200, 169, 110, 0.45);
  box-shadow: 0 20px 60px rgba(200, 169, 110, 0.12), 0 0 0 1px rgba(200, 169, 110, 0.2);
}

.worlds-card-placeholder {
  background: linear-gradient(135deg, #1a0a2e 0%, #0d0520 100%);
}
.worlds-card-placeholder-icon {
  opacity: 0.3;
  filter: grayscale(1);
}

.worlds-card-body {
  background: linear-gradient(180deg, rgba(10,6,20,0) 0%, rgba(10,6,20,0.95) 100%);
}

.worlds-card-name {
  color: #f0e0b0;
}
.worlds-card-desc {
  color: #8a7a6a;
}

.worlds-card-badge {
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.25);
  background: rgba(74, 222, 128, 0.06);
}

.worlds-card-enter {
  color: #c8a96e;
}

:global(html.theme-light) .worlds-bg {
  background: radial-gradient(ellipse at 50% 0%, #f5f0e8 0%, #e8dfc8 60%, #d4c8a8 100%);
}
:global(html.theme-light) .worlds-card {
  background: rgba(255, 252, 245, 0.92);
  border-color: rgba(139, 100, 20, 0.2);
}
:global(html.theme-light) .worlds-card-name { color: #3d2b00; }
:global(html.theme-light) .worlds-card-desc { color: #7a6a50; }
:global(html.theme-light) .worlds-title {
  background: linear-gradient(135deg, #7a5010 0%, #c8900a 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
:global(html.theme-light) .worlds-hero-title {
  background: linear-gradient(180deg, #3d2b00 0%, #8b5e00 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
</style>
