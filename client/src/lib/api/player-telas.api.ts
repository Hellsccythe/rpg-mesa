import { api } from '@/plugins/axios'

export const TELAS_DISPONIVEIS = [
  { id: 'deuses',       label: 'Deuses' },
  { id: 'cidade',       label: 'Cidade' },
  { id: 'skills',       label: 'Skills' },
  { id: 'titulos',      label: 'Títulos' },
  { id: 'classes',      label: 'Classes' },
  { id: 'npcs',         label: 'NPCs' },
  { id: 'racas',        label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas',        label: 'Notas de Aventura' },
] as const

export type TelaId = typeof TELAS_DISPONIVEIS[number]['id']

export async function listarMinhasTelas(characterId: number | string): Promise<TelaId[]> {
  const { data } = await api.get<TelaId[]>('/player-telas/me', { params: { characterId } })
  return data
}

export async function listarTelasPlayer(characterId: number | string): Promise<TelaId[]> {
  const { data } = await api.get<TelaId[]>(`/player-telas/admin/${characterId}`)
  return data
}

export async function definirTelasPlayer(characterId: number | string, telas: TelaId[]): Promise<TelaId[]> {
  const { data } = await api.put<TelaId[]>(`/player-telas/admin/${characterId}`, { telas })
  return data
}
