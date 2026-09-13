<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#1a1206] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(245_158_11/0.07),transparent)]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">◈ Livros e Notas ◈</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-500"
          @click="abrirModal(null)"
        >
          + Nova nota
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <!-- As colunas somem por breakpoint (hidden sm:block), então o grid também muda por breakpoint:
           com as trilhas fixas de PC num celular, a coluna do título ficava com largura zero. -->
      <p class="mb-2 text-sm text-zinc-500">
        Os livros, pergaminhos, bilhetes e cartas que os jogadores encontram na prateleira.
        Clique numa nota para editar o conteúdo, a capa e <strong class="text-zinc-400">para quem ela está liberada</strong>.
      </p>
      <p class="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-500">
        No conteúdo, <code class="text-zinc-300">---</code> numa linha sozinha quebra a página do livro;
        nos formatos de folha única vira um ornamento.
      </p>

      <div class="mb-4 flex flex-wrap gap-3">
        <input
          v-model="busca"
          type="text"
          placeholder="Filtrar por título ou subtítulo..."
          class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 sm:max-w-xs"
        />
        <div class="w-full sm:w-44">
          <VSelect v-model="filtroFormato" :options="opcoesFiltroFormato" />
        </div>
        <div class="w-full sm:w-48">
          <VSelect v-model="filtroVisibilidade" :options="opcoesFiltroVisibilidade" />
        </div>
      </div>

      <DataTable
        :colunas="[
          { label: 'Nota' },
          { label: 'Formato', classe: 'hidden sm:block' },
          { label: 'Para quem' },
          { label: 'Páginas', classe: 'hidden md:block' },
        ]"
        classe-grid="grid items-center gap-3 grid-cols-[1fr_7rem_3rem] sm:grid-cols-[2.4fr_6.5rem_9rem_3rem] md:grid-cols-[2.4fr_6.5rem_9rem_4.5rem_3rem]"
        :itens="listaFiltrada"
        :carregando="carregando"
        mensagem-vazia="Nenhuma nota neste mundo ainda."
        @editar="(item) => abrirModal(item as LoreNoteApi)"
        @deletar="(item) => paraDeletar = item as LoreNoteApi"
      >
        <template #linha="{ item }">
          <button type="button" class="flex min-w-0 items-center gap-3 text-left" @click="abrirModal(item as LoreNoteApi)">
            <img v-if="(item as LoreNoteApi).capa_url" :src="(item as LoreNoteApi).capa_url!" alt="" class="h-11 w-8 shrink-0 rounded-sm object-cover shadow-md shadow-black/50" />
            <span v-else class="flex h-11 w-8 shrink-0 items-center justify-center rounded-sm border border-white/[0.08] bg-black/30 text-lg">{{ ICONE_DO_FORMATO[(item as LoreNoteApi).formato] }}</span>
            <span class="min-w-0">
              <span class="line-clamp-2 font-medium leading-snug text-amber-100 sm:truncate">{{ (item as LoreNoteApi).title }}</span>
              <span v-if="(item as LoreNoteApi).subtitle" class="block truncate text-xs italic text-zinc-500">{{ (item as LoreNoteApi).subtitle }}</span>
            </span>
          </button>

          <span class="hidden text-xs text-zinc-400 sm:block">{{ rotuloDoFormato((item as LoreNoteApi).formato) }}</span>

          <span :title="nomesDosLeitores(item as LoreNoteApi)">
            <span
              class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
              :class="CLASSE_DA_VISIBILIDADE[(item as LoreNoteApi).visibilidade]"
            >{{ rotuloDeParaQuem(item as LoreNoteApi) }}</span>
          </span>

          <span class="hidden text-xs text-zinc-500 md:block">
            {{ (item as LoreNoteApi).formato === 'livro' ? contarPaginas((item as LoreNoteApi).content) : 'folha única' }}
          </span>
        </template>

        <template #vazia-cta>
          <button
            type="button"
            class="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500"
            @click="abrirModal(null)"
          >
            Escrever a primeira
          </button>
        </template>
      </DataTable>

      <p v-if="feedback" class="mt-4 text-center text-xs" :class="feedbackErro ? 'text-red-400' : 'text-emerald-400'">{{ feedback }}</p>
    </main>

    <!-- ── Modal: uma nota, em três abas ─────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-2xl"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModal"
    >
      <template #header>
        <!-- O header do Modal é um flex: sem w-full a tira de abas encolhe ao tamanho do texto. -->
        <div class="w-full space-y-3">
          <p class="truncate text-base font-bold text-white">{{ editando ? editando.title : 'Nova nota' }}</p>
          <div class="flex gap-1 rounded-xl bg-black/30 p-1 text-xs">
            <button
              v-for="tab in ABAS"
              :key="tab.id"
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 font-semibold transition-colors"
              :class="aba === tab.id ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'"
              @click="aba = tab.id"
            >
              {{ tab.label }}
              <span v-if="tab.id === 'acesso'" class="ml-1 opacity-70">· {{ resumoDoAcesso }}</span>
            </button>
          </div>
        </div>
      </template>

      <div class="space-y-4 p-6">
        <!-- Conteúdo -->
        <template v-if="aba === 'conteudo'">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Título</label>
              <input v-model="form.title" type="text" placeholder="A Queda de Vellmoor" :class="CLASSE_INPUT" />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Subtítulo</label>
              <input v-model="form.subtitle" type="text" placeholder="opcional" :class="CLASSE_INPUT" />
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_11rem]">
            <div class="space-y-1">
              <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Conteúdo</label>
              <textarea
                v-model="form.content"
                rows="12"
                placeholder="O texto da nota...&#10;&#10;Use --- em linha separada para quebrar páginas."
                class="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 outline-none focus:border-amber-500/50"
              />
            </div>
            <!-- A prévia da primeira página, como o jogador vai ver. -->
            <div class="hidden sm:block">
              <p class="mb-1 text-xs text-zinc-500">Página 1</p>
              <div class="previa">
                <p v-if="form.title" class="previa__titulo">{{ form.title }}</p>
                <p v-if="form.subtitle" class="previa__subtitulo">{{ form.subtitle }}</p>
                <div v-if="form.title" class="previa__regua" />
                <p v-if="primeiraPagina" class="previa__texto">{{ primeiraPagina }}</p>
                <p v-else class="previa__vazia">O conteúdo aparece aqui...</p>
              </div>
              <p v-if="totalDePaginas > 1 && form.formato === 'livro'" class="mt-1 text-right text-[0.65rem] text-zinc-600">+ {{ totalDePaginas - 1 }} página(s)</p>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">PDF anexo</label>
            <div
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-amber-600/25 bg-black/10 px-4 py-2.5 transition-colors hover:border-amber-500/40"
              @click="inputPdfRef?.click()"
            >
              <input ref="inputPdfRef" type="file" accept=".pdf" class="hidden" @change="selecionarPdf" />
              <svg class="h-4 w-4 shrink-0 text-amber-400/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p v-if="pdfFile" class="flex-1 truncate text-sm text-amber-200">{{ pdfFile.name }}</p>
              <p v-else-if="form.pdfUrl" class="flex-1 truncate text-sm text-amber-200">{{ nomeDoArquivo(form.pdfUrl) }}</p>
              <p v-else class="flex-1 text-sm text-zinc-500">Adicionar PDF (opcional)</p>
              <button v-if="pdfFile || form.pdfUrl" type="button" class="text-zinc-500 transition-colors hover:text-red-400" @click.stop="pdfFile = null; form.pdfUrl = null">✕</button>
            </div>
            <p class="text-[0.65rem] text-zinc-600">O arquivo fica em /uploads/, público: o acesso restringe a prateleira, não o PDF.</p>
          </div>
        </template>

        <!-- Formato e capas -->
        <template v-else-if="aba === 'formato'">
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="formato in FORMATOS_DA_NOTA"
              :key="formato.value"
              type="button"
              class="rounded-xl border px-3 py-2 text-left transition-colors"
              :class="form.formato === formato.value
                ? 'border-amber-500/60 bg-amber-900/25 text-amber-100'
                : 'border-white/[0.08] bg-black/10 text-zinc-400 hover:border-amber-600/30'"
              @click="form.formato = formato.value"
            >
              <p class="text-sm font-semibold">{{ formato.icone }} {{ formato.label }}</p>
              <p class="text-[0.7rem] leading-snug opacity-80">{{ formato.descricao }}</p>
            </button>
          </div>

          <!-- Só o livro tem capa. Sem capa, o leitor desenha a padrão; sem contracapa, repete a capa sem o título. -->
          <div v-if="form.formato === 'livro'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input ref="inputCapaRef" type="file" accept="image/*" class="hidden" @change="selecionarCapa($event, 'capa')" />
            <input ref="inputContracapaRef" type="file" accept="image/*" class="hidden" @change="selecionarCapa($event, 'contracapa')" />
            <div
              v-for="lado in LADOS"
              :key="lado.id"
              class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-amber-600/25 bg-black/10 px-3 py-2 transition-colors hover:border-amber-500/40"
              @click="(lado.id === 'capa' ? inputCapaRef : inputContracapaRef)?.click()"
            >
              <img v-if="previaDaCapa(lado.id)" :src="previaDaCapa(lado.id)!" alt="" class="h-14 w-10 shrink-0 rounded object-cover" />
              <div v-else class="flex h-14 w-10 shrink-0 items-center justify-center rounded border border-amber-600/30 text-amber-500/50">{{ lado.id === 'capa' ? '📖' : '◻' }}</div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm" :class="previaDaCapa(lado.id) ? 'text-amber-200' : 'text-zinc-500'">{{ lado.label }}</p>
                <p class="text-[0.65rem] text-zinc-600">{{ previaDaCapa(lado.id) ? 'personalizada' : lado.semEla }}</p>
              </div>
              <button v-if="previaDaCapa(lado.id)" type="button" class="text-zinc-500 hover:text-red-400" @click.stop="limparCapa(lado.id)">✕</button>
            </div>
          </div>
          <p v-else class="text-xs text-zinc-500">Folha única não tem capa — a cara do papel vem do formato.</p>
        </template>

        <!-- Acesso -->
        <template v-else>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              v-for="opcao in VISIBILIDADES_DA_NOTA"
              :key="opcao.value"
              type="button"
              class="rounded-xl border px-3 py-2 text-left transition-colors"
              :class="form.visibilidade === opcao.value
                ? 'border-amber-500/60 bg-amber-900/25 text-amber-100'
                : 'border-white/[0.08] bg-black/10 text-zinc-400 hover:border-amber-600/30'"
              @click="form.visibilidade = opcao.value"
            >
              <p class="text-sm font-semibold">{{ opcao.label }}</p>
              <p class="text-[0.7rem] leading-snug opacity-80">{{ opcao.descricao }}</p>
            </button>
          </div>

          <div v-if="form.visibilidade === 'escolhidos'" class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500">Quem pode ler</p>
              <div class="flex gap-3 text-xs">
                <button type="button" class="text-amber-400 hover:text-amber-200" @click="marcarTodos">marcar todos</button>
                <button type="button" class="text-zinc-500 hover:text-white" @click="form.characterIds = []">limpar</button>
              </div>
            </div>
            <p v-if="carregandoPersonagens" class="animate-pulse text-xs text-zinc-500">Carregando personagens...</p>
            <p v-else-if="personagensDoModal.length === 0" class="text-xs text-zinc-500">Nenhum personagem neste mundo ainda.</p>
            <div v-else class="max-h-64 space-y-1 overflow-y-auto pr-1">
              <label
                v-for="personagem in personagensDoModal"
                :key="personagem.character_id"
                class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors"
                :class="form.characterIds.includes(personagem.character_id)
                  ? 'border-amber-500/40 bg-amber-900/15'
                  : 'border-white/[0.06] bg-black/10 hover:border-white/15'"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 accent-amber-500"
                  :checked="form.characterIds.includes(personagem.character_id)"
                  @change="alternarPersonagem(personagem.character_id)"
                />
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm text-white">{{ personagem.nome }}</span>
                  <span v-if="personagem.username" class="block truncate text-[0.65rem] text-zinc-500">@{{ personagem.username }}</span>
                </span>
              </label>
            </div>
          </div>
        </template>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
        <p v-if="enviandoArquivos" class="animate-pulse text-xs text-amber-400">Enviando arquivos...</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="fecharModal">
            Cancelar
          </button>
          <button type="button" :disabled="salvando || !form.title.trim()"
            class="flex-1 rounded-2xl bg-amber-600 py-2.5 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-40"
            @click="salvar">
            {{ salvando ? 'Salvando...' : (editando ? 'Salvar' : 'Criar nota') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- ── Confirmação ────────────────────────────────────────────────────── -->
    <Modal
      v-if="paraDeletar"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="paraDeletar = null"
    >
      <div class="space-y-4 p-6">
        <p class="text-base font-bold text-white">Apagar nota?</p>
        <p class="text-sm text-zinc-400">
          <strong class="text-white">{{ paraDeletar.title }}</strong> some da prateleira de todo mundo.
          O PDF e as capas continuam no disco.
        </p>
        <div class="flex gap-3">
          <button type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="paraDeletar = null">
            Cancelar
          </button>
          <button type="button" :disabled="salvando"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="deletar">
            Apagar
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listAllLoreNotes, createLoreNote, updateLoreNote, deleteLoreNote,
  listarAcessosLoreNote, listarPersonagensDoMundo, uploadCapaLore, uploadPdfLore,
  FORMATOS_DA_NOTA, ICONE_DO_FORMATO, VISIBILIDADES_DA_NOTA,
  type LoreNoteApi, type AcessoDaNotaApi, type FormatoDaNota, type VisibilidadeDaNota,
} from '@/lib/api/lore-notes.api'

const router = useRouter()

const CLASSE_INPUT = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50'

const CLASSE_DA_VISIBILIDADE: Record<VisibilidadeDaNota, string> = {
  todos: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  escolhidos: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  ninguem: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-400',
}

const ABAS = [
  { id: 'conteudo', label: 'Conteúdo' },
  { id: 'formato', label: 'Formato e capas' },
  { id: 'acesso', label: 'Acesso' },
] as const
type Aba = (typeof ABAS)[number]['id']

const LADOS = [
  { id: 'capa', label: 'Capa personalizada', semEla: 'sem ela, a capa padrão com o título' },
  { id: 'contracapa', label: 'Contracapa', semEla: 'sem ela, repete a capa sem o título' },
] as const
type Lado = (typeof LADOS)[number]['id']

// ── Lista ─────────────────────────────────────────────────────────────────────
const notas = ref<LoreNoteApi[]>([])
const carregando = ref(false)
const busca = ref('')
const filtroFormato = ref<string>('')
const filtroVisibilidade = ref<string>('')
const feedback = ref('')
const feedbackErro = ref(false)

/** Os personagens do mundo, para dar nome à coluna "para quem" e à lista de acesso de nota nova. */
const personagensDoMundo = ref<AcessoDaNotaApi[]>([])

const opcoesFiltroFormato = [
  { value: '', label: 'Todos os formatos' },
  ...FORMATOS_DA_NOTA.map((formato) => ({ value: formato.value, label: formato.label })),
]
const opcoesFiltroVisibilidade = [
  { value: '', label: 'Qualquer acesso' },
  ...VISIBILIDADES_DA_NOTA.map((opcao) => ({ value: opcao.value, label: opcao.label })),
]

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return notas.value.filter((nota) => {
    if (filtroFormato.value && nota.formato !== filtroFormato.value) return false
    if (filtroVisibilidade.value && nota.visibilidade !== filtroVisibilidade.value) return false
    if (!termo) return true
    return nota.title.toLowerCase().includes(termo) || (nota.subtitle ?? '').toLowerCase().includes(termo)
  })
})

function rotuloDoFormato(formato: FormatoDaNota): string {
  return FORMATOS_DA_NOTA.find((item) => item.value === formato)?.label ?? formato
}

function contarPaginas(conteudo: string): number {
  return conteudo.trim() ? conteudo.split(/\n---+\n/).length : 0
}

function rotuloDeParaQuem(nota: LoreNoteApi): string {
  if (nota.visibilidade === 'todos') return 'Todos'
  if (nota.visibilidade === 'ninguem') return 'Ninguém'
  const total = nota.character_ids.length
  return total === 1 ? '1 personagem' : `${total} personagens`
}

function nomesDosLeitores(nota: LoreNoteApi): string {
  if (nota.visibilidade !== 'escolhidos') return ''
  return nota.character_ids
    .map((id) => personagensDoMundo.value.find((personagem) => personagem.character_id === id)?.nome ?? `#${id}`)
    .join(', ')
}

async function carregar() {
  carregando.value = true
  try {
    const [lista, personagens] = await Promise.all([listAllLoreNotes(), listarPersonagensDoMundo()])
    notas.value = lista
    personagensDoMundo.value = personagens
  } catch (erro: any) {
    mostrarFeedback(erro?.response?.data?.message || 'Erro ao carregar as notas.', true)
  } finally {
    carregando.value = false
  }
}

function mostrarFeedback(texto: string, erro = false) {
  feedback.value = texto
  feedbackErro.value = erro
}

// ── Modal ─────────────────────────────────────────────────────────────────────
const modalAberto = ref(false)
const editando = ref<LoreNoteApi | null>(null)
const aba = ref<Aba>('conteudo')
const salvando = ref(false)
const erroModal = ref('')
const enviandoArquivos = ref(false)

function formVazio() {
  return {
    title: '',
    subtitle: '',
    content: '',
    pdfUrl: null as string | null,
    formato: 'livro' as FormatoDaNota,
    capaUrl: null as string | null,
    contracapaUrl: null as string | null,
    visibilidade: 'todos' as VisibilidadeDaNota,
    characterIds: [] as number[],
  }
}
const form = ref(formVazio())

// Os arquivos escolhidos só sobem ao salvar; até lá ficam como File, com um object URL para a prévia.
const inputPdfRef = ref<HTMLInputElement | null>(null)
const inputCapaRef = ref<HTMLInputElement | null>(null)
const inputContracapaRef = ref<HTMLInputElement | null>(null)
const pdfFile = ref<File | null>(null)
const capaFile = ref<File | null>(null)
const contracapaFile = ref<File | null>(null)
const capaPreview = ref<string | null>(null)
const contracapaPreview = ref<string | null>(null)

/** A lista de acesso do modal: a da nota (com quem já lê marcado) ou a do mundo, para nota nova. */
const personagensDoModal = ref<AcessoDaNotaApi[]>([])
const carregandoPersonagens = ref(false)

const primeiraPagina = computed(() => form.value.content.split(/\n---+\n/)[0]?.trim() ?? '')
const totalDePaginas = computed(() => contarPaginas(form.value.content))

const resumoDoAcesso = computed(() => {
  if (form.value.visibilidade === 'todos') return 'todos'
  if (form.value.visibilidade === 'ninguem') return 'ninguém'
  return String(form.value.characterIds.length)
})

async function abrirModal(nota: LoreNoteApi | null) {
  editando.value = nota
  aba.value = 'conteudo'
  erroModal.value = ''
  pdfFile.value = null
  limparCapa('capa')
  limparCapa('contracapa')
  form.value = nota
    ? {
        title: nota.title,
        subtitle: nota.subtitle ?? '',
        content: nota.content,
        pdfUrl: nota.pdf_url,
        formato: nota.formato,
        capaUrl: nota.capa_url,
        contracapaUrl: nota.contracapa_url,
        visibilidade: nota.visibilidade,
        characterIds: [...nota.character_ids],
      }
    : formVazio()
  modalAberto.value = true

  carregandoPersonagens.value = true
  try {
    personagensDoModal.value = nota ? await listarAcessosLoreNote(nota.id) : personagensDoMundo.value
  } catch {
    personagensDoModal.value = personagensDoMundo.value
  } finally {
    carregandoPersonagens.value = false
  }
}

function fecharModal() {
  modalAberto.value = false
  limparCapa('capa')
  limparCapa('contracapa')
}

function selecionarPdf(evento: Event) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return
  pdfFile.value = arquivo
}

function selecionarCapa(evento: Event, lado: Lado) {
  const arquivo = (evento.target as HTMLInputElement).files?.[0]
  if (!arquivo) return
  limparCapa(lado)
  if (lado === 'capa') { capaFile.value = arquivo; capaPreview.value = URL.createObjectURL(arquivo) }
  else { contracapaFile.value = arquivo; contracapaPreview.value = URL.createObjectURL(arquivo) }
}

/** Some a imagem nova e também a que já estava gravada — é o "tirar". */
function limparCapa(lado: Lado) {
  const preview = lado === 'capa' ? capaPreview : contracapaPreview
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = null
  if (lado === 'capa') { capaFile.value = null; if (modalAberto.value) form.value.capaUrl = null }
  else { contracapaFile.value = null; if (modalAberto.value) form.value.contracapaUrl = null }
}

function previaDaCapa(lado: Lado): string | null {
  return lado === 'capa' ? (capaPreview.value ?? form.value.capaUrl) : (contracapaPreview.value ?? form.value.contracapaUrl)
}

function nomeDoArquivo(url: string): string {
  return decodeURIComponent(url.split('/').pop() ?? url)
}

function alternarPersonagem(id: number) {
  const lista = form.value.characterIds
  const posicao = lista.indexOf(id)
  if (posicao === -1) lista.push(id)
  else lista.splice(posicao, 1)
}

function marcarTodos() {
  form.value.characterIds = personagensDoModal.value.map((personagem) => personagem.character_id)
}

async function salvar() {
  if (!form.value.title.trim()) return
  salvando.value = true
  erroModal.value = ''
  try {
    let pdfUrl = form.value.pdfUrl
    let capaUrl = form.value.capaUrl
    let contracapaUrl = form.value.contracapaUrl
    if (pdfFile.value || capaFile.value || contracapaFile.value) {
      enviandoArquivos.value = true
      if (pdfFile.value) pdfUrl = (await uploadPdfLore(pdfFile.value)).path
      if (form.value.formato === 'livro') {
        if (capaFile.value) capaUrl = (await uploadCapaLore(capaFile.value)).path
        if (contracapaFile.value) contracapaUrl = (await uploadCapaLore(contracapaFile.value)).path
      }
      enviandoArquivos.value = false
    }
    // Folha única não tem capa: o que estava gravado sai junto com a troca de formato.
    if (form.value.formato !== 'livro') { capaUrl = null; contracapaUrl = null }

    const payload = {
      title: form.value.title.trim(),
      subtitle: form.value.subtitle.trim() || undefined,
      content: form.value.content,
      pdfUrl,
      formato: form.value.formato,
      capaUrl,
      contracapaUrl,
      visibilidade: form.value.visibilidade,
      // A lista só vale com 'escolhidos'; nos outros o servidor a apaga.
      characterIds: form.value.visibilidade === 'escolhidos' ? form.value.characterIds : undefined,
    }

    if (editando.value) {
      const salva = await updateLoreNote(editando.value.id, payload)
      const posicao = notas.value.findIndex((nota) => nota.id === salva.id)
      if (posicao !== -1) notas.value[posicao] = salva
      mostrarFeedback(`"${salva.title}" salva.`)
    } else {
      const criada = await createLoreNote(payload)
      notas.value.push(criada)
      mostrarFeedback(`"${criada.title}" criada.`)
    }
    fecharModal()
  } catch (erro: any) {
    erroModal.value = erro?.response?.data?.message || 'Erro ao salvar a nota.'
  } finally {
    enviandoArquivos.value = false
    salvando.value = false
  }
}

// ── Apagar ────────────────────────────────────────────────────────────────────
const paraDeletar = ref<LoreNoteApi | null>(null)

async function deletar() {
  if (!paraDeletar.value) return
  salvando.value = true
  try {
    await deleteLoreNote(paraDeletar.value.id)
    notas.value = notas.value.filter((nota) => nota.id !== paraDeletar.value!.id)
    mostrarFeedback(`"${paraDeletar.value.title}" apagada.`)
    paraDeletar.value = null
  } catch (erro: any) {
    mostrarFeedback(erro?.response?.data?.message || 'Erro ao apagar a nota.', true)
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
/* A prévia imita a página do livro: papel claro, tipografia do leitor. */
.previa {
  min-height: 12rem;
  border-radius: 0.6rem;
  padding: 0.9rem;
  color: #2a1a0c;
  font-family: 'EB Garamond', Georgia, serif;
  background: linear-gradient(180deg, #f1e7cf, #e6d8b5);
  box-shadow: inset 0 0 0 1px rgba(90, 55, 15, 0.15);
}
.previa__titulo {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  color: #2b3a1e;
  margin: 0;
}
.previa__subtitulo {
  text-align: center;
  font-style: italic;
  font-size: 0.65rem;
  color: #5a4020;
  margin: 0.1rem 0 0;
}
.previa__regua {
  height: 1px;
  margin: 0.5rem auto;
  width: 60%;
  background: linear-gradient(to right, transparent, #9a7a3a, transparent);
}
.previa__texto {
  white-space: pre-wrap;
  font-size: 0.68rem;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 14;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.previa__vazia {
  font-size: 0.68rem;
  font-style: italic;
  color: #9a8a6a;
  margin: 0;
}
</style>
