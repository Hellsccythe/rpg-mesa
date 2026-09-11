<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(16_185_129/0.08),transparent)]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-emerald-400">⚗ Consumíveis ⚗</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
          @click="abrirForm(null)"
        >
          + Novo Consumível
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <p class="mb-5 text-sm text-zinc-500">
        O que o jogador usa e some — poções, venenos, munição, alimento, pergaminhos.
        Ingredientes que produzem estes itens ficam em <span class="text-zinc-400">Itens</span>, não aqui.
      </p>

      <!-- Filtros -->
      <div class="mb-4 flex flex-wrap gap-3">
        <input
          v-model="busca"
          type="text"
          placeholder="Filtrar por nome ou efeito..."
          class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50 sm:max-w-xs"
        />
        <div class="w-40">
          <VSelect v-model="filtroCategoria" :options="opcoesFiltroCategoria" />
        </div>
        <div class="w-40">
          <VSelect v-model="filtroRaridade" :options="opcoesFiltroRaridade" />
        </div>
      </div>

      <DataTable
        :colunas="[
          { label: 'Nome' },
          { label: 'Categoria', classe: 'hidden sm:block' },
          { label: 'Raridade', classe: 'hidden sm:block' },
          { label: 'Efeito', classe: 'hidden md:block' },
          { label: 'Peso', classe: 'hidden lg:block' },
          { label: 'Valor' },
        ]"
        classe-grid="grid grid-cols-[2fr_7rem_7rem_3fr_4rem_5rem_3rem] items-center gap-3"
        :itens="listaFiltrada"
        :carregando="carregando"
        mensagem-vazia="Nenhum consumível cadastrado."
        @editar="(item) => abrirForm(item as ConsumivelApi)"
        @deletar="(item) => confirmarDelete(item as ConsumivelApi)"
      >
        <template #linha="{ item }">
          <div class="min-w-0">
            <p class="truncate font-medium text-zinc-200">{{ (item as ConsumivelApi).nome }}</p>
            <p v-if="(item as ConsumivelApi).usos > 1" class="text-[0.65rem] text-zinc-600">
              {{ (item as ConsumivelApi).usos }} usos
            </p>
            <p
              v-if="(item as ConsumivelApi).condicoes.length"
              class="truncate text-[0.65rem]"
              :class="(item as ConsumivelApi).condicoes.some(v => v.acao === 'inflige') ? 'text-red-400/80' : 'text-emerald-400/80'"
            >{{ resumoDosVinculos(item as ConsumivelApi) }}</p>
            <p v-if="(item as ConsumivelApi).cura_dado" class="truncate text-[0.65rem] text-emerald-400/80">
              cura {{ (item as ConsumivelApi).cura_dado }}<template v-if="(item as ConsumivelApi).cura_percentual"> + {{ (item as ConsumivelApi).cura_percentual }}%</template>
            </p>
            <p v-if="(item as ConsumivelApi).via" class="truncate text-[0.65rem] text-zinc-500">
              {{ ROTULO_VIA[(item as ConsumivelApi).via!] }}
            </p>
          </div>

          <span class="hidden truncate text-xs text-zinc-500 sm:block">
            {{ (item as ConsumivelApi).categoria?.descricao ?? '—' }}
          </span>

          <span class="hidden sm:block">
            <span
              v-if="(item as ConsumivelApi).raridade"
              class="rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
              :class="classeDaRaridade((item as ConsumivelApi).raridade!.cor)"
            >{{ (item as ConsumivelApi).raridade!.descricao }}</span>
            <span v-else class="text-xs text-zinc-700">—</span>
          </span>

          <span class="hidden truncate text-xs text-zinc-500 md:block">
            {{ (item as ConsumivelApi).efeito || '—' }}
          </span>

          <span class="hidden text-xs text-zinc-500 lg:block">
            {{ (item as ConsumivelApi).peso !== null ? `${(item as ConsumivelApi).peso} kg` : '—' }}
          </span>

          <span class="text-xs font-semibold text-amber-300">
            {{ (item as ConsumivelApi).valor !== null ? `${(item as ConsumivelApi).valor} pr` : '—' }}
          </span>
        </template>

        <template #vazia-cta>
          <button
            type="button"
            class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            @click="abrirForm(null)"
          >
            Criar o primeiro
          </button>
        </template>
      </DataTable>
    </main>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-xl max-h-[90vh] flex flex-col"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalAberto = false"
    >
      <template #header>
        <p class="text-base font-bold text-white">
          {{ editando ? 'Editar Consumível' : 'Novo Consumível' }}
        </p>
      </template>

      <div class="space-y-4 overflow-y-auto p-6">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nome</label>
          <input
            v-model="form.nome"
            type="text"
            placeholder="Poção de Cura Menor"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="2"
            placeholder="Como o item se parece, de onde vem..."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Efeito</label>
          <p class="text-[0.65rem] text-zinc-600">O que acontece ao usar. É isto que a mesa lê na hora.</p>
          <textarea
            v-model="form.efeito"
            rows="2"
            placeholder="Recupera 2d4 pontos de vida ao ser bebida."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Categoria</label>
            <VSelect v-model="form.categoria_consumivel_item" :options="opcoesCategoria" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Raridade</label>
            <VSelect v-model="form.raridade_item" :options="opcoesRaridade" />
          </div>
        </div>

        <!-- ── O que muda por categoria ────────────────────────────────────
             Veneno tem via; poção e prato têm cura em número; prato tem o que
             mais acontece quando sai bem. Mostrar todos sempre convidaria a
             preencher o campo errado — o bloco segue a categoria escolhida. -->
        <div v-if="ehVeneno" class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-red-400/80">Via</label>
          <p class="text-[0.65rem] text-zinc-600">
            Como chega num alvo que não quer. Só lâmina serve em combate.
          </p>
          <VSelect v-model="form.via" :options="opcoesVia" />
        </div>

        <div v-if="ehPocao || ehAlimento" class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <label class="block text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
            {{ ehAlimento ? 'Cura se bem feito' : 'Cura' }}
          </label>
          <p class="mb-2 text-[0.65rem] text-zinc-600">
            {{ ehAlimento
              ? 'Mal feito cura 1d4 fixo, não importa o ingrediente. Isto é o que sai quando o teste de Cozinha passa.'
              : 'Em número, para ser somável. O texto do efeito continua sendo o que a mesa lê.' }}
          </p>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-[0.65rem] uppercase tracking-wide text-zinc-500">Dado</label>
              <input v-model="form.cura_dado" type="text" placeholder="1d6"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm font-mono text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50" />
            </div>
            <div class="space-y-1">
              <label class="block text-[0.65rem] uppercase tracking-wide text-zinc-500">+ % do PV máximo</label>
              <input v-model.number="form.cura_percentual" type="number" min="0" max="100" placeholder="20"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50" />
            </div>
          </div>
          <p v-if="previaDaCura" class="mt-2 text-[0.7rem] text-zinc-400">{{ previaDaCura }}</p>

          <div v-if="ehAlimento" class="mt-3 space-y-1">
            <label class="block text-[0.65rem] uppercase tracking-wide text-violet-400/80">Se bem feito, também</label>
            <input v-model="form.efeito_bemfeito" type="text"
              placeholder="+2 em Encanto para quem partilhou a refeição, pela próxima cena social."
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50" />
          </div>
        </div>

        <!-- ── Condições ───────────────────────────────────────────────────
             É o que dá razão de existir a uma poção que não cura vida. Sem
             vínculo, "Elixir de Olhos Claros" é só um nome bonito. -->
        <div class="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <label class="block text-xs font-semibold uppercase tracking-wide text-sky-400/80">
            Condições que resolve
          </label>
          <p class="text-[0.65rem] text-zinc-600">
            Curar remove o que já se sofreu; prevenir imuniza por um tempo.
          </p>

          <div v-if="form.condicoes.length" class="flex flex-wrap gap-1.5">
            <span
              v-for="vinculo in form.condicoes"
              :key="`${vinculo.condicao_id}-${vinculo.acao}`"
              class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
              :class="CLASSE_POR_ACAO[vinculo.acao]"
            >
              {{ nomeDaCondicao(vinculo.condicao_id) }}
              <span class="text-[0.6rem] opacity-70">{{ vinculo.acao }}</span>
              <button
                type="button"
                class="text-zinc-500 hover:text-red-400"
                @click="removerVinculo(vinculo)"
              >&times;</button>
            </span>
          </div>
          <p v-else class="text-xs text-zinc-600">Nenhuma — é um consumível de outro tipo.</p>

          <div class="flex flex-wrap gap-2">
            <div class="min-w-[9rem] flex-1">
              <VSelect v-model="condicaoParaAdicionar" :options="opcoesCondicao" />
            </div>
            <button
              type="button"
              class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              :class="acaoParaAdicionar === 'inflige' ? 'text-red-300' : ''"
              @click="proximaAcao"
            >{{ ROTULO_ACAO[acaoParaAdicionar] }}</button>
            <button
              type="button"
              :disabled="condicaoParaAdicionar === ''"
              class="rounded-xl bg-sky-700 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-40"
              @click="adicionarVinculo"
            >Vincular</button>
          </div>

          <!-- Aviso, não bloqueio: a regra do catálogo é que a poção alcance a
               gravidade da condição, mas quem decide a exceção é o mestre. -->
          <p v-if="vinculosAcimaDaRaridade.length" class="text-[0.7rem] text-amber-400">
            {{ vinculosAcimaDaRaridade.join(', ') }} —
            gravidade acima da raridade deste consumível. Pelo catálogo, o antídoto
            precisa alcançar a condição.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Usos</label>
            <input v-model.number="form.usos" type="number" min="1" step="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Duração</label>
            <input v-model="form.duracao" type="text" placeholder="Instantâneo"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-emerald-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Peso (kg)</label>
            <input v-model.number="form.peso" type="number" min="0" step="0.1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Valor (prata)</label>
            <input v-model.number="form.valor" type="number" min="0" step="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
        </div>

        <p v-if="raridadeEscolhida" class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[0.7rem] text-zinc-500">
          <strong class="text-zinc-400">{{ raridadeEscolhida.descricao }}</strong> —
          {{ raridadeEscolhida.disponibilidade }}.
          Referência de preço: ×{{ raridadeEscolhida.multiplicador_valor }}
          <span v-if="raridadeEscolhida.dificuldade_base !== null">
            &middot; dificuldade para fabricar: {{ raridadeEscolhida.dificuldade_base }}
          </span>
          <span class="mt-1 block text-zinc-600">
            O multiplicador é só referência para você decidir o valor — ele não é aplicado em cima do que digitar.
          </span>
        </p>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
            @click="modalAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvando || !form.nome.trim()"
            class="flex-1 rounded-2xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- ── Confirmação de exclusão ────────────────────────────────────────── -->
    <Modal
      v-if="paraDeletar"
      panel-class="max-w-sm"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="paraDeletar = null"
    >
      <div class="space-y-4 p-6">
        <p class="text-base font-bold text-white">Apagar consumível?</p>
        <p class="text-sm text-zinc-400">
          <strong class="text-white">{{ paraDeletar.nome }}</strong> sai da listagem.
          O registro é preservado no banco e pode ser restaurado.
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="paraDeletar = null"
          >
            Cancelar
          </button>
          <button
            type="button" :disabled="salvando"
            class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40"
            @click="deletar"
          >
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
  listarConsumiveis, criarConsumivel, editarConsumivel, deletarConsumivel,
  listarCategoriasConsumivel,
  type ConsumivelApi, type CategoriaConsumivelApi,
  type AcaoSobreCondicao, type ViaDeVeneno,
  ACOES_SOBRE_CONDICAO, CLASSE_POR_ACAO, VIAS_DE_VENENO, ROTULO_VIA,
} from '@/lib/api/consumiveis.api'
import { listarRaridades, classeDaRaridade, type RaridadeApi } from '@/lib/api/raridades.api'
import { listarCondicoes, type CondicaoApi } from '@/lib/api/condicoes.api'

/** Um vínculo em edição no formulário. */
type VinculoEmEdicao = { condicao_id: number; acao: AcaoSobreCondicao }

const router = useRouter()

const consumiveis = ref<ConsumivelApi[]>([])
const categorias  = ref<CategoriaConsumivelApi[]>([])
const raridades   = ref<RaridadeApi[]>([])
const condicoes   = ref<CondicaoApi[]>([])
const carregando  = ref(true)

const busca           = ref('')
const filtroCategoria = ref<string | number>('')
const filtroRaridade  = ref<string | number>('')

const modalAberto = ref(false)
const editando    = ref<ConsumivelApi | null>(null)
const paraDeletar = ref<ConsumivelApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')

const formVazio = () => ({
  nome: '',
  descricao: '',
  efeito: '',
  usos: 1,
  duracao: '',
  peso: null as number | null,
  valor: null as number | null,
  raridade_item: '' as string | number,
  categoria_consumivel_item: '' as string | number,
  via: '' as string,
  cura_dado: '',
  cura_percentual: null as number | null,
  efeito_bemfeito: '',
  condicoes: [] as VinculoEmEdicao[],
})
const form = ref(formVazio())

const condicaoParaAdicionar = ref<string | number>('')
const acaoParaAdicionar = ref<AcaoSobreCondicao>('cura')

const opcoesCategoria = computed(() =>
  categorias.value.map(c => ({ value: c.item, label: c.descricao })),
)
const opcoesRaridade = computed(() =>
  raridades.value.map(r => ({ value: r.item, label: r.descricao })),
)
const opcoesFiltroCategoria = computed(() => [
  { value: '', label: 'Todas as categorias' },
  ...opcoesCategoria.value,
])
const opcoesFiltroRaridade = computed(() => [
  { value: '', label: 'Todas as raridades' },
  ...opcoesRaridade.value,
])

const raridadeEscolhida = computed(() =>
  raridades.value.find(r => r.item === Number(form.value.raridade_item)) ?? null,
)

/** Os blocos do formulário seguem a categoria — pelo NOME, que é o que o mestre vê. */
const nomeDaCategoriaEscolhida = computed(() =>
  categorias.value.find(c => c.item === Number(form.value.categoria_consumivel_item))?.descricao ?? '',
)
const ehVeneno   = computed(() => nomeDaCategoriaEscolhida.value === 'Veneno')
const ehPocao    = computed(() => nomeDaCategoriaEscolhida.value === 'Poção')
const ehAlimento = computed(() => nomeDaCategoriaEscolhida.value === 'Alimento')

const ROTULO_ACAO: Record<AcaoSobreCondicao, string> = {
  cura: 'Cura', previne: 'Previne', inflige: 'Inflige',
}

/** Cicla cura → previne → inflige → cura. */
function proximaAcao() {
  const posicao = ACOES_SOBRE_CONDICAO.indexOf(acaoParaAdicionar.value)
  acaoParaAdicionar.value = ACOES_SOBRE_CONDICAO[(posicao + 1) % ACOES_SOBRE_CONDICAO.length]
}

const opcoesVia = [
  { value: '', label: 'Sem via' },
  ...VIAS_DE_VENENO.map(v => ({ value: v, label: ROTULO_VIA[v] })),
]

/** Mostra a conta num personagem de 50 PV — o nível 20, meio da campanha. */
const previaDaCura = computed(() => {
  const dado = form.value.cura_dado.trim()
  const pct = form.value.cura_percentual
  if (!/^[0-9]+d[0-9]+$/.test(dado) && pct == null) return ''
  const partes: string[] = []
  if (/^[0-9]+d[0-9]+$/.test(dado)) {
    const [quantidade, faces] = dado.split('d').map(Number)
    partes.push(`${dado} (média ${(quantidade * (faces + 1)) / 2})`)
  }
  if (pct != null && !Number.isNaN(pct)) partes.push(`+ ${pct}% do PV máximo (${Math.round(50 * pct / 100)} PV em 50)`)
  return partes.join(' ')
})

/** Só as ainda não vinculadas com a ação escolhida — evita repetir o par. */
const opcoesCondicao = computed(() => {
  const jaTem = new Set(form.value.condicoes.map(v => `${v.condicao_id}:${v.acao}`))
  return [
    { value: '', label: 'Escolha uma condição...' },
    ...condicoes.value
      .filter(c => !jaTem.has(`${c.id}:${acaoParaAdicionar.value}`))
      .map(c => ({ value: c.id, label: c.raridade ? `${c.nome} (${c.raridade.descricao})` : c.nome })),
  ]
})

function nomeDaCondicao(id: number): string {
  return condicoes.value.find(c => c.id === id)?.nome ?? `#${id}`
}

/** Posição na escala de raridade, para comparar gravidade com raridade. */
function ordemDaRaridade(item: number | null): number | null {
  if (item === null) return null
  return raridades.value.find(r => r.item === item)?.ordem ?? null
}

const vinculosAcimaDaRaridade = computed(() => {
  const ordemDoConsumivel = ordemDaRaridade(
    form.value.raridade_item === '' ? null : Number(form.value.raridade_item),
  )
  if (ordemDoConsumivel === null) return []
  return form.value.condicoes
    .filter(vinculo => {
      const condicao = condicoes.value.find(c => c.id === vinculo.condicao_id)
      const ordemDaCondicao = ordemDaRaridade(condicao?.raridade_item ?? null)
      return ordemDaCondicao !== null && ordemDaCondicao > ordemDoConsumivel
    })
    .map(vinculo => nomeDaCondicao(vinculo.condicao_id))
})

function adicionarVinculo() {
  if (condicaoParaAdicionar.value === '') return
  form.value.condicoes.push({
    condicao_id: Number(condicaoParaAdicionar.value),
    acao: acaoParaAdicionar.value,
  })
  condicaoParaAdicionar.value = ''
}

function removerVinculo(alvo: VinculoEmEdicao) {
  form.value.condicoes = form.value.condicoes.filter(
    v => !(v.condicao_id === alvo.condicao_id && v.acao === alvo.acao),
  )
}

/** Texto curto para a listagem: "cura Cegueira, Surdez". */
function resumoDosVinculos(item: ConsumivelApi): string {
  const partes: string[] = []
  for (const acao of ACOES_SOBRE_CONDICAO) {
    const nomes = item.condicoes.filter(v => v.acao === acao).map(v => v.nome)
    if (nomes.length) partes.push(`${acao} ${nomes.join(', ')}`)
  }
  return partes.join(' · ')
}

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return consumiveis.value.filter(c => {
    if (termo && !`${c.nome} ${c.efeito}`.toLowerCase().includes(termo)) return false
    if (filtroCategoria.value !== '' && c.categoria_consumivel_item !== Number(filtroCategoria.value)) return false
    if (filtroRaridade.value !== '' && c.raridade_item !== Number(filtroRaridade.value)) return false
    return true
  })
})

async function carregar() {
  carregando.value = true
  try {
    // allSettled: uma lista de apoio que falhe não pode apagar a tela inteira.
    // Foi o que aconteceu em MasterProgressaoView e ClassesView com Promise.all.
    const [lista, cats, rars, conds] = await Promise.allSettled([
      listarConsumiveis(), listarCategoriasConsumivel(), listarRaridades(), listarCondicoes(),
    ])
    if (lista.status === 'fulfilled') consumiveis.value = lista.value
    if (cats.status  === 'fulfilled') categorias.value  = cats.value
    if (rars.status  === 'fulfilled') raridades.value   = rars.value
    if (conds.status === 'fulfilled') condicoes.value   = conds.value
  } finally {
    carregando.value = false
  }
}

function abrirForm(item: ConsumivelApi | null) {
  erroModal.value = ''
  editando.value = item
  form.value = item
    ? {
        nome: item.nome,
        descricao: item.descricao ?? '',
        efeito: item.efeito ?? '',
        usos: item.usos,
        duracao: item.duracao ?? '',
        peso: item.peso,
        valor: item.valor,
        raridade_item: item.raridade_item ?? '',
        categoria_consumivel_item: item.categoria_consumivel_item ?? '',
        via: item.via ?? '',
        cura_dado: item.cura_dado ?? '',
        cura_percentual: item.cura_percentual,
        efeito_bemfeito: item.efeito_bemfeito ?? '',
        condicoes: item.condicoes.map(v => ({ condicao_id: v.condicao_id, acao: v.acao })),
      }
    : formVazio()
  condicaoParaAdicionar.value = ''
  acaoParaAdicionar.value = 'cura'
  modalAberto.value = true
}

async function salvar() {
  if (!form.value.nome.trim()) return
  salvando.value = true
  erroModal.value = ''
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim() || undefined,
      efeito: form.value.efeito.trim() || undefined,
      usos: form.value.usos || 1,
      duracao: form.value.duracao.trim() || undefined,
      peso: form.value.peso ?? null,
      valor: form.value.valor ?? null,
      raridade_item: form.value.raridade_item === '' ? null : Number(form.value.raridade_item),
      categoria_consumivel_item:
        form.value.categoria_consumivel_item === '' ? null : Number(form.value.categoria_consumivel_item),
      // Zerados fora do bloco visível: uma poção que virou veneno não pode
      // continuar carregando cura, nem um veneno que virou prato carregar via.
      via: ehVeneno.value && form.value.via ? (form.value.via as ViaDeVeneno) : null,
      cura_dado: (ehPocao.value || ehAlimento.value) ? (form.value.cura_dado.trim() || null) : null,
      cura_percentual: (ehPocao.value || ehAlimento.value) && form.value.cura_percentual != null
        && !Number.isNaN(form.value.cura_percentual) ? form.value.cura_percentual : null,
      efeito_bemfeito: ehAlimento.value ? (form.value.efeito_bemfeito.trim() || null) : null,
      // Sempre enviado: aqui o formulário É a verdade sobre os vínculos, e
      // omitir faria o backend preservar os antigos (ver o DTO no servidor).
      condicoes: form.value.condicoes,
    }

    if (editando.value) {
      const atualizado = await editarConsumivel(editando.value.id, payload)
      const posicao = consumiveis.value.findIndex(c => c.id === editando.value!.id)
      if (posicao !== -1) consumiveis.value[posicao] = atualizado
    } else {
      consumiveis.value.push(await criarConsumivel(payload))
    }
    modalAberto.value = false
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

function confirmarDelete(item: ConsumivelApi) {
  paraDeletar.value = item
}

async function deletar() {
  if (!paraDeletar.value) return
  salvando.value = true
  try {
    await deletarConsumivel(paraDeletar.value.id)
    consumiveis.value = consumiveis.value.filter(c => c.id !== paraDeletar.value!.id)
    paraDeletar.value = null
  } catch {
    // A listagem continua como está; o mestre pode tentar de novo.
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>
