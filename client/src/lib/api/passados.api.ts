import { api } from '@/plugins/axios'

export type SkillResumo  = { id: number; name: string }
export type TituloResumo = { id: number; name: string }

export type AtributoBonus = {
  aura?: number
  forca?: number
  destreza?: number
  resistencia?: number
  inteligencia?: number
}

export type PassadoApi = {
  id: number
  nome: string
  descricao: string | null
  foto_url: string | null
  skill_ids: number[]
  titulo_ids: number[]
  skills: SkillResumo[]
  titulos: TituloResumo[]
  atributo_bonus: AtributoBonus | null
  created_at: string
  updated_at: string
}

export type PassadoPayload = {
  nome: string
  descricao?: string
  foto_url?: string
  skill_ids?: number[]
  titulo_ids?: number[]
  atributo_bonus?: AtributoBonus | null
}

export async function listarPassados(): Promise<PassadoApi[]> {
  const { data } = await api.get<PassadoApi[]>('/passados')
  return data
}

export async function criarPassado(payload: PassadoPayload): Promise<PassadoApi> {
  const { data } = await api.post<PassadoApi>('/passados/admin', payload)
  return data
}

export async function editarPassado(id: number, payload: PassadoPayload): Promise<PassadoApi> {
  const { data } = await api.patch<PassadoApi>(`/passados/admin/${id}`, payload)
  return data
}

export async function deletarPassado(id: number): Promise<void> {
  await api.delete(`/passados/admin/${id}`)
}
