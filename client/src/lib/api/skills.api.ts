import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export async function addSkillToCharacter(characterId: string, skillName: string) {
  const { data } = await api.post<PersonagemApi>(`/skills/admin/personagens/${characterId}`, {
    skillName,
  })
  return data
}
