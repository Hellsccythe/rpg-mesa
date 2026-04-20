import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export interface SkillApi {
  id: string | number
  name: string
  description?: string | null
  type?: string | null
  category?: string | null
  stat_bonuses?: Record<string, unknown> | string | null
  requirements?: Record<string, unknown> | string | null
  class_id?: string | number | null
  created_at?: string
  [key: string]: unknown
}

export async function listarCatalogoSkills(): Promise<SkillApi[]> {
  const { data } = await api.get<SkillApi[]>('/skills/catalogo')
  return data
}

export async function addSkillToCharacter(characterId: string, skillName: string) {
  const { data } = await api.post<PersonagemApi>(`/skills/admin/personagens/${characterId}`, {
    skillName,
  })
  return data
}
