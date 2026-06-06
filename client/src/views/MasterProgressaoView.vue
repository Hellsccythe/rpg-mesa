<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(99_102_241/0.08),transparent)]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">⚔ Progressão de XP ⚔</span>
        </div>
        <div class="w-20" />
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

      <!-- Tabs -->
      <div class="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
          :class="abaAtiva === tab.id
            ? 'bg-indigo-600 text-white shadow'
            : 'text-zinc-400 hover:text-zinc-200'"
          @click="abaAtiva = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ── Tab: Tabela XP ─────────────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'tabela'">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VSelect
            v-model="filtroClasseId"
            :options="opcoesClasseComVazio"
            root-class="w-full sm:w-64"
            placeholder="Todas as classes"
          />
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            @click="abrirModalCriacao"
          >
            + Adicionar Entradas
          </button>
        </div>

        <DataTable
          :colunas="[
            { label: 'Classe' },
            { label: 'Nível', classe: 'hidden sm:block' },
            { label: 'XP Necessário' },
          ]"
          classe-grid="grid grid-cols-[2fr_4rem_2fr_3rem] items-center gap-3"
          :itens="progressaoFiltrada"
          :carregando="carregando"
          mensagem-vazia="Nenhuma entrada de progressão cadastrada."
          @editar="iniciarEdicao"
          @deletar="confirmarDelete"
        >
          <template #linha="{ item }">
            <p class="font-medium text-zinc-200 truncate">{{ (item as ProgressaoClasseApi).classe_nome ?? `Classe #${(item as ProgressaoClasseApi).classe_id}` }}</p>
            <span class="hidden sm:inline-flex items-center justify-center rounded-full bg-indigo-900/50 text-indigo-300 px-2 py-0.5 text-xs font-bold">
              Nv.{{ (item as ProgressaoClasseApi).nivel }}
            </span>
            <p class="text-sm text-zinc-300">{{ (item as ProgressaoClasseApi).xp_necessario.toLocaleString('pt-BR') }} XP</p>
          </template>
          <template #vazia-cta>
            <button type="button" class="mt-2 text-sm text-indigo-400 hover:text-indigo-300" @click="abrirModalCriacao">
              Criar primeira entrada
            </button>
          </template>
        </DataTable>
      </template>

      <!-- ── Tab: Atribuir XP ───────────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'atribuir'">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg space-y-5">
          <p class="text-sm text-zinc-400">Selecione o personagem e a classe para atribuir XP. O sistema aplica o nível automaticamente se o limiar for atingido.</p>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
            <VSelect v-model="xpCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Classe</label>
            <VSelect v-model="xpClassId" :options="opcoesClassePersonagem" placeholder="Selecione a classe..." />
            <p v-if="infoClasseAtual" class="mt-1 text-xs text-zinc-500">{{ infoClasseAtual }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP a Conceder</label>
            <input
              v-model.number="xpAmount"
              type="number"
              min="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
              placeholder="Ex: 100"
            />
          </div>

          <p v-if="erroXp" class="text-sm text-red-400">{{ erroXp }}</p>
          <p v-if="feedbackXp" class="text-sm text-emerald-400">{{ feedbackXp }}</p>

          <button
            type="button"
            :disabled="salvandoXp || !xpCharacterId || !xpClassId || !xpAmount || xpAmount < 1"
            class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            @click="concederXp"
          >
            {{ salvandoXp ? 'Concedendo...' : 'Conceder XP' }}
          </button>
        </div>
      </template>

    </main>
  </div>

  <!-- ══════════════════════════════════════════════
       Modal CRIAÇÃO — multi-classe + proporcional
       ══════════════════════════════════════════════ -->
  <Modal
    v-if="criacao.aberto"
    title="Adicionar Entradas"
    panel-class="max-w-xl"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="criacao.aberto = false"
  >
    <div class="space-y-5">

      <!-- Classes (multi-checkbox) -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Classes</span>
          <div class="flex gap-3 text-xs">
            <button type="button" class="text-indigo-400 hover:text-indigo-300" @click="criacao.classeIds = classes.map(c => Number(c.id))">Selecionar tudo</button>
            <button type="button" class="text-zinc-500 hover:text-zinc-300" @click="criacao.classeIds = []">Limpar</button>
          </div>
        </div>
        <div class="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2">
          <label
            v-for="c in classes"
            :key="Number(c.id)"
            class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
          >
            <input type="checkbox" :value="Number(c.id)" v-model="criacao.classeIds" class="h-3.5 w-3.5 accent-indigo-500" />
            <span class="text-sm text-zinc-300">{{ c.name }}</span>
          </label>
          <p v-if="!classes.length" class="px-2 py-2 text-xs text-zinc-600">Nenhuma classe disponível.</p>
        </div>
        <p class="mt-1.5 text-xs text-zinc-600">{{ criacao.classeIds.length }} classe{{ criacao.classeIds.length !== 1 ? 's' : '' }} selecionada{{ criacao.classeIds.length !== 1 ? 's' : '' }}</p>
      </div>

      <!-- Modo -->
      <div>
        <span class="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Modo de geração</span>
        <div class="flex gap-3">
          <label
            v-for="opt in [{ v: 'proporcional', l: 'Proporcional' }, { v: 'manual', l: 'Manual' }]"
            :key="opt.v"
            class="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors"
            :class="criacao.modo === opt.v
              ? 'border-indigo-500/60 bg-indigo-900/30 text-indigo-300'
              : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
          >
            <input type="radio" :value="opt.v" v-model="criacao.modo" class="accent-indigo-500" />
            {{ opt.l }}
          </label>
        </div>
      </div>

      <!-- Proporcional -->
      <template v-if="criacao.modo === 'proporcional'">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              XP base (nível {{ criacao.nivelInicial ?? '?' }})
            </label>
            <input
              v-model.number="criacao.xpBase"
              type="number" min="1"
              placeholder="Ex: 100"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Aumento por nível (%)</label>
            <input
              v-model.number="criacao.aumentoPct"
              type="number" min="0" max="999"
              placeholder="Ex: 30"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível inicial</label>
            <input
              v-model.number="criacao.nivelInicial"
              type="number" min="2" max="20"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível final</label>
            <input
              v-model.number="criacao.nivelFinal"
              type="number" min="2" max="20"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        <!-- Preview -->
        <div v-if="previewProporcional.length">
          <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview da progressão</p>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table class="w-full text-xs">
              <thead class="sticky top-0 bg-[#0A0F1C]">
                <tr class="border-b border-white/10">
                  <th class="px-3 py-2 text-left font-semibold text-zinc-400">Nível</th>
                  <th class="px-3 py-2 text-right font-semibold text-zinc-400">XP necessário</th>
                  <th class="hidden px-3 py-2 text-right font-semibold text-zinc-400 sm:table-cell">Variação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in previewProporcional" :key="row.nivel" class="border-t border-white/[0.05]">
                  <td class="px-3 py-1.5 font-medium text-zinc-300">{{ row.nivel }}</td>
                  <td class="px-3 py-1.5 text-right font-mono text-indigo-300">{{ row.xp.toLocaleString('pt-BR') }}</td>
                  <td class="hidden px-3 py-1.5 text-right text-zinc-500 sm:table-cell">
                    {{ i === 0 ? 'base' : `+${criacao.aumentoPct}%` }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else class="text-xs text-zinc-600">Defina XP base ≥ 1 e nível inicial ≤ nível final para ver o preview.</p>
      </template>

      <!-- Manual -->
      <template v-else>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível</label>
            <input
              v-model.number="criacao.nivelManual"
              type="number" min="1" max="20"
              placeholder="1–20"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP necessário</label>
            <input
              v-model.number="criacao.xpManual"
              type="number" min="0"
              placeholder="Ex: 500"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
      </template>

      <p class="text-xs text-zinc-600">Entradas já existentes (mesmo par classe + nível) serão atualizadas.</p>

      <p v-if="erroCriacao" class="text-sm text-red-400">{{ erroCriacao }}</p>

      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="criacao.aberto = false">
          Cancelar
        </button>
        <button
          type="button"
          :disabled="salvando || totalEntradasCriacao === 0"
          class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          @click="salvarCriacao"
        >
          {{ salvando
            ? 'Criando...'
            : totalEntradasCriacao > 0
              ? `Criar ${totalEntradasCriacao} entrada${totalEntradasCriacao !== 1 ? 's' : ''}`
              : 'Criar entradas' }}
        </button>
      </div>
    </div>
  </Modal>

  <!-- ══════════════════════════════════════════════
       Modal EDIÇÃO — single entry
       ══════════════════════════════════════════════ -->
  <Modal
    v-if="edicao.aberto"
    title="Editar Entrada"
    panel-class="max-w-sm"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="edicao.aberto = false"
  >
    <form class="space-y-4" @submit.prevent="salvarEdicao">
      <p class="text-xs text-zinc-500">
        <span class="font-semibold text-zinc-300">{{ edicao.classeNome }}</span>
        · Nível <span class="font-semibold text-zinc-300">{{ edicao.nivel }}</span>
      </p>

      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP Necessário</label>
        <input
          v-model.number="edicao.xp_necessario"
          type="number" min="0"
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          placeholder="Ex: 500"
        />
      </div>

      <p v-if="erroEdicao" class="text-sm text-red-400">{{ erroEdicao }}</p>

      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="edicao.aberto = false">
          Cancelar
        </button>
        <button type="submit" :disabled="salvando" class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Modal>

  <!-- ══════════════════════════════════════════════
       Modal DELETE
       ══════════════════════════════════════════════ -->
  <Modal
    v-if="deleteModal.aberto"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Remover Entrada</h3>
    <p class="text-sm text-zinc-400">
      Remover progressão do <strong class="text-white">Nível {{ deleteModal.nivel }}</strong> da classe
      <strong class="text-white">{{ deleteModal.classeNome }}</strong>?
    </p>
    <div class="flex gap-3">
      <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="deleteModal.aberto = false">
        Cancelar
      </button>
      <button type="button" :disabled="salvando" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="executarDelete">
        {{ salvando ? 'Removendo...' : 'Remover' }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarProgressaoClasse, editarProgressaoClasse, deletarProgressaoClasse, criarProgressaoClasseBulk,
  listarClassesAdmin,
  type ProgressaoClasseApi, type ClasseApi, type BulkProgressaoItem,
} from '@/lib/api/classes.api'
import { atribuirXpClasse, getCharacterById } from '@/lib/api/personagens.api'
import { useCharactersStore } from '@/stores/characters'

const router = useRouter()

const carregando  = ref(true)
const salvando    = ref(false)
const progressoes = ref<ProgressaoClasseApi[]>([])
const classes     = ref<ClasseApi[]>([])
const filtroClasseId = ref<number | string>('')
const abaAtiva    = ref<'tabela' | 'atribuir'>('tabela')

const tabs = [
  { id: 'tabela' as const,  label: 'Tabela de XP' },
  { id: 'atribuir' as const, label: 'Atribuir XP' },
]

const opcoesClasseComVazio = computed(() => [
  { value: '' as number | string, label: 'Todas as classes' },
  ...classes.value.map(c => ({ value: Number(c.id), label: String(c.name) })),
])

const progressaoFiltrada = computed(() => {
  if (!filtroClasseId.value) return progressoes.value
  return progressoes.value.filter(p => p.classe_id === Number(filtroClasseId.value))
})

// ── Tab Atribuir XP ───────────────────────────────────────────────────────────
const xpCharacterId   = ref('')
const xpClassId       = ref('')
const xpAmount        = ref<number>(100)
const salvandoXp      = ref(false)
const erroXp          = ref('')
const feedbackXp      = ref('')
const xpCharacterData = ref<{ classId: string; name: string; level: number; xp: number }[]>([])

const charactersStore = useCharactersStore()
const opcoesPersonagem = computed(() =>
  charactersStore.publicCharacters.map(c => ({ value: String(c.characterId), label: c.name }))
)
const opcoesClassePersonagem = computed(() =>
  xpCharacterData.value.map(c => ({ value: c.classId, label: `${c.name} (Nv.${c.level})` }))
)
const infoClasseAtual = computed(() => {
  if (!xpClassId.value) return ''
  const c = xpCharacterData.value.find(c => c.classId === xpClassId.value)
  return c ? `XP atual: ${c.xp} · Nível atual: ${c.level}` : ''
})

watch(xpCharacterId, async (id) => {
  xpClassId.value = ''
  xpCharacterData.value = []
  feedbackXp.value = ''
  erroXp.value = ''
  if (!id) return
  try {
    const char = await getCharacterById(id, true)
    const list: any[] = Array.isArray((char as any).data?.classes) ? (char as any).data.classes : []
    xpCharacterData.value = list.map((c: any) => ({
      classId: String(c.classId),
      name:    String(c.name ?? 'Classe'),
      level:   Number(c.level ?? 1),
      xp:      Number(c.xp ?? 0),
    }))
  } catch {}
})

async function concederXp() {
  erroXp.value = ''
  feedbackXp.value = ''
  if (!xpCharacterId.value || !xpClassId.value || !xpAmount.value || xpAmount.value < 1) return
  salvandoXp.value = true
  try {
    const updated = await atribuirXpClasse(xpCharacterId.value, xpClassId.value, xpAmount.value)
    const list: any[] = Array.isArray((updated as any).data?.classes) ? (updated as any).data.classes : []
    xpCharacterData.value = list.map((c: any) => ({
      classId: String(c.classId),
      name:    String(c.name ?? 'Classe'),
      level:   Number(c.level ?? 1),
      xp:      Number(c.xp ?? 0),
    }))
    const atualizada = xpCharacterData.value.find(c => c.classId === xpClassId.value)
    feedbackXp.value = atualizada
      ? `XP concedido. Nível atual: ${atualizada.level} · XP: ${atualizada.xp}`
      : 'XP concedido com sucesso.'
    xpAmount.value = 100
  } catch (err: any) {
    erroXp.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder XP.'
  } finally {
    salvandoXp.value = false
  }
}

// ── Modal Criação (bulk) ──────────────────────────────────────────────────────
const criacao = ref({
  aberto:       false,
  classeIds:    [] as number[],
  modo:         'proporcional' as 'proporcional' | 'manual',
  xpBase:       100,
  aumentoPct:   30,
  nivelInicial: 2,
  nivelFinal:   20,
  nivelManual:  null as number | null,
  xpManual:     0,
})
const erroCriacao = ref('')

function abrirModalCriacao() {
  criacao.value = {
    aberto: true,
    classeIds: [],
    modo: 'proporcional',
    xpBase: 100,
    aumentoPct: 30,
    nivelInicial: 2,
    nivelFinal: 20,
    nivelManual: null,
    xpManual: 0,
  }
  erroCriacao.value = ''
}

const previewProporcional = computed(() => {
  const { xpBase, aumentoPct, nivelInicial, nivelFinal } = criacao.value
  if (!xpBase || xpBase < 1 || !nivelInicial || !nivelFinal || nivelInicial > nivelFinal) return []
  const result: { nivel: number; xp: number }[] = []
  let xp = xpBase
  for (let nivel = nivelInicial; nivel <= nivelFinal; nivel++) {
    result.push({ nivel, xp: Math.round(xp) })
    xp = xp * (1 + (aumentoPct ?? 0) / 100)
  }
  return result
})

const totalEntradasCriacao = computed(() => {
  const n = criacao.value.classeIds.length
  if (!n) return 0
  if (criacao.value.modo === 'manual') {
    const nv = criacao.value.nivelManual
    return nv && nv >= 1 && nv <= 20 ? n : 0
  }
  return n * previewProporcional.value.length
})

async function salvarCriacao() {
  erroCriacao.value = ''
  const { classeIds, modo, nivelManual, xpManual } = criacao.value

  if (!classeIds.length) { erroCriacao.value = 'Selecione ao menos uma classe.'; return }

  const entradas: BulkProgressaoItem[] = []

  if (modo === 'proporcional') {
    if (!previewProporcional.value.length) { erroCriacao.value = 'Configure o XP base e o intervalo de níveis.'; return }
    for (const classeId of classeIds) {
      for (const { nivel, xp } of previewProporcional.value) {
        entradas.push({ classe_id: classeId, nivel, xp_necessario: xp })
      }
    }
  } else {
    if (!nivelManual || nivelManual < 1 || nivelManual > 20) { erroCriacao.value = 'Nível inválido (1–20).'; return }
    if (xpManual < 0) { erroCriacao.value = 'XP não pode ser negativo.'; return }
    for (const classeId of classeIds) {
      entradas.push({ classe_id: classeId, nivel: nivelManual, xp_necessario: xpManual })
    }
  }

  salvando.value = true
  try {
    const created = await criarProgressaoClasseBulk(entradas)
    for (const item of created) {
      const idx = progressoes.value.findIndex(p => p.classe_id === item.classe_id && p.nivel === item.nivel)
      if (idx !== -1) progressoes.value[idx] = item
      else progressoes.value.push(item)
    }
    progressoes.value.sort((a, b) =>
      (a.classe_nome ?? '').localeCompare(b.classe_nome ?? '') || a.nivel - b.nivel
    )
    criacao.value.aberto = false
  } catch (err: any) {
    erroCriacao.value = err?.response?.data?.message ?? err.message ?? 'Erro ao criar entradas.'
  } finally {
    salvando.value = false
  }
}

// ── Modal Edição ──────────────────────────────────────────────────────────────
const edicao = ref({ aberto: false, id: null as number | null, classeNome: '', nivel: 0, xp_necessario: 0 })
const erroEdicao = ref('')

function iniciarEdicao(item: ProgressaoClasseApi) {
  edicao.value = {
    aberto: true,
    id: item.id,
    classeNome: item.classe_nome ?? `Classe #${item.classe_id}`,
    nivel: item.nivel,
    xp_necessario: item.xp_necessario,
  }
  erroEdicao.value = ''
}

async function salvarEdicao() {
  erroEdicao.value = ''
  if (!edicao.value.id) return
  if (edicao.value.xp_necessario < 0) { erroEdicao.value = 'XP não pode ser negativo.'; return }
  salvando.value = true
  try {
    const updated = await editarProgressaoClasse(edicao.value.id, { xp_necessario: edicao.value.xp_necessario })
    const idx = progressoes.value.findIndex(p => p.id === edicao.value.id!)
    if (idx !== -1) progressoes.value[idx] = { ...progressoes.value[idx], ...updated }
    edicao.value.aberto = false
  } catch (err: any) {
    erroEdicao.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

// ── Modal Delete ──────────────────────────────────────────────────────────────
const deleteModal = ref({ aberto: false, id: null as number | null, classeNome: '', nivel: 0 })

function confirmarDelete(item: ProgressaoClasseApi) {
  deleteModal.value = {
    aberto: true,
    id: item.id,
    classeNome: item.classe_nome ?? `Classe #${item.classe_id}`,
    nivel: item.nivel,
  }
}

async function executarDelete() {
  if (!deleteModal.value.id) return
  salvando.value = true
  try {
    await deletarProgressaoClasse(deleteModal.value.id)
    progressoes.value = progressoes.value.filter(p => p.id !== deleteModal.value.id)
    deleteModal.value.aberto = false
  } catch {
    deleteModal.value.aberto = false
  } finally {
    salvando.value = false
  }
}

// ── Carregar ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [progressData, classesData] = await Promise.all([
      listarProgressaoClasse(),
      listarClassesAdmin(),
      charactersStore.fetchPaginaInicial().catch(() => {}),
    ])
    progressoes.value = progressData
    classes.value     = classesData
  } finally {
    carregando.value = false
  }
})
</script>
