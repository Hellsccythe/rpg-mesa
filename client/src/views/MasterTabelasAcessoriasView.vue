<template>
  <div class="page-root min-h-screen text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-20 border-b backdrop-blur-xl" style="background:rgb(7 12 24/0.82);border-color:rgb(255 255 255/0.07)">
        <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button @click="router.push({ name: 'master-panel' })" class="gm-btn-ghost">← Voltar</button>
          <h1 class="flex-1 text-center text-xs font-bold tracking-[0.3em] uppercase text-amber-400">
            ⚔ Tabelas Acessórias de Equipamento
          </h1>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">

        <!-- Abas -->
        <div class="mb-6 flex flex-wrap gap-2">
          <button
            v-for="aba in abas"
            :key="aba.id"
            @click="abaAtiva = aba.id"
            class="rounded-xl border px-4 py-2 text-xs font-semibold transition-all"
            :class="abaAtiva === aba.id
              ? 'border-amber-500/60 bg-amber-900/25 text-amber-300'
              : 'border-white/10 bg-white/[0.025] text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
          >
            {{ aba.label }}
          </button>
        </div>

        <!-- ── Tipos de Equipamento ──────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'tipos'" class="space-y-6">
          <TabelaEditor
            titulo="Tipos de Equipamento"
            subtitulo="Arma, Armadura, Variados — itens base do sistema"
            :itens="tipos"
            :carregando="carregando.tipos"
            @criar="(d) => criarItem('tipos', d)"
            @editar="(it, d) => editarItem('tipos', it, d)"
            @deletar="(it) => deletarItem('tipos', it)"
          />
        </div>

        <!-- ── Família Arma ──────────────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'arma'" class="space-y-6">
          <TabelaEditor
            titulo="Categorias de Arma"
            subtitulo="Subcategorias vinculadas ao tipo Arma"
            :itens="categoriasArma"
            :carregando="carregando.categoriasArma"
            @criar="(d) => criarItem('categoriasArma', d)"
            @editar="(it, d) => editarItem('categoriasArma', it, d)"
            @deletar="(it) => deletarItem('categoriasArma', it)"
          />
          <TabelaEditor
            titulo="Propriedades de Arma"
            subtitulo="Ex: Perfurante, Cortante, Pesada"
            :itens="propriedadesArma"
            :carregando="carregando.propriedadesArma"
            :categorias="categoriasArma"
            campo-categoria="categoria_arma_item"
            label-categoria="Categoria de Arma"
            @criar="(d, extra) => criarItem('propriedadesArma', d, extra)"
            @editar="(it, d) => editarItem('propriedadesArma', it, d)"
            @deletar="(it) => deletarItem('propriedadesArma', it)"
          />
          <TabelaEditor
            titulo="Classes de Arma"
            subtitulo="Ex: Lâmina, Arco, Bastão"
            :itens="classesArma"
            :carregando="carregando.classesArma"
            :categorias="categoriasArma"
            campo-categoria="categoria_arma_item"
            label-categoria="Categoria de Arma"
            @criar="(d, extra) => criarItem('classesArma', d, extra)"
            @editar="(it, d) => editarItem('classesArma', it, d)"
            @deletar="(it) => deletarItem('classesArma', it)"
          />
        </div>

        <!-- ── Família Armadura ────────────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'armadura'" class="space-y-6">
          <TabelaEditor
            titulo="Categorias de Armadura"
            subtitulo="Subcategorias vinculadas ao tipo Armadura"
            :itens="categoriasArmadura"
            :carregando="carregando.categoriasArmadura"
            @criar="(d) => criarItem('categoriasArmadura', d)"
            @editar="(it, d) => editarItem('categoriasArmadura', it, d)"
            @deletar="(it) => deletarItem('categoriasArmadura', it)"
          />
          <TabelaEditor
            titulo="Propriedades de Armadura"
            subtitulo="Ex: Leve, Média, Pesada"
            :itens="propriedadesArmadura"
            :carregando="carregando.propriedadesArmadura"
            :categorias="categoriasArmadura"
            campo-categoria="categoria_armadura_item"
            label-categoria="Categoria de Armadura"
            @criar="(d, extra) => criarItem('propriedadesArmadura', d, extra)"
            @editar="(it, d) => editarItem('propriedadesArmadura', it, d)"
            @deletar="(it) => deletarItem('propriedadesArmadura', it)"
          />
          <TabelaEditor
            titulo="Classes de Armadura"
            subtitulo="Ex: Escudo, Elmo, Peitoral"
            :itens="classesArmadura"
            :carregando="carregando.classesArmadura"
            :categorias="categoriasArmadura"
            campo-categoria="categoria_armadura_item"
            label-categoria="Categoria de Armadura"
            @criar="(d, extra) => criarItem('classesArmadura', d, extra)"
            @editar="(it, d) => editarItem('classesArmadura', it, d)"
            @deletar="(it) => deletarItem('classesArmadura', it)"
          />
        </div>

        <!-- ── Família Variados ────────────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'variados'" class="space-y-6">
          <TabelaEditor
            titulo="Categorias de Variados"
            subtitulo="Subcategorias vinculadas ao tipo Variados"
            :itens="categoriasVariados"
            :carregando="carregando.categoriasVariados"
            @criar="(d) => criarItem('categoriasVariados', d)"
            @editar="(it, d) => editarItem('categoriasVariados', it, d)"
            @deletar="(it) => deletarItem('categoriasVariados', it)"
          />
          <TabelaEditor
            titulo="Propriedades de Variados"
            subtitulo="Ex: Consumível, Mágico, Raro"
            :itens="propriedadesVariados"
            :carregando="carregando.propriedadesVariados"
            :categorias="categoriasVariados"
            campo-categoria="categoria_variados_item"
            label-categoria="Categoria de Variados"
            @criar="(d, extra) => criarItem('propriedadesVariados', d, extra)"
            @editar="(it, d) => editarItem('propriedadesVariados', it, d)"
            @deletar="(it) => deletarItem('propriedadesVariados', it)"
          />
          <TabelaEditor
            titulo="Classes de Variados"
            subtitulo="Ex: Poção, Ferramenta, Pergaminho"
            :itens="classesVariados"
            :carregando="carregando.classesVariados"
            :categorias="categoriasVariados"
            campo-categoria="categoria_variados_item"
            label-categoria="Categoria de Variados"
            @criar="(d, extra) => criarItem('classesVariados', d, extra)"
            @editar="(it, d) => editarItem('classesVariados', it, d)"
            @deletar="(it) => deletarItem('classesVariados', it)"
          />
        </div>

        <p v-if="feedbackGlobal" class="mt-4 text-sm" :class="feedbackErro ? 'text-red-400' : 'text-emerald-400'">
          {{ feedbackGlobal }}
        </p>
      </main>
    </TemaDarkLight>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import TabelaEditor from '@/components/TabelaEditor.vue'
import {
  tiposApi, categoriasArmaApi, categoriasArmaduraApi, categoriasVariadosApi,
  propriedadesArmaApi, classesArmaApi, propriedadesArmaduraApi, classesArmaduraApi,
  propriedadesVariadosApi, classesVariadosApi,
  type TabelaItemApi,
} from '@/lib/api/tabelas-acessorias.api'

const router = useRouter()

const abas = [
  { id: 'tipos', label: 'Tipos' },
  { id: 'arma', label: 'Família Arma' },
  { id: 'armadura', label: 'Família Armadura' },
  { id: 'variados', label: 'Família Variados' },
]
const abaAtiva = ref('tipos')

const tipos = ref<TabelaItemApi[]>([])
const categoriasArma = ref<TabelaItemApi[]>([])
const categoriasArmadura = ref<TabelaItemApi[]>([])
const categoriasVariados = ref<TabelaItemApi[]>([])
const propriedadesArma = ref<TabelaItemApi[]>([])
const classesArma = ref<TabelaItemApi[]>([])
const propriedadesArmadura = ref<TabelaItemApi[]>([])
const classesArmadura = ref<TabelaItemApi[]>([])
const propriedadesVariados = ref<TabelaItemApi[]>([])
const classesVariados = ref<TabelaItemApi[]>([])

const carregando = ref({
  tipos: false,
  categoriasArma: false, categoriasArmadura: false, categoriasVariados: false,
  propriedadesArma: false, classesArma: false,
  propriedadesArmadura: false, classesArmadura: false,
  propriedadesVariados: false, classesVariados: false,
})

const feedbackGlobal = ref('')
const feedbackErro = ref(false)

const apiMap = {
  tipos: tiposApi,
  categoriasArma: categoriasArmaApi,
  categoriasArmadura: categoriasArmaduraApi,
  categoriasVariados: categoriasVariadosApi,
  propriedadesArma: propriedadesArmaApi,
  classesArma: classesArmaApi,
  propriedadesArmadura: propriedadesArmaduraApi,
  classesArmadura: classesArmaduraApi,
  propriedadesVariados: propriedadesVariadosApi,
  classesVariados: classesVariadosApi,
} as const

const listaMap = {
  tipos, categoriasArma, categoriasArmadura, categoriasVariados,
  propriedadesArma, classesArma, propriedadesArmadura, classesArmadura,
  propriedadesVariados, classesVariados,
} as const

type Chave = keyof typeof apiMap

async function recarregar(chave: Chave) {
  carregando.value[chave] = true
  try {
    listaMap[chave].value = await apiMap[chave].listar()
  } finally {
    carregando.value[chave] = false
  }
}

async function criarItem(chave: Chave, descricao: string, extra?: Record<string, any>) {
  try {
    await apiMap[chave].criar(descricao, extra)
    await recarregar(chave)
    feedbackGlobal.value = 'Item criado com sucesso.'
    feedbackErro.value = false
  } catch (err: any) {
    feedbackGlobal.value = err?.response?.data?.message || 'Erro ao criar item.'
    feedbackErro.value = true
  }
}

async function editarItem(chave: Chave, item: number, payload: Record<string, any>) {
  try {
    await apiMap[chave].editar(item, payload)
    await recarregar(chave)
    feedbackGlobal.value = 'Item atualizado.'
    feedbackErro.value = false
  } catch (err: any) {
    feedbackGlobal.value = err?.response?.data?.message || 'Erro ao editar item.'
    feedbackErro.value = true
  }
}

async function deletarItem(chave: Chave, item: number) {
  try {
    await apiMap[chave].deletar(item)
    await recarregar(chave)
    feedbackGlobal.value = 'Item removido.'
    feedbackErro.value = false
  } catch (err: any) {
    feedbackGlobal.value = err?.response?.data?.message || 'Erro ao deletar item.'
    feedbackErro.value = true
  }
}

onMounted(async () => {
  await Promise.all(
    (Object.keys(apiMap) as Chave[]).map((k) => recarregar(k))
  )
})
</script>

<style scoped>
.page-root { background: #070C18; }
.gm-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border-radius: 0.75rem; border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04); padding: 0.45rem 0.9rem;
  font-size: 0.75rem; font-weight: 500; color: #a1a1aa;
  transition: background 0.15s, color 0.15s;
}
.gm-btn-ghost:hover { background: rgb(255 255 255 / 0.07); color: #e4e4e7; }
:global(html.theme-light) .page-root { background: var(--bg-page); }
</style>
