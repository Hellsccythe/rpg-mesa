<template>
  <!--
    O inventário estruturado, mobile-first: uma coluna, alvos de toque grandes,
    nada escondido por largura. Nome, peso e valor vêm do servidor, que lê o
    catálogo — este componente nunca sabe o nome de um item por conta própria.
  -->
  <div class="space-y-3">
    <!-- ── Peso ─────────────────────────────────────────────────────────── -->
    <div class="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-widest text-amber-400">Carga</span>
        <span class="text-sm font-semibold tabular-nums" :class="corDoPeso">
          {{ inventario.peso_total.toFixed(1) }} / {{ inventario.peso_maximo.toFixed(1) }} kg
        </span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div class="h-full rounded-full transition-all duration-500" :class="corDaBarra"
          :style="`width: ${Math.min(100, porcentagemDoPeso)}%`" />
      </div>
      <p class="mt-1.5 text-[0.65rem] text-zinc-600">2 + Força × 2. Soma tudo que está na lista, do catálogo.</p>
    </div>

    <!-- ── Adicionar ────────────────────────────────────────────────────── -->
    <div v-if="podeEditar" class="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div class="flex gap-2">
        <input v-model="busca" type="search" placeholder="Buscar no catálogo para adicionar..."
          class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50" />
      </div>
      <div v-if="busca.trim().length >= 2" class="mt-2 max-h-56 space-y-1 overflow-y-auto">
        <p v-if="!sugestoes.length" class="py-3 text-center text-xs text-zinc-600">Nada no catálogo com esse nome.</p>
        <button v-for="s in sugestoes" :key="`${s.tabela}-${s.id}`" type="button"
          class="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-amber-500/40 active:bg-amber-950/30"
          :disabled="salvando" @click="adicionar(s)">
          <span class="min-w-0">
            <span class="block truncate text-sm text-zinc-200">{{ s.nome }}</span>
            <span class="block text-[0.65rem] text-zinc-500">{{ s.categoria }} · {{ s.peso ?? '—' }} kg · {{ s.valor ?? '—' }} pr</span>
          </span>
          <span class="ml-3 shrink-0 text-xs font-semibold text-amber-400">+ 1</span>
        </button>
      </div>
    </div>

    <!-- ── Grupos ───────────────────────────────────────────────────────── -->
    <p v-if="carregando" class="py-8 text-center text-sm text-zinc-600">Carregando...</p>
    <p v-else-if="erro" class="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-300">{{ erro }}</p>

    <template v-else>
      <section v-for="grupo in grupos" :key="grupo.chave" class="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
        <header class="flex items-center justify-between px-4 pt-3 pb-2">
          <span class="text-xs font-semibold uppercase tracking-widest" :class="grupo.cor">{{ grupo.titulo }}</span>
          <span class="text-[0.65rem] text-zinc-600">{{ grupo.entradas.length }} {{ grupo.entradas.length === 1 ? 'item' : 'itens' }}</span>
        </header>

        <p v-if="!grupo.entradas.length" class="px-4 pb-4 text-xs text-zinc-600">{{ grupo.vazio }}</p>

        <ul v-else class="divide-y divide-white/[0.05]">
          <li v-for="{ entrada, posicao } in grupo.entradas" :key="posicao" class="px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="text-sm font-medium" :class="entrada.orfao ? 'italic text-zinc-500' : 'text-zinc-200'">
                    {{ entrada.nome }}
                  </span>
                  <span v-if="entrada.quantidade > 1" class="text-xs text-zinc-500">×{{ entrada.quantidade }}</span>
                  <span v-if="entrada.qualidade" class="rounded-full border px-1.5 py-0.5 text-[0.6rem] font-semibold"
                    :class="CLASSE_QUALIDADE[entrada.qualidade]">{{ ROTULO_QUALIDADE[entrada.qualidade] }}</span>
                </div>
                <p class="mt-0.5 text-[0.65rem] text-zinc-600">
                  {{ entrada.categoria ?? '—' }}
                  <template v-if="entrada.peso !== null"> · {{ (entrada.peso * entrada.quantidade).toFixed(1) }} kg</template>
                  <template v-if="entrada.valor !== null"> · {{ entrada.valor }} pr</template>
                </p>
              </div>

              <!-- Ações: toque, não hover. -->
              <div v-if="podeEditar" class="flex shrink-0 items-center gap-1">
                <button type="button" :title="entrada.equipado ? 'Desequipar' : 'Equipar'"
                  class="rounded-lg border px-2 py-1.5 text-[0.65rem] font-semibold transition-colors"
                  :class="entrada.equipado ? 'border-violet-500/40 bg-violet-950/40 text-violet-300' : 'border-white/10 text-zinc-500'"
                  :disabled="salvando" @click="alternar(posicao, 'equipado', !entrada.equipado)">
                  {{ entrada.equipado ? 'Equipado' : 'Equipar' }}
                </button>
                <button type="button" :title="entrada.rapido ? 'Tirar da mochila rápida' : 'Mochila rápida'"
                  class="rounded-lg border px-2 py-1.5 text-[0.65rem] font-semibold transition-colors"
                  :class="entrada.rapido ? 'border-amber-500/40 bg-amber-950/40 text-amber-300' : 'border-white/10 text-zinc-500'"
                  :disabled="salvando" @click="alternar(posicao, 'rapido', !entrada.rapido)">
                  ⚡
                </button>
                <button type="button" title="Remover 1"
                  class="rounded-lg border border-white/10 px-2 py-1.5 text-[0.65rem] text-zinc-500 transition-colors hover:border-red-500/40 hover:text-red-300"
                  :disabled="salvando" @click="remover(posicao)">
                  −1
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  listarInventario, adicionarAoInventario, removerDoInventario, alternarNoInventario,
  CLASSE_QUALIDADE, ROTULO_QUALIDADE,
  type InventarioApi, type EntradaDeInventario, type TabelaDeInventario,
} from '@/lib/api/inventario.api'
import { listarItens } from '@/lib/api/itens.api'
import { listarConsumiveis } from '@/lib/api/consumiveis.api'
import { listarArmas } from '@/lib/api/armas.api'

const props = defineProps<{
  personagemId: number
  podeEditar: boolean
}>()

const emit = defineEmits<{ (e: 'mudou', inventario: InventarioApi): void }>()

const inventario = ref<InventarioApi>({ entradas: [], peso_total: 0, peso_maximo: 2 })
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')
const busca = ref('')

/** Os três catálogos, achatados para a busca. Carregados uma vez, na primeira digitação. */
type Sugestao = { tabela: TabelaDeInventario; id: number; nome: string; categoria: string; peso: number | null; valor: number | null }
const catalogo = ref<Sugestao[]>([])
const catalogoCarregado = ref(false)

const porcentagemDoPeso = computed(() =>
  inventario.value.peso_maximo > 0 ? (inventario.value.peso_total / inventario.value.peso_maximo) * 100 : 0)
const corDoPeso = computed(() =>
  porcentagemDoPeso.value >= 100 ? 'text-red-400' : porcentagemDoPeso.value >= 70 ? 'text-amber-400' : 'text-zinc-300')
const corDaBarra = computed(() =>
  porcentagemDoPeso.value >= 100 ? 'bg-red-500' : porcentagemDoPeso.value >= 70 ? 'bg-amber-500' : 'bg-emerald-500')

/**
 * Três grupos, pela pergunta que o jogador faz: o que estou usando, o que
 * pego rápido, o que carrego. A posição original vai junto porque as rotas
 * de remover e alternar trabalham por índice.
 */
const grupos = computed(() => {
  const indexadas = inventario.value.entradas.map((entrada, posicao) => ({ entrada, posicao }))
  return [
    { chave: 'equipado', titulo: 'Equipado', cor: 'text-violet-400',
      vazio: 'Nada vestido ou empunhado.',
      entradas: indexadas.filter(({ entrada }) => entrada.equipado) },
    { chave: 'rapido', titulo: 'Mochila rápida', cor: 'text-amber-400',
      vazio: 'Nada à mão para a luta. Marque ⚡ no que precisa pegar sem procurar.',
      entradas: indexadas.filter(({ entrada }) => entrada.rapido && !entrada.equipado) },
    { chave: 'mochila', titulo: 'Mochila', cor: 'text-zinc-400',
      vazio: 'Vazia. Busque no catálogo acima para adicionar.',
      entradas: indexadas.filter(({ entrada }) => !entrada.rapido && !entrada.equipado) },
  ]
})

const sugestoes = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (termo.length < 2) return []
  return catalogo.value.filter(s => s.nome.toLowerCase().includes(termo)).slice(0, 12)
})

async function carregar() {
  carregando.value = true
  erro.value = ''
  try {
    inventario.value = await listarInventario(props.personagemId)
  } catch (e: any) {
    erro.value = e?.response?.data?.message ?? 'Não foi possível carregar o inventário.'
  } finally {
    carregando.value = false
  }
}

async function carregarCatalogo() {
  if (catalogoCarregado.value) return
  const [itens, consumiveis, equipamentos] = await Promise.allSettled([
    listarItens(), listarConsumiveis(), listarArmas(),
  ])
  const lista: Sugestao[] = []
  if (itens.status === 'fulfilled') {
    for (const i of itens.value) lista.push({ tabela: 'itens', id: i.id, nome: i.nome, categoria: i.categoria?.descricao ?? 'Item', peso: i.peso, valor: i.valor })
  }
  if (consumiveis.status === 'fulfilled') {
    for (const c of consumiveis.value) lista.push({ tabela: 'consumiveis', id: c.id, nome: c.nome, categoria: c.categoria?.descricao ?? 'Consumível', peso: c.peso, valor: c.valor })
  }
  if (equipamentos.status === 'fulfilled') {
    for (const e of equipamentos.value) lista.push({ tabela: 'equipamentos', id: e.id, nome: e.nome, categoria: 'Equipamento', peso: e.peso, valor: e.valor })
  }
  catalogo.value = lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  catalogoCarregado.value = true
}

async function aplicar(operacao: () => Promise<InventarioApi>) {
  salvando.value = true
  erro.value = ''
  try {
    inventario.value = await operacao()
    emit('mudou', inventario.value)
  } catch (e: any) {
    erro.value = e?.response?.data?.message ?? 'Não foi possível salvar.'
  } finally {
    salvando.value = false
  }
}

function adicionar(s: Sugestao) {
  busca.value = ''
  return aplicar(() => adicionarAoInventario(props.personagemId, { tabela: s.tabela, id: s.id, quantidade: 1 }))
}
function remover(posicao: number) {
  return aplicar(() => removerDoInventario(props.personagemId, posicao, 1))
}
function alternar(posicao: number, campo: 'rapido' | 'equipado', valor: boolean) {
  return aplicar(() => alternarNoInventario(props.personagemId, posicao, campo, valor))
}

/** Para o painel de fabricar avisar que o inventário mudou. */
function recarregar() { return carregar() }
defineExpose({ recarregar })

watch(busca, (valor) => { if (valor.trim().length >= 2) void carregarCatalogo() })
onMounted(carregar)
</script>
