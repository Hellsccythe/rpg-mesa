import { api } from '@/plugins/axios'
import type { PersonagemApi } from '@/types/supabase'

export interface TituloApi {
  id: number
  name: string
  tier: 'Comum' | 'Raro' | 'Épico' | 'Lendário'
  description: string
  bonuses: Record<string, unknown>
  requirements: Record<string, unknown>
  is_hidden: boolean
  linked_hidden_class: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export async function listarCatalogoTitulos(): Promise<TituloApi[]> {
  const { data } = await api.get<TituloApi[]>('/titulos/catalogo')
  return data
}

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
