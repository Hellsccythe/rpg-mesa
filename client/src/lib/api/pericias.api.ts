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
 * O bônus total no teste: `rank × 3 + ⌊atributo ÷ 2⌋`.
 *
 * O atributo entra pela metade de propósito — com 10 pontos no onboarding mais
 * o bônus do passado, um atributo focado chega a 13 e engoliria o rank.
 */
export function bonusDoTeste(rank: number, valorDoAtributo: number): number {
  return bonusDoRank(rank) + Math.floor(valorDoAtributo / 2)
}

export const CLASSE_POR_CATEGORIA: Record<CategoriaPericia, string> = {
  'Ofício': 'border-amber-500/25 bg-amber-950/40 text-amber-300',
  'Social': 'border-violet-500/25 bg-violet-950/40 text-violet-300',
  'Corpo': 'border-emerald-500/25 bg-emerald-950/40 text-emerald-300',
  'Saber': 'border-sky-500/25 bg-sky-950/40 text-sky-300',
}
