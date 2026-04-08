import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export async function createTitle(payload: { name: string; tier: string; description: string }) {
  const { data } = await api.post('/titulos/admin', payload)
  return data
}

export async function addTitleToCharacter(characterId: string, titleName: string) {
  const { data } = await api.post<PersonagemApi>(`/titulos/admin/personagens/${characterId}`, {
    titleName,
  })
  return data
}
