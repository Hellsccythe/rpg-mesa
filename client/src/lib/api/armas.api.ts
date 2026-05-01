import { api } from '@/plugins/axios'

export interface ArmaApi {
  id: string
  nome: string
  tipo: string
  dano: string
  peso: number | null
  propriedades: string
  valor: number | null
  categoria_equipamento: string | null
  descricao_equipamento: string | null
  pre_requisitos: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CriarArmaPayload {
  nome: string
  tipo: string
  dano?: string | null
  peso?: number | null
  propriedades?: string
  valor?: number | null
  categoria_equipamento?: string | null
  descricao_equipamento?: string | null
  pre_requisitos?: string | null
}

export interface EditarArmaPayload {
  nome?: string
  tipo?: string
  dano?: string | null
  peso?: number | null
  propriedades?: string
  valor?: number | null
  categoria_equipamento?: string | null
  descricao_equipamento?: string | null
  pre_requisitos?: string | null
}

export async function listarArmasPublicas(): Promise<ArmaApi[]> {
  const { data } = await api.get<ArmaApi[]>('/armas')
  return data
}

export async function listarArmas(): Promise<ArmaApi[]> {
  const { data } = await api.get<ArmaApi[]>('/armas/admin')
  return data
}

export async function criarArma(payload: CriarArmaPayload): Promise<ArmaApi> {
  const { data } = await api.post<ArmaApi>('/armas/admin', payload)
  return data
}

export async function editarArma(armaId: string, payload: EditarArmaPayload): Promise<ArmaApi> {
  const { data } = await api.patch<ArmaApi>(`/armas/admin/${armaId}`, payload)
  return data
}

export async function deletarArma(armaId: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/${armaId}`)
  return data
}
