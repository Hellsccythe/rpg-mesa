import { api } from '@/plugins/axios'

export type NpcApi = {
  id: number
  nome: string
  raca_id: number | null
  raca_nome: string | null
  descricao: string | null
  foto_url: string | null
  created_at: string
  updated_at: string
}

export type NpcAcessoPlayer = {
  character_id: number
  nome: string
  username: string | null
  tem_acesso: boolean
}

export type NpcPayload = {
  nome: string
  raca_id?: number | null
  descricao?: string
  foto_url?: string
}

export async function listarNpcsAdmin(): Promise<NpcApi[]> {
  const { data } = await api.get<NpcApi[]>('/npcs/admin')
  return data
}

export async function listarNpcsPlayer(characterId: number | string): Promise<NpcApi[]> {
  const { data } = await api.get<NpcApi[]>('/npcs/player', { params: { characterId } })
  return data
}

export async function criarNpc(payload: NpcPayload): Promise<NpcApi> {
  const { data } = await api.post<NpcApi>('/npcs/admin', payload)
  return data
}

export async function editarNpc(id: number, payload: NpcPayload): Promise<NpcApi> {
  const { data } = await api.patch<NpcApi>(`/npcs/admin/${id}`, payload)
  return data
}

export async function deletarNpc(id: number): Promise<void> {
  await api.delete(`/npcs/admin/${id}`)
}

export async function listarAcessosNpc(npcId: number): Promise<NpcAcessoPlayer[]> {
  const { data } = await api.get<NpcAcessoPlayer[]>(`/npcs/admin/${npcId}/acessos`)
  return data
}

export async function concederAcessoNpc(npcId: number, characterId: number): Promise<void> {
  await api.post(`/npcs/admin/${npcId}/acessos/${characterId}`)
}

export async function revogarAcessoNpc(npcId: number, characterId: number): Promise<void> {
  await api.delete(`/npcs/admin/${npcId}/acessos/${characterId}`)
}
