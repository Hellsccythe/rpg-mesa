import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export interface SkillLookupApi {
  item: number
  descricao: string
  created_at?: string
  created_by?: string | null
  updated_at?: string
}

export interface SkillApi {
  id: string | number
  name: string
  description?: string | null
  raca_vinculada?: string[] | null
  skill_natureza_item?: number | null
  skill_tipo_item?: number | null
  skill_categoria_item?: number[] | null
  skill_tipo_dano_item?: number[] | null
  multiplicador_atributo?: string[][] | null
  damage_base?: string | null
  effect_description?: string | null
  custo?: number | null
  cooldown?: number | null
  range?: string | null
  required_class?: string | null
  stat_bonuses?: Record<string, unknown> | string | null
  requirements?: Record<string, unknown> | string | null
  class_id?: string | number | null
  created_at?: string
  [key: string]: unknown
}

export interface CriarSkillPayload {
  name: string
  description?: string
  raca_vinculada?: string[]
  skill_natureza_item?: number | null
  skill_tipo_item?: number | null
  skill_categoria_item?: number[]
  skill_tipo_dano_item?: number[]
  multiplicador_atributo?: string[]
  damage_base?: string
  effect_description?: string
  custo?: number | null
  cooldown?: number | null
  range?: string
  required_class?: string | null
}

export type EditarSkillPayload = Partial<CriarSkillPayload>

export interface SkillOverrideApi {
  id: number
  skill_name: string
  character_id: number
  damage_base_override: string | null
  multiplicador_override: string[] | null
  created_at: string
  created_by: string | null
  updated_at: string
  updated_by: string | null
}

export async function listarCatalogoSkills(): Promise<SkillApi[]> {
  const { data } = await api.get<SkillApi[]>('/skills/catalogo')
  return data
}

export async function criarSkillCatalogo(payload: CriarSkillPayload): Promise<SkillApi> {
  const { data } = await api.post<SkillApi>('/skills/admin/catalogo', payload)
  return data
}

export async function editarSkillCatalogo(id: string | number, payload: EditarSkillPayload): Promise<SkillApi> {
  const { data } = await api.patch<SkillApi>(`/skills/admin/catalogo/${id}`, payload)
  return data
}

export async function deletarSkillCatalogo(id: string | number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/skills/admin/catalogo/${id}`)
  return data
}

export interface SkillReferencias {
  passados: { id: number; nome: string }[]
  titulos:  { id: number; nome: string }[]
  classes:  { id: number; nome: string }[]
}

export async function buscarReferenciasSkill(id: string | number): Promise<SkillReferencias> {
  const { data } = await api.get<SkillReferencias>(`/skills/admin/catalogo/${id}/referencias`)
  return data
}

export async function addSkillToCharacter(characterId: string, skillName: string) {
  const { data } = await api.post<PersonagemApi>(`/skills/admin/personagens/${characterId}`, {
    skillName,
  })
  return data
}

// ── Overrides ─────────────────────────────────────────────────────────────────
export async function listarOverridesPersonagem(characterId: number): Promise<SkillOverrideApi[]> {
  const { data } = await api.get<SkillOverrideApi[]>('/skills/admin/overrides', { params: { character_id: characterId } })
  return data
}

export async function criarOverride(payload: { skill_name: string; character_id: number; damage_base_override?: string | null; multiplicador_override?: string[] | null }): Promise<SkillOverrideApi> {
  const { data } = await api.post<SkillOverrideApi>('/skills/admin/overrides', payload)
  return data
}

export async function editarOverride(id: number, payload: { damage_base_override?: string | null; multiplicador_override?: string[] | null }): Promise<SkillOverrideApi> {
  const { data } = await api.patch<SkillOverrideApi>(`/skills/admin/overrides/${id}`, payload)
  return data
}

export async function deletarOverride(id: number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/skills/admin/overrides/${id}`)
  return data
}

// ── Lookups de skill ──────────────────────────────────────────────────────────
function crudLookup(path: string) {
  return {
    listar: (): Promise<SkillLookupApi[]> =>
      api.get<SkillLookupApi[]>(path).then((r) => r.data),
    criar: (descricao: string): Promise<SkillLookupApi> =>
      api.post<SkillLookupApi>(`${path}/admin`, { descricao }).then((r) => r.data),
    editar: (item: number, descricao: string): Promise<SkillLookupApi> =>
      api.patch<SkillLookupApi>(`${path}/admin/${item}`, { descricao }).then((r) => r.data),
    deletar: (item: number): Promise<{ ok: boolean }> =>
      api.delete<{ ok: boolean }>(`${path}/admin/${item}`).then((r) => r.data),
  }
}

export const skillNaturezasApi = crudLookup('/skills/naturezas')
export const skillTiposApi = crudLookup('/skills/tipos')
export const skillCategoriasApi = crudLookup('/skills/categorias')
export const skillTiposDanoApi = crudLookup('/skills/tipos-dano')

// ── Níveis de skill ───────────────────────────────────────────────────────────
export interface SkillNivelApi {
  id: number
  skill_id: number
  skill_name?: string | null
  nivel: 2 | 3
  damage_multiplier_pct?: number | null
  nome_override?: string | null
  damage_base_override?: string | null
  multiplicador_override?: string | null
  effect_description_override?: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
}

export interface CriarSkillNivelPayload {
  skill_id: number
  nivel: 2 | 3
  damage_multiplier_pct?: number | null
  nome_override?: string | null
  damage_base_override?: string | null
  multiplicador_override?: string | null
  effect_description_override?: string | null
}

export type EditarSkillNivelPayload = Omit<CriarSkillNivelPayload, 'skill_id' | 'nivel'>

export async function listarSkillNiveis(skillId?: number): Promise<SkillNivelApi[]> {
  const params = skillId ? { skill_id: skillId } : {}
  const { data } = await api.get<SkillNivelApi[]>('/skills/niveis', { params })
  return data
}

export async function criarSkillNivel(payload: CriarSkillNivelPayload): Promise<SkillNivelApi> {
  const { data } = await api.post<SkillNivelApi>('/skills/admin/niveis', payload)
  return data
}

export async function editarSkillNivel(id: number, payload: EditarSkillNivelPayload): Promise<SkillNivelApi> {
  const { data } = await api.patch<SkillNivelApi>(`/skills/admin/niveis/${id}`, payload)
  return data
}

export async function deletarSkillNivel(id: number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/skills/admin/niveis/${id}`)
  return data
}
