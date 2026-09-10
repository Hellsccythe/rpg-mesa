import { api } from '@/plugins/axios'

export const ATRIBUTOS = ['aura', 'forca', 'destreza', 'resistencia', 'inteligencia'] as const
export type Atributo = (typeof ATRIBUTOS)[number]

export const CATEGORIAS_PERICIA = ['Ofício', 'Social', 'Corpo', 'Saber'] as const
export type CategoriaPericia = (typeof CATEGORIAS_PERICIA)[number]

/** Rank máximo. Com custo crescente, chegar lá custa 1+2+3+4+5 = 15 pontos. */
export const RANK_MAXIMO = 5

export const ROTULO_ATRIBUTO: Record<Atributo, string> = {
  aura: 'Aura',
  forca: 'Força',
  destreza: 'Destreza',
  resistencia: 'Resistência',
  inteligencia: 'Inteligência',
}

export type PericiaApi = {
  id: number
  nome: string
  descricao: string
  atributoBase: Atributo
  categoria: CategoriaPericia
}

export type PericiaPayload = {
  nome: string
  descricao?: string
  atributo_base: Atributo
  categoria: CategoriaPericia
}

/** Um rank do personagem, como vem em `data.pericias`. */
export type PericiaDoPersonagem = {
  periciaId: number
  nome: string
  rank: number
  /** Quanto veio do passado. Não custou ponto. */
  rankInicial?: number
}

export async function listarPericias(): Promise<PericiaApi[]> {
  const { data } = await api.get<PericiaApi[]>('/pericias')
  return data
}

export async function criarPericia(payload: PericiaPayload): Promise<PericiaApi> {
  const { data } = await api.post<PericiaApi>('/pericias/admin', payload)
  return data
}

export async function editarPericia(id: number, payload: Partial<PericiaPayload>): Promise<PericiaApi> {
  const { data } = await api.patch<PericiaApi>(`/pericias/admin/${id}`, payload)
  return data
}

export async function deletarPericia(id: number): Promise<void> {
  await api.delete(`/pericias/admin/${id}`)
}

/** Custo em pontos para subir ATÉ o rank informado. Espelha o backend. */
export function custoDoRank(rank: number): number {
  return rank
}

/** Bônus que o rank dá no teste. */
export function bonusDoRank(rank: number): number {
  return rank * 3
}

/**
 * Quanto o atributo contribui no teste: metade dele, **limitado ao dobro do
 * rank**.
 *
 * A metade já era para o atributo não engolir o rank. A trava resolve o outro
 * lado: com os atributos crescendo ao longo da campanha, um personagem de
 * rank 1 e Inteligência 20 chegava a +13 e passava 70% dos testes Raros —
 * treino mínimo vencendo por talento bruto.
 *
 * Com a trava ele cai para 30%, e o profissional (rank 3) e o mestre (rank 5)
 * não perdem nada. Talento deixa de substituir treino sem deixar de importar.
 */
export function bonusDoAtributo(rank: number, valorDoAtributo: number): number {
  return Math.min(Math.floor(valorDoAtributo / 2), rank * 2)
}

/** O bônus total no teste: `rank × 3 + min(⌊atributo ÷ 2⌋, rank × 2)`. */
export function bonusDoTeste(rank: number, valorDoAtributo: number): number {
  return bonusDoRank(rank) + bonusDoAtributo(rank, valorDoAtributo)
}

export const CLASSE_POR_CATEGORIA: Record<CategoriaPericia, string> = {
  'Ofício': 'border-amber-500/25 bg-amber-950/40 text-amber-300',
  'Social': 'border-violet-500/25 bg-violet-950/40 text-violet-300',
  'Corpo': 'border-emerald-500/25 bg-emerald-950/40 text-emerald-300',
  'Saber': 'border-sky-500/25 bg-sky-950/40 text-sky-300',
}
