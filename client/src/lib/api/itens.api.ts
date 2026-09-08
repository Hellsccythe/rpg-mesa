import { api } from '@/plugins/axios'
import type { RaridadeResumo } from './consumiveis.api'

/**
 * Item: o que só se carrega, vende ou entrega numa receita. Cosméticos,
 * ferramentas, exploração, materiais preciosos e ingredientes.
 *
 * Uma erva de alquimia é item, e não consumível: ela não some ao ser usada,
 * ela vira outra coisa. Quem some é a poção que ela produz.
 */
export type CategoriaItemApi = { item: number; descricao: string; icone: string | null }

export type ItemApi = {
  id: number
  nome: string
  descricao: string | null
  peso: number | null
  /** Preço final em prata. O multiplicador da raridade é referência, não é aplicado. */
  valor: number | null
  /** Ervas e minérios empilham; uma gazua ou um vestido, não. */
  empilhavel: boolean
  raridade_item: number | null
  raridade: RaridadeResumo | null
  categoria_item: number | null
  categoria: { item: number; descricao: string } | null
}

export type ItemPayload = {
  nome: string
  descricao?: string
  peso?: number | null
  valor?: number | null
  empilhavel?: boolean
  raridade_item?: number | null
  categoria_item?: number | null
}

export async function listarItens(): Promise<ItemApi[]> {
  const { data } = await api.get<ItemApi[]>('/itens')
  return data
}

export async function criarItem(payload: ItemPayload): Promise<ItemApi> {
  const { data } = await api.post<ItemApi>('/itens/admin', payload)
  return data
}

export async function editarItem(id: number, payload: ItemPayload): Promise<ItemApi> {
  const { data } = await api.patch<ItemApi>(`/itens/admin/${id}`, payload)
  return data
}

export async function deletarItem(id: number): Promise<void> {
  await api.delete(`/itens/admin/${id}`)
}

export async function listarCategoriasItem(): Promise<CategoriaItemApi[]> {
  const { data } = await api.get<CategoriaItemApi[]>('/itens/categorias')
  return data
}
