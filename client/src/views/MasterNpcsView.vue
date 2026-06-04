<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">⚔ NPCs ⚔</span>
        </div>
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-600"
          @click="abrirModal()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          Novo NPC
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">

      <div v-if="erro" class="mb-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">{{ erro }}</div>

      <!-- Carregando -->
      <div v-if="carregando" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-72 animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
      </div>

      <!-- Vazio -->
      <div
        v-else-if="!npcs.length"
        class="flex flex-col items-center justify-center rounded-3xl border border-white/[0.06] bg-white/[0.02] py-20 text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-950/30 text-indigo-400">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <p class="text-sm font-semibold text-zinc-300">Nenhum NPC cadastrado</p>
        <p class="mt-1 text-xs text-zinc-600">Clique em "Novo NPC" para começar</p>
        <button
          type="button"
          class="mt-5 rounded-xl bg-indigo-700 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
          @click="abrirModal()"
        >Criar primeiro NPC</button>
      </div>

      <!-- Grid de cards -->
      <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="npc in npcs"
          :key="npc.id"
          class="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10"
        >
          <!-- Imagem -->
          <div class="relative h-44 overflow-hidden">
            <img
              v-if="npc.foto_url"
              :src="npc.foto_url"
              :alt="npc.nome"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950/80 to-slate-900/80"
            >
              <svg class="h-12 w-12 text-indigo-800/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#070C18] via-[#070C18]/30 to-transparent" />

            <!-- Botões de ação -->
            <div class="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
                title="Gerenciar acesso de players"
                @click.stop="abrirModalAcesso(npc)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
                title="Editar"
                @click.stop="abrirModal(npc)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-zinc-300 backdrop-blur-sm transition-colors hover:border-red-500/50 hover:text-red-400"
                title="Deletar"
                @click.stop="abrirConfirmacaoDelete(npc)"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>

            <!-- Raça badge -->
            <div v-if="npc.raca_nome" class="absolute bottom-3 left-3">
              <span class="rounded-full border border-indigo-500/40 bg-indigo-950/70 px-2.5 py-0.5 text-[0.65rem] font-semibold text-indigo-300 backdrop-blur-sm">
                {{ npc.raca_nome }}
              </span>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="flex flex-1 flex-col gap-2 p-5">
            <h3 class="text-base font-bold text-white leading-tight">{{ npc.nome }}</h3>
            <p v-if="npc.descricao" class="line-clamp-3 text-xs leading-relaxed text-zinc-400">{{ npc.descricao }}</p>
            <p v-else class="text-xs italic text-zinc-600">Sem descrição.</p>
          </div>
        </article>
      </div>
    </main>

    <!-- ── Modal Criar / Editar ──────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-md"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">{{ editando ? 'Editar NPC' : 'Novo NPC' }}</h3>
        <button type="button" @click="fecharModal" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-6 space-y-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Nome <span class="text-red-400">*</span>
          </label>
          <input
            v-model="form.nome"
            type="text"
            maxlength="100"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            placeholder="Nome do NPC..."
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Raça</label>
          <VSelect
            v-model="form.raca_id"
            :options="racasOptions"
            placeholder="Selecione uma raça..."
          />
        </div>

        <!-- Upload de imagem -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Imagem</label>

          <!-- Preview -->
          <div v-if="form.foto_url" class="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20" style="max-height:140px">
            <img :src="form.foto_url" class="h-full w-full object-cover" style="max-height:140px" alt="preview" @error="form.foto_url = ''" />
            <button
              type="button"
              class="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-zinc-400 backdrop-blur-sm hover:text-red-400 transition-colors"
              @click="form.foto_url = ''"
              title="Remover imagem"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Drop zone -->
          <div
            v-else
            class="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] py-8 text-center transition-colors hover:border-indigo-500/40 hover:bg-indigo-950/10 cursor-pointer"
            :class="uploadandoImagem ? 'opacity-60 pointer-events-none' : ''"
            @click="$refs.fileInputImagem.click()"
            @dragover.prevent
            @drop.prevent="onDropImagem"
          >
            <svg class="h-8 w-8 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p v-if="uploadandoImagem" class="text-sm text-zinc-400 animate-pulse">Enviando...</p>
            <div v-else>
              <p class="text-sm font-medium text-zinc-300">Clique ou arraste uma imagem</p>
              <p class="text-xs text-zinc-600 mt-0.5">JPG, PNG, WebP — máx. 8 MB</p>
            </div>
            <input
              ref="fileInputImagem"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onSelecionarImagem"
            />
          </div>

          <p v-if="erroUpload" class="text-xs text-red-400">{{ erroUpload }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="4"
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            placeholder="Descreva este NPC..."
          />
        </div>

        <div v-if="erroModal" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {{ erroModal }}
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-5 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="fecharModal"
          >Cancelar</button>
          <button
            type="button"
            :disabled="salvando || !form.nome.trim()"
            class="rounded-xl bg-indigo-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="salvar"
          >{{ salvando ? 'Salvando...' : (editando ? 'Salvar' : 'Criar NPC') }}</button>
        </div>
      </template>
    </Modal>

    <!-- ── Modal Confirmação Delete ──────────────────────────────────────── -->
    <Modal
      v-if="modalDeleteAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalDeleteAberto = false"
    >
      <div class="space-y-4 p-6">
        <h3 class="text-base font-bold text-white">Deletar NPC</h3>
        <p class="text-sm text-zinc-400">
          Tem certeza que deseja deletar
          <span class="font-semibold text-white">"{{ npcParaDelete?.nome }}"</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div v-if="erroDelete" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroDelete }}</div>
        <div class="flex gap-3">
          <button type="button" :disabled="deletando" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-300 transition-colors hover:border-white/20 disabled:opacity-50" @click="modalDeleteAberto = false">Cancelar</button>
          <button type="button" :disabled="deletando" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50" @click="confirmarDelete">{{ deletando ? 'Deletando...' : 'Deletar' }}</button>
        </div>
      </div>
    </Modal>

    <!-- ── Modal Acesso de Players ───────────────────────────────────────── -->
    <Modal
      v-if="modalAcessoAberto"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModalAcesso"
    >
      <template #header>
        <h3 class="text-base font-bold text-white">Acesso ao NPC</h3>
        <p class="text-xs text-zinc-500 mt-0.5">{{ npcAcesso?.nome }}</p>
        <button type="button" @click="fecharModalAcesso" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-4">
        <div v-if="carregandoAcessos" class="py-8 text-center text-xs text-zinc-500">Carregando...</div>
        <div v-else-if="!acessos.length" class="py-8 text-center text-xs text-zinc-500 italic">
          Nenhum player com personagem ativo encontrado.
        </div>
        <div v-else class="space-y-1 max-h-72 overflow-y-auto">
          <label
            v-for="player in acessos"
            :key="player.character_id"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            :class="player.tem_acesso ? 'bg-indigo-950/30' : ''"
          >
            <input
              type="checkbox"
              :checked="player.tem_acesso"
              class="h-4 w-4 rounded accent-indigo-500"
              :disabled="togglingAcesso === player.character_id"
              @change="toggleAcesso(player)"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate" :class="player.tem_acesso ? 'text-indigo-200' : 'text-zinc-300'">
                {{ player.nome }}
              </p>
              <p v-if="player.username" class="text-xs text-zinc-600 truncate">@{{ player.username }}</p>
            </div>
            <span v-if="togglingAcesso === player.character_id" class="text-[0.6rem] text-zinc-600">...</span>
          </label>
        </div>
        <div v-if="erroAcesso" class="mt-3 rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">{{ erroAcesso }}</div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import { api } from '@/plugins/axios'
import {
  listarNpcsAdmin, criarNpc, editarNpc, deletarNpc,
  listarAcessosNpc, concederAcessoNpc, revogarAcessoNpc,
  type NpcApi, type NpcAcessoPlayer,
} from '@/lib/api/npcs.api'
import { listarRacasPublicas, type RacaApi } from '@/lib/api/racas.api'

const router = useRouter()

const carregando = ref(true)
const erro       = ref('')
const npcs       = ref<NpcApi[]>([])
const racas      = ref<RacaApi[]>([])

const racasOptions = computed(() => [
  { value: '', label: 'Sem raça' },
  ...racas.value.map(r => ({ value: Number(r.id), label: r.nome })),
])

// Modal form
const modalAberto = ref(false)
const editando    = ref<NpcApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')
const form = ref({ nome: '', raca_id: '' as number | string, descricao: '', foto_url: '' })

// Modal delete
const modalDeleteAberto = ref(false)
const npcParaDelete     = ref<NpcApi | null>(null)
const deletando         = ref(false)
const erroDelete        = ref('')

// Upload de imagem
const uploadandoImagem = ref(false)
const erroUpload       = ref('')

async function uploadImagem(file: File) {
  if (!file.type.startsWith('image/')) { erroUpload.value = 'Envie uma imagem válida.'; return }
  if (file.size > 8 * 1024 * 1024) { erroUpload.value = 'Imagem excede 8 MB.'; return }
  uploadandoImagem.value = true
  erroUpload.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post<{ publicUrl: string }>('/npcs/admin/upload-image', fd)
    form.value.foto_url = data.publicUrl
  } catch (err: any) {
    erroUpload.value = err?.response?.data?.error ?? err.message ?? 'Erro ao enviar imagem.'
  } finally {
    uploadandoImagem.value = false
  }
}

function onSelecionarImagem(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadImagem(file)
}

function onDropImagem(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadImagem(file)
}

// Modal acesso
const modalAcessoAberto  = ref(false)
const npcAcesso          = ref<NpcApi | null>(null)
const acessos            = ref<NpcAcessoPlayer[]>([])
const carregandoAcessos  = ref(false)
const togglingAcesso     = ref<number | null>(null)
const erroAcesso         = ref('')

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    const [npcsData, racasData] = await Promise.all([listarNpcsAdmin(), listarRacasPublicas()])
    npcs.value  = npcsData
    racas.value = racasData
  } catch (err: any) {
    erro.value = err?.response?.data?.error ?? err.message ?? 'Erro ao carregar.'
  } finally {
    carregando.value = false
  }
}

function abrirModal(npc?: NpcApi) {
  editando.value     = npc ?? null
  erroModal.value    = ''
  erroUpload.value   = ''
  uploadandoImagem.value = false
  if (npc) {
    form.value = {
      nome:      npc.nome,
      raca_id:   npc.raca_id ?? '',
      descricao: npc.descricao ?? '',
      foto_url:  npc.foto_url  ?? '',
    }
  } else {
    form.value = { nome: '', raca_id: '', descricao: '', foto_url: '' }
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  editando.value    = null
}

async function salvar() {
  if (!form.value.nome.trim()) return
  salvando.value  = true
  erroModal.value = ''
  try {
    const payload = {
      nome:      form.value.nome.trim(),
      raca_id:   form.value.raca_id ? Number(form.value.raca_id) : null,
      descricao: form.value.descricao.trim() || undefined,
      foto_url:  form.value.foto_url.trim()  || undefined,
    }
    if (editando.value) {
      const updated = await editarNpc(editando.value.id, payload)
      const idx = npcs.value.findIndex(n => n.id === editando.value!.id)
      if (idx !== -1) npcs.value[idx] = updated
    } else {
      npcs.value.unshift(await criarNpc(payload))
    }
    fecharModal()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

function abrirConfirmacaoDelete(npc: NpcApi) {
  npcParaDelete.value     = npc
  erroDelete.value        = ''
  modalDeleteAberto.value = true
}

async function confirmarDelete() {
  if (!npcParaDelete.value) return
  deletando.value  = true
  erroDelete.value = ''
  try {
    await deletarNpc(npcParaDelete.value.id)
    npcs.value          = npcs.value.filter(n => n.id !== npcParaDelete.value!.id)
    modalDeleteAberto.value = false
  } catch (err: any) {
    erroDelete.value = err?.response?.data?.error ?? err.message ?? 'Erro ao deletar.'
  } finally {
    deletando.value = false
  }
}

async function abrirModalAcesso(npc: NpcApi) {
  npcAcesso.value         = npc
  erroAcesso.value        = ''
  acessos.value           = []
  modalAcessoAberto.value = true
  carregandoAcessos.value = true
  try {
    acessos.value = await listarAcessosNpc(npc.id)
  } catch (err: any) {
    erroAcesso.value = err?.response?.data?.error ?? err.message ?? 'Erro ao carregar acessos.'
  } finally {
    carregandoAcessos.value = false
  }
}

function fecharModalAcesso() {
  modalAcessoAberto.value = false
  npcAcesso.value         = null
}

async function toggleAcesso(player: NpcAcessoPlayer) {
  if (!npcAcesso.value || togglingAcesso.value !== null) return
  togglingAcesso.value = player.character_id
  erroAcesso.value     = ''
  try {
    if (player.tem_acesso) {
      await revogarAcessoNpc(npcAcesso.value.id, player.character_id)
    } else {
      await concederAcessoNpc(npcAcesso.value.id, player.character_id)
    }
    player.tem_acesso = !player.tem_acesso
  } catch (err: any) {
    erroAcesso.value = err?.response?.data?.error ?? err.message ?? 'Erro ao alterar acesso.'
  } finally {
    togglingAcesso.value = null
  }
}

onMounted(carregar)
</script>
