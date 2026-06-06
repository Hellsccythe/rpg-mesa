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
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">⚔ Níveis de Skill ⚔</span>
        </div>
        <button
          type="button"
          class="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          @click="abrirFormCriar"
        >
          + Adicionar Nível
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

      <p class="mb-4 text-sm text-zinc-500">Configure os efeitos de cada skill nos níveis 2 e 3.</p>

      <!-- Filtro -->
      <div class="mb-4">
        <input
          v-model="busca"
          type="text"
          placeholder="Filtrar por nome da skill..."
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50 sm:max-w-xs"
        />
      </div>

      <!-- Tabela -->
      <DataTable
        :colunas="[
          { label: 'Skill' },
          { label: 'Nível', classe: 'hidden sm:block' },
          { label: 'Configuração' },
        ]"
        classe-grid="grid grid-cols-[2fr_4rem_2fr_3rem] items-center gap-3"
        :itens="nivelsFiltrados"
        :carregando="carregando"
        mensagem-vazia="Nenhum nível configurado ainda."
        @editar="iniciarEdicao"
        @deletar="confirmarDelete"
      >
        <template #linha="{ item }">
          <p class="font-medium text-zinc-200 truncate">{{ (item as SkillNivelApi).skill_name ?? `Skill #${(item as SkillNivelApi).skill_id}` }}</p>
          <span
            class="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
            :class="(item as SkillNivelApi).nivel === 2 ? 'bg-sky-900/60 text-sky-300' : 'bg-violet-900/60 text-violet-300'"
          >
            Nv.{{ (item as SkillNivelApi).nivel }}
          </span>
          <p class="text-xs text-zinc-400 truncate">{{ resumoNivel(item as SkillNivelApi) }}</p>
        </template>
        <template #vazia-cta>
          <button type="button" class="mt-2 text-sm text-indigo-400 hover:text-indigo-300" @click="abrirFormCriar">
            Criar primeiro nível
          </button>
        </template>
      </DataTable>

    </main>
  </div>

  <!-- Modal criar/editar -->
  <Modal
    v-if="modalForm.aberto"
    :title="modalForm.editando ? 'Editar Nível' : 'Adicionar Nível'"
    panel-class="max-w-md"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="fecharModal"
  >
    <form class="space-y-4" @submit.prevent="salvar">

      <!-- Skill (só na criação) -->
      <template v-if="!modalForm.editando">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Skill</label>
          <input
            v-model="buscaSkillModal"
            type="text"
            placeholder="Filtrar skill..."
            class="mb-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          />
          <div class="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <div
              v-for="s in skillsModalFiltradas"
              :key="Number(s.id)"
              class="flex items-center transition-colors hover:bg-white/[0.05]"
              :class="modalForm.form.skill_id === Number(s.id) ? 'bg-indigo-600/20' : ''"
            >
              <button
                type="button"
                class="flex flex-1 items-center px-3 py-2 text-sm text-left"
                :class="modalForm.form.skill_id === Number(s.id) ? 'text-indigo-300' : 'text-zinc-300'"
                @click="modalForm.form.skill_id = Number(s.id)"
              >
                <span class="mr-2 w-3 shrink-0 text-indigo-400 opacity-0 transition-opacity" :class="{ 'opacity-100': modalForm.form.skill_id === Number(s.id) }">✓</span>
                {{ s.name }}
              </button>
              <button
                type="button"
                class="mr-2 shrink-0 rounded-md px-2 py-0.5 text-xs text-zinc-500 hover:bg-indigo-900/40 hover:text-indigo-300 transition-colors"
                @click="skillPreview = s"
              >
                Exibir
              </button>
            </div>
            <p v-if="!skillsModalFiltradas.length" class="px-3 py-2 text-xs text-zinc-600">Nenhuma skill encontrada.</p>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível</label>
          <div class="grid grid-cols-2 gap-2">
            <label
              v-for="opt in niveisOpcoes"
              :key="opt.value"
              class="flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-colors"
              :class="modalForm.form.nivel === opt.value
                ? 'border-indigo-500/60 bg-indigo-900/25 text-indigo-300'
                : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
            >
              <input type="radio" :value="opt.value" v-model="modalForm.form.nivel" class="sr-only" />
              <span class="text-sm font-semibold">{{ opt.label }}</span>
              <span class="text-xs opacity-70">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="text-xs text-zinc-500">
          Skill: <span class="font-semibold text-zinc-300">{{ nomeSkillSelecionada }}</span>
          · Nível: <span class="font-semibold text-zinc-300">{{ modalForm.form.nivel }}</span>
        </p>
      </template>

      <!-- Campos nível 2 -->
      <template v-if="modalForm.form.nivel === 2">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Multiplicador de Dano (%)
          </label>
          <input
            v-model.number="modalForm.form.damage_multiplier_pct"
            type="number"
            min="1"
            max="9999"
            placeholder="Ex: 150 para 150% do dano base"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          />
          <p class="mt-1 text-xs text-zinc-600">Deixe vazio para não alterar o dano.</p>
        </div>
      </template>

      <!-- Campos nível 3 -->
      <template v-if="modalForm.form.nivel === 3">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nome Override</label>
          <input
            v-model="modalForm.form.nome_override"
            type="text"
            maxlength="100"
            placeholder="Novo nome da skill no nível 3"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Dano Base Override</label>
            <input
              v-model="modalForm.form.damage_base_override"
              type="text"
              maxlength="60"
              placeholder="Ex: 3d8+5"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Atributo Override</label>
            <div class="flex flex-wrap gap-1.5 pt-0.5">
              <label
                v-for="opt in opcoesAtributo"
                :key="String(opt.value)"
                class="cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                :class="modalForm.form.multiplicador_override === opt.value
                  ? 'border-indigo-500/60 bg-indigo-900/30 text-indigo-300'
                  : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
              >
                <input type="radio" :value="opt.value" v-model="modalForm.form.multiplicador_override" class="sr-only" />
                {{ opt.label }}
              </label>
            </div>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Descrição do Efeito Override</label>
          <textarea
            v-model="modalForm.form.effect_description_override"
            rows="3"
            maxlength="500"
            placeholder="Nova descrição do efeito no nível 3"
            class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          />
        </div>
      </template>

      <p v-if="erro" class="text-sm text-red-400">{{ erro }}</p>

      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="fecharModal">
          Cancelar
        </button>
        <button type="submit" :disabled="salvando" class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
          {{ salvando ? 'Salvando...' : modalForm.editando ? 'Salvar' : 'Adicionar' }}
        </button>
      </div>
    </form>
  </Modal>

  <!-- Modal preview de skill -->
  <Modal
    v-if="skillPreview"
    panel-class="max-w-sm"
    body-class="p-5 space-y-3"
    tema="escuro"
    :close-on-backdrop="true"
    :show-close-button="true"
    @close="skillPreview = null"
  >
    <h3 class="text-base font-bold text-white">{{ skillPreview.name }}</h3>

    <p v-if="(skillPreview as any).description" class="text-sm text-zinc-400 leading-relaxed">
      {{ (skillPreview as any).description }}
    </p>

    <div class="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
      <div v-if="(skillPreview as any).damage_base">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Dano base</p>
        <p class="font-mono text-zinc-200">{{ (skillPreview as any).damage_base }}</p>
      </div>
      <div v-if="(skillPreview as any).multiplicador_atributo">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Atributo</p>
        <p class="capitalize text-zinc-200">{{ (skillPreview as any).multiplicador_atributo }}</p>
      </div>
      <div v-if="(skillPreview as any).custo">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Custo</p>
        <p class="text-zinc-200">{{ (skillPreview as any).custo }}</p>
      </div>
      <div v-if="(skillPreview as any).cooldown">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Cooldown</p>
        <p class="text-zinc-200">{{ (skillPreview as any).cooldown }} turno{{ (skillPreview as any).cooldown !== 1 ? 's' : '' }}</p>
      </div>
      <div v-if="(skillPreview as any).range">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Alcance</p>
        <p class="text-zinc-200">{{ (skillPreview as any).range }}</p>
      </div>
      <div v-if="(skillPreview as any).required_class">
        <p class="font-semibold uppercase tracking-wide text-zinc-500">Classe requerida</p>
        <p class="text-zinc-200">{{ (skillPreview as any).required_class }}</p>
      </div>
    </div>

    <div
      v-if="(skillPreview as any).effect_description"
      class="rounded-xl border border-indigo-500/20 bg-indigo-900/20 px-3 py-2 text-xs text-indigo-200 leading-relaxed"
    >
      {{ (skillPreview as any).effect_description }}
    </div>

    <div v-if="(skillPreview as any).raca_vinculada?.length">
      <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Raças vinculadas</p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="raca in (skillPreview as any).raca_vinculada"
          :key="raca"
          class="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-300"
        >{{ raca }}</span>
      </div>
    </div>
  </Modal>

  <!-- Modal confirmar delete -->
  <Modal
    v-if="deleteModal.aberto"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Remover Nível</h3>
    <p class="text-sm text-zinc-400">
      Remover configuração do nível <strong class="text-white">{{ deleteModal.nivel }}</strong> da skill
      <strong class="text-white">{{ deleteModal.skillName }}</strong>?
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import {
  listarSkillNiveis, criarSkillNivel, editarSkillNivel, deletarSkillNivel,
  listarCatalogoSkills,
  type SkillNivelApi, type SkillApi,
} from '@/lib/api/skills.api'

const router     = useRouter()
const carregando = ref(true)
const salvando   = ref(false)
const erro       = ref('')
const busca      = ref('')
const niveis     = ref<SkillNivelApi[]>([])
const skills     = ref<SkillApi[]>([])
const skillPreview = ref<SkillApi | null>(null)

const buscaSkillModal = ref('')

const skillsModalFiltradas = computed(() => {
  const q = buscaSkillModal.value.trim().toLowerCase()
  if (!q) return skills.value
  return skills.value.filter(s => s.name.toLowerCase().includes(q))
})

const niveisOpcoes = [
  { value: 2 as 2 | 3, label: 'Nível 2', desc: 'Multiplicador de dano' },
  { value: 3 as 2 | 3, label: 'Nível 3', desc: 'Override completo' },
]

const opcoesAtributo = [
  { value: '', label: 'Nenhum' },
  { value: 'aura', label: 'Aura' },
  { value: 'forca', label: 'Força' },
  { value: 'destreza', label: 'Destreza' },
  { value: 'resistencia', label: 'Resistência' },
  { value: 'inteligencia', label: 'Inteligência' },
]

const nivelsFiltrados = computed(() => {
  if (!busca.value.trim()) return niveis.value
  const q = busca.value.toLowerCase()
  return niveis.value.filter(n => (n.skill_name ?? '').toLowerCase().includes(q))
})

function resumoNivel(n: SkillNivelApi): string {
  if (n.nivel === 2) {
    return n.damage_multiplier_pct ? `${n.damage_multiplier_pct}% do dano base` : 'Sem multiplicador'
  }
  const parts: string[] = []
  if (n.nome_override) parts.push(`Nome: ${n.nome_override}`)
  if (n.damage_base_override) parts.push(`Dano: ${n.damage_base_override}`)
  if (n.multiplicador_override) parts.push(`Attr: ${n.multiplicador_override}`)
  if (n.effect_description_override) parts.push('Descrição override')
  return parts.length ? parts.join(' · ') : 'Nenhum override'
}

// ── Modal criar/editar ────────────────────────────────────────────────────────
function formVazio() {
  return {
    skill_id:                    null as number | null,
    nivel:                       null as 2 | 3 | null,
    damage_multiplier_pct:       null as number | null,
    nome_override:               '',
    damage_base_override:        '',
    multiplicador_override:      '',
    effect_description_override: '',
  }
}

const modalForm = ref({ aberto: false, editando: false, id: null as number | null, form: formVazio() })

const nomeSkillSelecionada = computed(() => {
  if (!modalForm.value.editando || !modalForm.value.id) return ''
  const n = niveis.value.find(x => x.id === modalForm.value.id)
  return n?.skill_name ?? `Skill #${n?.skill_id}`
})

function abrirFormCriar() {
  modalForm.value = { aberto: true, editando: false, id: null, form: formVazio() }
  buscaSkillModal.value = ''
  erro.value = ''
}

function iniciarEdicao(item: SkillNivelApi) {
  modalForm.value = {
    aberto: true,
    editando: true,
    id: item.id,
    form: {
      skill_id:                    item.skill_id,
      nivel:                       item.nivel,
      damage_multiplier_pct:       item.damage_multiplier_pct ?? null,
      nome_override:               item.nome_override ?? '',
      damage_base_override:        item.damage_base_override ?? '',
      multiplicador_override:      item.multiplicador_override ?? '',
      effect_description_override: item.effect_description_override ?? '',
    },
  }
  erro.value = ''
}

function fecharModal() {
  modalForm.value.aberto = false
}

async function salvar() {
  erro.value = ''
  const f = modalForm.value.form

  if (!modalForm.value.editando) {
    if (!f.skill_id) { erro.value = 'Selecione uma skill.'; return }
    if (!f.nivel)    { erro.value = 'Selecione o nível.'; return }
  }

  salvando.value = true
  try {
    if (modalForm.value.editando && modalForm.value.id) {
      const updated = await editarSkillNivel(modalForm.value.id, {
        damage_multiplier_pct:       f.damage_multiplier_pct || null,
        nome_override:               f.nome_override.trim() || null,
        damage_base_override:        f.damage_base_override.trim() || null,
        multiplicador_override:      f.multiplicador_override.trim() || null,
        effect_description_override: f.effect_description_override.trim() || null,
      })
      const idx = niveis.value.findIndex(n => n.id === modalForm.value.id!)
      if (idx !== -1) niveis.value[idx] = { ...niveis.value[idx], ...updated }
    } else {
      const created = await criarSkillNivel({
        skill_id:                    f.skill_id!,
        nivel:                       f.nivel!,
        damage_multiplier_pct:       f.damage_multiplier_pct || null,
        nome_override:               f.nome_override.trim() || null,
        damage_base_override:        f.damage_base_override.trim() || null,
        multiplicador_override:      f.multiplicador_override.trim() || null,
        effect_description_override: f.effect_description_override.trim() || null,
      })
      const skillName = skills.value.find(s => Number(s.id) === f.skill_id!)?.name ?? null
      niveis.value.push({ ...created, skill_name: skillName })
      niveis.value.sort((a, b) => (a.skill_name ?? '').localeCompare(b.skill_name ?? '') || a.nivel - b.nivel)
    }
    fecharModal()
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

// ── Modal delete ──────────────────────────────────────────────────────────────
const deleteModal = ref({ aberto: false, id: null as number | null, skillName: '', nivel: 0 })

function confirmarDelete(item: SkillNivelApi) {
  deleteModal.value = {
    aberto: true,
    id: item.id,
    skillName: item.skill_name ?? `Skill #${item.skill_id}`,
    nivel: item.nivel,
  }
}

async function executarDelete() {
  if (!deleteModal.value.id) return
  salvando.value = true
  try {
    await deletarSkillNivel(deleteModal.value.id)
    niveis.value = niveis.value.filter(n => n.id !== deleteModal.value.id)
    deleteModal.value.aberto = false
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err.message ?? 'Erro ao remover.'
  } finally {
    salvando.value = false
  }
}

// ── Carregar ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [niveisData, skillsData] = await Promise.all([listarSkillNiveis(), listarCatalogoSkills()])
    niveis.value = niveisData
    skills.value = skillsData
  } finally {
    carregando.value = false
  }
})
</script>
