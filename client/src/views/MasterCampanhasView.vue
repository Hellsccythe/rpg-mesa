<template>
  <TemaDarkLight variante="contexto" class="min-h-screen">
    <header class="sticky top-0 z-20 border-b backdrop-blur-xl page-header">
      <div class="mx-auto flex h-16 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <button type="button" class="text-zinc-400 hover:text-white transition-colors" @click="router.push({ name: 'master-panel' })">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <h1 class="text-base font-bold text-white flex-1">Campanhas / Mundos</h1>
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          @click="abrirModal()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Nova Campanha
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-4">
      <div v-if="carregando" class="py-20 text-center text-zinc-500 animate-pulse">Carregando...</div>

      <div v-else-if="!campanhas.length" class="py-20 text-center">
        <p class="text-zinc-500">Nenhuma campanha cadastrada.</p>
        <button class="mt-3 text-sm text-amber-500 hover:text-amber-400 underline" @click="abrirModal()">Criar primeira campanha</button>
      </div>

      <div v-else class="grid gap-4">
        <div
          v-for="c in campanhas"
          :key="c.id"
          class="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 flex gap-4 items-start"
        >
          <!-- Miniatura -->
          <div class="flex-none w-20 h-14 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.06]">
            <img v-if="c.cover_image_url" :src="c.cover_image_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-xl text-zinc-700">🌍</div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold text-white truncate">{{ c.name }}</span>
              <span class="text-[0.6rem] px-2 py-0.5 rounded-full font-semibold tracking-wide"
                :class="c.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-700/30 text-zinc-500 border border-white/[0.05]'"
              >{{ c.is_active ? 'Ativo' : 'Inativo' }}</span>
            </div>
            <p class="text-xs text-zinc-500 mt-0.5">/mundo/{{ c.slug }}</p>
            <p v-if="c.description" class="text-xs text-zinc-400 mt-1 line-clamp-2">{{ c.description }}</p>
          </div>

          <!-- Ações -->
          <div class="flex-none flex items-center gap-2">
            <button
              type="button"
              class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              @click="abrirGms(c)"
            >GMs</button>
            <button
              type="button"
              class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              @click="abrirModal(c)"
            >Editar</button>
            <button
              type="button"
              class="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              @click="confirmarDelete(c)"
            >Deletar</button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal criar/editar campanha -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-lg"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">{{ editando ? 'Editar Campanha' : 'Nova Campanha' }}</h3>
        <button type="button" @click="fecharModal" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-6 space-y-4">
        <!-- Nome -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nome <span class="text-red-400">*</span></label>
          <input v-model="form.name" type="text" maxlength="100" class="input-campo" placeholder="Ex: Caminho Sem Volta" />
        </div>

        <!-- Slug -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Slug (URL) <span class="text-red-400">*</span></label>
          <input v-model="form.slug" type="text" maxlength="60" class="input-campo font-mono text-sm" placeholder="ex: caminho-sem-volta" />
          <p class="text-[0.65rem] text-zinc-600">Aparece na URL: /mundo/<strong class="text-zinc-500">{{ form.slug || 'slug' }}</strong></p>
        </div>

        <!-- Descrição -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Descrição</label>
          <textarea v-model="form.description" rows="3" class="input-campo resize-none" placeholder="Breve descrição da campanha..." />
        </div>

        <!-- Imagem de capa -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Imagem de Capa</label>
          <div
            class="relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] px-4 py-6 cursor-pointer hover:border-white/20 transition-colors"
            @click="inputImagemRef?.click()"
          >
            <img v-if="form.cover_image_url" :src="form.cover_image_url" class="h-24 w-full object-cover rounded-lg mb-2" />
            <p class="text-xs text-zinc-500">{{ uploadandoImagem ? 'Enviando...' : 'Clique para selecionar imagem (max 8 MB)' }}</p>
            <input ref="inputImagemRef" type="file" accept="image/*" class="hidden" @change="selecionarImagem" />
          </div>
          <button v-if="form.cover_image_url" type="button" class="text-xs text-red-400 hover:text-red-300" @click="form.cover_image_url = ''">Remover imagem</button>
        </div>

        <!-- Ativo -->
        <label class="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" v-model="form.is_active" class="h-4 w-4 rounded accent-amber-500" />
          <span class="text-sm text-zinc-300">Campanha ativa (visível na tela de mundos)</span>
        </label>

        <div v-if="erroModal" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm text-red-400">{{ erroModal }}</div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:text-white" @click="fecharModal">Cancelar</button>
          <button
            type="button"
            :disabled="salvando || !form.name.trim() || !form.slug.trim()"
            class="rounded-xl bg-amber-700 px-6 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="salvar"
          >{{ salvando ? 'Salvando...' : (editando ? 'Salvar Alterações' : 'Criar Campanha') }}</button>
        </div>
      </template>
    </Modal>

    <!-- Modal GMs -->
    <Modal
      v-if="modalGmsAberto && campanhaGms"
      panel-class="max-w-md"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharGms"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">GMs — {{ campanhaGms.name }}</h3>
        <button type="button" @click="fecharGms" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-6 space-y-4">
        <!-- Lista de GMs -->
        <div v-if="carregandoGms" class="text-center text-zinc-500 py-4 animate-pulse text-sm">Carregando GMs...</div>
        <div v-else-if="!gms.length" class="text-center text-zinc-600 py-4 text-sm">Nenhum GM vinculado.</div>
        <div v-else class="space-y-2">
          <div v-for="gm in gms" :key="gm.id" class="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
            <span class="text-sm text-zinc-300">{{ gm.email }}</span>
            <button type="button" class="text-xs text-red-400 hover:text-red-300 transition-colors" @click="removerGm(gm)">Remover</button>
          </div>
        </div>

        <!-- Adicionar GM -->
        <div class="space-y-2 pt-2 border-t border-white/[0.06]">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Adicionar GM</label>
          <div class="flex gap-2">
            <input
              v-model="novoGmEmail"
              type="email"
              class="input-campo flex-1 text-sm"
              placeholder="email@exemplo.com"
              @keyup.enter="adicionarGm"
            />
            <button
              type="button"
              :disabled="!novoGmEmail.trim() || adicionandoGm"
              class="rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
              @click="adicionarGm"
            >{{ adicionandoGm ? '...' : 'Adicionar' }}</button>
          </div>
          <div v-if="erroGms" class="text-xs text-red-400">{{ erroGms }}</div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end px-6 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:text-white" @click="fecharGms">Fechar</button>
        </div>
      </template>
    </Modal>

    <!-- Modal confirmar delete -->
    <Modal
      v-if="modalDeleteAberto && campanhaParaDeletar"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="cancelarDelete"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">Deletar Campanha</h3>
      </template>
      <div class="px-6 py-5 space-y-3">
        <p class="text-sm text-zinc-300">Tem certeza que deseja deletar <strong class="text-white">{{ campanhaParaDeletar.name }}</strong>?</p>
        <p class="text-xs text-zinc-500">Os personagens vinculados NÃO serão deletados, mas perderão o vínculo com esta campanha.</p>
        <div v-if="erroDelete" class="text-xs text-red-400">{{ erroDelete }}</div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 hover:text-white" @click="cancelarDelete">Cancelar</button>
          <button type="button" :disabled="deletando" class="rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" @click="executarDelete">
            {{ deletando ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </template>
    </Modal>
  </TemaDarkLight>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import Modal from '@/components/Modal.vue'
import {
  listarCampanhasAdmin,
  criarCampanha,
  editarCampanha,
  deletarCampanha,
  uploadCapaCampanha,
  listarGmsCampanha,
  adicionarGmCampanha,
  removerGmCampanha,
  type CampanhaApi,
  type CampanhaGmApi,
} from '@/lib/api/campanhas.api'

const router = useRouter()

const campanhas  = ref<CampanhaApi[]>([])
const carregando = ref(true)

// ── CRUD modal ────────────────────────────────────────────────────────────────
const modalAberto = ref(false)
const editando    = ref<CampanhaApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')
const uploadandoImagem = ref(false)
const inputImagemRef   = ref<HTMLInputElement | null>(null)

const form = ref({ name: '', slug: '', description: '', cover_image_url: '', is_active: true })

function abrirModal(c?: CampanhaApi) {
  editando.value = c ?? null
  erroModal.value = ''
  if (c) {
    form.value = { name: c.name, slug: c.slug, description: c.description ?? '', cover_image_url: c.cover_image_url ?? '', is_active: c.is_active }
  } else {
    form.value = { name: '', slug: '', description: '', cover_image_url: '', is_active: true }
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value = null
}

async function selecionarImagem(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadandoImagem.value = true
  try {
    form.value.cover_image_url = await uploadCapaCampanha(file)
  } catch (err: any) {
    erroModal.value = err?.response?.data?.error ?? 'Erro ao enviar imagem.'
  } finally {
    uploadandoImagem.value = false
    if (inputImagemRef.value) inputImagemRef.value.value = ''
  }
}

async function salvar() {
  if (!form.value.name.trim() || !form.value.slug.trim()) return
  salvando.value = true
  erroModal.value = ''
  try {
    if (editando.value) {
      const updated = await editarCampanha(editando.value.id, form.value)
      const idx = campanhas.value.findIndex(c => c.id === updated.id)
      if (idx !== -1) campanhas.value[idx] = updated
    } else {
      const created = await criarCampanha(form.value)
      campanhas.value.unshift(created)
    }
    fecharModal()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

// ── Delete modal ──────────────────────────────────────────────────────────────
const modalDeleteAberto   = ref(false)
const campanhaParaDeletar = ref<CampanhaApi | null>(null)
const deletando           = ref(false)
const erroDelete          = ref('')

function confirmarDelete(c: CampanhaApi) { campanhaParaDeletar.value = c; modalDeleteAberto.value = true; erroDelete.value = '' }
function cancelarDelete() { modalDeleteAberto.value = false; campanhaParaDeletar.value = null }

async function executarDelete() {
  if (!campanhaParaDeletar.value) return
  deletando.value = true; erroDelete.value = ''
  try {
    await deletarCampanha(campanhaParaDeletar.value.id)
    campanhas.value = campanhas.value.filter(c => c.id !== campanhaParaDeletar.value!.id)
    cancelarDelete()
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.error ?? err.message ?? 'Erro ao deletar.'
  } finally {
    deletando.value = false
  }
}

// ── GMs modal ─────────────────────────────────────────────────────────────────
const modalGmsAberto = ref(false)
const campanhaGms    = ref<CampanhaApi | null>(null)
const gms            = ref<CampanhaGmApi[]>([])
const carregandoGms  = ref(false)
const novoGmEmail    = ref('')
const adicionandoGm  = ref(false)
const erroGms        = ref('')

async function abrirGms(c: CampanhaApi) {
  campanhaGms.value = c
  modalGmsAberto.value = true
  novoGmEmail.value = ''
  erroGms.value = ''
  carregandoGms.value = true
  try {
    gms.value = await listarGmsCampanha(c.id)
  } catch { gms.value = [] }
  finally { carregandoGms.value = false }
}

function fecharGms() { modalGmsAberto.value = false; campanhaGms.value = null; gms.value = [] }

async function adicionarGm() {
  if (!campanhaGms.value || !novoGmEmail.value.trim()) return
  adicionandoGm.value = true; erroGms.value = ''
  try {
    const gm = await adicionarGmCampanha(campanhaGms.value.id, novoGmEmail.value.trim())
    gms.value.push(gm)
    novoGmEmail.value = ''
  } catch (err: any) {
    erroGms.value = err?.response?.data?.error ?? err.message ?? 'Erro ao adicionar GM.'
  } finally { adicionandoGm.value = false }
}

async function removerGm(gm: CampanhaGmApi) {
  if (!campanhaGms.value) return
  try {
    await removerGmCampanha(campanhaGms.value.id, gm.id)
    gms.value = gms.value.filter(g => g.id !== gm.id)
  } catch (err: any) {
    erroGms.value = err?.response?.data?.error ?? err.message ?? 'Erro ao remover GM.'
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    campanhas.value = await listarCampanhasAdmin()
  } catch { campanhas.value = [] }
  finally { carregando.value = false }
})
</script>

<style scoped>
.page-header {
  background: rgb(7 12 24 / 0.82);
  border-color: rgb(255 255 255 / 0.07);
}
.input-campo {
  @apply w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20;
}
:global(html.theme-light) .page-header {
  background: rgb(255 255 255 / 0.9);
  border-color: var(--border-soft);
}
</style>
