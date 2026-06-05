<template>
  <div class="page-root min-h-screen text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">
      <!-- Header -->
      <header class="sticky top-0 z-20 border-b backdrop-blur-xl" style="background:rgb(7 12 24/0.82);border-color:rgb(255 255 255/0.07)">
        <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button @click="router.push({ name: 'master-panel' })" class="gm-btn-ghost">← Voltar</button>
          <h1 class="flex-1 text-center text-xs font-bold tracking-[0.3em] uppercase text-violet-400">⚔ Skills — Catálogo</h1>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 space-y-8">

        <!-- ── Abas principais ──────────────────────────────────────────────── -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="aba in abas" :key="aba.id"
            @click="abaAtiva = aba.id"
            class="rounded-xl border px-4 py-2 text-xs font-semibold transition-all"
            :class="abaAtiva === aba.id
              ? 'border-violet-500/60 bg-violet-900/25 text-violet-300'
              : 'border-white/10 bg-white/[0.025] text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
          >{{ aba.label }}</button>
        </div>

        <!-- ── ABA: Catálogo de Skills ─────────────────────────────────────── -->
        <div v-if="abaAtiva === 'catalogo'" class="space-y-6">

          <!-- Formulário (criar) -->
          <section class="gm-card border-violet-500/15">
            <div class="gm-card-header">
              <div class="gm-icon-wrap bg-violet-500/10 text-violet-400">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h2 class="gm-title">Nova Skill</h2>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input v-model="form.name" type="text" placeholder="Nome *" class="gm-input sm:col-span-2" />

              <VSelect v-model="form.skill_tipo_item" :options="tipoOptions" placeholder="Tipo — (selecionar)" />
              <VSelect v-model="form.skill_categoria_item" :options="categoriaOptions" placeholder="Categoria — (selecionar)" />
              <VSelect v-model="form.skill_tipo_dano_item" :options="tipoDanoOptions" placeholder="Tipo de Dano — (selecionar)" />
              <VSelect v-model="form.raca_vinculada" :options="racaOptions" placeholder="Raça vinculada — (nenhuma)" />

              <input v-model="form.damage_display" type="text" placeholder="Dano (ex: 1d6+2)" class="gm-input" />
              <input v-model.number="form.damage_base" type="number" min="0" placeholder="Dano base (número)" class="gm-input" />
              <input v-model.number="form.custo" type="number" min="0" placeholder="Custo (mana/recurso)" class="gm-input" />
              <input v-model.number="form.cooldown" type="number" min="0" placeholder="Cooldown (turnos)" class="gm-input" />
              <input v-model="form.range" type="text" placeholder="Alcance (ex: Toque, 10m)" class="gm-input" />
              <VSelect v-model="form.required_class" :options="classOptions" placeholder="Classe requerida — (nenhuma)" />

              <input v-model="form.effect_description" type="text" placeholder="Efeito (descrição curta)" class="gm-input sm:col-span-2" />
              <input v-model.number="form.effect_value" type="number" placeholder="Valor do efeito (número)" class="gm-input" />

              <textarea v-model="form.description" rows="3" placeholder="Descrição completa" class="gm-textarea sm:col-span-2" />
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button @click="salvar" :disabled="carregando || !form.name?.trim()" class="gm-btn-violet disabled:opacity-40 disabled:cursor-not-allowed">
                {{ carregando ? 'Salvando...' : 'Criar Skill' }}
              </button>
            </div>
            <p v-if="feedback" class="mt-3 text-sm" :class="feedbackErro ? 'text-red-400' : 'text-emerald-400'">{{ feedback }}</p>
          </section>

          <!-- Filtro -->
          <input v-model="filtro" type="text" placeholder="Filtrar por nome, tipo, categoria ou raça..." class="gm-input w-full" />

          <!-- Tabela -->
          <section class="gm-card border-violet-500/15">
            <div v-if="carregandoLista" class="gm-empty">Carregando...</div>
            <div v-else-if="listaFiltrada.length === 0" class="gm-empty">Nenhuma skill cadastrada.</div>
            <ul v-else class="space-y-1.5">
              <li
                v-for="s in listaFiltrada" :key="s.id"
                class="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-2.5"
              >
                <p class="truncate text-sm font-medium text-zinc-100">{{ s.name }}</p>
                <span class="text-xs text-zinc-400 truncate">{{ nomeTipo(s.skill_tipo_item) }}</span>
                <span class="hidden sm:block text-xs text-zinc-400 truncate">{{ nomeCategoria(s.skill_categoria_item) }}</span>
                <span class="hidden md:block text-xs text-zinc-500 truncate">{{ nomeTipoDano(s.skill_tipo_dano_item) }}</span>
                <div class="flex gap-1">
                  <button @click="iniciarEdicao(s)" class="gm-btn-icon text-amber-400 hover:text-amber-300" title="Editar">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button @click="confirmarDelete(s)" class="gm-btn-icon text-red-400 hover:text-red-300" title="Deletar">
                    <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </li>
            </ul>
            <div v-if="lista.length > 0" class="mt-2 grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-4 text-[0.62rem] font-semibold uppercase tracking-wider text-zinc-600">
              <span>Nome</span><span>Tipo</span><span class="hidden sm:block">Categoria</span><span class="hidden md:block">Tipo Dano</span><span></span>
            </div>
          </section>
        </div>

        <!-- ── ABA: Tipos de Skill ──────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'tipos'" class="space-y-4">
          <TabelaEditor
            titulo="Tipos de Skill"
            subtitulo="Ex: Ativa, Passiva, Reação, Livre"
            :itens="tiposSkill"
            :carregando="carregandoLookup.tipos"
            @criar="(d) => criarLookup('tipos', d)"
            @editar="(it, p) => editarLookup('tipos', it, p)"
            @deletar="(it) => deletarLookup('tipos', it)"
          />
        </div>

        <!-- ── ABA: Categorias de Skill ────────────────────────────────────── -->
        <div v-if="abaAtiva === 'categorias'" class="space-y-4">
          <TabelaEditor
            titulo="Categorias de Skill"
            subtitulo="Ex: Combate, Social, Exploração, Magia"
            :itens="categoriasSkill"
            :carregando="carregandoLookup.categorias"
            @criar="(d) => criarLookup('categorias', d)"
            @editar="(it, p) => editarLookup('categorias', it, p)"
            @deletar="(it) => deletarLookup('categorias', it)"
          />
        </div>

        <!-- ── ABA: Tipos de Dano ──────────────────────────────────────────── -->
        <div v-if="abaAtiva === 'tiposDano'" class="space-y-4">
          <TabelaEditor
            titulo="Tipos de Dano"
            subtitulo="Ex: Fogo, Gelo, Cortante, Mágico"
            :itens="tiposDanoSkill"
            :carregando="carregandoLookup.tiposDano"
            @criar="(d) => criarLookup('tiposDano', d)"
            @editar="(it, p) => editarLookup('tiposDano', it, p)"
            @deletar="(it) => deletarLookup('tiposDano', it)"
          />
        </div>

      </main>
    </TemaDarkLight>

    <!-- Modal edição -->
    <Modal v-if="editModal.show" @close="fecharEditModal" panel-class="max-w-xl" :close-on-backdrop="false">
      <div class="p-6 space-y-3 overflow-y-auto" style="max-height:80vh">
        <p class="text-sm font-semibold text-zinc-100">Editar Skill</p>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input v-model="editModal.form.name" type="text" placeholder="Nome *" class="gm-input sm:col-span-2" />

          <VSelect v-model="editModal.form.skill_tipo_item" :options="tipoOptions" placeholder="Tipo — (selecionar)" />
          <VSelect v-model="editModal.form.skill_categoria_item" :options="categoriaOptions" placeholder="Categoria — (selecionar)" />
          <VSelect v-model="editModal.form.skill_tipo_dano_item" :options="tipoDanoOptions" placeholder="Tipo de Dano — (selecionar)" />
          <VSelect v-model="editModal.form.raca_vinculada" :options="racaOptions" placeholder="Raça vinculada — (nenhuma)" />

          <input v-model="editModal.form.damage_display" type="text" placeholder="Dano (ex: 1d6+2)" class="gm-input" />
          <input v-model.number="editModal.form.damage_base" type="number" min="0" placeholder="Dano base (número)" class="gm-input" />
          <input v-model.number="editModal.form.custo" type="number" min="0" placeholder="Custo (mana/recurso)" class="gm-input" />
          <input v-model.number="editModal.form.cooldown" type="number" min="0" placeholder="Cooldown (turnos)" class="gm-input" />
          <input v-model="editModal.form.range" type="text" placeholder="Alcance (ex: Toque, 10m)" class="gm-input" />
          <VSelect v-model="editModal.form.required_class" :options="classOptions" placeholder="Classe requerida — (nenhuma)" />

          <input v-model="editModal.form.effect_description" type="text" placeholder="Efeito (descrição curta)" class="gm-input sm:col-span-2" />
          <input v-model.number="editModal.form.effect_value" type="number" placeholder="Valor do efeito (número)" class="gm-input" />

          <textarea v-model="editModal.form.description" rows="3" placeholder="Descrição completa" class="gm-textarea sm:col-span-2" />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <button @click="fecharEditModal" class="gm-btn-ghost">Cancelar</button>
          <button
            @click="salvarEdicao"
            :disabled="carregando || !editModal.form.name?.trim()"
            class="gm-btn-violet disabled:opacity-40 disabled:cursor-not-allowed"
          >{{ carregando ? 'Salvando...' : 'Salvar' }}</button>
        </div>
        <p v-if="editModal.feedback" class="text-sm" :class="editModal.feedbackErro ? 'text-red-400' : 'text-emerald-400'">{{ editModal.feedback }}</p>
      </div>
    </Modal>

    <!-- Modal delete -->
    <Modal v-if="deleteId !== null" @close="deleteId = null" panel-class="max-w-sm" :show-close-button="false" :close-on-backdrop="false">
      <div class="p-6 space-y-4">
        <p class="text-zinc-200">
          Deletar a skill <strong class="text-white">{{ deleteNome }}</strong>?
        </p>

        <!-- Carregando referências -->
        <div v-if="carregandoRefs" class="text-xs text-zinc-500 italic">Verificando referências...</div>

        <!-- Referências encontradas -->
        <template v-else-if="deleteRefs && (deleteRefs.passados.length || deleteRefs.titulos.length || deleteRefs.classes.length)">
          <div class="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 space-y-2">
            <p class="text-xs font-semibold text-amber-400">Esta skill está sendo usada em:</p>
            <ul class="space-y-0.5 text-xs text-zinc-400">
              <li v-for="c in deleteRefs.classes"  :key="'c'+c.id">⚔ Classe: <span class="text-zinc-200">{{ c.nome }}</span></li>
              <li v-for="p in deleteRefs.passados"  :key="'p'+p.id">📜 Passado: <span class="text-zinc-200">{{ p.nome }}</span></li>
              <li v-for="t in deleteRefs.titulos"   :key="'t'+t.id">🏅 Título: <span class="text-zinc-200">{{ t.nome }}</span></li>
            </ul>
            <p class="text-xs text-amber-400/80">Ao confirmar, a skill será removida de todos esses registros.</p>
          </div>
        </template>

        <div class="flex justify-center gap-3">
          <button @click="executarDelete" :disabled="carregando || carregandoRefs" class="rounded-xl bg-red-800/80 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700/80 disabled:opacity-40">
            {{ carregando ? 'Deletando...' : 'Confirmar' }}
          </button>
          <button @click="deleteId = null" class="gm-btn-ghost">Cancelar</button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import TabelaEditor from '@/components/TabelaEditor.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarCatalogoSkills, criarSkillCatalogo, editarSkillCatalogo, deletarSkillCatalogo,
  buscarReferenciasSkill,
  skillTiposApi, skillCategoriasApi, skillTiposDanoApi,
  type SkillApi, type SkillLookupApi, type SkillReferencias,
} from '@/lib/api/skills.api'
import { listarRacasPublicas, type RacaApi } from '@/lib/api/racas.api'
import { listarClasses, type ClasseApi } from '@/lib/api/classes.api'

const router = useRouter()

const abas = [
  { id: 'catalogo', label: 'Catálogo de Skills' },
  { id: 'tipos', label: 'Tipos' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'tiposDano', label: 'Tipos de Dano' },
]
const abaAtiva = ref('catalogo')

const lista = ref<SkillApi[]>([])
const tiposSkill = ref<SkillLookupApi[]>([])
const categoriasSkill = ref<SkillLookupApi[]>([])
const tiposDanoSkill = ref<SkillLookupApi[]>([])
const racas = ref<RacaApi[]>([])
const classes = ref<ClasseApi[]>([])

const carregandoLista = ref(false)
const carregando = ref(false)
const carregandoLookup = ref({ tipos: false, categorias: false, tiposDano: false })
const filtro = ref('')
const feedback = ref('')
const feedbackErro = ref(false)

const deleteId = ref<string | number | null>(null)
const deleteNome = ref('')
const deleteRefs = ref<SkillReferencias | null>(null)
const carregandoRefs = ref(false)

const emptyForm = () => ({
  name: '',
  description: '',
  raca_vinculada: '' as string,
  skill_tipo_item: 0 as number,
  skill_categoria_item: 0 as number,
  skill_tipo_dano_item: 0 as number,
  damage_display: '',
  damage_base: null as number | null,
  effect_description: '',
  effect_value: null as number | null,
  custo: null as number | null,
  cooldown: null as number | null,
  range: '',
  required_class: '' as string,
})

const form = ref(emptyForm())

const editModal = ref({
  show: false,
  id: null as string | number | null,
  feedback: '',
  feedbackErro: false,
  form: emptyForm(),
})

const tipoOptions = computed(() => [
  { value: 0, label: 'Tipo — (selecionar)' },
  ...tiposSkill.value.map((t) => ({ value: t.item, label: t.descricao })),
])
const categoriaOptions = computed(() => [
  { value: 0, label: 'Categoria — (selecionar)' },
  ...categoriasSkill.value.map((c) => ({ value: c.item, label: c.descricao })),
])
const tipoDanoOptions = computed(() => [
  { value: 0, label: 'Tipo de Dano — (selecionar)' },
  ...tiposDanoSkill.value.map((d) => ({ value: d.item, label: d.descricao })),
])
const racaOptions = computed(() => [
  { value: '', label: 'Raça vinculada — (nenhuma)' },
  ...racas.value.map((r) => ({ value: r.nome, label: r.nome })),
])
const classOptions = computed(() => [
  { value: '', label: 'Classe requerida — (nenhuma)' },
  ...classes.value.map((c) => ({ value: String(c.id), label: c.name })),
])

const nomeTipo = (item?: number | null) =>
  item ? tiposSkill.value.find((t) => t.item === item)?.descricao ?? String(item) : '—'
const nomeCategoria = (item?: number | null) =>
  item ? categoriasSkill.value.find((c) => c.item === item)?.descricao ?? String(item) : '—'
const nomeTipoDano = (item?: number | null) =>
  item ? tiposDanoSkill.value.find((d) => d.item === item)?.descricao ?? String(item) : '—'

const listaFiltrada = computed(() => {
  const q = filtro.value.toLowerCase().trim()
  if (!q) return lista.value
  return lista.value.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    nomeTipo(s.skill_tipo_item).toLowerCase().includes(q) ||
    nomeCategoria(s.skill_categoria_item).toLowerCase().includes(q) ||
    (s.raca_vinculada ?? '').toLowerCase().includes(q),
  )
})

function buildPayload(f: ReturnType<typeof emptyForm>) {
  return {
    name: f.name.trim(),
    description: f.description.trim() || undefined,
    raca_vinculada: f.raca_vinculada || undefined,
    skill_tipo_item: f.skill_tipo_item || null,
    skill_categoria_item: f.skill_categoria_item || null,
    skill_tipo_dano_item: f.skill_tipo_dano_item || null,
    damage_display: f.damage_display.trim() || undefined,
    damage_base: f.damage_base,
    effect_description: f.effect_description.trim() || undefined,
    effect_value: f.effect_value,
    custo: f.custo,
    cooldown: f.cooldown,
    range: f.range.trim() || undefined,
    required_class: f.required_class || null,
  }
}

async function carregar() {
  carregandoLista.value = true
  try { lista.value = await listarCatalogoSkills() } finally { carregandoLista.value = false }
}

async function carregarLookups() {
  carregandoLookup.value = { tipos: true, categorias: true, tiposDano: true }
  const [t, c, d, r, cl] = await Promise.allSettled([
    skillTiposApi.listar(),
    skillCategoriasApi.listar(),
    skillTiposDanoApi.listar(),
    listarRacasPublicas(),
    listarClasses(),
  ])
  if (t.status === 'fulfilled') tiposSkill.value = t.value
  if (c.status === 'fulfilled') categoriasSkill.value = c.value
  if (d.status === 'fulfilled') tiposDanoSkill.value = d.value
  if (r.status === 'fulfilled') racas.value = r.value
  if (cl.status === 'fulfilled') classes.value = cl.value
  carregandoLookup.value = { tipos: false, categorias: false, tiposDano: false }
}

async function salvar() {
  if (!form.value.name.trim()) return
  carregando.value = true
  feedback.value = ''
  try {
    await criarSkillCatalogo(buildPayload(form.value) as any)
    feedback.value = 'Skill criada com sucesso.'
    feedbackErro.value = false
    form.value = emptyForm()
    await carregar()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar skill.'
    feedbackErro.value = true
  } finally {
    carregando.value = false
  }
}

function iniciarEdicao(s: SkillApi) {
  editModal.value = {
    show: true,
    id: s.id,
    feedback: '',
    feedbackErro: false,
    form: {
      name: s.name ?? '',
      description: (s.description as string) ?? '',
      raca_vinculada: (s.raca_vinculada as string) ?? '',
      skill_tipo_item: (s.skill_tipo_item as number | null) ?? 0,
      skill_categoria_item: (s.skill_categoria_item as number | null) ?? 0,
      skill_tipo_dano_item: (s.skill_tipo_dano_item as number | null) ?? 0,
      damage_display: (s.damage_display as string) ?? '',
      damage_base: (s.damage_base as number | null) ?? null,
      effect_description: (s.effect_description as string) ?? '',
      effect_value: (s.effect_value as number | null) ?? null,
      custo: (s.custo as number | null) ?? null,
      cooldown: (s.cooldown as number | null) ?? null,
      range: (s.range as string) ?? '',
      required_class: (s.required_class as string) ?? '',
    },
  }
}

function fecharEditModal() {
  editModal.value = { show: false, id: null, feedback: '', feedbackErro: false, form: emptyForm() }
}

async function salvarEdicao() {
  if (editModal.value.id === null || !editModal.value.form.name.trim()) return
  carregando.value = true
  editModal.value.feedback = ''
  try {
    await editarSkillCatalogo(editModal.value.id, buildPayload(editModal.value.form))
    await carregar()
    fecharEditModal()
  } catch (err: any) {
    editModal.value.feedback = err?.response?.data?.message || 'Erro ao salvar skill.'
    editModal.value.feedbackErro = true
  } finally {
    carregando.value = false
  }
}

async function confirmarDelete(s: SkillApi) {
  deleteId.value = s.id
  deleteNome.value = s.name
  deleteRefs.value = null
  carregandoRefs.value = true
  try {
    deleteRefs.value = await buscarReferenciasSkill(s.id)
  } catch { /* exibe modal mesmo sem referências */ }
  finally { carregandoRefs.value = false }
}

async function executarDelete() {
  if (deleteId.value === null) return
  carregando.value = true
  try {
    await deletarSkillCatalogo(deleteId.value)
    deleteId.value = null
    feedback.value = 'Skill removida.'
    feedbackErro.value = false
    await carregar()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao deletar.'
    feedbackErro.value = true
  } finally {
    carregando.value = false
  }
}

// ── Gestão de lookups ─────────────────────────────────────────────────────────
type LookupKey = 'tipos' | 'categorias' | 'tiposDano'
const lookupApiMap = { tipos: skillTiposApi, categorias: skillCategoriasApi, tiposDano: skillTiposDanoApi }
const lookupDataMap = { tipos: tiposSkill, categorias: categoriasSkill, tiposDano: tiposDanoSkill }

async function recarregarLookup(chave: LookupKey) {
  carregandoLookup.value[chave] = true
  try { lookupDataMap[chave].value = await lookupApiMap[chave].listar() }
  finally { carregandoLookup.value[chave] = false }
}

async function criarLookup(chave: LookupKey, descricao: string) {
  try { await lookupApiMap[chave].criar(descricao); await recarregarLookup(chave) }
  catch (err: any) { feedback.value = err?.response?.data?.message || 'Erro ao criar.'; feedbackErro.value = true }
}

async function editarLookup(chave: LookupKey, item: number, payload: Record<string, any>) {
  try { await lookupApiMap[chave].editar(item, payload.descricao); await recarregarLookup(chave) }
  catch (err: any) { feedback.value = err?.response?.data?.message || 'Erro ao editar.'; feedbackErro.value = true }
}

async function deletarLookup(chave: LookupKey, item: number) {
  try { await lookupApiMap[chave].deletar(item); await recarregarLookup(chave) }
  catch (err: any) { feedback.value = err?.response?.data?.message || 'Erro ao deletar.'; feedbackErro.value = true }
}

onMounted(async () => { await Promise.all([carregar(), carregarLookups()]) })
</script>

<style scoped>
.page-root { background: #070C18; }
.gm-card {
  background: rgb(255 255 255 / 0.025); border-width: 1px; border-style: solid;
  border-radius: 1.25rem; padding: 1.25rem; backdrop-filter: blur(8px);
}
@media (min-width: 640px) { .gm-card { padding: 1.5rem; } }
.gm-card-header { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
.gm-icon-wrap { display: flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border-radius: 0.6rem; flex-shrink: 0; }
.gm-title { font-size: 1rem; font-weight: 700; color: #f1f5f9; }
.gm-empty { font-size: 0.875rem; color: #52525b; font-style: italic; padding: 0.5rem 0; }

.gm-input, .gm-textarea {
  background: rgb(0 0 0 / 0.35); border: 1px solid rgb(255 255 255 / 0.09);
  border-radius: 0.75rem; color: #e2e8f0; font-size: 0.875rem;
  padding: 0.55rem 0.85rem; width: 100%; outline: none; transition: border-color 0.15s;
}
.gm-input:focus, .gm-textarea:focus { border-color: rgb(139 92 246 / 0.55); box-shadow: 0 0 0 3px rgb(139 92 246 / 0.12); }
.gm-input::placeholder, .gm-textarea::placeholder { color: #3f3f46; }

.gm-btn-violet {
  display: inline-flex; align-items: center; gap: 0.35rem;
  border-radius: 0.75rem; background: rgb(109 40 217 / 0.7);
  padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; color: #fff; transition: background 0.15s;
}
.gm-btn-violet:hover { background: rgb(109 40 217 / 0.9); }
.gm-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border-radius: 0.75rem; border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04); padding: 0.45rem 0.9rem;
  font-size: 0.75rem; font-weight: 500; color: #a1a1aa; transition: background 0.15s, color 0.15s;
}
.gm-btn-ghost:hover { background: rgb(255 255 255 / 0.07); color: #e4e4e7; }
.gm-btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem; border-radius: 0.5rem;
  border: 1px solid rgb(255 255 255 / 0.06); background: rgb(255 255 255 / 0.02); transition: background 0.15s;
}
.gm-btn-icon:hover { background: rgb(255 255 255 / 0.06); }

:global(html.theme-light) .page-root { background: var(--bg-page); color: var(--text-main); }
:global(html.theme-light) .gm-card { background: var(--bg-card); border-color: var(--border-soft); }
:global(html.theme-light) .gm-title { color: var(--text-main); }
:global(html.theme-light) .gm-input, :global(html.theme-light) .gm-textarea {
  background: #fff; border-color: var(--border-soft); color: var(--text-main);
}
</style>
