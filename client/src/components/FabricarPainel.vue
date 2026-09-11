<template>
  <!--
    A ação de fabricar, para o jogador. Mobile-first. O servidor decide tudo:
    este painel só pergunta "posso?" (com o motivo escrito quando não pode),
    mostra as chances antes de rolar, e apresenta o resultado depois.
  -->
  <div class="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
    <header class="flex items-center justify-between px-4 pt-3 pb-2">
      <span class="text-xs font-semibold uppercase tracking-widest text-sky-400">Fabricar</span>
      <span class="text-[0.65rem] text-zinc-600">{{ receitasDoPersonagem.length }} receitas ao alcance</span>
    </header>

    <p v-if="carregando" class="px-4 pb-4 text-xs text-zinc-600">Carregando receitas...</p>

    <p v-else-if="!receitasDoPersonagem.length" class="px-4 pb-4 text-xs text-zinc-600">
      Nenhuma receita ao alcance. É preciso rank 1 numa perícia de ofício — Alquimia, Cozinha,
      Ferraria, Carpintaria, Costura ou Joalheria.
    </p>

    <template v-else>
      <!-- Escolha: lista com busca, não dropdown. Um select que abre para
           baixo no fim da página fica cortado no celular. -->
      <div class="px-4 pb-3">
        <input v-model="buscaReceita" type="search" placeholder="Buscar receita..."
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-sky-500/50" />
        <ul v-if="!receita" class="mt-2 max-h-64 space-y-1 overflow-y-auto">
          <li v-for="r in receitasFiltradas" :key="r.id">
            <button type="button"
              class="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-sky-500/40 active:bg-sky-950/30"
              @click="receitaEscolhida = r.id">
              <span class="min-w-0">
                <span class="block truncate text-sm text-zinc-200">{{ r.nome }}</span>
                <span class="block text-[0.65rem] text-zinc-500">{{ nomeDaPericia(r.pericia_id) }} · DC {{ r.dificuldade }} · {{ r.tempo_minutos }} min</span>
              </span>
              <span class="ml-3 shrink-0 text-xs text-zinc-600">›</span>
            </button>
          </li>
          <li v-if="!receitasFiltradas.length" class="py-3 text-center text-xs text-zinc-600">Nenhuma receita com esse nome.</li>
        </ul>
        <button v-else type="button"
          class="mt-2 flex w-full items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/30 px-3 py-2.5 text-left"
          @click="receitaEscolhida = ''">
          <span class="text-sm font-semibold text-sky-200">{{ receita.nome }}</span>
          <span class="text-[0.65rem] text-sky-400">trocar</span>
        </button>
      </div>

      <!-- A checagem -->
      <div v-if="receita" class="border-t border-white/[0.05] px-4 py-3">
        <p class="text-xs text-zinc-500">
          <strong class="text-zinc-300">{{ nomeDaPericia(receita.pericia_id) }}</strong>
          · DC {{ receita.dificuldade }}
          · {{ receita.tempo_minutos }} min
          · produz {{ receita.quantidade_produzida }}× {{ receita.produto?.nome ?? '—' }}
        </p>
        <ul class="mt-2 space-y-0.5 text-[0.7rem] text-zinc-500">
          <li v-for="i in receita.ingredientes" :key="`${i.tabela}-${i.id}`">
            {{ i.quantidade }}× {{ i.nome }}
            <span v-if="!i.consumido" class="text-zinc-600">(ferramenta, não gasta)</span>
          </li>
        </ul>

        <label v-if="exigeOficina" class="mt-3 flex items-center gap-2 text-xs text-zinc-400">
          <input v-model="oficinaDisponivel" type="checkbox" class="h-4 w-4 accent-sky-500" />
          Há uma oficina aqui com a ferramenta fixa
        </label>

        <div v-if="checagem" class="mt-3">
          <div v-if="!checagem.pode" class="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
            <p class="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-400">Falta</p>
            <ul class="space-y-0.5 text-xs text-amber-200">
              <li v-for="m in checagem.motivos" :key="m">{{ m }}</li>
            </ul>
          </div>

          <div v-else-if="checagem.chances" class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p class="mb-2 text-[0.65rem] text-zinc-500">
              d20 + {{ checagem.pericia?.bonus }} ({{ checagem.pericia?.nome }} rank {{ checagem.pericia?.rank }})
              contra DC {{ checagem.dificuldade }}
            </p>
            <!-- A barra das quatro saídas, como no PDF. -->
            <div class="flex h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div class="bg-red-500" :style="`width:${checagem.chances.desastre}%`" />
              <div class="bg-amber-500" :style="`width:${checagem.chances.malfeito}%`" />
              <div class="bg-emerald-500" :style="`width:${checagem.chances.bemfeito}%`" />
              <div class="bg-sky-500" :style="`width:${checagem.chances.obra_prima}%`" />
            </div>
            <div class="mt-1.5 grid grid-cols-4 gap-1 text-center text-[0.6rem]">
              <span class="text-red-400">{{ checagem.chances.desastre }}% desastre</span>
              <span class="text-amber-400">{{ checagem.chances.malfeito }}% mal</span>
              <span class="text-emerald-400">{{ checagem.chances.bemfeito }}% bem</span>
              <span class="text-sky-400">{{ checagem.chances.obra_prima }}% obra</span>
            </div>
          </div>
        </div>

        <button type="button"
          class="mt-3 w-full rounded-2xl py-3 text-sm font-bold transition-colors disabled:opacity-40"
          :class="checagem?.pode ? 'bg-sky-700 text-white hover:bg-sky-600 active:bg-sky-800' : 'bg-white/[0.05] text-zinc-500'"
          :disabled="!checagem?.pode || fabricando"
          @click="confirmar = true">
          {{ fabricando ? 'Fabricando...' : 'Fabricar' }}
        </button>
      </div>
    </template>

    <!-- ── Resultado ────────────────────────────────────────────────────── -->
    <div v-if="resultado" class="border-t border-white/[0.05] px-4 py-4">
      <div class="mb-2 flex items-center gap-2">
        <span class="rounded-full border px-2.5 py-1 text-xs font-bold" :class="CLASSE_RESULTADO[resultado.resultado]">
          {{ ROTULO_RESULTADO[resultado.resultado] }}
        </span>
        <span class="text-xs text-zinc-500">
          d20 <strong class="text-zinc-300">{{ resultado.rolagem.d20 }}</strong>
          + {{ resultado.rolagem.bonus }} = <strong class="text-zinc-300">{{ resultado.rolagem.total }}</strong>
          contra {{ resultado.rolagem.dificuldade }}
        </span>
      </div>
      <p v-if="resultado.produzido" class="text-sm text-zinc-200">
        Saiu {{ resultado.produzido.quantidade }}× <strong>{{ resultado.produzido.nome }}</strong>
        <span class="text-xs text-zinc-500">({{ ROTULO_QUALIDADE[resultado.produzido.qualidade].toLowerCase() }})</span>
      </p>
      <p v-else class="text-sm text-red-300">Nada saiu. Os insumos se perderam; as ferramentas não.</p>
      <p class="mt-1 text-[0.65rem] text-zinc-600">
        Gastou {{ resultado.consumido.map(c => `${c.quantidade}× ${c.nome}`).join(', ') }}
        · levou {{ resultado.tempo_minutos }} min
      </p>
    </div>

    <!-- Confirmação: a rolagem é irreversível e consome insumo. -->
    <Modal v-if="confirmar" panel-class="max-w-sm" tema="escuro" :show-close-button="false" :close-on-backdrop="false" @close="confirmar = false">
      <div class="space-y-4 p-6">
        <p class="text-base font-bold text-white">Fabricar {{ receita?.nome }}?</p>
        <p class="text-sm text-zinc-400">
          A rolagem é feita no servidor e não dá para desfazer. Os insumos são gastos mesmo em desastre.
        </p>
        <div class="flex gap-3">
          <button type="button" class="flex-1 rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
            @click="confirmar = false">Cancelar</button>
          <button type="button" class="flex-1 rounded-2xl bg-sky-700 py-2.5 text-sm font-bold text-white hover:bg-sky-600"
            :disabled="fabricando" @click="executar">Rolar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { listarReceitas, type ReceitaApi } from '@/lib/api/receitas.api'
import { listarPericias, type PericiaApi, type PericiaDoPersonagem } from '@/lib/api/pericias.api'
import {
  checarFabricar, fabricar, CLASSE_RESULTADO, ROTULO_RESULTADO,
  type ChecagemDeFabricar, type ResultadoDeFabricar,
} from '@/lib/api/fabricacao.api'
import { ROTULO_QUALIDADE } from '@/lib/api/inventario.api'

const props = defineProps<{
  personagemId: number
  /** `data.pericias` do personagem — para filtrar as receitas ao alcance. */
  periciasDoPersonagem: PericiaDoPersonagem[]
}>()

const emit = defineEmits<{ (e: 'fabricou', resultado: ResultadoDeFabricar): void }>()

const receitas = ref<ReceitaApi[]>([])
const pericias = ref<PericiaApi[]>([])
const carregando = ref(true)
const receitaEscolhida = ref<string | number>('')
const oficinaDisponivel = ref(false)
const checagem = ref<ChecagemDeFabricar | null>(null)
const resultado = ref<ResultadoDeFabricar | null>(null)
const confirmar = ref(false)
const fabricando = ref(false)

/** Só receitas de perícias em que o personagem tem rank ≥ 1 — o resto ele nem pode tentar. */
const receitasDoPersonagem = computed(() => {
  const comRank = new Set(props.periciasDoPersonagem.filter(p => p.rank >= 1).map(p => p.periciaId))
  return receitas.value.filter(r => r.pericia_id !== null && comRank.has(r.pericia_id))
})

const buscaReceita = ref('')
const receitasFiltradas = computed(() => {
  const termo = buscaReceita.value.trim().toLowerCase()
  const lista = termo ? receitasDoPersonagem.value.filter(r => r.nome.toLowerCase().includes(termo)) : receitasDoPersonagem.value
  return [...lista].sort((a, b) => a.dificuldade - b.dificuldade || a.nome.localeCompare(b.nome, 'pt-BR'))
})

const receita = computed(() => receitas.value.find(r => r.id === Number(receitaEscolhida.value)) ?? null)

/** Ferramenta fixa é a que não se carrega; a checagem do servidor sabe pelo peso, a tela só oferece o toggle. */
const exigeOficina = computed(() =>
  receita.value?.ingredientes.some(i => !i.consumido && ['Bigorna', 'Tear de Mesa'].includes(i.nome)) ?? false)

function nomeDaPericia(id: number | null): string {
  return pericias.value.find(p => p.id === id)?.nome ?? '—'
}

async function carregar() {
  carregando.value = true
  try {
    const [rs, ps] = await Promise.allSettled([listarReceitas(), listarPericias()])
    if (rs.status === 'fulfilled') receitas.value = rs.value
    if (ps.status === 'fulfilled') pericias.value = ps.value
  } finally {
    carregando.value = false
  }
}

async function checar() {
  checagem.value = null
  if (!receita.value) return
  try {
    checagem.value = await checarFabricar(props.personagemId, receita.value.id, oficinaDisponivel.value)
  } catch (e: any) {
    checagem.value = { pode: false, motivos: [e?.response?.data?.message ?? 'Não foi possível checar.'], pericia: null, dificuldade: 0, chances: null }
  }
}

async function executar() {
  if (!receita.value) return
  confirmar.value = false
  fabricando.value = true
  try {
    resultado.value = await fabricar(props.personagemId, receita.value.id, oficinaDisponivel.value)
    emit('fabricou', resultado.value)
    await checar()
  } catch (e: any) {
    checagem.value = { pode: false, motivos: [e?.response?.data?.message ?? 'Erro ao fabricar.'], pericia: null, dificuldade: 0, chances: null }
  } finally {
    fabricando.value = false
  }
}

/** Para o inventário avisar que mudou por fora (o jogador adicionou um insumo). */
defineExpose({ rechecar: checar })

watch([receitaEscolhida, oficinaDisponivel], () => { resultado.value = null; void checar() })
onMounted(carregar)
</script>
