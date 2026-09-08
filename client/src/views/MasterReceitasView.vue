<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(168_85_247/0.08),transparent)]" />

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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-violet-400">⚒ Receitas ⚒</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
          @click="abrirForm(null)"
        >
          + Nova Receita
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <p class="mb-2 text-sm text-zinc-500">
        O que produz o quê, com o quê. Uma receita pode consumir itens, consumíveis ou equipamentos,
        e produzir qualquer um dos três.
      </p>
      <p class="mb-5 text-xs text-zinc-600">
        Alvo do projeto: fabricar deve custar <strong class="text-emerald-400">70–75%</strong> do preço
        de compra. Abaixo disso ninguém compra nada; acima, fabricar não compensa o risco.
      </p>

      <input
        v-model="busca"
        type="text"
        placeholder="Filtrar por nome, produto ou ingrediente..."
        class="mb-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50 sm:max-w-sm"
      />

      <p v-if="carregando" class="py-16 text-center text-sm text-zinc-600">Carregando...</p>

      <div v-else-if="!listaFiltrada.length" class="rounded-2xl border border-white/[0.07] bg-white/[0.02] py-16 text-center">
        <p class="mb-4 text-sm text-zinc-500">Nenhuma receita cadastrada.</p>
        <button
          type="button"
          class="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
          @click="abrirForm(null)"
        >
          Criar a primeira
        </button>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="receita in listaFiltrada" :key="receita.id"
          class="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
        >
          <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="font-semibold text-zinc-100">{{ receita.nome }}</h3>
              <p class="mt-0.5 text-xs text-zinc-600">
                Produz
                <strong class="text-zinc-400">
                  {{ receita.quantidade_produzida }}× {{ receita.produto?.nome ?? 'produto removido' }}
                </strong>
                &middot; {{ formatarTempo(receita.tempo_minutos) }}
                &middot; dificuldade {{ receita.dificuldade }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                type="button"
                class="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:border-white/25 hover:text-white"
                @click="abrirForm(receita)"
              >
                Editar
              </button>
              <button
                type="button"
                class="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/25"
                @click="paraDeletar = receita"
              >
                Apagar
              </button>
            </div>
          </div>

          <div class="mb-3 flex flex-wrap gap-2">
            <span
              v-for="ingrediente in receita.ingredientes"
              :key="`${ingrediente.tabela}-${ingrediente.id}`"
              class="rounded-full border px-2.5 py-1 text-xs"
              :class="ingrediente.consumido
                ? 'border-white/10 bg-white/[0.03] text-zinc-300'
                : 'border-sky-500/25 bg-sky-950/30 text-sky-300'"
            >
              {{ ingrediente.quantidade }}× {{ ingrediente.nome }}
              <span v-if="!ingrediente.consumido" class="text-[0.6rem] text-sky-500/80">(ferramenta)</span>
              <span v-else-if="ingrediente.valor !== null" class="text-[0.65rem] text-zinc-600">
                {{ ingrediente.valor * ingrediente.quantidade }} pr
              </span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-white/[0.06] pt-3 text-xs">
            <span class="text-zinc-600">
              Ingredientes: <strong class="text-zinc-400">{{ receita.custo_dos_ingredientes }} pr</strong>
            </span>
            <span class="text-zinc-600">
              Comprar pronto:
              <strong class="text-zinc-400">
                {{ receita.preco_de_compra !== null ? `${receita.preco_de_compra} pr` : '—' }}
              </strong>
            </span>
            <span v-if="receita.proporcao_do_preco !== null" :class="classeDaProporcao(receita.proporcao_do_preco)">
              <strong>{{ receita.proporcao_do_preco }}%</strong> do preço de compra
              <span v-if="receita.proporcao_do_preco < 60" class="text-[0.65rem]">— barato demais</span>
              <span v-else-if="receita.proporcao_do_preco > 80" class="text-[0.65rem]">— não compensa fabricar</span>
            </span>
          </div>
        </article>
      </div>
    </main>

    <!-- ── Formulário ─────────────────────────────────────────────────────── -->
    <Modal
      v-if="modalAberto"
      panel-class="max-w-2xl max-h-[90vh] flex flex-col"
      tema="escuro"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalAberto = false"
    >
      <template #header>
        <p class="text-base font-bold text-white">{{ editando ? 'Editar Receita' : 'Nova Receita' }}</p>
      </template>

      <div class="space-y-4 overflow-y-auto p-6">
        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nome</label>
          <input v-model="form.nome" type="text" placeholder="Poção de Cura Menor"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50" />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Descrição</label>
          <textarea v-model="form.descricao" rows="2" placeholder="Como se faz, o que dá errado..."
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-violet-500/50" />
        </div>

        <!-- Produto -->
        <div class="space-y-2 rounded-xl border border-violet-500/20 bg-violet-950/10 p-3">
          <label class="block text-xs font-semibold uppercase tracking-wide text-violet-400/80">Produz</label>
          <div class="grid grid-cols-[8rem_1fr_5rem] gap-2">
            <VSelect v-model="form.produto_tabela" :options="opcoesTabela" />
            <VSelect v-model="form.produto_id" :options="opcoesDoCatalogo(form.produto_tabela)" />
            <input v-model.number="form.quantidade_produzida" type="number" min="1" step="1" title="Quantidade produzida"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-center text-sm text-white outline-none focus:border-violet-500/50" />
          </div>
        </div>

        <!-- Ingredientes -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Ingredientes</label>
            <button
              type="button"
              class="rounded-lg border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 hover:border-emerald-500/60"
              @click="adicionarIngrediente"
            >
              + Adicionar
            </button>
          </div>

          <p v-if="!form.ingredientes.length" class="rounded-xl border border-dashed border-white/10 px-4 py-3 text-center text-[0.7rem] text-zinc-600">
            Uma receita precisa de pelo menos um ingrediente.
          </p>

          <div v-for="(ingrediente, indice) in form.ingredientes" :key="indice" class="grid grid-cols-[7rem_1fr_3.5rem_5.5rem_2.5rem] items-center gap-2">
            <VSelect v-model="ingrediente.ingrediente_tabela" :options="opcoesTabela" />
            <VSelect v-model="ingrediente.ingrediente_id" :options="opcoesDoCatalogo(ingrediente.ingrediente_tabela)" />
            <input v-model.number="ingrediente.quantidade" type="number" min="1" step="1" title="Quantidade"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-center text-sm text-white outline-none focus:border-emerald-500/50" />
            <button
              type="button"
              class="rounded-xl border px-2 py-2 text-[0.65rem] font-semibold transition-colors"
              :class="ingrediente.consumido
                ? 'border-white/10 bg-white/[0.04] text-zinc-400'
                : 'border-sky-500/40 bg-sky-950/30 text-sky-300'"
              :title="ingrediente.consumido ? 'É consumido ao fabricar' : 'Ferramenta: não some ao usar'"
              @click="ingrediente.consumido = !ingrediente.consumido"
            >
              {{ ingrediente.consumido ? 'Consome' : 'Ferramenta' }}
            </button>
            <button
              type="button"
              class="rounded-xl border border-white/10 py-2 text-xs text-zinc-500 hover:border-red-500/40 hover:text-red-400"
              title="Remover"
              @click="form.ingredientes.splice(indice, 1)"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Tempo e dificuldade -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Tempo (minutos)</label>
            <input v-model.number="form.tempo_minutos" type="number" min="1" step="5"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-violet-500/50" />
            <p class="text-[0.65rem] text-zinc-600">{{ formatarTempo(form.tempo_minutos || 0) }}</p>
          </div>
          <div class="space-y-1">
            <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Dificuldade</label>
            <input v-model.number="form.dificuldade" type="number" min="0" max="100" step="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm text-white outline-none focus:border-violet-500/50" />
            <p class="text-[0.65rem] text-zinc-600">Solta por enquanto — vira teste de perícia depois.</p>
          </div>
        </div>

        <!-- Prévia da margem, calculada enquanto se edita -->
        <div class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs">
          <p class="text-zinc-500">
            Ingredientes: <strong class="text-zinc-300">{{ previaCusto }} pr</strong>
            &middot; comprar pronto:
            <strong class="text-zinc-300">{{ previaPreco !== null ? `${previaPreco} pr` : '—' }}</strong>
          </p>
          <p v-if="previaProporcao !== null" class="mt-1" :class="classeDaProporcao(previaProporcao)">
            <strong>{{ previaProporcao }}%</strong> do preço de compra
            <span v-if="previaProporcao < 60">— barato demais, ninguém vai comprar pronto</span>
            <span v-else-if="previaProporcao > 80">— caro demais, não compensa fabricar</span>
            <span v-else>— dentro do alvo</span>
          </p>
        </div>

        <p v-if="erroModal" class="text-xs text-red-400">{{ erroModal }}</p>
      </div>

      <template #footer>
        <div class="flex gap-3 p-6 pt-0">
          <button
            type="button"
            class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="modalAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button" :disabled="salvando || !podeSalvar"
            class="flex-1 rounded-2xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-40"
            @click="salvar"
          >
            {{ salvando ? 'Salvando...' : 'Salvar' }}
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
        <p class="text-base font-bold text-white">Apagar receita?</p>
        <p class="text-sm text-zinc-400">
          <strong class="text-white">{{ paraDeletar.nome }}</strong> e seus ingredientes saem da listagem.
        </p>
        <div class="flex gap-3">
          <button type="button" class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white" @click="paraDeletar = null">
            Cancelar
          </button>
          <button type="button" :disabled="salvando" class="flex-1 rounded-2xl bg-red-700 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40" @click="deletar">
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
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarReceitas, criarReceita, editarReceita, deletarReceita,
  formatarTempo, classeDaProporcao,
  TABELAS_DE_ITEM, ROTULO_DA_TABELA,
  type ReceitaApi, type TabelaDeItem,
} from '@/lib/api/receitas.api'
import { listarConsumiveis } from '@/lib/api/consumiveis.api'
import { listarItens } from '@/lib/api/itens.api'
import { listarArmasPublicas } from '@/lib/api/armas.api'

const router = useRouter()

const receitas   = ref<ReceitaApi[]>([])
const carregando = ref(true)
const busca      = ref('')

/** Nome e valor de tudo que pode ser produto ou ingrediente, por tabela. */
type EntradaCatalogo = { id: number; nome: string; valor: number | null }
const catalogo = ref<Record<TabelaDeItem, EntradaCatalogo[]>>({
  consumiveis: [], itens: [], equipamentos: [],
})

const modalAberto = ref(false)
const editando    = ref<ReceitaApi | null>(null)
const paraDeletar = ref<ReceitaApi | null>(null)
const salvando    = ref(false)
const erroModal   = ref('')

const formVazio = () => ({
  nome: '',
  descricao: '',
  produto_tabela: 'consumiveis' as TabelaDeItem,
  produto_id: '' as string | number,
  quantidade_produzida: 1,
  tempo_minutos: 60,
  dificuldade: 10,
  ingredientes: [] as Array<{
    ingrediente_tabela: TabelaDeItem
    ingrediente_id: string | number
    quantidade: number
    consumido: boolean
  }>,
})
const form = ref(formVazio())

const opcoesTabela = TABELAS_DE_ITEM.map(t => ({ value: t, label: ROTULO_DA_TABELA[t] }))

function opcoesDoCatalogo(tabela: TabelaDeItem) {
  return catalogo.value[tabela].map(e => ({ value: e.id, label: e.nome }))
}

function valorDe(tabela: TabelaDeItem, id: string | number): number | null {
  return catalogo.value[tabela].find(e => e.id === Number(id))?.valor ?? null
}

// A prévia repete a conta do backend enquanto o mestre edita, para ele ver a
// margem sair da faixa antes de salvar em vez de depois.
const previaCusto = computed(() =>
  Math.round(
    form.value.ingredientes
      .filter(i => i.consumido)
      .reduce((total, i) => total + (valorDe(i.ingrediente_tabela, i.ingrediente_id) ?? 0) * (i.quantidade || 0), 0) * 100,
  ) / 100,
)
const previaPreco = computed(() => {
  const unitario = valorDe(form.value.produto_tabela, form.value.produto_id)
  return unitario === null ? null : unitario * (form.value.quantidade_produzida || 1)
})
const previaProporcao = computed(() => {
  const preco = previaPreco.value
  if (!preco || preco <= 0) return null
  return Math.round((previaCusto.value / preco) * 100)
})

const podeSalvar = computed(() =>
  form.value.nome.trim().length > 0 &&
  form.value.produto_id !== '' &&
  form.value.ingredientes.length > 0 &&
  form.value.ingredientes.every(i => i.ingrediente_id !== ''),
)

const listaFiltrada = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return receitas.value
  return receitas.value.filter(r =>
    `${r.nome} ${r.produto?.nome ?? ''} ${r.ingredientes.map(i => i.nome).join(' ')}`
      .toLowerCase().includes(termo),
  )
})

async function carregar() {
  carregando.value = true
  try {
    // allSettled: uma lista de apoio que falhe não pode apagar a tela inteira.
    const [lista, cons, its, equis] = await Promise.allSettled([
      listarReceitas(), listarConsumiveis(), listarItens(), listarArmasPublicas(),
    ])
    if (lista.status === 'fulfilled') receitas.value = lista.value
    if (cons.status === 'fulfilled') {
      catalogo.value.consumiveis = cons.value.map(c => ({ id: c.id, nome: c.nome, valor: c.valor }))
    }
    if (its.status === 'fulfilled') {
      catalogo.value.itens = its.value.map(i => ({ id: i.id, nome: i.nome, valor: i.valor }))
    }
    if (equis.status === 'fulfilled') {
      catalogo.value.equipamentos = equis.value.map(e => ({
        id: Number(e.id), nome: e.nome, valor: e.valor ?? null,
      }))
    }
  } finally {
    carregando.value = false
  }
}

function adicionarIngrediente() {
  form.value.ingredientes.push({
    ingrediente_tabela: 'itens', ingrediente_id: '', quantidade: 1, consumido: true,
  })
}

function abrirForm(receita: ReceitaApi | null) {
  erroModal.value = ''
  editando.value = receita
  form.value = receita
    ? {
        nome: receita.nome,
        descricao: receita.descricao ?? '',
        produto_tabela: receita.produto?.tabela ?? 'consumiveis',
        produto_id: receita.produto?.id ?? '',
        quantidade_produzida: receita.quantidade_produzida,
        tempo_minutos: receita.tempo_minutos,
        dificuldade: receita.dificuldade,
        ingredientes: receita.ingredientes.map(i => ({
          ingrediente_tabela: i.tabela,
          ingrediente_id: i.id,
          quantidade: i.quantidade,
          consumido: i.consumido,
        })),
      }
    : formVazio()
  modalAberto.value = true
}

async function salvar() {
  if (!podeSalvar.value) return
  salvando.value = true
  erroModal.value = ''
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao.trim() || undefined,
      produto_tabela: form.value.produto_tabela,
      produto_id: Number(form.value.produto_id),
      quantidade_produzida: form.value.quantidade_produzida || 1,
      tempo_minutos: form.value.tempo_minutos || 60,
      dificuldade: form.value.dificuldade ?? 10,
      ingredientes: form.value.ingredientes.map(i => ({
        ingrediente_tabela: i.ingrediente_tabela,
        ingrediente_id: Number(i.ingrediente_id),
        quantidade: i.quantidade || 1,
        consumido: i.consumido,
      })),
    }

    if (editando.value) {
      const atualizada = await editarReceita(editando.value.id, payload)
      const posicao = receitas.value.findIndex(r => r.id === editando.value!.id)
      if (posicao !== -1) receitas.value[posicao] = atualizada
    } else {
      receitas.value.push(await criarReceita(payload))
    }
    modalAberto.value = false
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

async function deletar() {
  if (!paraDeletar.value) return
  salvando.value = true
  try {
    await deletarReceita(paraDeletar.value.id)
    receitas.value = receitas.value.filter(r => r.id !== paraDeletar.value!.id)
    paraDeletar.value = null
  } catch {
    // A listagem continua como está; o mestre pode tentar de novo.
  } finally {
    salvando.value = false
  }
}

onMounted(carregar)
</script>
