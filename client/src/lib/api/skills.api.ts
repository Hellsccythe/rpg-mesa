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
  raca_vinculada?: string | null
  skill_tipo_item?: number | null
  skill_categoria_item?: number | null
  skill_tipo_dano_item?: number | null
  damage_display?: string | null
  damage_base?: number | null
  effect_description?: string | null
  effect_value?: number | null
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
  raca_vinculada?: string
  skill_tipo_item?: number | null
  skill_categoria_item?: number | null
  skill_tipo_dano_item?: number | null
  damage_display?: string
  damage_base?: number | null
  effect_description?: string
  effect_value?: number | null
  custo?: number | null
  cooldown?: number | null
  range?: string
  required_class?: string | null
}

export type EditarSkillPayload = Partial<CriarSkillPayload>

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

export async function addSkillToCharacter(characterId: string, skillName: string) {
  const { data } = await api.post<PersonagemApi>(`/skills/admin/personagens/${characterId}`, {
    skillName,
  })
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

export const skillTiposApi = crudLookup('/skills/tipos')
export const skillCategoriasApi = crudLookup('/skills/categorias')
export const skillTiposDanoApi = crudLookup('/skills/tipos-dano')
