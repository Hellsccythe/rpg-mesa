<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <!-- Header -->
      <header class="sticky top-0 z-20 border-b border-white/[0.06] backdrop-blur-xl bg-[#0a0f1c]/80">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
            @click="router.push({ name: 'master-panel' })"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Painel
          </button>
          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-fuchsia-400">🖼 Backup de Imagens</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="progressoLabel" class="text-xs text-zinc-500 animate-pulse">{{ progressoLabel }}</span>
            <button
              type="button"
              :disabled="baixandoTudo || !!baixandoSecao || carregando"
              class="rounded-xl bg-fuchsia-600/80 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:opacity-40"
              @click="baixarTodasImagens"
            >
              {{ baixandoTudo ? 'Gerando...' : 'Baixar tudo' }}
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6">

        <!-- Loading global -->
        <div v-if="carregando" class="flex items-center justify-center py-24">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-fuchsia-500 border-t-transparent" />
        </div>

        <template v-else>

          <!-- ── Personagens ────────────────────────────────────────────────── -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-widest text-cyan-400">Personagens</h2>
                <p class="text-xs text-zinc-600">{{ personagensComImagem.length }} imagem(ns)</p>
              </div>
              <button
                v-if="personagensComImagem.length > 0"
                type="button"
                class="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
                :disabled="!!baixandoSecao || baixandoTudo"
                @click="baixarTudoSecao('personagens', 'PERSONAGENS', personagensComImagem)"
              >
                {{ baixandoSecao === 'personagens' ? 'Gerando ZIP...' : 'Baixar tudo' }}
              </button>
            </div>

            <div v-if="personagensComImagem.length === 0" class="rounded-2xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-zinc-600">
              Nenhum personagem com avatar.
            </div>
            <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              <div
                v-for="item in personagensComImagem"
                :key="item.id"
                class="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div class="aspect-[3/4] overflow-hidden">
                  <img
                    :src="item.url"
                    :alt="item.nome"
                    class="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div class="p-2">
                  <p class="truncate text-[0.7rem] font-semibold text-zinc-200">{{ item.nome }}</p>
                  <button
                    type="button"
                    class="mt-1.5 w-full rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-1 text-[0.65rem] font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
                    @click="baixarImagem(item.url, item.nome)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Deuses ─────────────────────────────────────────────────────── -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-widest text-amber-400">Deuses</h2>
                <p class="text-xs text-zinc-600">{{ deusesComImagem.length }} imagem(ns)</p>
              </div>
              <button
                v-if="deusesComImagem.length > 0"
                type="button"
                class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                :disabled="!!baixandoSecao || baixandoTudo"
                @click="baixarTudoSecao('deuses', 'DEUSES', deusesComImagem)"
              >
                {{ baixandoSecao === 'deuses' ? 'Gerando ZIP...' : 'Baixar tudo' }}
              </button>
            </div>

            <div v-if="deusesComImagem.length === 0" class="rounded-2xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-zinc-600">
              Nenhum deus com imagem.
            </div>
            <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <div
                v-for="item in deusesComImagem"
                :key="item.id"
                class="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div class="aspect-square overflow-hidden">
                  <img
                    :src="item.url"
                    :alt="item.nome"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div class="p-2">
                  <p class="truncate text-[0.7rem] font-semibold text-zinc-200">{{ item.nome }}</p>
                  <button
                    type="button"
                    class="mt-1.5 w-full rounded-lg border border-amber-500/30 bg-amber-500/10 py-1 text-[0.65rem] font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                    @click="baixarImagem(item.url, item.nome)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Mapas ──────────────────────────────────────────────────────── -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-widest text-emerald-400">Mapas da Cidade</h2>
                <p class="text-xs text-zinc-600">{{ mapasComImagem.length }} imagem(ns)</p>
              </div>
              <button
                v-if="mapasComImagem.length > 0"
                type="button"
                class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                :disabled="!!baixandoSecao || baixandoTudo"
                @click="baixarTudoSecao('mapas', 'MAPAS', mapasComImagem)"
              >
                {{ baixandoSecao === 'mapas' ? 'Gerando ZIP...' : 'Baixar tudo' }}
              </button>
            </div>

            <div v-if="mapasComImagem.length === 0" class="rounded-2xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-zinc-600">
              Nenhum mapa com imagem.
            </div>
            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div
                v-for="item in mapasComImagem"
                :key="item.id"
                class="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div class="aspect-video overflow-hidden">
                  <img
                    :src="item.url"
                    :alt="item.nome"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div class="p-2">
                  <p class="truncate text-[0.7rem] font-semibold text-zinc-200">{{ item.nome }}</p>
                  <button
                    type="button"
                    class="mt-1.5 w-full rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-1 text-[0.65rem] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                    @click="baixarImagem(item.url, item.nome)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Raças ──────────────────────────────────────────────────────── -->
          <section>
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold uppercase tracking-widest text-violet-400">Raças</h2>
                <p class="text-xs text-zinc-600">{{ racasComImagem.length }} imagem(ns)</p>
              </div>
              <button
                v-if="racasComImagem.length > 0"
                type="button"
                class="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
                :disabled="!!baixandoSecao || baixandoTudo"
                @click="baixarTudoSecao('racas', 'RACAS', racasComImagem)"
              >
                {{ baixandoSecao === 'racas' ? 'Gerando ZIP...' : 'Baixar tudo' }}
              </button>
            </div>

            <div v-if="racasComImagem.length === 0" class="rounded-2xl border border-white/[0.05] bg-white/[0.02] py-10 text-center text-sm text-zinc-600">
              Nenhuma raça com imagem.
            </div>
            <div v-else class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <div
                v-for="item in racasComImagem"
                :key="item.id"
                class="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              >
                <div class="aspect-square overflow-hidden">
                  <img
                    :src="item.url"
                    :alt="item.nome"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div class="p-2">
                  <p class="truncate text-[0.7rem] font-semibold text-zinc-200">{{ item.nome }}</p>
                  <button
                    type="button"
                    class="mt-1.5 w-full rounded-lg border border-violet-500/30 bg-violet-500/10 py-1 text-[0.65rem] font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
                    @click="baixarImagem(item.url, item.nome)"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </section>

        </template>
      </main>
    </TemaDarkLight>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import { listGods } from '@/lib/api/gods.api'
import { listCityMaps } from '@/lib/api/city-maps.api'
import { listarRacasAdmin } from '@/lib/api/racas.api'
import { useCharactersStore } from '@/stores/characters'

type ItemImagem = { id: string | number; nome: string; url: string }

const router = useRouter()
const charactersStore = useCharactersStore()

const carregando = ref(true)
const baixandoSecao = ref<string | null>(null)
const baixandoTudo = ref(false)
const progressoLabel = ref('')

const personagensComImagem = ref<ItemImagem[]>([])
const deusesComImagem = ref<ItemImagem[]>([])
const mapasComImagem = ref<ItemImagem[]>([])
const racasComImagem = ref<ItemImagem[]>([])

async function carregar() {
  carregando.value = true
  try {
    const [, gods, maps, racas] = await Promise.all([
      charactersStore.fetchPaginaInicial(),
      listGods(),
      listCityMaps(),
      listarRacasAdmin(),
    ])

    personagensComImagem.value = charactersStore.publicCharacters
      .filter((c) => !!c.avatarUrl)
      .map((c) => ({ id: c.characterId, nome: c.name, url: c.avatarUrl! }))

    deusesComImagem.value = gods
      .filter((g) => !!g.imageUrl)
      .map((g) => ({ id: g.id, nome: g.name, url: g.imageUrl! }))

    mapasComImagem.value = maps
      .filter((m) => !!m.imageUrl)
      .map((m) => ({ id: m.id, nome: m.name, url: m.imageUrl! }))

    racasComImagem.value = racas
      .filter((r) => !!r.foto_url)
      .map((r) => ({ id: r.id, nome: r.nome, url: r.foto_url! }))
  } finally {
    carregando.value = false
  }
}

function nomeArquivo(nome: string, url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg'
  const base = nome.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase()
  return `${base}.${ext}`
}

async function fetchBlob(url: string): Promise<Blob | null> {
  try {
    const resp = await fetch(url)
    if (!resp.ok) return null
    return await resp.blob()
  } catch {
    return null
  }
}

function dispararDownload(blob: Blob, nomeArq: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nomeArq
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(a.href)
}

async function baixarImagem(url: string, nome: string) {
  const blob = await fetchBlob(url)
  if (blob) {
    dispararDownload(blob, nomeArquivo(nome, url))
  } else {
    window.open(url, '_blank')
  }
}

async function adicionarItensNoZip(zip: JSZip, pasta: string, itens: ItemImagem[], label: string) {
  const folder = zip.folder(pasta)!
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    progressoLabel.value = `${label} (${i + 1}/${itens.length})`
    const blob = await fetchBlob(item.url)
    if (blob) {
      folder.file(nomeArquivo(item.nome, item.url), blob)
    }
  }
}

async function baixarTudoSecao(secao: string, nomeZip: string, itens: ItemImagem[]) {
  baixandoSecao.value = secao
  progressoLabel.value = ''
  try {
    const zip = new JSZip()
    await adicionarItensNoZip(zip, nomeZip, itens, nomeZip)
    progressoLabel.value = 'Gerando ZIP...'
    const blob = await zip.generateAsync({ type: 'blob' })
    dispararDownload(blob, `${nomeZip}.zip`)
  } finally {
    baixandoSecao.value = null
    progressoLabel.value = ''
  }
}

async function baixarTodasImagens() {
  baixandoTudo.value = true
  progressoLabel.value = ''
  try {
    const zip = new JSZip()
    const root = zip.folder('IMAGENS')!

    const secoes: [string, ItemImagem[]][] = [
      ['PERSONAGENS', personagensComImagem.value],
      ['DEUSES', deusesComImagem.value],
      ['MAPAS', mapasComImagem.value],
      ['RACAS', racasComImagem.value],
    ]

    for (const [nome, itens] of secoes) {
      if (itens.length === 0) continue
      const folder = root.folder(nome)!
      for (let i = 0; i < itens.length; i++) {
        const item = itens[i]
        progressoLabel.value = `${nome} — ${i + 1}/${itens.length}`
        const blob = await fetchBlob(item.url)
        if (blob) {
          folder.file(nomeArquivo(item.nome, item.url), blob)
        }
      }
    }

    progressoLabel.value = 'Gerando ZIP...'
    const blob = await zip.generateAsync({ type: 'blob' })
    dispararDownload(blob, 'IMAGENS.zip')
  } finally {
    baixandoTudo.value = false
    progressoLabel.value = ''
  }
}

onMounted(carregar)
</script>
