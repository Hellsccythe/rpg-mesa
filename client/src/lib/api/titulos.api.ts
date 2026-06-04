import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export type SkillResumo = { id: number; name: string }

export type AtributoBonus = {
  aura?: number
  forca?: number
  destreza?: number
  resistencia?: number
  inteligencia?: number
}

export interface TituloApi {
  id: number
  name: string
  tier: string
  description: string
  skill_ids: number[]
  skills: SkillResumo[]
  bonuses: AtributoBonus | null
  requirements: Record<string, unknown> | null
  is_hidden: boolean
  linked_hidden_class: boolean
  classe_secreta_id: number | null
  created_at?: string
  updated_at?: string
}

export type SalvarTituloPayload = {
  name: string
  tier: string
  description: string
  skillIds?: number[]
  bonuses?: AtributoBonus | null
  is_hidden?: boolean
  linked_hidden_class?: boolean
  classe_secreta_id?: number | null
}

export async function listarCatalogoTitulos(): Promise<TituloApi[]> {
  const { data } = await api.get<TituloApi[]>('/titulos/catalogo')
  return data
}

export async function createTitle(payload: SalvarTituloPayload): Promise<TituloApi> {
  const { data } = await api.post<TituloApi>('/titulos/admin', payload)
  return data
}

export async function editarTitulo(id: number, payload: Partial<SalvarTituloPayload>): Promise<TituloApi> {
  const { data } = await api.patch<TituloApi>(`/titulos/admin/${id}`, payload)
  return data
}

export async function deletarTitulo(id: number): Promise<void> {
  await api.delete(`/titulos/admin/${id}`)
}

export async function addTitleToCharacter(characterId: string, titleName: string) {
  const { data } = await api.post<PersonagemApi>(`/titulos/admin/personagens/${characterId}`, { titleName })
  return data
}
