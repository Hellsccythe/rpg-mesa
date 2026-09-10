import { api } from '@/plugins/axios'
import type { RaridadeResumo } from './consumiveis.api'

export const CATEGORIAS_CONDICAO = ['Física', 'Mental', 'Mágica', 'Doença', 'Alquímica'] as const
export type CategoriaCondicao = (typeof CATEGORIAS_CONDICAO)[number]

export type ConsumivelQueTrata = {
  id: number
  nome: string
  /** `cura` remove o que já se sofreu; `previne` imuniza por um tempo. */
  acao: 'cura' | 'previne'
  valor: number | null
}

export type CondicaoApi = {
  id: number
  nome: string
  descricao: string
  efeito: string
  categoria: CategoriaCondicao
  raridade_item: number | null
  raridade: RaridadeResumo | null
  duracao: string
  /** Por quanto tempo a cura ainda funciona. Nulo = sem prazo. */
  janela_de_cura: string | null
  se_nao_tratada: string | null
  acumulativa: boolean
  /** Vazio significa condição sem resposta no catálogo. */
  tratada_por: ConsumivelQueTrata[]
}

export type CondicaoPayload = {
  nome: string
  descricao?: string
  efeito?: string
  categoria: CategoriaCondicao
  raridade_item?: number | null
  duracao?: string
  janela_de_cura?: string | null
  se_nao_tratada?: string | null
  acumulativa?: boolean
}

export async function listarCondicoes(): Promise<CondicaoApi[]> {
  const { data } = await api.get<CondicaoApi[]>('/condicoes')
  return data
}

export async function criarCondicao(payload: CondicaoPayload): Promise<CondicaoApi> {
  const { data } = await api.post<CondicaoApi>('/condicoes/admin', payload)
  return data
}

export async function editarCondicao(id: number, payload: Partial<CondicaoPayload>): Promise<CondicaoApi> {
  const { data } = await api.patch<CondicaoApi>(`/condicoes/admin/${id}`, payload)
  return data
}

export async function deletarCondicao(id: number): Promise<void> {
  await api.delete(`/condicoes/admin/${id}`)
}

/**
 * Cor de cada categoria. Escritas por extenso porque o Tailwind varre o código
 * atrás de nomes literais — montar a classe com template string faria o build
 * descartá-la.
 */
export const CLASSE_POR_CATEGORIA: Record<CategoriaCondicao, string> = {
  'Física': 'border-amber-500/25 bg-amber-950/40 text-amber-300',
  'Mental': 'border-violet-500/25 bg-violet-950/40 text-violet-300',
  'Mágica': 'border-sky-500/25 bg-sky-950/40 text-sky-300',
  'Doença': 'border-red-500/25 bg-red-950/40 text-red-300',
  'Alquímica': 'border-emerald-500/25 bg-emerald-950/40 text-emerald-300',
}
