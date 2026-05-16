import { api } from '@/plugins/axios'

export type Habilidade    = { nome: string; descricao: string }
export type AtributoBonus = { atributo: string; valor: string }

export type RacaApi = {
  id: string
  nome: string
  foto_url: string | null
  descricao: string | null
  lore: string | null
  habilidades: Habilidade[]
  atributos_bonus: AtributoBonus[]
  createdAt?: string
  updatedAt?: string
}

export type CriarRacaPayload = {
  nome: string
  foto_url?: string | null
  descricao?: string | null
  lore?: string | null
  habilidades?: Habilidade[]
  atributos_bonus?: AtributoBonus[]
}

export type EditarRacaPayload = Partial<CriarRacaPayload>

export async function listarRacasPublicas(): Promise<RacaApi[]> {
  const { data } = await api.get<RacaApi[]>('/racas')
  return data
}

export async function listarRacasAdmin(): Promise<RacaApi[]> {
  const { data } = await api.get<RacaApi[]>('/racas/admin')
  return data
}

export async function criarRaca(payload: CriarRacaPayload): Promise<RacaApi> {
  const { data } = await api.post<RacaApi>('/racas/admin', payload)
  return data
}

export async function editarRaca(id: string, payload: EditarRacaPayload): Promise<RacaApi> {
  const { data } = await api.patch<RacaApi>(`/racas/admin/${id}`, payload)
  return data
}

export async function deletarRaca(id: string): Promise<void> {
  await api.delete(`/racas/admin/${id}`)
}
