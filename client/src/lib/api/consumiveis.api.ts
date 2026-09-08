import { api } from '@/plugins/axios'

/**
 * Consumível: o que o jogador usa e some. Poções, venenos, munição, alimento,
 * pergaminhos.
 *
 * O ingrediente que produz uma poção NÃO é consumível — ele não some ao ser
 * usado, vira outra coisa. Ingrediente mora em `itens`, e a ligação entre os
 * dois é a tabela de receitas.
 */
export type RaridadeResumo = { item: number; descricao: string; cor: string; ordem: number }
export type CategoriaConsumivelApi = { item: number; descricao: string; icone: string | null }

export type ConsumivelApi = {
  id: number
  nome: string
  descricao: string | null
  /** O que acontece ao usar. Nunca null — string vazia quando não preenchido. */
  efeito: string
  /** Quantas vezes antes de acabar. Poção tem 1; kit de primeiros socorros, vários. */
  usos: number
  duracao: string | null
  peso: number | null
  /** Preço final em prata. O multiplicador da raridade é referência, não é aplicado. */
  valor: number | null
  raridade_item: number | null
  raridade: RaridadeResumo | null
  categoria_consumivel_item: number | null
  categoria: { item: number; descricao: string } | null
}

export type ConsumivelPayload = {
  nome: string
  descricao?: string
  efeito?: string
  usos?: number
  duracao?: string
  peso?: number | null
  valor?: number | null
  raridade_item?: number | null
  categoria_consumivel_item?: number | null
}

export async function listarConsumiveis(): Promise<ConsumivelApi[]> {
  const { data } = await api.get<ConsumivelApi[]>('/consumiveis')
  return data
}

export async function criarConsumivel(payload: ConsumivelPayload): Promise<ConsumivelApi> {
  const { data } = await api.post<ConsumivelApi>('/consumiveis/admin', payload)
  return data
}

export async function editarConsumivel(id: number, payload: ConsumivelPayload): Promise<ConsumivelApi> {
  const { data } = await api.patch<ConsumivelApi>(`/consumiveis/admin/${id}`, payload)
  return data
}

export async function deletarConsumivel(id: number): Promise<void> {
  await api.delete(`/consumiveis/admin/${id}`)
}

export async function listarCategoriasConsumivel(): Promise<CategoriaConsumivelApi[]> {
  const { data } = await api.get<CategoriaConsumivelApi[]>('/consumiveis/categorias')
  return data
}
