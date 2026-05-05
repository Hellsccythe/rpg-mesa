<template>
  <div class="page-root min-h-screen relative overflow-x-hidden">
    <div class="page-ambient absolute inset-0 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#1A0B27]" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="page-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <button @click="voltarAoPainel" class="back-btn flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors">
          ← Painel
        </button>
        <div class="text-center">
          <p class="page-kicker text-xs font-semibold uppercase tracking-widest">Mestre</p>
          <h1 class="page-title text-lg font-bold tracking-wide font-cinzel">⚔ Raças ⚔</h1>
        </div>
        <button @click="abrirFormNovo" class="btn-primary rounded-xl px-4 py-2 text-sm font-semibold">
          + Nova Raça
        </button>
      </header>

      <main class="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        <!-- Feedback -->
        <Transition name="fade">
          <div v-if="feedback.msg" class="mb-6 rounded-2xl px-4 py-3 text-sm font-medium"
            :class="feedback.tipo === 'ok' ? 'bg-emerald-900/40 border border-emerald-700/50 text-emerald-300' : 'bg-red-900/40 border border-red-700/50 text-red-300'">
            {{ feedback.msg }}
          </div>
        </Transition>

        <!-- Contador -->
        <p class="page-sub text-xs mb-6">{{ racas.length }} raça(s) cadastrada(s)</p>

        <!-- Loading -->
        <div v-if="carregando" class="flex items-center justify-center h-64 text-zinc-400 animate-pulse">
          Carregando raças...
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="raca in racas" :key="raca.id" class="raca-card rounded-3xl border overflow-hidden">
            <!-- Imagem -->
            <div class="raca-img-wrap relative h-36 bg-cover bg-center"
              :style="raca.foto_url ? `background-image: url('${raca.foto_url}')` : ''">
              <div v-if="!raca.foto_url" class="absolute inset-0 flex items-center justify-center">
                <span class="text-4xl opacity-30">🧬</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 class="absolute bottom-3 left-4 text-white font-bold text-lg font-cinzel leading-tight">{{ raca.nome }}</h3>
            </div>

            <!-- Body -->
            <div class="px-4 py-4 space-y-3">
              <!-- Atributos bônus -->
              <div v-if="raca.atributos_bonus.length" class="flex flex-wrap gap-1.5">
                <span v-for="ab in raca.atributos_bonus" :key="ab.atributo"
                  class="attr-badge text-xs rounded-full px-2.5 py-0.5">
                  {{ ab.atributo }} {{ (ab.valor || '').startsWith('-') ? '' : '+' }}{{ ab.valor }}
                </span>
              </div>

              <!-- Habilidades -->
              <div v-if="raca.habilidades.length" class="space-y-1">
                <p class="field-label text-xs uppercase tracking-widest mb-1">Habilidades</p>
                <p v-for="h in raca.habilidades" :key="h.nome" class="text-xs page-sub">
                  <span class="text-zinc-300 font-semibold">{{ h.nome }}</span>
                  <span v-if="h.descricao"> — {{ h.descricao }}</span>
                </p>
              </div>

              <!-- Descrição -->
              <p v-if="raca.descricao" class="text-xs page-sub line-clamp-2">{{ raca.descricao }}</p>

              <!-- Lore bloqueado badge -->
              <span class="lore-badge text-xs rounded-full px-2.5 py-0.5">
                {{ raca.lore ? '📜 Lore disponível' : '📜 Sem lore' }}
              </span>
            </div>

            <!-- Ações -->
            <div class="raca-card-footer border-t flex items-center justify-end gap-2 px-4 py-3">
              <button @click="iniciarEdicao(raca)" class="action-btn-edit rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors">
                Editar
              </button>
              <button @click="confirmarDelete(raca)" class="action-btn-del rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors">
                Deletar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Formulário lateral -->
    <Transition name="slide">
      <div v-if="formAberto" class="fixed inset-0 z-40 flex justify-end" @click.self="fecharForm">
        <div class="form-card w-full max-w-lg h-full overflow-y-auto border-l flex flex-col">
          <div class="flex items-center justify-between border-b px-6 py-5">
            <h2 class="form-title font-bold text-lg font-cinzel">
              {{ editandoId ? 'Editar Raça' : 'Nova Raça' }}
            </h2>
            <button @click="fecharForm" class="close-btn rounded-xl px-3 py-1.5 text-sm">✕</button>
          </div>

          <div class="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
            <!-- Nome -->
            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Nome *</label>
              <input v-model="form.nome" type="text" maxlength="100"
                class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none transition-colors"
                placeholder="Ex: Elfo das Sombras" />
            </div>

            <!-- Foto -->
            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Foto</label>
              <input ref="fotoInput" type="file" accept="image/*" class="hidden" @change="onFotoChange" />
              <div v-if="fotoPreview || form.foto_url"
                class="mb-2 rounded-xl overflow-hidden foto-preview-wrap"
                @click="fotoLightbox = fotoPreview || form.foto_url">
                <img :src="fotoPreview || form.foto_url"
                  class="foto-preview-img" alt="Preview da foto" />
              </div>
              <div v-else class="mb-2 rounded-xl h-32 flex items-center justify-center foto-placeholder">
                <span class="text-4xl opacity-20">🧬</span>
              </div>
              <button type="button" @click="fotoInput?.click()" class="btn-upload text-xs rounded-xl px-4 py-2 w-full">
                {{ fotoPreview || form.foto_url ? 'Trocar foto' : 'Escolher foto' }}
              </button>
              <p v-if="fotoFile" class="mt-1 text-xs page-sub text-center truncate">{{ fotoFile.name }}</p>
            </div>

            <!-- Atributos Bônus -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="field-label text-xs uppercase tracking-widest">Atributos Bônus</label>
                <button @click="addAtributo" type="button" class="btn-add-item text-xs rounded-lg px-2.5 py-1">+ Adicionar</button>
              </div>
              <div v-for="(ab, i) in form.atributos_bonus" :key="i" class="flex gap-2 mb-2">
                <input v-model="ab.atributo" type="text" maxlength="60" placeholder="Atributo"
                  class="field-input flex-1 rounded-xl border px-3 py-2 text-sm outline-none" />
                <input v-model="ab.valor" type="text" maxlength="10" placeholder="+2"
                  class="field-input w-20 rounded-xl border px-3 py-2 text-sm outline-none text-center" />
                <button @click="removeAtributo(i)" type="button" class="action-btn-del rounded-lg px-2.5 py-1 text-xs">✕</button>
              </div>
            </div>

            <!-- Habilidades -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="field-label text-xs uppercase tracking-widest">Habilidades</label>
                <button @click="abrirModalNovaSkill" type="button" class="btn-add-item text-xs rounded-lg px-2.5 py-1">+ Nova Skill</button>
              </div>
              <div v-for="(h, i) in form.habilidades" :key="i" class="habilidade-block rounded-2xl border p-3 mb-3 space-y-2">
                <!-- Autocomplete de skill -->
                <div class="flex items-center gap-2 relative">
                  <div class="flex-1 relative">
                    <input
                      v-model="h._busca"
                      type="text"
                      maxlength="100"
                      placeholder="Buscar skill..."
                      autocomplete="off"
                      class="field-input w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      @input="onSkillBusca(h)"
                      @focus="h._aberto = true"
                      @blur="fecharDropdownDelay(h)"
                    />
                    <!-- Dropdown -->
                    <ul v-if="h._aberto && skillsFiltradas(h).length"
                      class="skill-dropdown absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 max-h-44 overflow-y-auto">
                      <li v-for="sk in skillsFiltradas(h)" :key="sk.id"
                        @mousedown.prevent="selecionarSkill(h, sk)"
                        class="skill-dropdown-item px-3 py-2 text-sm cursor-pointer">
                        <span class="font-medium">{{ sk.name }}</span>
                        <span v-if="sk.type" class="skill-type-tag ml-2 text-xs rounded-full px-1.5 py-0.5">{{ sk.type }}</span>
                      </li>
                    </ul>
                  </div>
                  <button @click="removeHabilidade(i)" type="button" class="action-btn-del rounded-lg px-2.5 py-1.5 text-xs shrink-0">✕</button>
                </div>
                <!-- Descrição (readonly, preenchida ao selecionar) -->
                <textarea
                  :value="h.descricao"
                  rows="2"
                  disabled
                  placeholder="Selecione uma skill para ver a descrição..."
                  class="field-input field-input-disabled w-full rounded-xl border px-3 py-2 text-sm outline-none resize-none"
                />
              </div>
              <!-- Botão adicionar linha -->
              <button @click="addHabilidade" type="button"
                class="btn-ghost w-full rounded-xl py-2 text-xs border-dashed">
                + Adicionar habilidade
              </button>
            </div>

            <!-- Descrição -->
            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Descrição</label>
              <textarea v-model="form.descricao" maxlength="2000" rows="4"
                class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                placeholder="Descrição geral da raça..." />
            </div>

            <!-- Lore -->
            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">
                Lore
                <span class="lore-badge ml-2 text-xs rounded-full px-2 py-0.5">Oculto para players</span>
              </label>
              <textarea v-model="form.lore" maxlength="5000" rows="6"
                class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none resize-none transition-colors"
                placeholder="História, segredos e lore profundo da raça..." />
            </div>
          </div>

          <div class="border-t px-6 py-4 flex gap-3 justify-end">
            <button @click="fecharForm" class="btn-ghost rounded-xl px-5 py-2 text-sm">Cancelar</button>
            <button @click="salvar" :disabled="salvando || !form.nome.trim()" class="btn-primary rounded-xl px-6 py-2 text-sm font-semibold">
              {{ salvando ? 'Salvando...' : editandoId ? 'Salvar' : 'Criar Raça' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal de exclusão -->
    <Transition name="fade">
      <div v-if="racaParaDeletar" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        @click.self="racaParaDeletar = null">
        <div class="modal-card w-full max-w-sm rounded-3xl border p-6 text-center">
          <p class="modal-title font-bold text-lg mb-2">Deletar Raça</p>
          <p class="modal-body text-sm mb-6">Tem certeza que deseja deletar <strong>{{ racaParaDeletar.nome }}</strong>?</p>
          <div class="flex gap-3 justify-center">
            <button @click="racaParaDeletar = null" class="btn-ghost rounded-xl px-5 py-2 text-sm">Cancelar</button>
            <button @click="executarDelete" :disabled="deletando" class="btn-danger rounded-xl px-5 py-2 text-sm font-semibold">
              {{ deletando ? 'Deletando...' : 'Deletar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal Nova Skill -->
    <Transition name="fade">
      <div v-if="modalSkill.aberto" class="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/75"
        @click.self="fecharModalSkill">
        <div class="modal-card w-full max-w-md rounded-3xl border p-6">
          <p class="form-title font-bold text-lg mb-5 font-cinzel">Nova Skill</p>

          <div class="space-y-4">
            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Nome *</label>
              <input v-model="modalSkill.nome" type="text" maxlength="100" placeholder="Ex: Visão Noturna"
                class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none" />
            </div>
            <div class="flex gap-3">
              <div class="flex-1">
                <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Tipo</label>
                <select v-model="modalSkill.type"
                  class="field-input field-select w-full rounded-xl border px-3 py-2.5 text-sm outline-none">
                  <option value="">— Nenhum —</option>
                  <option v-for="t in tiposExistentes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Categoria</label>
                <select v-model="modalSkill.category"
                  class="field-input field-select w-full rounded-xl border px-3 py-2.5 text-sm outline-none">
                  <option value="">— Nenhuma —</option>
                  <option v-for="c in categoriasExistentes" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <!-- Campo Racial -->
            <Transition name="fade">
              <div v-if="modalSkill.category === 'Racial'">
                <label class="field-label block text-xs uppercase tracking-widest mb-1.5">
                  Raça Vinculada
                  <span class="ml-1 text-amber-400 text-xs normal-case tracking-normal">obrigatório para Racial</span>
                </label>
                <input v-model="modalSkill.raca_vinculada" type="text" maxlength="100"
                  placeholder="Ex: Elfo das Sombras"
                  class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none" />
              </div>
            </Transition>

            <div>
              <label class="field-label block text-xs uppercase tracking-widest mb-1.5">Descrição</label>
              <textarea v-model="modalSkill.description" maxlength="2000" rows="4"
                class="field-input w-full rounded-2xl border px-4 py-2.5 text-sm outline-none resize-none"
                placeholder="Descrição da skill..." />
            </div>
          </div>

          <p v-if="modalSkill.erro" class="mt-3 text-xs text-red-400">{{ modalSkill.erro }}</p>

          <div class="flex gap-3 justify-end mt-6">
            <button @click="fecharModalSkill" class="btn-ghost rounded-xl px-5 py-2 text-sm">Cancelar</button>
            <button @click="salvarNovaSkill" :disabled="modalSkill.salvando || !modalSkill.nome.trim()"
              class="btn-primary rounded-xl px-6 py-2 text-sm font-semibold">
              {{ modalSkill.salvando ? 'Criando...' : 'Criar Skill' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Lightbox -->
    <Transition name="fade">
      <div v-if="fotoLightbox" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
        @click="fotoLightbox = null">
        <img :src="fotoLightbox" class="lightbox-img" alt="Foto ampliada" @click.stop />
        <button @click="fotoLightbox = null"
          class="absolute top-4 right-4 text-white/60 hover:text-white text-2xl leading-none">✕</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listarRacasAdmin, criarRaca, editarRaca, deletarRaca } from '@/lib/api/racas.api'
import type { RacaApi, AtributoBonus } from '@/lib/api/racas.api'
import { uploadRacaFoto } from '@/lib/supabase/storage'
import { listarCatalogoSkills, criarSkillCatalogo } from '@/lib/api/skills.api'
import type { SkillApi } from '@/lib/api/skills.api'

type HabilidadeForm = {
  nome: string
  descricao: string
  _busca: string
  _aberto: boolean
}

const router = useRouter()

const racas = ref<RacaApi[]>([])
const carregando = ref(false)
const salvando = ref(false)
const deletando = ref(false)
const formAberto = ref(false)
const editandoId = ref<string | null>(null)
const racaParaDeletar = ref<RacaApi | null>(null)
const feedback = reactive({ msg: '', tipo: 'ok' as 'ok' | 'erro' })

const fotoInput = ref<HTMLInputElement | null>(null)
const fotoFile = ref<File | null>(null)
const fotoPreview = ref('')
const fotoLightbox = ref<string | null>(null)

const skillsCatalogo = ref<SkillApi[]>([])

const tiposExistentes = computed(() => {
  const set = new Set<string>()
  for (const s of skillsCatalogo.value) if (s.type) set.add(String(s.type))
  return [...set].sort()
})

const categoriasExistentes = computed(() => {
  const set = new Set<string>(['Racial'])
  for (const s of skillsCatalogo.value) if (s.category) set.add(String(s.category))
  return [...set].sort()
})

const modalSkill = reactive({
  aberto: false,
  nome: '',
  description: '',
  type: '',
  category: '',
  raca_vinculada: '',
  salvando: false,
  erro: '',
})

const form = reactive({
  nome: '',
  foto_url: '',
  descricao: '',
  lore: '',
  habilidades: [] as HabilidadeForm[],
  atributos_bonus: [] as AtributoBonus[],
})

function voltarAoPainel() { router.push({ name: 'master-panel' }) }

function mostrarFeedback(msg: string, tipo: 'ok' | 'erro' = 'ok') {
  feedback.msg = msg
  feedback.tipo = tipo
  setTimeout(() => { feedback.msg = '' }, 4000)
}

function resetForm() {
  form.nome = ''
  form.foto_url = ''
  form.descricao = ''
  form.lore = ''
  form.habilidades = []
  form.atributos_bonus = []
  editandoId.value = null
  fotoFile.value = null
  if (fotoPreview.value) { URL.revokeObjectURL(fotoPreview.value); fotoPreview.value = '' }
  if (fotoInput.value) fotoInput.value.value = ''
}

function onFotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  fotoFile.value = file
  if (fotoPreview.value) URL.revokeObjectURL(fotoPreview.value)
  fotoPreview.value = URL.createObjectURL(file)
}

function abrirFormNovo() { resetForm(); formAberto.value = true }
function fecharForm() { formAberto.value = false; resetForm() }

function iniciarEdicao(raca: RacaApi) {
  resetForm()
  editandoId.value = raca.id
  form.nome = raca.nome
  form.foto_url = raca.foto_url ?? ''
  form.descricao = raca.descricao ?? ''
  form.lore = raca.lore ?? ''
  form.habilidades = raca.habilidades.map(h => ({ nome: h.nome, descricao: h.descricao, _busca: h.nome, _aberto: false }))
  form.atributos_bonus = raca.atributos_bonus.map(a => ({ ...a }))
  formAberto.value = true
}

function novaHabilidadeForm(): HabilidadeForm {
  return { nome: '', descricao: '', _busca: '', _aberto: false }
}
function addHabilidade() { form.habilidades.push(novaHabilidadeForm()) }
function removeHabilidade(i: number) { form.habilidades.splice(i, 1) }
function addAtributo() { form.atributos_bonus.push({ atributo: '', valor: '' }) }
function removeAtributo(i: number) { form.atributos_bonus.splice(i, 1) }

function skillsFiltradas(h: HabilidadeForm): SkillApi[] {
  const q = h._busca.toLowerCase().trim()
  if (!q) return skillsCatalogo.value.slice(0, 20)
  return skillsCatalogo.value.filter(s => s.name.toLowerCase().includes(q)).slice(0, 20)
}

function onSkillBusca(h: HabilidadeForm) {
  h._aberto = true
  if (!h._busca.trim()) { h.nome = ''; h.descricao = '' }
}

function selecionarSkill(h: HabilidadeForm, sk: SkillApi) {
  h.nome = sk.name
  h.descricao = sk.description ?? ''
  h._busca = sk.name
  h._aberto = false
}

function fecharDropdownDelay(h: HabilidadeForm) {
  setTimeout(() => { h._aberto = false }, 150)
}

function abrirModalNovaSkill() {
  modalSkill.aberto = true
  modalSkill.nome = ''
  modalSkill.description = ''
  modalSkill.type = ''
  modalSkill.category = ''
  modalSkill.raca_vinculada = ''
  modalSkill.erro = ''
}

function fecharModalSkill() { modalSkill.aberto = false }

async function salvarNovaSkill() {
  if (!modalSkill.nome.trim()) return
  modalSkill.salvando = true
  modalSkill.erro = ''
  try {
    const nova = await criarSkillCatalogo({
      name: modalSkill.nome.trim(),
      description: modalSkill.description.trim() || undefined,
      type: modalSkill.type || undefined,
      category: modalSkill.category || undefined,
      raca_vinculada: modalSkill.category === 'Racial' ? modalSkill.raca_vinculada.trim() || undefined : undefined,
    })
    skillsCatalogo.value.push(nova)
    skillsCatalogo.value.sort((a, b) => a.name.localeCompare(b.name))
    // Adiciona automaticamente como habilidade da raça
    form.habilidades.push({
      nome: nova.name,
      descricao: nova.description ?? '',
      _busca: nova.name,
      _aberto: false,
    })
    fecharModalSkill()
  } catch (e: any) {
    modalSkill.erro = e.message ?? 'Erro ao criar skill'
  } finally {
    modalSkill.salvando = false
  }
}

function confirmarDelete(raca: RacaApi) { racaParaDeletar.value = raca }

async function carregar() {
  carregando.value = true
  try { racas.value = await listarRacasAdmin() }
  catch { mostrarFeedback('Erro ao carregar raças.', 'erro') }
  finally { carregando.value = false }
}

async function salvar() {
  if (!form.nome.trim()) return
  salvando.value = true
  try {
    let fotoUrl: string | null = form.foto_url.trim() || null
    if (fotoFile.value) {
      fotoUrl = await uploadRacaFoto(fotoFile.value)
    }
    const payload = {
      nome: form.nome.trim(),
      foto_url: fotoUrl,
      descricao: form.descricao.trim() || null,
      lore: form.lore.trim() || null,
      habilidades: form.habilidades.filter(h => h.nome.trim()).map(h => ({ nome: h.nome, descricao: h.descricao })),
      atributos_bonus: form.atributos_bonus.filter(a => a.atributo.trim()),
    }
    if (editandoId.value) {
      const updated = await editarRaca(editandoId.value, payload)
      const idx = racas.value.findIndex(r => r.id === editandoId.value)
      if (idx !== -1) racas.value[idx] = updated
      mostrarFeedback('Raça atualizada com sucesso.')
    } else {
      const nova = await criarRaca(payload)
      racas.value.unshift(nova)
      mostrarFeedback('Raça criada com sucesso.')
    }
    fecharForm()
  } catch (e: any) {
    mostrarFeedback(e.message ?? 'Erro ao salvar raça.', 'erro')
  } finally {
    salvando.value = false
  }
}

async function executarDelete() {
  if (!racaParaDeletar.value) return
  deletando.value = true
  try {
    await deletarRaca(racaParaDeletar.value.id)
    racas.value = racas.value.filter(r => r.id !== racaParaDeletar.value!.id)
    mostrarFeedback('Raça deletada.')
    racaParaDeletar.value = null
  } catch (e: any) {
    mostrarFeedback(e.message ?? 'Erro ao deletar raça.', 'erro')
  } finally {
    deletando.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    carregar(),
    listarCatalogoSkills().then(s => { skillsCatalogo.value = s }),
  ])
})
</script>

<style scoped>
.font-cinzel { font-family: 'Cinzel', serif; }

.page-root    { background: #070C18; color: #e2e8f0; }
.page-ambient { opacity: 0.6; }

.page-header {
  background: rgb(7 12 24 / 0.9);
  border-color: rgb(139 92 246 / 0.25);
  backdrop-filter: blur(12px);
}

.page-kicker { color: #a78bfa; }
.page-title  { color: #c4b5fd; }
.page-sub    { color: #64748b; }

.back-btn {
  color: #64748b;
  border: 1px solid rgb(255 255 255 / 0.08);
}
.back-btn:hover { background: rgb(255 255 255 / 0.05); color: #e2e8f0; }

/* ── Cards ── */
.raca-card {
  background: rgb(255 255 255 / 0.03);
  border-color: rgb(255 255 255 / 0.08);
}
.raca-card:hover { border-color: rgb(139 92 246 / 0.35); }

.raca-img-wrap { background-color: #111a2d; }

.attr-badge {
  background: rgb(139 92 246 / 0.15);
  border: 1px solid rgb(139 92 246 / 0.3);
  color: #c4b5fd;
}

.lore-badge {
  background: rgb(245 158 11 / 0.12);
  border: 1px solid rgb(245 158 11 / 0.25);
  color: #fcd34d;
  display: inline-block;
}

.field-label { color: #64748b; }

.raca-card-footer { border-color: rgb(255 255 255 / 0.06); background: rgb(255 255 255 / 0.02); }

.action-btn-edit {
  color: #93c5fd;
  border: 1px solid rgb(59 130 246 / 0.3);
}
.action-btn-edit:hover { background: rgb(59 130 246 / 0.1); }

.action-btn-del {
  color: #fca5a5;
  border: 1px solid rgb(239 68 68 / 0.3);
}
.action-btn-del:hover { background: rgb(239 68 68 / 0.1); }

/* ── Form ── */
.form-card {
  background: #0b1220;
  border-color: rgb(139 92 246 / 0.25);
}

.form-title { color: #c4b5fd; }

.close-btn {
  color: #64748b;
  border: 1px solid rgb(255 255 255 / 0.08);
}
.close-btn:hover { background: rgb(255 255 255 / 0.05); }

.field-input {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.field-input::placeholder { color: #475569; }
.field-input:focus { border-color: rgb(139 92 246 / 0.5); }

.field-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
  cursor: pointer;
}
.field-select option { background: #0f172a; color: #e2e8f0; }

.habilidade-block { border-color: rgb(255 255 255 / 0.06); background: rgb(255 255 255 / 0.02); }

.field-input-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgb(255 255 255 / 0.02) !important;
}

.skill-dropdown {
  background: #0f172a;
  border-color: rgb(139 92 246 / 0.35);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
}

.skill-dropdown-item {
  color: #e2e8f0;
  transition: background 0.1s;
}
.skill-dropdown-item:hover { background: rgb(139 92 246 / 0.15); }

.skill-type-tag {
  background: rgb(139 92 246 / 0.15);
  color: #a78bfa;
}

.foto-placeholder {
  background: rgb(255 255 255 / 0.03);
  border: 1px dashed rgb(255 255 255 / 0.1);
  border-radius: 0.75rem;
}

.foto-preview-wrap {
  background: #0a0f1c;
  border: 1px solid rgb(255 255 255 / 0.08);
  cursor: zoom-in;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 220px;
}

.foto-preview-img {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  display: block;
}

.lightbox-img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.75rem;
  box-shadow: 0 25px 60px rgb(0 0 0 / 0.7);
}

.btn-upload {
  background: rgb(255 255 255 / 0.04);
  border: 1px solid rgb(255 255 255 / 0.12);
  color: #94a3b8;
  transition: background 0.15s;
}
.btn-upload:hover { background: rgb(255 255 255 / 0.08); color: #e2e8f0; }

.btn-add-item {
  background: rgb(139 92 246 / 0.12);
  border: 1px solid rgb(139 92 246 / 0.3);
  color: #c4b5fd;
}
.btn-add-item:hover { background: rgb(139 92 246 / 0.2); }

.btn-primary {
  background: #7c3aed;
  color: #fff;
}
.btn-primary:hover:not(:disabled) { background: #6d28d9; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost {
  color: #64748b;
  border: 1px solid rgb(255 255 255 / 0.08);
}
.btn-ghost:hover { background: rgb(255 255 255 / 0.05); color: #e2e8f0; }

/* ── Modal ── */
.modal-card {
  background: #0f172a;
  border-color: rgb(239 68 68 / 0.3);
}
.modal-title { color: #fca5a5; }
.modal-body  { color: #94a3b8; }
.modal-body strong { color: #e2e8f0; }

.btn-danger {
  background: #dc2626;
  color: #fff;
}
.btn-danger:hover:not(:disabled) { background: #b91c1c; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Transições ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.25s ease, opacity 0.25s ease; }
.slide-enter-from,   .slide-leave-to     { transform: translateX(100%); opacity: 0; }
</style>
